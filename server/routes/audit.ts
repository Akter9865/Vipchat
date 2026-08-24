import { Router, Response } from 'express';
import { store } from '../storage/store.js';
import { authenticateAdmin, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/audit-logs
router.get('/', authenticateAdmin, requireRole(['SUPER_ADMIN']), async (_req: any, res: Response) => {
  try {
    const logs = await store.getAuditLogs();
    return res.json(logs);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// GET /api/notifications
router.get('/notifications', authenticateAdmin, async (_req: any, res: Response) => {
  try {
    const notifs = await store.getNotifications();
    return res.json(notifs);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/notifications/:id/read', authenticateAdmin, async (req: any, res: Response) => {
  try {
    await store.markNotificationRead(req.params.id);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update notification' });
  }
});

export default router;
