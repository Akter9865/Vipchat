import { Router, Response } from 'express';
import { store } from '../storage/store.js';
import { authenticateAdmin, requireRole, logAudit } from '../middleware/auth.js';

const router = Router();

// GET /api/settings/appearance - Public or Admin
router.get('/appearance', async (_req: any, res: Response) => {
  try {
    const settings = await store.getSetting('appearance');
    return res.json(settings || {});
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch appearance settings' });
  }
});

// PATCH /api/settings/appearance - Super Admin only
router.patch('/appearance', authenticateAdmin, requireRole(['SUPER_ADMIN']), async (req: any, res: Response) => {
  try {
    const current = (await store.getSetting('appearance')) || {};
    const updated = { ...current, ...req.body };
    await store.setSetting('appearance', updated);

    await logAudit(req.adminUser.id, 'UPDATE_APPEARANCE_SETTINGS', 'SETTING', 'appearance', req.body, req);

    return res.json({ success: true, settings: updated });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update appearance settings' });
  }
});

export default router;
