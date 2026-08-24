import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { store } from '../storage/store.js';
import { authenticateAdmin, requireRole, logAudit } from '../middleware/auth.js';

const router = Router();

// GET /api/users - List users
router.get('/', authenticateAdmin, requireRole(['SUPER_ADMIN', 'ADMIN']), async (_req: any, res: Response) => {
  try {
    const users = await store.getUsers();
    return res.json(users);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST /api/users - Create Admin or Agent
router.post('/', authenticateAdmin, requireRole(['SUPER_ADMIN']), async (req: any, res: Response) => {
  try {
    const { email, fullName, password, role, avatarUrl } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, fullName, and password are required' });
    }

    const existing = await store.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await store.createUser({
      email,
      fullName,
      passwordHash,
      role: role || 'AGENT',
      avatarUrl,
    });

    await logAudit(req.adminUser.id, 'CREATE_USER', 'USER', user.id, { email, role }, req);

    const { passwordHash: _, ...safeUser } = user;
    return res.status(201).json(safeUser);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to create user' });
  }
});

// PATCH /api/users/:id - Edit user
router.patch('/:id', authenticateAdmin, requireRole(['SUPER_ADMIN']), async (req: any, res: Response) => {
  try {
    const updates: any = { ...req.body };
    if (updates.password) {
      updates.passwordHash = await bcrypt.hash(updates.password, 10);
      delete updates.password;
    }

    const updated = await store.updateUser(req.params.id, updates);
    if (!updated) return res.status(404).json({ error: 'User not found' });

    await logAudit(req.adminUser.id, 'UPDATE_USER', 'USER', req.params.id, updates, req);

    const { passwordHash: _, ...safeUser } = updated;
    return res.json(safeUser);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update user' });
  }
});

// GET /api/users/:id/sessions - List active sessions for user
router.get('/:id/sessions', authenticateAdmin, requireRole(['SUPER_ADMIN']), async (req: any, res: Response) => {
  try {
    const sessions = await store.getUserSessionsByUserId(req.params.id);
    return res.json(sessions);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// POST /api/users/sessions/:token/revoke - Revoke a user's session
router.post('/sessions/:token/revoke', authenticateAdmin, requireRole(['SUPER_ADMIN']), async (req: any, res: Response) => {
  try {
    await store.revokeUserSession(req.params.token);
    await logAudit(req.adminUser.id, 'REVOKE_USER_SESSION', 'USER_SESSION', req.params.token, {}, req);
    return res.json({ success: true, message: 'Session revoked' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to revoke session' });
  }
});

export default router;
