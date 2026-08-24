import { Router, Response } from 'express';
import { store } from '../storage/store.js';
import { authenticateAdmin, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateAdmin, async (_req: any, res: Response) => {
  try {
    const tags = await store.getTags();
    return res.json(tags);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

router.post('/', authenticateAdmin, requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: any, res: Response) => {
  try {
    const { name, description, colorHex } = req.body;
    if (!name) return res.status(400).json({ error: 'Tag name is required' });

    const tag = await store.createTag({ name, description, colorHex });
    return res.status(201).json(tag);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to create tag' });
  }
});

router.patch('/:id', authenticateAdmin, requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: any, res: Response) => {
  try {
    const updated = await store.updateTag(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Tag not found' });
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update tag' });
  }
});

router.delete('/:id', authenticateAdmin, requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: any, res: Response) => {
  try {
    await store.deleteTag(req.params.id);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete tag' });
  }
});

export default router;
