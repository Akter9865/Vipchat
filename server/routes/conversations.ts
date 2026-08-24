import { Router, Response } from 'express';
import { store } from '../storage/store.js';
import { authenticateAdmin, authenticateCustomer, logAudit } from '../middleware/auth.js';
import { getIO, broadcastToConversation, broadcastToAdmin } from '../services/socketService.js';
import { runAutomations } from '../services/automationRunner.js';

const router = Router();

// GET /api/conversations - List conversations for Admin Inbox
router.get('/', authenticateAdmin, async (req: any, res: Response) => {
  try {
    const { tab = 'ALL', search } = req.query;
    const conversations = await store.getConversations({
      tab: tab as any,
      agentId: req.adminUser.id,
      search: search?.toString(),
    });
    return res.json(conversations);
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    return res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// GET /api/conversations/:id - Single conversation details
router.get('/:id', async (req: any, res: Response) => {
  try {
    const convo = await store.getConversationById(req.params.id);
    if (!convo) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    return res.json(convo);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// GET /api/conversations/:id/messages - Message history
router.get('/:id/messages', async (req: any, res: Response) => {
  try {
    const messages = await store.getMessages(req.params.id);
    return res.json(messages);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /api/conversations/:id/messages - Send a message
router.post('/:id/messages', async (req: any, res: Response) => {
  try {
    const { content, messageType = 'TEXT', replyToId, attachments = [] } = req.body;
    const conversationId = req.params.id;

    if (!content && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ error: 'Message content or attachment required' });
    }

    const convo = await store.getConversationById(conversationId);
    if (!convo) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    let senderName = req.body.senderName || 'Agent';
    let senderType: any = req.body.senderType || 'AGENT';
    let senderUserId = null;

    const message = await store.createMessage({
      conversationId,
      senderType,
      senderUserId,
      senderName,
      content: content || '',
      messageType,
      replyToId,
      attachments,
    });

    const io = getIO();
    if (io) {
      io.to(`conversation_${conversationId}`).emit('message:new', message);
      io.to('admin_inbox').emit('conversation:updated', {
        conversationId,
        lastMessageSnippet: message.content,
        lastMessageAt: message.createdAt,
        senderType,
      });
    }

    // Trigger automations if customer
    if (senderType === 'CUSTOMER' && convo.contact) {
      setTimeout(async () => {
        await runAutomations({
          triggerType: 'FIRST_MESSAGE',
          contact: convo.contact,
          conversationId,
          messageContent: content,
          io,
        });

        await runAutomations({
          triggerType: 'KEYWORD_MATCH',
          contact: convo.contact,
          conversationId,
          messageContent: content,
          io,
        });
      }, 200);
    }

    return res.status(201).json(message);
  } catch (error: any) {
    console.error('Error creating message:', error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
});

// PATCH /api/conversations/:id - Update status / assignment / priority / star
router.patch('/:id', authenticateAdmin, async (req: any, res: Response) => {
  try {
    const updated = await store.updateConversation(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    broadcastToConversation(req.params.id, 'conversation:updated', updated);
    broadcastToAdmin('conversation:updated', updated);

    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update conversation' });
  }
});

// GET /api/conversations/:id/notes - Internal notes
router.get('/:id/notes', authenticateAdmin, async (req: any, res: Response) => {
  try {
    const notes = await store.getInternalNotes(req.params.id);
    return res.json(notes);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// POST /api/conversations/:id/notes - Add internal note
router.post('/:id/notes', authenticateAdmin, async (req: any, res: Response) => {
  try {
    const { content, contactId } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const note = await store.createInternalNote({
      conversationId: req.params.id,
      contactId: contactId,
      authorId: req.adminUser.id,
      content: content.trim(),
    });

    return res.status(201).json(note);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to create internal note' });
  }
});

export default router;
