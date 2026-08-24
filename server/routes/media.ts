import { Router, Response } from 'express';
import { uploadMiddleware, getFileCategory } from '../middleware/upload.js';
import { store } from '../storage/store.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = Router();

// POST /api/media/upload - Works for both authenticated admin and customer
router.post('/upload', uploadMiddleware.single('file'), async (req: any, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const category = getFileCategory(req.file.mimetype);
    const fileUrl = `/storage/uploads/${category}/${req.file.filename}`;

    const media = await store.createMediaFile({
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      storagePath: req.file.path,
      uploadedBy: req.adminUser?.id || req.body.senderName || 'Customer',
      fileCategory: category,
    });

    return res.status(201).json({
      success: true,
      file: {
        id: media.id,
        fileName: req.file.originalname,
        fileUrl,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        fileType: category.toUpperCase(),
      },
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return res.status(500).json({ error: error.message || 'File upload failed' });
  }
});

// GET /api/media - List media files
router.get('/', authenticateAdmin, async (req: any, res: Response) => {
  try {
    const { category } = req.query;
    const media = await store.getMediaFiles(category?.toString());
    return res.json(media);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch media assets' });
  }
});

export default router;
