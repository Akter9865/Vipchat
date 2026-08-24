import { Router, Response } from 'express';
import { store } from '../storage/store.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = Router();

// GET /api/analytics - Dashboard metrics & charts
router.get('/', authenticateAdmin, async (req: any, res: Response) => {
  try {
    const { range = 'LAST_7_DAYS' } = req.query;
    const analytics = await store.getAnalytics(range.toString());
    return res.json(analytics);
  } catch (error: any) {
    console.error('Analytics error:', error);
    return res.status(500).json({ error: 'Failed to generate analytics' });
  }
});

export default router;
