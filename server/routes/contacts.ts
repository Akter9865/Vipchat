import { Router, Response } from 'express';
import { store } from '../storage/store.js';
import { authenticateAdmin, requireRole, logAudit } from '../middleware/auth.js';
import { exportContactsToCsv, exportContactsToXlsx } from '../services/exportService.js';
import { runAutomations } from '../services/automationRunner.js';
import { getIO } from '../services/socketService.js';

const router = Router();

// GET /api/contacts - List & filter contacts
router.get('/', authenticateAdmin, async (req: any, res: Response) => {
  try {
    const {
      search,
      status,
      agentId,
      tagId,
      startDate,
      endDate,
      page = 1,
      limit = 50,
      sortBy,
      sortOrder,
    } = req.query;

    const result = await store.getContacts({
      search: search?.toString(),
      status: status?.toString(),
      agentId: agentId?.toString(),
      tagId: tagId?.toString(),
      startDate: startDate?.toString(),
      endDate: endDate?.toString(),
      page: parseInt(page.toString(), 10),
      limit: parseInt(limit.toString(), 10),
      sortBy: sortBy?.toString(),
      sortOrder: sortOrder as any,
    });

    return res.json(result);
  } catch (error: any) {
    console.error('Error fetching contacts:', error);
    return res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// GET /api/contacts/export/csv
router.get('/export/csv', authenticateAdmin, async (req: any, res: Response) => {
  try {
    const result = await store.getContacts({ limit: 10000 });
    await logAudit(req.adminUser.id, 'EXPORT_CONTACTS_CSV', 'CONTACT', null, { count: result.total }, req);
    return await exportContactsToCsv(result.contacts, res);
  } catch (error: any) {
    console.error('CSV export error:', error);
    return res.status(500).json({ error: 'CSV export failed' });
  }
});

// GET /api/contacts/export/xlsx
router.get('/export/xlsx', authenticateAdmin, async (req: any, res: Response) => {
  try {
    const result = await store.getContacts({ limit: 10000 });
    await logAudit(req.adminUser.id, 'EXPORT_CONTACTS_XLSX', 'CONTACT', null, { count: result.total }, req);
    return await exportContactsToXlsx(result.contacts, res);
  } catch (error: any) {
    console.error('XLSX export error:', error);
    return res.status(500).json({ error: 'XLSX export failed' });
  }
});

// GET /api/contacts/:id - Contact details
router.get('/:id', authenticateAdmin, async (req: any, res: Response) => {
  try {
    const contact = await store.getContactById(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    return res.json(contact);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch contact' });
  }
});

// PATCH /api/contacts/:id - Update contact
router.patch('/:id', authenticateAdmin, async (req: any, res: Response) => {
  try {
    const oldContact = await store.getContactById(req.params.id);
    const updated = await store.updateContact(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    await logAudit(req.adminUser.id, 'UPDATE_CONTACT', 'CONTACT', req.params.id, req.body, req);

    // If status changed, check automations
    if (oldContact && req.body.leadStatus && oldContact.leadStatus !== req.body.leadStatus) {
      const io = getIO();
      setTimeout(async () => {
        await runAutomations({
          triggerType: 'STATUS_CHANGED',
          contact: updated,
          oldStatus: oldContact.leadStatus,
          newStatus: req.body.leadStatus,
          io,
        });
      }, 200);
    }

    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update contact' });
  }
});

// DELETE /api/contacts/:id - Soft delete / privacy removal
router.delete('/:id', authenticateAdmin, requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: any, res: Response) => {
  try {
    const success = await store.deleteContact(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    await logAudit(req.adminUser.id, 'DELETE_CONTACT', 'CONTACT', req.params.id, {}, req);
    return res.json({ success: true, message: 'Contact record deleted' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete contact' });
  }
});

// POST /api/contacts/bulk - Bulk updates
router.post('/bulk', authenticateAdmin, async (req: any, res: Response) => {
  try {
    const { contactIds, updates } = req.body;
    if (!Array.isArray(contactIds) || contactIds.length === 0) {
      return res.status(400).json({ error: 'contactIds array is required' });
    }

    const count = await store.bulkUpdateContacts(contactIds, updates);
    await logAudit(req.adminUser.id, 'BULK_UPDATE_CONTACTS', 'CONTACT', null, { count, updates }, req);

    return res.json({ success: true, affected: count });
  } catch (error: any) {
    return res.status(500).json({ error: 'Bulk update failed' });
  }
});

export default router;
