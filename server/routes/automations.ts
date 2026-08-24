import { Router, Response } from 'express';
import { store } from '../storage/store.js';
import { authenticateAdmin, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateAdmin, async (_req: any, res: Response) => {
  try {
    const automations = await store.getAutomations();
    return res.json(automations);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch automations' });
  }
});

router.post('/', authenticateAdmin, requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: any, res: Response) => {
  try {
    const { name, description, triggerType, conditions, actions, delaySeconds } = req.body;
    if (!name || !triggerType) {
      return res.status(400).json({ error: 'Name and triggerType are required' });
    }

    const auto = await store.createAutomation({
      name,
      description,
      triggerType,
      conditions,
      actions,
      delaySeconds,
    });
    return res.status(201).json(auto);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to create automation' });
  }
});

router.patch('/:id', authenticateAdmin, requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: any, res: Response) => {
  try {
    const updated = await store.updateAutomation(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Automation not found' });
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update automation' });
  }
});

router.delete('/:id', authenticateAdmin, requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: any, res: Response) => {
  try {
    await store.deleteAutomation(req.params.id);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete automation' });
  }
});

router.get('/logs', authenticateAdmin, async (_req: any, res: Response) => {
  try {
    const logs = await store.getAutomationLogs();
    return res.json(logs);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch automation logs' });
  }
});

export default router;
