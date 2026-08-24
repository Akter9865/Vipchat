import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { store } from '../storage/store.js';
import { runAutomations } from './automationRunner.js';

const JWT_SECRET = process.env.JWT_SECRET || 'vipchat_super_secret_jwt_key_2026';

let io: SocketIOServer;

export function initSocketIO(httpServer: HttpServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingInterval: 15000,
    pingTimeout: 30000,
  });

  io.use(async (socket: Socket, next) => {
    try {
      const auth = socket.handshake.auth || {};
      const token = auth.token;
      const customerSession = auth.customerSession;

      if (token) {
        try {
          const decoded: any = jwt.verify(token, JWT_SECRET);
          socket.data.adminUser = decoded;
          return next();
        } catch (e) {
          // Fall through to check customer
        }
      }

      if (customerSession) {
        const sess = await store.getContactSession(customerSession);
        if (sess) {
          socket.data.customer = sess.contact;
          socket.data.sessionId = sess.id;
          return next();
        }
      }

      // Allow guest / public socket connection
      next();
    } catch (err) {
      next();
    }
  });

  io.on('connection', (socket: Socket) => {
    const isCustomer = !!socket.data.customer;
    const isAdmin = !!socket.data.adminUser;

    if (isAdmin) {
      socket.join('admin_inbox');
      if (socket.data.adminUser?.id) {
        socket.join(`user_${socket.data.adminUser.id}`);
      }
    } else if (isCustomer) {
      socket.join(`customer_${socket.data.customer.id}`);
    }

    // Join specific conversation room
    socket.on('conversation:join', ({ conversationId }) => {
      if (conversationId) {
        socket.join(`conversation_${conversationId}`);
      }
    });

    socket.on('conversation:leave', ({ conversationId }) => {
      if (conversationId) {
        socket.leave(`conversation_${conversationId}`);
      }
    });

    // Send Message
    socket.on('message:send', async (data, callback) => {
      try {
        const { conversationId, content, messageType = 'TEXT', replyToId, attachments = [] } = data;

        let senderName = 'Guest';
        let senderType: any = 'CUSTOMER';
        let senderUserId = null;

        if (isAdmin) {
          senderName = socket.data.adminUser.fullName;
          senderType = 'AGENT';
          senderUserId = socket.data.adminUser.id;
        } else if (isCustomer) {
          senderName = socket.data.customer.fullName;
          senderType = 'CUSTOMER';
        }

        const msg = await store.createMessage({
          conversationId,
          senderType,
          senderUserId,
          senderName,
          content,
          messageType,
          replyToId,
          attachments,
        });

        // Broadcast to conversation room
        io.to(`conversation_${conversationId}`).emit('message:new', msg);

        // Notify admin inbox
        io.to('admin_inbox').emit('conversation:updated', {
          conversationId,
          lastMessageSnippet: msg.content,
          lastMessageAt: msg.createdAt,
          senderType: msg.senderType,
        });

        if (typeof callback === 'function') {
          callback({ success: true, message: msg });
        }

        // Trigger background automations if customer message
        if (senderType === 'CUSTOMER' && socket.data.customer) {
          setTimeout(async () => {
            await runAutomations({
              triggerType: 'FIRST_MESSAGE',
              contact: socket.data.customer,
              conversationId,
              messageContent: content,
              io,
            });

            await runAutomations({
              triggerType: 'KEYWORD_MATCH',
              contact: socket.data.customer,
              conversationId,
              messageContent: content,
              io,
            });
          }, 300);
        }
      } catch (err: any) {
        console.error('Socket message:send error:', err);
        if (typeof callback === 'function') {
          callback({ success: false, error: err.message });
        }
      }
    });

    // Typing indicators
    socket.on('typing:start', ({ conversationId }) => {
      socket.to(`conversation_${conversationId}`).emit('typing:status', {
        conversationId,
        isTyping: true,
        userName: isAdmin ? socket.data.adminUser?.fullName || 'Agent' : socket.data.customer?.fullName || 'Customer',
        userType: isAdmin ? 'AGENT' : 'CUSTOMER',
      });
    });

    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(`conversation_${conversationId}`).emit('typing:status', {
        conversationId,
        isTyping: false,
        userType: isAdmin ? 'AGENT' : 'CUSTOMER',
      });
    });

    // Mark as read
    socket.on('message:read_all', async ({ conversationId }) => {
      try {
        const readerType = isAdmin ? 'AGENT' : 'CUSTOMER';
        await store.markConversationAsRead(conversationId, readerType);
        io.to(`conversation_${conversationId}`).emit('conversation:read', {
          conversationId,
          readerType,
        });
        io.to('admin_inbox').emit('conversation:read_updated', { conversationId });
      } catch (err) {}
    });

    socket.on('disconnect', () => {
      if (isCustomer && socket.data.customer?.id) {
        // Optional presence offline
      }
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  return io;
}

export function broadcastToAdmin(event: string, payload: any) {
  if (io) {
    io.to('admin_inbox').emit(event, payload);
  }
}

export function broadcastToConversation(conversationId: string, event: string, payload: any) {
  if (io) {
    io.to(`conversation_${conversationId}`).emit(event, payload);
  }
}
