import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { store } from '../storage/store.js';
import { authenticateAdmin, authenticateCustomer, logAudit } from '../middleware/auth.js';
import { runAutomations } from '../services/automationRunner.js';
import { getIO } from '../services/socketService.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'vipchat_super_secret_jwt_key_2026';
const isProd = process.env.NODE_ENV === 'production';

// CUSTOMER ONBOARDING / LOGIN (No password, persistent session)
router.post('/customer-onboarding', async (req: Request, res: Response) => {
  try {
    const { fullName, mobileNumber, emailAddress } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ error: 'Full name is required' });
    }
    if (!mobileNumber || !mobileNumber.trim()) {
      return res.status(400).json({ error: 'Mobile number is required' });
    }

    const ip = req.ip || req.headers['x-forwarded-for']?.toString();
    const userAgent = req.headers['user-agent'];

    const result = await store.findOrCreateContact(
      fullName,
      mobileNumber,
      emailAddress,
      ip,
      userAgent
    );

    // Set secure persistent cookie (30 days)
    res.cookie('customer_session', result.sessionToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      expires: result.expiresAt,
      path: '/',
    });

    // Run auto-welcome or registration automations
    const io = getIO();
    setTimeout(async () => {
      await runAutomations({
        triggerType: 'CUSTOMER_REGISTERED',
        contact: result.contact,
        conversationId: result.conversation.id,
        io,
      });
    }, 400);

    return res.status(200).json({
      success: true,
      contact: result.contact,
      conversation: result.conversation,
      sessionToken: result.sessionToken,
    });
  } catch (error: any) {
    console.error('Customer onboarding error:', error);
    return res.status(500).json({ error: 'Failed to complete onboarding' });
  }
});

// CUSTOMER SESSION CHECK
router.get('/customer-session', async (req: Request, res: Response) => {
  try {
    const sessionToken = req.cookies?.customer_session || req.headers['x-customer-session'];
    if (!sessionToken || typeof sessionToken !== 'string') {
      return res.status(401).json({ authenticated: false });
    }

    const session = await store.getContactSession(sessionToken);
    if (!session || !session.contact) {
      res.clearCookie('customer_session');
      return res.status(401).json({ authenticated: false });
    }

    const convo = await store.getCustomerActiveConversation(session.contact.id);

    return res.status(200).json({
      authenticated: true,
      contact: session.contact,
      conversation: convo,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Session lookup failed' });
  }
});

// CUSTOMER EXPLICIT LOGOUT
router.post('/customer-logout', async (req: Request, res: Response) => {
  try {
    const sessionToken = req.cookies?.customer_session;
    if (sessionToken) {
      await store.revokeContactSession(sessionToken);
    }
    res.clearCookie('customer_session');
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Logout failed' });
  }
});

// ADMIN LOGIN
router.post('/admin-login', async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await store.getUserByEmail(email);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid email or disabled account' });
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const expiresIn = rememberMe ? '30d' : '24h';
    const expiresAt = new Date(Date.now() + (rememberMe ? 30 * 86400000 : 86400000));

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
      JWT_SECRET,
      { expiresIn }
    );

    const ip = req.ip || req.headers['x-forwarded-for']?.toString();
    const userAgent = req.headers['user-agent'];

    await store.createUserSession({
      userId: user.id,
      token,
      userAgent,
      ipAddress: ip,
      expiresAt,
    });

    await logAudit(user.id, 'ADMIN_LOGIN', 'USER', user.id, { email: user.email }, req);

    res.cookie('admin_session', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    const { passwordHash, ...userSafe } = user;

    return res.status(200).json({
      success: true,
      token,
      user: userSafe,
    });
  } catch (error: any) {
    console.error('Admin login error:', error);
    return res.status(500).json({ error: 'Login process failed' });
  }
});

// ADMIN CURRENT SESSION
router.get('/admin-session', authenticateAdmin, async (req: any, res: Response) => {
  return res.status(200).json({
    authenticated: true,
    user: req.adminUser,
  });
});

// ADMIN LOGOUT
router.post('/admin-logout', authenticateAdmin, async (req: any, res: Response) => {
  try {
    const token = req.cookies?.admin_session || req.headers.authorization?.slice(7);
    if (token) {
      await store.revokeUserSession(token);
    }
    await logAudit(req.adminUser?.id || null, 'ADMIN_LOGOUT', 'USER', req.adminUser?.id, {}, req);
    res.clearCookie('admin_session');
    return res.json({ success: true, message: 'Admin logged out' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Logout failed' });
  }
});

export default router;
