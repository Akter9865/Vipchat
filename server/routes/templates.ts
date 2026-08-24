import { Router, Response } from 'express';
import { store } from '../storage/store.js';
import { authenticateAdmin, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateAdmin, async (req: any, res: Response) => {
  try {
    const { category } = req.query;
    const templates = await store.getTemplates(category?.toString());
    return res.json(templates);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

router.post('/', authenticateAdmin, async (req: any, res: Response) => {
  try {
    const { title, category, content, shortcutKey } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const template = await store.createTemplate({
      title,
      category: category || 'General',
      content,
      shortcutKey,
      createdById: req.adminUser.id,
    });

    return res.status(201).json(template);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to create template' });
  }
});

router.patch('/:id', authenticateAdmin, async (req: any, res: Response) => {
  try {
    const updated = await store.updateTemplate(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Template not found' });
    }
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update template' });
  }
});

router.delete('/:id', authenticateAdmin, requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: any, res: Response) => {
  try {
    await store.deleteTemplate(req.params.id);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete template' });
  }
});

export default router;
