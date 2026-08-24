import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';

const STORAGE_PATH = process.env.STORAGE_PATH || './storage/uploads';

// Ensure base upload directories exist
const categories = ['images', 'videos', 'audio', 'documents', 'others'];
categories.forEach((cat) => {
  const dir = path.join(STORAGE_PATH, cat);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

export function getFileCategory(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'images';
  if (mimeType.startsWith('video/')) return 'videos';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (
    mimeType.includes('pdf') ||
    mimeType.includes('msword') ||
    mimeType.includes('officedocument') ||
    mimeType.includes('text') ||
    mimeType.includes('zip') ||
    mimeType.includes('rar')
  ) {
    return 'documents';
  }
  return 'others';
}

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const category = getFileCategory(file.mimetype);
    const targetDir = path.join(STORAGE_PATH, category);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.bin';
    const safeName = `${uuidv4()}${ext}`;
    cb(null, safeName);
  },
});

const allowedMimeTypes = [
  // Images
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  // Videos
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-matroska',
  // Audio
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
  'audio/webm',
  'audio/mp4',
  'audio/aac',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
  'application/zip',
];

const maxSizeBytes = parseInt(process.env.MAX_UPLOAD_SIZE_MB || '50', 10) * 1024 * 1024;

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: maxSizeBytes,
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});
