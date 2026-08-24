import { describe, it, expect } from 'vitest';
import { store } from '../server/storage/store.js';
import bcrypt from 'bcryptjs';

describe('Authentication & Session Persistence', () => {
  it('should create or find contact on customer onboarding without password', async () => {
    const res = await store.findOrCreateContact('Test VIP Guest', '+919999888877', 'testguest@example.com');
    expect(res.contact).toBeDefined();
    expect(res.contact.fullName).toBe('Test VIP Guest');
    expect(res.sessionToken).toBeDefined();
    expect(res.conversation).toBeDefined();
  });

  it('should validate persistent customer session from session token', async () => {
    const res = await store.findOrCreateContact('Returning VIP Guest', '+919999888866', 'returning@example.com');
    const session = await store.getContactSession(res.sessionToken);
    expect(session).toBeDefined();
    expect(session?.contact?.fullName).toBe('Returning VIP Guest');
  });

  it('should revoke customer session on explicit logout', async () => {
    const res = await store.findOrCreateContact('Logout Guest', '+919999888855');
    await store.revokeContactSession(res.sessionToken);
    const session = await store.getContactSession(res.sessionToken);
    expect(session).toBeNull();
  });

  it('should authenticate admin user with hashed password', async () => {
    const admin = await store.getUserByEmail('admin@vipchat.live');
    expect(admin).toBeDefined();
    expect(admin?.role).toBe('SUPER_ADMIN');

    const valid = await bcrypt.compare('VipAdmin@2026!', admin!.passwordHash);
    expect(valid).toBe(true);
  });
});
