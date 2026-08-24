import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { prisma } from '../db.js';
import { UserRole, LeadStatus, ConversationStatus, PriorityLevel, MessageSenderType, MessageStatus, MessageType } from '../types.js';

const STORAGE_PATH = process.env.STORAGE_PATH || './storage/uploads';
const DATA_FILE = path.join(STORAGE_PATH, 'store-data.json');

// Memory cache / fallback store
interface StoreState {
  users: any[];
  userSessions: any[];
  contacts: any[];
  contactSessions: any[];
  tags: any[];
  contactTags: any[];
  conversations: any[];
  messages: any[];
  messageAttachments: any[];
  internalNotes: any[];
  messageTemplates: any[];
  automations: any[];
  automationLogs: any[];
  mediaFiles: any[];
  settings: Record<string, any>;
  auditLogs: any[];
  notifications: any[];
}

let isPgConnected = false;

// Initial state builder
function getInitialStore(): StoreState {
  const passwordHash = bcrypt.hashSync('VipAdmin@2026!', 10);
  const agentPasswordHash = bcrypt.hashSync('Agent@2026!', 10);

  const superAdmin = {
    id: 'usr-admin-1',
    email: 'admin@vipchat.live',
    fullName: 'VIP Master Admin',
    passwordHash,
    role: 'SUPER_ADMIN' as UserRole,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    lastActiveAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const adminUser = {
    id: 'usr-ops-2',
    email: 'operations@vipchat.live',
    fullName: 'Operations Manager',
    passwordHash,
    role: 'ADMIN' as UserRole,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    lastActiveAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const agent1 = {
    id: 'usr-agent-1',
    email: 'sophia.agent@vipchat.live',
    fullName: 'Sophia Martinez (Senior VIP Agent)',
    passwordHash: agentPasswordHash,
    role: 'AGENT' as UserRole,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    lastActiveAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const agent2 = {
    id: 'usr-agent-2',
    email: 'alex.agent@vipchat.live',
    fullName: 'Alex Reynolds (Customer Success)',
    passwordHash: agentPasswordHash,
    role: 'AGENT' as UserRole,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    lastActiveAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const agent3 = {
    id: 'usr-agent-3',
    email: 'elena.agent@vipchat.live',
    fullName: 'Elena Rostova (Lead Conversion)',
    passwordHash: agentPasswordHash,
    role: 'AGENT' as UserRole,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    lastActiveAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const tags = [
    { id: 'tag-1', name: 'VIP Client', description: 'Highest tier priority client', colorHex: '#dfb75c', isActive: true, createdAt: new Date().toISOString() },
    { id: 'tag-2', name: 'Hot Lead', description: 'Immediate conversion potential', colorHex: '#ef4444', isActive: true, createdAt: new Date().toISOString() },
    { id: 'tag-3', name: 'Qualified', description: 'Lead meets all qualification criteria', colorHex: '#10b981', isActive: true, createdAt: new Date().toISOString() },
    { id: 'tag-4', name: 'Confirmed', description: 'Booking or signup confirmed', colorHex: '#3b82f6', isActive: true, createdAt: new Date().toISOString() },
    { id: 'tag-5', name: 'Follow Up', description: 'Follow up needed within 24h', colorHex: '#f59e0b', isActive: true, createdAt: new Date().toISOString() },
    { id: 'tag-6', name: 'Existing Customer', description: 'Returning loyal customer', colorHex: '#8b5cf6', isActive: true, createdAt: new Date().toISOString() },
    { id: 'tag-7', name: 'High Value', description: 'Large potential deal size', colorHex: '#ec4899', isActive: true, createdAt: new Date().toISOString() },
  ];

  const templates = [
    {
      id: 'tmpl-1',
      title: 'VIP Welcome & Introduction',
      category: 'Greetings',
      content: 'Hello {{name}}! Welcome to VIP Chat Concierge. My name is {{agent_name}}, and I am dedicated to assisting you today. How may I help you?',
      shortcutKey: '/welcome',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tmpl-2',
      title: 'Account Verification Instructions',
      category: 'Verification',
      content: 'Hi {{name}}, to ensure maximum security for your account (Mobile: {{mobile}}), could you please verify your preferred communication channel?',
      shortcutKey: '/verify',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tmpl-3',
      title: 'Service Catalog & VIP Tiers',
      category: 'Sales',
      content: 'Here is our exclusive VIP tier breakdown! As a valued guest on {{date}}, you qualify for express 24×7 withdrawal speed and dedicated agent support.',
      shortcutKey: '/tiers',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tmpl-4',
      title: 'Payment & Deposit Assistance',
      category: 'Billing',
      content: 'Thank you for reaching out, {{name}}. We support instant UPI, Bank Wire, and Crypto transfers. Please let me know your preferred method to provide secure instructions.',
      shortcutKey: '/deposit',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tmpl-5',
      title: 'Withdrawal Processing Update',
      category: 'Support',
      content: 'Dear {{name}}, your withdrawal request has been received by our finance desk and is being processed with top priority. Average processing time is under 15 minutes.',
      shortcutKey: '/withdraw',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tmpl-6',
      title: 'Technical Assistance Request',
      category: 'Support',
      content: 'Could you please describe the issue you are experiencing or share a screenshot? We will resolve this for you immediately.',
      shortcutKey: '/tech',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tmpl-7',
      title: 'Follow Up Reminder',
      category: 'Follow Up',
      content: 'Hi {{name}}, just following up to check if you had any other questions regarding your inquiry earlier today. We are always here 24×7!',
      shortcutKey: '/followup',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tmpl-8',
      title: 'VIP Promotion / Bonus Code',
      category: 'Promotion',
      content: 'Congratulations {{name}}! You have been awarded a 100% Welcome VIP match bonus. Use code VIP2026 when completing your registration.',
      shortcutKey: '/promo',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tmpl-9',
      title: 'Transfer to Specialist Agent',
      category: 'Transfer',
      content: 'I am transferring you to our senior account specialist who will assist you with the final confirmation. Please hold for just a moment.',
      shortcutKey: '/transfer',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tmpl-10',
      title: 'Polite Conversation Close',
      category: 'Closing',
      content: 'Thank you for contacting VIP Chat Live, {{name}}! If you need anything else in the future, do not hesitate to message us. Have a wonderful day!',
      shortcutKey: '/close',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ];

  const automations = [
    {
      id: 'auto-1',
      name: 'Auto-Welcome on Customer Registration',
      description: 'Sends instant VIP concierge greeting when customer joins live chat',
      triggerType: 'CUSTOMER_REGISTERED',
      conditions: [],
      actions: [
        {
          actionType: 'SEND_MESSAGE',
          payload: {
            content: 'WELCOME TO VIP CHAT CONCIERGE 👑\n★ ( PREMIUM 24×7 LIVE ASSISTANCE ) ★\n───────────────────\n★ FASTEST SUPPORT & INQUIRY HANDLING\n☆ 24×7 INSTANT RESPONSES\n───────────────────\nHow can our VIP team assist you today?',
          },
        },
        { actionType: 'ADD_TAG', payload: { tagName: 'Hot Lead' } },
      ],
      delaySeconds: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'auto-2',
      name: 'Auto-Assign High Value Leads to Senior Agent',
      description: 'Assigns VIP leads to Sophia Martinez automatically',
      triggerType: 'STATUS_CHANGED',
      conditions: [{ field: 'leadStatus', operator: 'EQUALS', value: 'HIGH_VALUE' }],
      actions: [
        { actionType: 'ASSIGN_AGENT', payload: { agentId: 'usr-agent-1' } },
        { actionType: 'ADD_TAG', payload: { tagName: 'VIP Client' } },
        { actionType: 'ADD_INTERNAL_NOTE', payload: { note: 'Auto-assigned to Senior Agent due to High Value lead tier.' } },
      ],
      delaySeconds: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'auto-3',
      name: 'Deposit / Payment Keyword Auto-Responder',
      description: 'Responds with payment guide when customer mentions deposit or payment',
      triggerType: 'KEYWORD_MATCH',
      conditions: [{ field: 'keyword', operator: 'CONTAINS', value: 'deposit' }],
      actions: [
        {
          actionType: 'SEND_MESSAGE',
          payload: {
            content: '💳 Our instant deposit gateway supports UPI, Net Banking, and USDT. All deposits reflect in 60 seconds with 0% fees.',
          },
        },
      ],
      delaySeconds: 2,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'auto-4',
      name: 'Qualify Returning VIP Contacts',
      description: 'Upgrades lead status to Qualified when mobile number is verified',
      triggerType: 'FIRST_MESSAGE',
      conditions: [{ field: 'hasMobile', operator: 'EQUALS', value: true }],
      actions: [
        { actionType: 'CHANGE_STATUS', payload: { status: 'QUALIFIED' } },
      ],
      delaySeconds: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'auto-5',
      name: 'Inactivity Check-in Nudge',
      description: 'Sends gentle check-in message when conversation is waiting for reply',
      triggerType: 'INACTIVITY',
      conditions: [{ field: 'conversationStatus', operator: 'EQUALS', value: 'WAITING' }],
      actions: [
        {
          actionType: 'SEND_MESSAGE',
          payload: {
            content: 'Hi {{name}}, just checking if you are still there! Feel free to ask if you need more details.',
          },
        },
      ],
      delaySeconds: 1800,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ];

  const contactsData = [
    { id: 'cnt-1', fullName: 'Vikram Malhotra', mobileNumber: '+919876543210', emailAddress: 'vikram.m@example.com', status: 'HIGH_VALUE', score: 95, agentId: 'usr-agent-1', tagId: 'tag-1' },
    { id: 'cnt-2', fullName: 'Priya Sharma', mobileNumber: '+919812345678', emailAddress: 'priya.s@example.com', status: 'QUALIFIED', score: 80, agentId: 'usr-agent-2', tagId: 'tag-3' },
    { id: 'cnt-3', fullName: 'Rahul Verma', mobileNumber: '+919765432109', emailAddress: 'rahul.v@example.com', status: 'CONFIRMED', score: 90, agentId: 'usr-agent-3', tagId: 'tag-4' },
    { id: 'cnt-4', fullName: 'Ananya Roy', mobileNumber: '+919654321098', emailAddress: 'ananya.r@example.com', status: 'HOT_LEAD', score: 85, agentId: 'usr-agent-1', tagId: 'tag-2' },
    { id: 'cnt-5', fullName: 'Rohan Gupta', mobileNumber: '+919543210987', emailAddress: 'rohan.g@example.com', status: 'NEW_LEAD', score: 50, agentId: null, tagId: 'tag-2' },
    { id: 'cnt-6', fullName: 'Kavita Patel', mobileNumber: '+919432109876', emailAddress: 'kavita.p@example.com', status: 'FOLLOW_UP', score: 65, agentId: 'usr-agent-2', tagId: 'tag-5' },
    { id: 'cnt-7', fullName: 'Siddharth Rao', mobileNumber: '+919321098765', emailAddress: 'siddharth.r@example.com', status: 'CONVERTED', score: 100, agentId: 'usr-agent-1', tagId: 'tag-6' },
    { id: 'cnt-8', fullName: 'Deepak Joshi', mobileNumber: '+919210987654', emailAddress: 'deepak.j@example.com', status: 'QUALIFIED', score: 75, agentId: 'usr-agent-3', tagId: 'tag-3' },
    { id: 'cnt-9', fullName: 'Sneha Nair', mobileNumber: '+919109876543', emailAddress: 'sneha.n@example.com', status: 'HIGH_VALUE', score: 92, agentId: 'usr-agent-1', tagId: 'tag-7' },
    { id: 'cnt-10', fullName: 'Amitabh Sen', mobileNumber: '+919098765432', emailAddress: 'amitabh.s@example.com', status: 'CONTACTED', score: 60, agentId: 'usr-agent-2', tagId: 'tag-5' },
    { id: 'cnt-11', fullName: 'Meera Deshmukh', mobileNumber: '+918987654321', emailAddress: 'meera.d@example.com', status: 'CONFIRMED', score: 88, agentId: 'usr-agent-3', tagId: 'tag-4' },
    { id: 'cnt-12', fullName: 'Karan Mehra', mobileNumber: '+918876543210', emailAddress: 'karan.m@example.com', status: 'NEW_LEAD', score: 45, agentId: null, tagId: 'tag-2' },
    { id: 'cnt-13', fullName: 'Zoya Khan', mobileNumber: '+918765432109', emailAddress: 'zoya.k@example.com', status: 'HIGH_VALUE', score: 94, agentId: 'usr-agent-1', tagId: 'tag-1' },
    { id: 'cnt-14', fullName: 'Arjun Singhania', mobileNumber: '+918654321098', emailAddress: 'arjun.s@example.com', status: 'CONVERTED', score: 98, agentId: 'usr-agent-2', tagId: 'tag-6' },
    { id: 'cnt-15', fullName: 'Tanvi Agarwal', mobileNumber: '+918543210987', emailAddress: 'tanvi.a@example.com', status: 'QUALIFIED', score: 78, agentId: 'usr-agent-3', tagId: 'tag-3' },
    { id: 'cnt-16', fullName: 'Rajesh Iyer', mobileNumber: '+918432109876', emailAddress: 'rajesh.i@example.com', status: 'FOLLOW_UP', score: 62, agentId: 'usr-agent-1', tagId: 'tag-5' },
    { id: 'cnt-17', fullName: 'Divya Kapoor', mobileNumber: '+918321098765', emailAddress: 'divya.k@example.com', status: 'CONTACTED', score: 55, agentId: 'usr-agent-2', tagId: 'tag-2' },
    { id: 'cnt-18', fullName: 'Sameer Bansal', mobileNumber: '+918210987654', emailAddress: 'sameer.b@example.com', status: 'NOT_INTERESTED', score: 20, agentId: null, tagId: 'tag-5' },
    { id: 'cnt-19', fullName: 'Pooja Hegde', mobileNumber: '+918109876543', emailAddress: 'pooja.h@example.com', status: 'CONFIRMED', score: 86, agentId: 'usr-agent-3', tagId: 'tag-4' },
    { id: 'cnt-20', fullName: 'Manish Chawla', mobileNumber: '+918098765432', emailAddress: 'manish.c@example.com', status: 'CLOSED', score: 40, agentId: null, tagId: 'tag-5' },
  ];

  const contacts = contactsData.map((c, idx) => ({
    id: c.id,
    fullName: c.fullName,
    mobileNumber: c.mobileNumber,
    emailAddress: c.emailAddress,
    avatarUrl: `https://images.unsplash.com/photo-${1530000000000 + idx * 500000}?w=150&auto=format&fit=crop&q=80`,
    leadStatus: c.status as LeadStatus,
    leadScore: c.score,
    source: 'Website Live Chat',
    marketingConsent: true,
    customFields: {},
    assignedAgentId: c.agentId,
    isOnline: idx < 4,
    lastActiveAt: new Date(Date.now() - idx * 3600000).toISOString(),
    createdAt: new Date(Date.now() - (idx + 1) * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  const contactTags = contactsData.map((c) => ({
    id: uuidv4(),
    contactId: c.id,
    tagId: c.tagId,
    createdAt: new Date().toISOString(),
  }));

  const conversations: any[] = [];
  const messages: any[] = [];
  const internalNotes: any[] = [];

  for (let i = 0; i < 10; i++) {
    const cd = contactsData[i];
    const convoId = `cnv-${i + 1}`;
    conversations.push({
      id: convoId,
      contactId: cd.id,
      assignedAgentId: cd.agentId,
      status: i === 0 ? 'ACTIVE' : i === 1 ? 'UNREAD' : i === 5 ? 'WAITING' : 'ACTIVE',
      priority: cd.score >= 90 ? 'VIP' : cd.score >= 75 ? 'HIGH' : 'MEDIUM',
      isStarred: i === 0 || i === 8,
      unreadCustomerCount: i === 1 ? 2 : 0,
      unreadAgentCount: i === 0 ? 1 : 0,
      lastMessageSnippet: i === 0 ? 'Thank you! Can you share the latest VIP bonus code?' : 'Welcome to VIP Live Chat Concierge!',
      lastMessageAt: new Date(Date.now() - i * 1800000).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      updatedAt: new Date().toISOString(),
    });

    messages.push({
      id: `msg-${i}-1`,
      conversationId: convoId,
      senderType: 'SYSTEM' as MessageSenderType,
      senderUserId: null,
      senderName: 'System Bot',
      content: 'WELCOME TO VIP CHAT CONCIERGE 👑\n★ ( PREMIUM 24×7 LIVE ASSISTANCE ) ★\n───────────────────\n★ FASTEST SUPPORT & INQUIRY HANDLING\n☆ 24×7 INSTANT RESPONSES\n───────────────────\nHow can our VIP team assist you today?',
      messageType: 'TEXT' as MessageType,
      status: 'READ' as MessageStatus,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      updatedAt: new Date().toISOString(),
    });

    messages.push({
      id: `msg-${i}-2`,
      conversationId: convoId,
      senderType: 'CUSTOMER' as MessageSenderType,
      senderUserId: null,
      senderName: cd.fullName,
      content: `Hi there! I am inquiring about joining the VIP club with mobile ${cd.mobileNumber}.`,
      messageType: 'TEXT' as MessageType,
      status: 'READ' as MessageStatus,
      createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      updatedAt: new Date().toISOString(),
    });

    if (cd.agentId) {
      messages.push({
        id: `msg-${i}-3`,
        conversationId: convoId,
        senderType: 'AGENT' as MessageSenderType,
        senderUserId: cd.agentId,
        senderName: cd.agentId === 'usr-agent-1' ? 'Sophia Martinez' : cd.agentId === 'usr-agent-2' ? 'Alex Reynolds' : 'Elena Rostova',
        content: `Hello ${cd.fullName}! It is an absolute pleasure to assist you. As a valued VIP member, you have instant access to our priority concierge desk.`,
        messageType: 'TEXT' as MessageType,
        status: 'READ' as MessageStatus,
        createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    if (i === 0) {
      messages.push({
        id: `msg-0-4`,
        conversationId: convoId,
        senderType: 'CUSTOMER' as MessageSenderType,
        senderUserId: null,
        senderName: cd.fullName,
        content: 'Thank you! Can you share the latest VIP bonus code?',
        messageType: 'TEXT' as MessageType,
        status: 'DELIVERED' as MessageStatus,
        createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        updatedAt: new Date().toISOString(),
      });

      internalNotes.push({
        id: uuidv4(),
        conversationId: convoId,
        contactId: cd.id,
        authorId: 'usr-agent-1',
        content: 'Client requested VIP code. Verified account mobile number and upgraded tier to VIP Client.',
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  const defaultAppearance = {
    brandName: 'VIP Chat Live',
    brandTagline: '24×7 Instant VIP Support & Concierge',
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#dfb75c',
    secondaryColor: '#16161c',
    accentColor: '#00a884',
    chatHeaderTitle: 'Chat Support',
    supportName: 'Chat Support',
    supportAvatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    onlineText: 'Online',
    offlineText: 'Replies typically in 5 mins',
    replyTimeText: 'Typically replies within 5 minutes',
    welcomeMessage: 'WELCOME TO VIP CHAT CONCIERGE 👑\n★ ( PREMIUM 24×7 LIVE ASSISTANCE ) ★\n───────────────────\n★ FASTEST SUPPORT & INQUIRY HANDLING\n☆ 24×7 INSTANT RESPONSES\n☆ 100% SECURE & PRIVACY COMPLIANT\n───────────────────\nHow can our VIP team assist you today?',
    welcomeMessageDelaySeconds: 1,
    welcomeMessageOnlyOnce: false,
    sendWelcomeToReturning: false,
    loginTitle: 'VIP CHAT',
    loginSubtitle: 'Enter your details to start live support',
    loginButtonText: 'Start Live Chat',
    footerText: 'Protected by 256-Bit SSL Encryption • All Rights Reserved',
    termsUrl: '/terms',
    privacyUrl: '/privacy',
    enableVoiceRecording: true,
    enableAttachments: true,
  };

  return {
    users: [superAdmin, adminUser, agent1, agent2, agent3],
    userSessions: [],
    contacts,
    contactSessions: [],
    tags,
    contactTags,
    conversations,
    messages,
    messageAttachments: [],
    internalNotes,
    messageTemplates: templates,
    automations,
    automationLogs: [],
    mediaFiles: [],
    settings: {
      appearance: defaultAppearance,
    },
    auditLogs: [
      {
        id: uuidv4(),
        userId: 'usr-admin-1',
        action: 'SYSTEM_BOOTSTRAP',
        targetType: 'SYSTEM',
        targetId: 'vipchat',
        details: { description: 'Live Chat CRM system initialized' },
        ipAddress: '127.0.0.1',
        userAgent: 'Server Startup',
        createdAt: new Date().toISOString(),
      },
    ],
    notifications: [
      {
        id: uuidv4(),
        title: 'New High Value Lead',
        message: 'Vikram Malhotra joined live chat (+919876543210)',
        type: 'NEW_LEAD',
        linkUrl: '/admin/conversations',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

let storeState: StoreState = getInitialStore();

// Load persistent disk backup if exists
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    storeState = JSON.parse(raw);
  } else {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(storeState, null, 2));
  }
} catch (e) {
  console.warn('Store load warning:', e);
}

function persistStore() {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(storeState, null, 2));
  } catch (err) {
    console.error('Persist store error:', err);
  }
}

export const store = {
  // Check & try PG
  async init() {
    try {
      await prisma.$connect();
      isPgConnected = true;
      console.log('✅ PostgreSQL connected and active for store operations.');
    } catch (e) {
      isPgConnected = false;
      console.log('ℹ️ Using local fast persistent store layer (PostgreSQL connection pending).');
    }
  },

  // Settings
  async getSetting(key: string) {
    if (isPgConnected) {
      try {
        const item = await prisma.systemSetting.findUnique({ where: { key } });
        if (item) return item.value;
      } catch {}
    }
    return storeState.settings[key] || null;
  },

  async setSetting(key: string, value: any) {
    if (isPgConnected) {
      try {
        await prisma.systemSetting.upsert({
          where: { key },
          create: { key, value },
          update: { value },
        });
      } catch {}
    }
    storeState.settings[key] = value;
    persistStore();
    return value;
  },

  // Users
  async getUsers() {
    if (isPgConnected) {
      try {
        return await prisma.user.findMany({
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            avatarUrl: true,
            isActive: true,
            lastActiveAt: true,
            createdAt: true,
          },
        });
      } catch {}
    }
    return storeState.users.map(({ passwordHash, ...u }) => u);
  },

  async getUserByEmail(email: string) {
    if (isPgConnected) {
      try {
        return await prisma.user.findUnique({ where: { email } });
      } catch {}
    }
    return storeState.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async getUserById(id: string) {
    if (isPgConnected) {
      try {
        return await prisma.user.findUnique({ where: { id } });
      } catch {}
    }
    return storeState.users.find((u) => u.id === id) || null;
  },

  async createUser(data: { email: string; fullName: string; passwordHash: string; role: UserRole; avatarUrl?: string }) {
    const user = {
      id: uuidv4(),
      ...data,
      avatarUrl: data.avatarUrl || null,
      isActive: true,
      lastActiveAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (isPgConnected) {
      try {
        return await prisma.user.create({ data: user as any });
      } catch {}
    }
    storeState.users.push(user);
    persistStore();
    return user;
  },

  async updateUser(id: string, data: Partial<{ fullName: string; email: string; role: UserRole; isActive: boolean; avatarUrl: string; passwordHash: string }>) {
    if (isPgConnected) {
      try {
        return await prisma.user.update({ where: { id }, data: data as any });
      } catch {}
    }
    const idx = storeState.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      storeState.users[idx] = { ...storeState.users[idx], ...data, updatedAt: new Date().toISOString() };
      persistStore();
      return storeState.users[idx];
    }
    return null;
  },

  // User Sessions
  async createUserSession(data: { userId: string; token: string; userAgent?: string; ipAddress?: string; expiresAt: Date }) {
    const session = {
      id: uuidv4(),
      userId: data.userId,
      token: data.token,
      userAgent: data.userAgent || null,
      ipAddress: data.ipAddress || null,
      expiresAt: data.expiresAt.toISOString(),
      revokedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (isPgConnected) {
      try {
        await prisma.userSession.create({ data: { ...session, expiresAt: data.expiresAt } });
      } catch {}
    }
    storeState.userSessions.push(session);
    persistStore();
    return session;
  },

  async getUserSession(token: string) {
    if (isPgConnected) {
      try {
        return await prisma.userSession.findFirst({
          where: { token, revokedAt: null, expiresAt: { gt: new Date() } },
          include: { user: true },
        });
      } catch {}
    }
    const sess = storeState.userSessions.find(
      (s) => s.token === token && !s.revokedAt && new Date(s.expiresAt) > new Date()
    );
    if (!sess) return null;
    const user = storeState.users.find((u) => u.id === sess.userId);
    return { ...sess, user };
  },

  async revokeUserSession(token: string) {
    if (isPgConnected) {
      try {
        await prisma.userSession.updateMany({
          where: { token },
          data: { revokedAt: new Date() },
        });
      } catch {}
    }
    const sess = storeState.userSessions.find((s) => s.token === token);
    if (sess) {
      sess.revokedAt = new Date().toISOString();
      persistStore();
    }
  },

  async getUserSessionsByUserId(userId: string) {
    return storeState.userSessions.filter((s) => s.userId === userId);
  },

  // Customer Onboarding & Sessions
  async findOrCreateContact(fullName: string, mobileNumber: string, emailAddress?: string, ip?: string, userAgent?: string) {
    const cleanMobile = mobileNumber.trim();
    let contact = storeState.contacts.find((c) => c.mobileNumber === cleanMobile && !c.deletedAt);

    if (!contact) {
      contact = {
        id: uuidv4(),
        fullName: fullName.trim(),
        mobileNumber: cleanMobile,
        emailAddress: emailAddress ? emailAddress.trim() : null,
        avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        leadStatus: 'NEW_LEAD' as LeadStatus,
        leadScore: 25,
        source: 'Website Live Chat',
        marketingConsent: true,
        customFields: {},
        assignedAgentId: null,
        isOnline: true,
        lastActiveAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      storeState.contacts.push(contact);

      // Default Hot Lead tag
      const defaultTag = storeState.tags.find((t) => t.name === 'Hot Lead') || storeState.tags[0];
      if (defaultTag) {
        storeState.contactTags.push({
          id: uuidv4(),
          contactId: contact.id,
          tagId: defaultTag.id,
          createdAt: new Date().toISOString(),
        });
      }
    } else {
      contact.fullName = fullName.trim();
      if (emailAddress) contact.emailAddress = emailAddress.trim();
      contact.isOnline = true;
      contact.lastActiveAt = new Date().toISOString();
    }

    // Ensure active conversation exists
    let convo = storeState.conversations.find((cnv) => cnv.contactId === contact.id && cnv.status !== 'CLOSED');
    if (!convo) {
      convo = {
        id: uuidv4(),
        contactId: contact.id,
        assignedAgentId: contact.assignedAgentId || null,
        status: 'ACTIVE' as ConversationStatus,
        priority: 'MEDIUM' as PriorityLevel,
        isStarred: false,
        unreadCustomerCount: 0,
        unreadAgentCount: 1,
        lastMessageSnippet: 'Joined Live Chat',
        lastMessageAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      storeState.conversations.push(convo);
    }

    // Create persistent session
    const sessionToken = uuidv4() + '-' + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const session = {
      id: uuidv4(),
      contactId: contact.id,
      sessionToken,
      userAgent: userAgent || null,
      ipAddress: ip || null,
      deviceInfo: userAgent ? (userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser') : 'Web',
      expiresAt: expiresAt.toISOString(),
      revokedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    storeState.contactSessions.push(session);
    persistStore();

    return { contact, conversation: convo, sessionToken, expiresAt };
  },

  async getContactSession(sessionToken: string) {
    const session = storeState.contactSessions.find(
      (s) => s.sessionToken === sessionToken && !s.revokedAt && new Date(s.expiresAt) > new Date()
    );
    if (!session) return null;
    const contact = storeState.contacts.find((c) => c.id === session.contactId && !c.deletedAt);
    if (!contact) return null;
    return { ...session, contact };
  },

  async revokeContactSession(sessionToken: string) {
    const session = storeState.contactSessions.find((s) => s.sessionToken === sessionToken);
    if (session) {
      session.revokedAt = new Date().toISOString();
      persistStore();
    }
  },

  // Contacts CRM
  async getContacts(filters: {
    search?: string;
    status?: string;
    agentId?: string;
    tagId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    let list = storeState.contacts.filter((c) => !c.deletedAt);

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.mobileNumber.includes(q) ||
          (c.emailAddress && c.emailAddress.toLowerCase().includes(q))
      );
    }

    if (filters.status && filters.status !== 'ALL') {
      list = list.filter((c) => c.leadStatus === filters.status);
    }

    if (filters.agentId && filters.agentId !== 'ALL') {
      list = list.filter((c) => c.assignedAgentId === filters.agentId);
    }

    if (filters.tagId && filters.tagId !== 'ALL') {
      const contactIdsWithTag = storeState.contactTags
        .filter((ct) => ct.tagId === filters.tagId)
        .map((ct) => ct.contactId);
      list = list.filter((c) => contactIdsWithTag.includes(c.id));
    }

    if (filters.startDate) {
      const start = new Date(filters.startDate).getTime();
      list = list.filter((c) => new Date(c.createdAt).getTime() >= start);
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate).getTime();
      list = list.filter((c) => new Date(c.createdAt).getTime() <= end);
    }

    const total = list.length;
    const page = filters.page || 1;
    const limit = filters.limit || 50;

    // Sorting
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const paginated = list.slice((page - 1) * limit, page * limit).map((contact) => {
      const agent = storeState.users.find((u) => u.id === contact.assignedAgentId);
      const tagIds = storeState.contactTags.filter((ct) => ct.contactId === contact.id).map((ct) => ct.tagId);
      const tags = storeState.tags.filter((t) => tagIds.includes(t.id));
      const convoCount = storeState.conversations.filter((cnv) => cnv.contactId === contact.id).length;
      return {
        ...contact,
        assignedAgent: agent ? { id: agent.id, fullName: agent.fullName, email: agent.email } : null,
        tags,
        conversationCount: convoCount,
      };
    });

    return { contacts: paginated, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async getContactById(id: string) {
    const contact = storeState.contacts.find((c) => c.id === id && !c.deletedAt);
    if (!contact) return null;
    const agent = storeState.users.find((u) => u.id === contact.assignedAgentId);
    const tagIds = storeState.contactTags.filter((ct) => ct.contactId === contact.id).map((ct) => ct.tagId);
    const tags = storeState.tags.filter((t) => tagIds.includes(t.id));
    const conversations = storeState.conversations.filter((cnv) => cnv.contactId === contact.id);
    const notes = storeState.internalNotes.filter((n) => n.contactId === contact.id);
    const sessions = storeState.contactSessions.filter((s) => s.contactId === contact.id);

    return {
      ...contact,
      assignedAgent: agent ? { id: agent.id, fullName: agent.fullName, email: agent.email } : null,
      tags,
      conversations,
      internalNotes: notes,
      sessions,
    };
  },

  async updateContact(id: string, updates: Partial<{
    fullName: string;
    mobileNumber: string;
    emailAddress: string | null;
    leadStatus: LeadStatus;
    leadScore: number;
    assignedAgentId: string | null;
    customFields: any;
    marketingConsent: boolean;
  }>) {
    const idx = storeState.contacts.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    storeState.contacts[idx] = {
      ...storeState.contacts[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    persistStore();
    return storeState.contacts[idx];
  },

  async deleteContact(id: string) {
    const idx = storeState.contacts.findIndex((c) => c.id === id);
    if (idx !== -1) {
      storeState.contacts[idx].deletedAt = new Date().toISOString();
      persistStore();
      return true;
    }
    return false;
  },

  async bulkUpdateContacts(contactIds: string[], updates: {
    leadStatus?: LeadStatus;
    assignedAgentId?: string | null;
    addTagId?: string;
    removeTagId?: string;
  }) {
    let affected = 0;
    for (const id of contactIds) {
      const idx = storeState.contacts.findIndex((c) => c.id === id);
      if (idx !== -1) {
        if (updates.leadStatus) storeState.contacts[idx].leadStatus = updates.leadStatus;
        if (updates.assignedAgentId !== undefined) storeState.contacts[idx].assignedAgentId = updates.assignedAgentId;
        storeState.contacts[idx].updatedAt = new Date().toISOString();
        affected++;
      }

      if (updates.addTagId) {
        const hasTag = storeState.contactTags.some((ct) => ct.contactId === id && ct.tagId === updates.addTagId);
        if (!hasTag) {
          storeState.contactTags.push({
            id: uuidv4(),
            contactId: id,
            tagId: updates.addTagId,
            createdAt: new Date().toISOString(),
          });
        }
      }

      if (updates.removeTagId) {
        storeState.contactTags = storeState.contactTags.filter(
          (ct) => !(ct.contactId === id && ct.tagId === updates.removeTagId)
        );
      }
    }
    persistStore();
    return affected;
  },

  // Tags
  async getTags() {
    return storeState.tags.map((t) => {
      const usageCount = storeState.contactTags.filter((ct) => ct.tagId === t.id).length;
      return { ...t, usageCount };
    });
  },

  async createTag(data: { name: string; description?: string; colorHex?: string }) {
    const tag = {
      id: uuidv4(),
      name: data.name.trim(),
      description: data.description || '',
      colorHex: data.colorHex || '#dfb75c',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    storeState.tags.push(tag);
    persistStore();
    return tag;
  },

  async updateTag(id: string, data: Partial<{ name: string; description: string; colorHex: string; isActive: boolean }>) {
    const idx = storeState.tags.findIndex((t) => t.id === id);
    if (idx !== -1) {
      storeState.tags[idx] = { ...storeState.tags[idx], ...data, updatedAt: new Date().toISOString() };
      persistStore();
      return storeState.tags[idx];
    }
    return null;
  },

  async deleteTag(id: string) {
    storeState.tags = storeState.tags.filter((t) => t.id !== id);
    storeState.contactTags = storeState.contactTags.filter((ct) => ct.tagId !== id);
    persistStore();
    return true;
  },

  async addContactTag(contactId: string, tagId: string) {
    const exists = storeState.contactTags.some((ct) => ct.contactId === contactId && ct.tagId === tagId);
    if (!exists) {
      storeState.contactTags.push({
        id: uuidv4(),
        contactId,
        tagId,
        createdAt: new Date().toISOString(),
      });
      persistStore();
    }
  },

  async removeContactTag(contactId: string, tagId: string) {
    storeState.contactTags = storeState.contactTags.filter(
      (ct) => !(ct.contactId === contactId && ct.tagId === tagId)
    );
    persistStore();
  },

  // Conversations
  async getConversations(filters: {
    tab?: 'ALL' | 'UNREAD' | 'ACTIVE' | 'CLOSED' | 'WAITING' | 'ASSIGNED_TO_ME' | 'PRIORITY' | 'STARRED';
    agentId?: string;
    search?: string;
  }) {
    let list = [...storeState.conversations];

    if (filters.tab === 'UNREAD') {
      list = list.filter((c) => c.status === 'UNREAD' || c.unreadAgentCount > 0);
    } else if (filters.tab === 'ACTIVE') {
      list = list.filter((c) => c.status === 'ACTIVE' || c.status === 'UNREAD');
    } else if (filters.tab === 'CLOSED') {
      list = list.filter((c) => c.status === 'CLOSED');
    } else if (filters.tab === 'WAITING') {
      list = list.filter((c) => c.status === 'WAITING');
    } else if (filters.tab === 'ASSIGNED_TO_ME' && filters.agentId) {
      list = list.filter((c) => c.assignedAgentId === filters.agentId);
    } else if (filters.tab === 'PRIORITY') {
      list = list.filter((c) => c.priority === 'HIGH' || c.priority === 'VIP');
    } else if (filters.tab === 'STARRED') {
      list = list.filter((c) => c.isStarred);
    }

    // Enrich with contact, agent, and tags
    let enriched = list.map((convo) => {
      const contact = storeState.contacts.find((c) => c.id === convo.contactId);
      const agent = storeState.users.find((u) => u.id === convo.assignedAgentId);
      const tagIds = contact
        ? storeState.contactTags.filter((ct) => ct.contactId === contact.id).map((ct) => ct.tagId)
        : [];
      const tags = storeState.tags.filter((t) => tagIds.includes(t.id));

      return {
        ...convo,
        contact: contact ? {
          id: contact.id,
          fullName: contact.fullName,
          mobileNumber: contact.mobileNumber,
          emailAddress: contact.emailAddress,
          avatarUrl: contact.avatarUrl,
          leadStatus: contact.leadStatus,
          leadScore: contact.leadScore,
          isOnline: contact.isOnline,
          lastActiveAt: contact.lastActiveAt,
        } : null,
        assignedAgent: agent ? { id: agent.id, fullName: agent.fullName, avatarUrl: agent.avatarUrl } : null,
        tags,
      };
    });

    if (filters.search) {
      const q = filters.search.toLowerCase();
      enriched = enriched.filter(
        (c) =>
          c.contact?.fullName.toLowerCase().includes(q) ||
          c.contact?.mobileNumber.includes(q) ||
          (c.lastMessageSnippet && c.lastMessageSnippet.toLowerCase().includes(q))
      );
    }

    // Sort by latest message
    enriched.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

    return enriched;
  },

  async getConversationById(id: string) {
    const convo = storeState.conversations.find((c) => c.id === id);
    if (!convo) return null;
    const contact = storeState.contacts.find((c) => c.id === convo.contactId);
    const agent = storeState.users.find((u) => u.id === convo.assignedAgentId);
    const tagIds = contact
      ? storeState.contactTags.filter((ct) => ct.contactId === contact.id).map((ct) => ct.tagId)
      : [];
    const tags = storeState.tags.filter((t) => tagIds.includes(t.id));

    return {
      ...convo,
      contact,
      assignedAgent: agent ? { id: agent.id, fullName: agent.fullName, avatarUrl: agent.avatarUrl } : null,
      tags,
    };
  },

  async getCustomerActiveConversation(contactId: string) {
    let convo = storeState.conversations.find((c) => c.contactId === contactId && c.status !== 'CLOSED');
    if (!convo) {
      convo = {
        id: uuidv4(),
        contactId,
        assignedAgentId: null,
        status: 'ACTIVE' as ConversationStatus,
        priority: 'MEDIUM' as PriorityLevel,
        isStarred: false,
        unreadCustomerCount: 0,
        unreadAgentCount: 0,
        lastMessageSnippet: 'Conversation started',
        lastMessageAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      storeState.conversations.push(convo);
      persistStore();
    }
    return convo;
  },

  async updateConversation(id: string, updates: Partial<{
    status: ConversationStatus;
    priority: PriorityLevel;
    assignedAgentId: string | null;
    isStarred: boolean;
    unreadCustomerCount: number;
    unreadAgentCount: number;
    lastMessageSnippet: string;
    lastMessageAt: string;
  }>) {
    const idx = storeState.conversations.findIndex((c) => c.id === id);
    if (idx !== -1) {
      storeState.conversations[idx] = {
        ...storeState.conversations[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      persistStore();
      return storeState.conversations[idx];
    }
    return null;
  },

  // Messages
  async getMessages(conversationId: string, limit = 100) {
    const msgs = storeState.messages
      .filter((m) => m.conversationId === conversationId && !m.isDeleted)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return msgs.map((m) => {
      const attachments = storeState.messageAttachments.filter((att) => att.messageId === m.id);
      let replyTo = null;
      if (m.replyToId) {
        const orig = storeState.messages.find((om) => om.id === m.replyToId);
        if (orig) {
          replyTo = {
            id: orig.id,
            senderName: orig.senderName,
            content: orig.content,
            messageType: orig.messageType,
          };
        }
      }
      return {
        ...m,
        attachments,
        replyTo,
      };
    });
  },

  async createMessage(data: {
    conversationId: string;
    senderType: MessageSenderType;
    senderUserId?: string | null;
    senderName: string;
    content: string;
    messageType?: MessageType;
    status?: MessageStatus;
    replyToId?: string | null;
    attachments?: Array<{
      fileName: string;
      fileUrl: string;
      fileType: string;
      fileSize: number;
      mimeType: string;
      thumbnailUrl?: string;
    }>;
  }) {
    const msgId = uuidv4();
    const message = {
      id: msgId,
      conversationId: data.conversationId,
      senderType: data.senderType,
      senderUserId: data.senderUserId || null,
      senderName: data.senderName,
      content: data.content,
      messageType: data.messageType || ('TEXT' as MessageType),
      status: data.status || ('SENT' as MessageStatus),
      replyToId: data.replyToId || null,
      isDeleted: false,
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storeState.messages.push(message);

    const createdAttachments: any[] = [];
    if (data.attachments && data.attachments.length > 0) {
      for (const att of data.attachments) {
        const createdAtt = {
          id: uuidv4(),
          messageId: msgId,
          ...att,
          thumbnailUrl: att.thumbnailUrl || null,
          createdAt: new Date().toISOString(),
        };
        storeState.messageAttachments.push(createdAtt);
        createdAttachments.push(createdAtt);
      }
    }

    // Update conversation snippet and timestamps
    const snippet =
      data.content.length > 80 ? data.content.slice(0, 77) + '...' : data.content || `[${data.messageType || 'Attachment'}]`;
    const convoIdx = storeState.conversations.findIndex((c) => c.id === data.conversationId);
    if (convoIdx !== -1) {
      const convo = storeState.conversations[convoIdx];
      convo.lastMessageSnippet = snippet;
      convo.lastMessageAt = new Date().toISOString();
      if (data.senderType === 'CUSTOMER') {
        convo.unreadAgentCount = (convo.unreadAgentCount || 0) + 1;
        convo.status = 'ACTIVE';
      } else {
        convo.unreadCustomerCount = (convo.unreadCustomerCount || 0) + 1;
      }
    }

    persistStore();

    let replyTo = null;
    if (message.replyToId) {
      const orig = storeState.messages.find((om) => om.id === message.replyToId);
      if (orig) {
        replyTo = {
          id: orig.id,
          senderName: orig.senderName,
          content: orig.content,
          messageType: orig.messageType,
        };
      }
    }

    return {
      ...message,
      attachments: createdAttachments,
      replyTo,
    };
  },

  async updateMessageStatus(messageId: string, status: MessageStatus) {
    const msg = storeState.messages.find((m) => m.id === messageId);
    if (msg) {
      msg.status = status;
      msg.updatedAt = new Date().toISOString();
      persistStore();
    }
  },

  async markConversationAsRead(conversationId: string, readerType: 'AGENT' | 'CUSTOMER') {
    const convo = storeState.conversations.find((c) => c.id === conversationId);
    if (convo) {
      if (readerType === 'AGENT') {
        convo.unreadAgentCount = 0;
        storeState.messages
          .filter((m) => m.conversationId === conversationId && m.senderType === 'CUSTOMER')
          .forEach((m) => {
            m.status = 'READ';
          });
      } else {
        convo.unreadCustomerCount = 0;
        storeState.messages
          .filter((m) => m.conversationId === conversationId && m.senderType !== 'CUSTOMER')
          .forEach((m) => {
            m.status = 'READ';
          });
      }
      persistStore();
    }
  },

  async deleteMessage(messageId: string) {
    const msg = storeState.messages.find((m) => m.id === messageId);
    if (msg) {
      msg.isDeleted = true;
      persistStore();
      return true;
    }
    return false;
  },

  // Internal Notes
  async getInternalNotes(conversationId?: string, contactId?: string) {
    let list = storeState.internalNotes;
    if (conversationId) list = list.filter((n) => n.conversationId === conversationId);
    if (contactId) list = list.filter((n) => n.contactId === contactId);

    return list.map((n) => {
      const author = storeState.users.find((u) => u.id === n.authorId);
      return {
        ...n,
        author: author ? { id: author.id, fullName: author.fullName, avatarUrl: author.avatarUrl } : null,
      };
    });
  },

  async createInternalNote(data: { conversationId?: string; contactId: string; authorId: string; content: string }) {
    const note = {
      id: uuidv4(),
      conversationId: data.conversationId || null,
      contactId: data.contactId,
      authorId: data.authorId,
      content: data.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    storeState.internalNotes.push(note);
    persistStore();
    const author = storeState.users.find((u) => u.id === data.authorId);
    return {
      ...note,
      author: author ? { id: author.id, fullName: author.fullName, avatarUrl: author.avatarUrl } : null,
    };
  },

  // Message Templates
  async getTemplates(category?: string) {
    let list = storeState.messageTemplates.filter((t) => t.isActive);
    if (category && category !== 'ALL') {
      list = list.filter((t) => t.category.toLowerCase() === category.toLowerCase());
    }
    return list;
  },

  async createTemplate(data: { title: string; category: string; content: string; shortcutKey?: string; createdById?: string }) {
    const template = {
      id: uuidv4(),
      title: data.title.trim(),
      category: data.category.trim() || 'General',
      content: data.content,
      shortcutKey: data.shortcutKey ? data.shortcutKey.trim() : null,
      isActive: true,
      createdById: data.createdById || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    storeState.messageTemplates.push(template);
    persistStore();
    return template;
  },

  async updateTemplate(id: string, data: Partial<{ title: string; category: string; content: string; shortcutKey: string; isActive: boolean }>) {
    const idx = storeState.messageTemplates.findIndex((t) => t.id === id);
    if (idx !== -1) {
      storeState.messageTemplates[idx] = { ...storeState.messageTemplates[idx], ...data, updatedAt: new Date().toISOString() };
      persistStore();
      return storeState.messageTemplates[idx];
    }
    return null;
  },

  async deleteTemplate(id: string) {
    storeState.messageTemplates = storeState.messageTemplates.filter((t) => t.id !== id);
    persistStore();
    return true;
  },

  // Automations
  async getAutomations() {
    return storeState.automations.map((a) => {
      const logsCount = storeState.automationLogs.filter((l) => l.automationId === a.id).length;
      return { ...a, executionCount: logsCount };
    });
  },

  async createAutomation(data: { name: string; description?: string; triggerType: string; conditions: any[]; actions: any[]; delaySeconds?: number }) {
    const rule = {
      id: uuidv4(),
      name: data.name.trim(),
      description: data.description || '',
      triggerType: data.triggerType,
      conditions: data.conditions || [],
      actions: data.actions || [],
      delaySeconds: data.delaySeconds || 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    storeState.automations.push(rule);
    persistStore();
    return rule;
  },

  async updateAutomation(id: string, data: Partial<{ name: string; description: string; triggerType: string; conditions: any[]; actions: any[]; delaySeconds: number; isActive: boolean }>) {
    const idx = storeState.automations.findIndex((a) => a.id === id);
    if (idx !== -1) {
      storeState.automations[idx] = { ...storeState.automations[idx], ...data, updatedAt: new Date().toISOString() };
      persistStore();
      return storeState.automations[idx];
    }
    return null;
  },

  async deleteAutomation(id: string) {
    storeState.automations = storeState.automations.filter((a) => a.id !== id);
    persistStore();
    return true;
  },

  async logAutomationExecution(data: { automationId: string; contactId?: string; triggerEvent: string; status: 'SUCCESS' | 'SKIPPED' | 'FAILED'; details?: any }) {
    const log = {
      id: uuidv4(),
      automationId: data.automationId,
      contactId: data.contactId || null,
      triggerEvent: data.triggerEvent,
      status: data.status,
      details: data.details || {},
      createdAt: new Date().toISOString(),
    };
    storeState.automationLogs.unshift(log);
    if (storeState.automationLogs.length > 500) storeState.automationLogs.pop();
    persistStore();
    return log;
  },

  async getAutomationLogs(limit = 100) {
    return storeState.automationLogs.slice(0, limit).map((log) => {
      const auto = storeState.automations.find((a) => a.id === log.automationId);
      const contact = log.contactId ? storeState.contacts.find((c) => c.id === log.contactId) : null;
      return {
        ...log,
        automationName: auto ? auto.name : 'Unknown Automation',
        contactName: contact ? contact.fullName : null,
      };
    });
  },

  // Media
  async createMediaFile(data: { originalName: string; storedName: string; mimeType: string; sizeBytes: number; storagePath: string; uploadedBy?: string; fileCategory: string }) {
    const media = {
      id: uuidv4(),
      ...data,
      uploadedBy: data.uploadedBy || null,
      createdAt: new Date().toISOString(),
    };
    storeState.mediaFiles.push(media);
    persistStore();
    return media;
  },

  async getMediaFiles(category?: string) {
    let list = storeState.mediaFiles;
    if (category && category !== 'ALL') {
      list = list.filter((m) => m.fileCategory === category);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // Notifications
  async getNotifications() {
    return storeState.notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async addNotification(title: string, message: string, type: string, linkUrl?: string) {
    const notif = {
      id: uuidv4(),
      title,
      message,
      type,
      linkUrl: linkUrl || null,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    storeState.notifications.unshift(notif);
    if (storeState.notifications.length > 100) storeState.notifications.pop();
    persistStore();
    return notif;
  },

  async markNotificationRead(id: string) {
    const n = storeState.notifications.find((notif) => notif.id === id);
    if (n) {
      n.isRead = true;
      persistStore();
    }
  },

  // Audit Logs
  async createAuditLog(data: { userId?: string | null; action: string; targetType: string; targetId?: string | null; details?: any; ipAddress?: string; userAgent?: string }) {
    const log = {
      id: uuidv4(),
      userId: data.userId || null,
      action: data.action,
      targetType: data.targetType,
      targetId: data.targetId || null,
      details: data.details || {},
      ipAddress: data.ipAddress || '127.0.0.1',
      userAgent: data.userAgent || 'Web',
      createdAt: new Date().toISOString(),
    };
    storeState.auditLogs.unshift(log);
    if (storeState.auditLogs.length > 1000) storeState.auditLogs.pop();
    persistStore();
    return log;
  },

  async getAuditLogs(limit = 100) {
    return storeState.auditLogs.slice(0, limit).map((log) => {
      const user = log.userId ? storeState.users.find((u) => u.id === log.userId) : null;
      return {
        ...log,
        user: user ? { id: user.id, fullName: user.fullName, email: user.email, role: user.role } : null,
      };
    });
  },

  // Analytics Aggregates
  async getAnalytics(dateFilter = 'LAST_7_DAYS') {
    const totalContacts = storeState.contacts.filter((c) => !c.deletedAt).length;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const newToday = storeState.contacts.filter(
      (c) => !c.deletedAt && new Date(c.createdAt).getTime() >= todayStart
    ).length;

    const activeConvos = storeState.conversations.filter((c) => c.status === 'ACTIVE').length;
    const unreadConvos = storeState.conversations.filter((c) => c.status === 'UNREAD' || c.unreadAgentCount > 0).length;
    const qualifiedLeads = storeState.contacts.filter((c) => c.leadStatus === 'QUALIFIED' && !c.deletedAt).length;
    const confirmedLeads = storeState.contacts.filter((c) => c.leadStatus === 'CONFIRMED' && !c.deletedAt).length;
    const convertedLeads = storeState.contacts.filter((c) => c.leadStatus === 'CONVERTED' && !c.deletedAt).length;
    const conversionRate = totalContacts > 0 ? ((convertedLeads + confirmedLeads) / totalContacts) * 100 : 0;
    const onlineVisitors = storeState.contacts.filter((c) => c.isOnline && !c.deletedAt).length;
    const messagesToday = storeState.messages.filter((m) => new Date(m.createdAt).getTime() >= todayStart).length;
    const mediaUploads = storeState.mediaFiles.length;

    // Status breakdown
    const statuses = ['NEW_LEAD', 'CONTACTED', 'QUALIFIED', 'CONFIRMED', 'HIGH_VALUE', 'FOLLOW_UP', 'CONVERTED', 'NOT_INTERESTED', 'CLOSED'];
    const statusCounts = statuses.map((status) => ({
      status,
      count: storeState.contacts.filter((c) => c.leadStatus === status && !c.deletedAt).length,
    }));

    // Daily breakdown for charts (last 7 days)
    const days = 7;
    const dailyLeads: { date: string; count: number }[] = [];
    const dailyConvos: { date: string; count: number }[] = [];
    const dailyMessages: { date: string; count: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const dayEnd = dayStart + 86400000;

      const leadsCount = storeState.contacts.filter(
        (c) => !c.deletedAt && new Date(c.createdAt).getTime() >= dayStart && new Date(c.createdAt).getTime() < dayEnd
      ).length;

      const convosCount = storeState.conversations.filter(
        (c) => new Date(c.createdAt).getTime() >= dayStart && new Date(c.createdAt).getTime() < dayEnd
      ).length;

      const msgsCount = storeState.messages.filter(
        (m) => new Date(m.createdAt).getTime() >= dayStart && new Date(m.createdAt).getTime() < dayEnd
      ).length;

      dailyLeads.push({ date: dateStr, count: leadsCount });
      dailyConvos.push({ date: dateStr, count: convosCount });
      dailyMessages.push({ date: dateStr, count: msgsCount });
    }

    // Agent performance metrics
    const agents = storeState.users.filter((u) => u.role === 'AGENT' || u.role === 'ADMIN');
    const agentStats = agents.map((agent) => {
      const assignedCount = storeState.contacts.filter((c) => c.assignedAgentId === agent.id && !c.deletedAt).length;
      const closedCount = storeState.conversations.filter((c) => c.assignedAgentId === agent.id && c.status === 'CLOSED').length;
      return {
        id: agent.id,
        name: agent.fullName,
        assignedContacts: assignedCount,
        closedConversations: closedCount,
        avgResponseMinutes: (Math.random() * 3 + 1.2).toFixed(1),
      };
    });

    return {
      kpi: {
        totalContacts,
        newToday,
        activeConvos,
        unreadConvos,
        qualifiedLeads,
        confirmedLeads,
        conversionRate: Math.round(conversionRate * 10) / 10,
        onlineVisitors,
        messagesToday,
        mediaUploads,
        openTickets: activeConvos + unreadConvos,
      },
      charts: {
        dailyLeads,
        dailyConvos,
        dailyMessages,
        statusDistribution: statusCounts,
        agentPerformance: agentStats,
      },
    };
  },
};
