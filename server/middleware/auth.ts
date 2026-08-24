import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';
import { UserRole } from '../types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'vipchat_super_secret_jwt_key_2026';

export interface AuthenticatedAdminRequest extends Request {
  adminUser?: {
    id: string;
    email: string;
    role: UserRole;
    fullName: string;
    sessionId?: string;
  };
}

export interface AuthenticatedCustomerRequest extends Request {
  customer?: {
    id: string;
    fullName: string;
    mobileNumber: string;
    emailAddress?: string | null;
    sessionId: string;
  };
}

export async function authenticateCustomer(
  req: AuthenticatedCustomerRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const sessionToken = req.cookies?.customer_session || req.headers['x-customer-session'];

    if (!sessionToken || typeof sessionToken !== 'string') {
      return res.status(401).json({ error: 'Customer session not found or expired', code: 'UNAUTHORIZED' });
    }

    const session = await prisma.contactSession.findFirst({
      where: {
        sessionToken,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        contact: true,
      },
    });

    if (!session || !session.contact || session.contact.deletedAt) {
      res.clearCookie('customer_session');
      return res.status(401).json({ error: 'Invalid or revoked customer session', code: 'SESSION_REVOKED' });
    }

    // Update last active
    await prisma.contact.update({
      where: { id: session.contact.id },
      data: { lastActiveAt: new Date(), isOnline: true },
    }).catch(() => {});

    req.customer = {
      id: session.contact.id,
      fullName: session.contact.fullName,
      mobileNumber: session.contact.mobileNumber,
      emailAddress: session.contact.emailAddress,
      sessionId: session.id,
    };

    next();
  } catch (error) {
    console.error('Customer auth error:', error);
    return res.status(500).json({ error: 'Internal server error in customer authentication' });
  }
}

export async function authenticateAdmin(
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token =
      req.cookies?.admin_session ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : null);

    if (!token) {
      return res.status(401).json({ error: 'Admin session required', code: 'ADMIN_UNAUTHORIZED' });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      res.clearCookie('admin_session');
      return res.status(401).json({ error: 'Invalid or expired admin token', code: 'TOKEN_EXPIRED' });
    }

    const userSession = await prisma.userSession.findFirst({
      where: {
        token,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: true,
      },
    });

    if (!userSession || !userSession.user || !userSession.user.isActive) {
      res.clearCookie('admin_session');
      return res.status(401).json({ error: 'Admin session revoked or account disabled', code: 'SESSION_INVALID' });
    }

    // Update last active
    await prisma.user.update({
      where: { id: userSession.user.id },
      data: { lastActiveAt: new Date() },
    }).catch(() => {});

    req.adminUser = {
      id: userSession.user.id,
      email: userSession.user.email,
      role: userSession.user.role as UserRole,
      fullName: userSession.user.fullName,
      sessionId: userSession.id,
    };

    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(500).json({ error: 'Internal server error in admin authentication' });
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
    if (!req.adminUser) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    if (!allowedRoles.includes(req.adminUser.role)) {
      return res.status(403).json({
        error: `Forbidden: requires one of roles [${allowedRoles.join(', ')}]`,
        code: 'FORBIDDEN',
      });
    }

    next();
  };
}

export async function logAudit(
  userId: string | null,
  action: string,
  targetType: string,
  targetId?: string | null,
  details: Record<string, any> = {},
  req?: Request
) {
  try {
    const ipAddress = req?.ip || req?.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req?.headers['user-agent'] || 'Unknown';

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        targetType,
        targetId: targetId || null,
        details,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
}
