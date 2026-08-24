import { describe, it, expect } from 'vitest';
import { store } from '../server/storage/store.js';

describe('Real-time Messaging & Internal Notes', () => {
  it('should create message with delivery status and snippet update', async () => {
    const convos = await store.getConversations({ tab: 'ALL' });
    const convo = convos[0];

    const message = await store.createMessage({
      conversationId: convo.id,
      senderType: 'CUSTOMER',
      senderName: 'VIP Customer',
      content: 'Hello, need help with VIP deposit!',
    });

    expect(message).toBeDefined();
    expect(message.content).toBe('Hello, need help with VIP deposit!');
    expect(message.status).toBe('SENT');

    const updatedConvo = await store.getConversationById(convo.id);
    expect(updatedConvo?.lastMessageSnippet).toContain('Hello, need help');
  });

  it('should add private internal note visible to team', async () => {
    const convos = await store.getConversations({ tab: 'ALL' });
    const convo = convos[0];

    const note = await store.createInternalNote({
      conversationId: convo.id,
      contactId: convo.contactId,
      authorId: 'usr-admin-1',
      content: 'Private verification test note',
    });

    expect(note).toBeDefined();
    expect(note.content).toBe('Private verification test note');
  });
});
