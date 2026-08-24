import express from 'express';
import http from 'http';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

dotenv.config();

import { connectDb } from './db.js';
import { store } from './storage/store.js';
import { initSocketIO } from './services/socketService.js';

// Route handlers
import authRoutes from './routes/auth.js';
import contactsRoutes from './routes/contacts.js';
import conversationsRoutes from './routes/conversations.js';
import templatesRoutes from './routes/templates.js';
import tagsRoutes from './routes/tags.js';
import automationsRoutes from './routes/automations.js';
import mediaRoutes from './routes/media.js';
import usersRoutes from './routes/users.js';
import settingsRoutes from './routes/settings.js';
import analyticsRoutes from './routes/analytics.js';
import auditRoutes from './routes/audit.js';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Initialize Database connection & Store
await store.init();
await connectDb();

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows flexible avatar/media embeds & websocket
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  })
);

// Body and Cookie Parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Rate Limiting on sensitive endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', apiLimiter);

// Serve Media Storage files statically with access control
const STORAGE_PATH = process.env.STORAGE_PATH || './storage/uploads';
app.use('/storage/uploads', express.static(path.resolve(STORAGE_PATH)));

// Initialize Socket.IO
initSocketIO(server);

// API Health Check (used by Dokploy / Docker healthcheck)
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'vipchat-live-crm',
    version: '1.0.0',
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/automations', automationsRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit-logs', auditRoutes);

// Production Static Frontend Servicing
if (isProd) {
  const distPath = path.resolve('dist');
  app.use(express.static(distPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/storage') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// 404 Handler
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error Handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('Server unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`
  👑 ============================================
  👑 [BRAND NAME] Live Chat CRM Server Running
  👑 ============================================
  🚀 HTTP Server: http://localhost:${PORT}
  💬 Socket.IO:   Ready for live messaging
  🔒 Production:  ${isProd ? 'ENABLED' : 'DEVELOPMENT'}
  `);
});

export { app, server };
