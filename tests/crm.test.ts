import { describe, it, expect } from 'vitest';
import { store } from '../server/storage/store.js';

describe('Contacts CRM & Lead Operations', () => {
  it('should list contacts with pagination and filtering', async () => {
    const res = await store.getContacts({ limit: 10 });
    expect(res.contacts.length).toBeGreaterThan(0);
    expect(res.total).toBeGreaterThan(0);
  });

  it('should update lead status and lead score', async () => {
    const list = await store.getContacts({ limit: 1 });
    const contact = list.contacts[0];

    const updated = await store.updateContact(contact.id, {
      leadStatus: 'HIGH_VALUE',
      leadScore: 99,
    });

    expect(updated).toBeDefined();
    expect(updated?.leadStatus).toBe('HIGH_VALUE');
    expect(updated?.leadScore).toBe(99);
  });

  it('should perform bulk updates on multiple contact records', async () => {
    const list = await store.getContacts({ limit: 3 });
    const ids = list.contacts.map((c) => c.id);

    const affected = await store.bulkUpdateContacts(ids, {
      leadStatus: 'QUALIFIED',
    });

    expect(affected).toBe(ids.length);
  });
});
