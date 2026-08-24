import { PrismaClient, UserRole, LeadStatus, ConversationStatus, PriorityLevel, MessageSenderType, MessageStatus, MessageType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Live Chat CRM database seeding...');

  // 1. System Settings / Appearance
  await prisma.systemSetting.upsert({
    where: { key: 'appearance' },
    update: {},
    create: {
      key: 'appearance',
      value: {
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
      },
    },
  });

  // 2. Users (Super Admin, Admin, 3 Agents)
  const passwordHash = await bcrypt.hash('VipAdmin@2026!', 10);
  const agentPasswordHash = await bcrypt.hash('Agent@2026!', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@vipchat.live' },
    update: {},
    create: {
      email: 'admin@vipchat.live',
      fullName: 'VIP Master Admin',
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'operations@vipchat.live' },
    update: {},
    create: {
      email: 'operations@vipchat.live',
      fullName: 'Operations Manager',
      passwordHash,
      role: UserRole.ADMIN,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  });

  const agent1 = await prisma.user.upsert({
    where: { email: 'sophia.agent@vipchat.live' },
    update: {},
    create: {
      email: 'sophia.agent@vipchat.live',
      fullName: 'Sophia Martinez (Senior VIP Agent)',
      passwordHash: agentPasswordHash,
      role: UserRole.AGENT,
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
  });

  const agent2 = await prisma.user.upsert({
    where: { email: 'alex.agent@vipchat.live' },
    update: {},
    create: {
      email: 'alex.agent@vipchat.live',
      fullName: 'Alex Reynolds (Customer Success)',
      passwordHash: agentPasswordHash,
      role: UserRole.AGENT,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
  });

  const agent3 = await prisma.user.upsert({
    where: { email: 'elena.agent@vipchat.live' },
    update: {},
    create: {
      email: 'elena.agent@vipchat.live',
      fullName: 'Elena Rostova (Lead Conversion)',
      passwordHash: agentPasswordHash,
      role: UserRole.AGENT,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    },
  });

  // 3. Tags
  const tagList = [
    { name: 'VIP Client', description: 'Highest tier priority client', colorHex: '#dfb75c' },
    { name: 'Hot Lead', description: 'Immediate conversion potential', colorHex: '#ef4444' },
    { name: 'Qualified', description: 'Lead meets all qualification criteria', colorHex: '#10b981' },
    { name: 'Confirmed', description: 'Booking or signup confirmed', colorHex: '#3b82f6' },
    { name: 'Follow Up', description: 'Follow up needed within 24h', colorHex: '#f59e0b' },
    { name: 'Existing Customer', description: 'Returning loyal customer', colorHex: '#8b5cf6' },
    { name: 'High Value', description: 'Large potential deal size', colorHex: '#ec4899' },
  ];

  const createdTags: any[] = [];
  for (const t of tagList) {
    const created = await prisma.tag.upsert({
      where: { name: t.name },
      update: {},
      create: t,
    });
    createdTags.push(created);
  }

  // 4. Message Templates (10 Templates)
  const templateList = [
    {
      title: 'VIP Welcome & Introduction',
      category: 'Greetings',
      content: 'Hello {{name}}! Welcome to VIP Chat Concierge. My name is {{agent_name}}, and I am dedicated to assisting you today. How may I help you?',
      shortcutKey: '/welcome',
    },
    {
      title: 'Account Verification Instructions',
      category: 'Verification',
      content: 'Hi {{name}}, to ensure maximum security for your account (Mobile: {{mobile}}), could you please verify your preferred communication channel?',
      shortcutKey: '/verify',
    },
    {
      title: 'Service Catalog & VIP Tiers',
      category: 'Sales',
      content: 'Here is our exclusive VIP tier breakdown! As a valued guest on {{date}}, you qualify for express 24×7 withdrawal speed and dedicated agent support.',
      shortcutKey: '/tiers',
    },
    {
      title: 'Payment & Deposit Assistance',
      category: 'Billing',
      content: 'Thank you for reaching out, {{name}}. We support instant UPI, Bank Wire, and Crypto transfers. Please let me know your preferred method to provide secure instructions.',
      shortcutKey: '/deposit',
    },
    {
      title: 'Withdrawal Processing Update',
      category: 'Support',
      content: 'Dear {{name}}, your withdrawal request has been received by our finance desk and is being processed with top priority. Average processing time is under 15 minutes.',
      shortcutKey: '/withdraw',
    },
    {
      title: 'Technical Assistance Request',
      category: 'Support',
      content: 'Could you please describe the issue you are experiencing or share a screenshot? We will resolve this for you immediately.',
      shortcutKey: '/tech',
    },
    {
      title: 'Follow Up Reminder',
      category: 'Follow Up',
      content: 'Hi {{name}}, just following up to check if you had any other questions regarding your inquiry earlier today. We are always here 24×7!',
      shortcutKey: '/followup',
    },
    {
      title: 'VIP Promotion / Bonus Code',
      category: 'Promotion',
      content: 'Congratulations {{name}}! You have been awarded a 100% Welcome VIP match bonus. Use code VIP2026 when completing your registration.',
      shortcutKey: '/promo',
    },
    {
      title: 'Transfer to Specialist Agent',
      category: 'Transfer',
      content: 'I am transferring you to our senior account specialist who will assist you with the final confirmation. Please hold for just a moment.',
      shortcutKey: '/transfer',
    },
    {
      title: 'Polite Conversation Close',
      category: 'Closing',
      content: 'Thank you for contacting VIP Chat Live, {{name}}! If you need anything else in the future, do not hesitate to message us. Have a wonderful day!',
      shortcutKey: '/close',
    },
  ];

  for (const t of templateList) {
    await prisma.messageTemplate.create({
      data: {
        ...t,
        createdById: superAdmin.id,
      },
    });
  }

  // 5. Automation Rules (5 Rules)
  const automationList = [
    {
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
    },
    {
      name: 'Auto-Assign High Value Leads to Senior Agent',
      description: 'Assigns VIP leads to Sophia Martinez automatically',
      triggerType: 'STATUS_CHANGED',
      conditions: [{ field: 'leadStatus', operator: 'EQUALS', value: 'HIGH_VALUE' }],
      actions: [
        { actionType: 'ASSIGN_AGENT', payload: { agentId: agent1.id } },
        { actionType: 'ADD_TAG', payload: { tagName: 'VIP Client' } },
        { actionType: 'ADD_INTERNAL_NOTE', payload: { note: 'Auto-assigned to Senior Agent due to High Value lead tier.' } },
      ],
      delaySeconds: 0,
    },
    {
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
    },
    {
      name: 'Qualify Returning VIP Contacts',
      description: 'Upgrades lead status to Qualified when mobile number is verified',
      triggerType: 'FIRST_MESSAGE',
      conditions: [{ field: 'hasMobile', operator: 'EQUALS', value: true }],
      actions: [
        { actionType: 'CHANGE_STATUS', payload: { status: 'QUALIFIED' } },
      ],
      delaySeconds: 0,
    },
    {
      name: 'Inactivity 30-Min Gentle Nudge',
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
    },
  ];

  for (const a of automationList) {
    await prisma.automation.create({
      data: a,
    });
  }

  // 6. Realistic 20 Contacts & 10 Conversations
  const contactsData = [
    { fullName: 'Vikram Malhotra', mobileNumber: '+919876543210', emailAddress: 'vikram.m@example.com', status: LeadStatus.HIGH_VALUE, score: 95, agent: agent1, tag: 'VIP Client' },
    { fullName: 'Priya Sharma', mobileNumber: '+919812345678', emailAddress: 'priya.s@example.com', status: LeadStatus.QUALIFIED, score: 80, agent: agent2, tag: 'Qualified' },
    { fullName: 'Rahul Verma', mobileNumber: '+919765432109', emailAddress: 'rahul.v@example.com', status: LeadStatus.CONFIRMED, score: 90, agent: agent3, tag: 'Confirmed' },
    { fullName: 'Ananya Roy', mobileNumber: '+919654321098', emailAddress: 'ananya.r@example.com', status: LeadStatus.QUALIFIED, score: 85, agent: agent1, tag: 'Hot Lead' },
    { fullName: 'Rohan Gupta', mobileNumber: '+919543210987', emailAddress: 'rohan.g@example.com', status: LeadStatus.NEW_LEAD, score: 50, agent: null, tag: 'Hot Lead' },
    { fullName: 'Kavita Patel', mobileNumber: '+919432109876', emailAddress: 'kavita.p@example.com', status: LeadStatus.FOLLOW_UP, score: 65, agent: agent2, tag: 'Follow Up' },
    { fullName: 'Siddharth Rao', mobileNumber: '+919321098765', emailAddress: 'siddharth.r@example.com', status: LeadStatus.CONVERTED, score: 100, agent: agent1, tag: 'Existing Customer' },
    { fullName: 'Deepak Joshi', mobileNumber: '+919210987654', emailAddress: 'deepak.j@example.com', status: LeadStatus.QUALIFIED, score: 75, agent: agent3, tag: 'Qualified' },
    { fullName: 'Sneha Nair', mobileNumber: '+919109876543', emailAddress: 'sneha.n@example.com', status: LeadStatus.HIGH_VALUE, score: 92, agent: agent1, tag: 'High Value' },
    { fullName: 'Amitabh Sen', mobileNumber: '+919098765432', emailAddress: 'amitabh.s@example.com', status: LeadStatus.CONTACTED, score: 60, agent: agent2, tag: 'Follow Up' },
    { fullName: 'Meera Deshmukh', mobileNumber: '+918987654321', emailAddress: 'meera.d@example.com', status: LeadStatus.CONFIRMED, score: 88, agent: agent3, tag: 'Confirmed' },
    { fullName: 'Karan Mehra', mobileNumber: '+918876543210', emailAddress: 'karan.m@example.com', status: LeadStatus.NEW_LEAD, score: 45, agent: null, tag: 'Hot Lead' },
    { fullName: 'Zoya Khan', mobileNumber: '+918765432109', emailAddress: 'zoya.k@example.com', status: LeadStatus.HIGH_VALUE, score: 94, agent: agent1, tag: 'VIP Client' },
    { fullName: 'Arjun Singhania', mobileNumber: '+918654321098', emailAddress: 'arjun.s@example.com', status: LeadStatus.CONVERTED, score: 98, agent: agent2, tag: 'Existing Customer' },
    { fullName: 'Tanvi Agarwal', mobileNumber: '+918543210987', emailAddress: 'tanvi.a@example.com', status: LeadStatus.QUALIFIED, score: 78, agent: agent3, tag: 'Qualified' },
    { fullName: 'Rajesh Iyer', mobileNumber: '+918432109876', emailAddress: 'rajesh.i@example.com', status: LeadStatus.FOLLOW_UP, score: 62, agent: agent1, tag: 'Follow Up' },
    { fullName: 'Divya Kapoor', mobileNumber: '+918321098765', emailAddress: 'divya.k@example.com', status: LeadStatus.CONTACTED, score: 55, agent: agent2, tag: 'Hot Lead' },
    { fullName: 'Sameer Bansal', mobileNumber: '+918210987654', emailAddress: 'sameer.b@example.com', status: LeadStatus.NOT_INTERESTED, score: 20, agent: null, tag: 'Follow Up' },
    { fullName: 'Pooja Hegde', mobileNumber: '+918109876543', emailAddress: 'pooja.h@example.com', status: LeadStatus.CONFIRMED, score: 86, agent: agent3, tag: 'Confirmed' },
    { fullName: 'Manish Chawla', mobileNumber: '+918098765432', emailAddress: 'manish.c@example.com', status: LeadStatus.CLOSED, score: 40, agent: null, tag: 'Follow Up' },
  ];

  for (let i = 0; i < contactsData.length; i++) {
    const cd = contactsData[i];
    const contact = await prisma.contact.create({
      data: {
        fullName: cd.fullName,
        mobileNumber: cd.mobileNumber,
        emailAddress: cd.emailAddress,
        leadStatus: cd.status,
        leadScore: cd.score,
        assignedAgentId: cd.agent?.id || null,
        isOnline: i < 3,
        avatarUrl: `https://images.unsplash.com/photo-${1530000000000 + i * 500000}?w=150&auto=format&fit=crop&q=80`,
      },
    });

    const matchingTag = createdTags.find((t) => t.name === cd.tag);
    if (matchingTag) {
      await prisma.contactTag.create({
        data: {
          contactId: contact.id,
          tagId: matchingTag.id,
        },
      });
    }

    // Create 10 rich conversations for the first 10 contacts
    if (i < 10) {
      const convo = await prisma.conversation.create({
        data: {
          contactId: contact.id,
          assignedAgentId: cd.agent?.id || null,
          status: i === 0 ? ConversationStatus.ACTIVE : i === 1 ? ConversationStatus.UNREAD : ConversationStatus.ACTIVE,
          priority: cd.score >= 90 ? PriorityLevel.VIP : cd.score >= 75 ? PriorityLevel.HIGH : PriorityLevel.MEDIUM,
          isStarred: i === 0 || i === 8,
          unreadCustomerCount: i === 1 ? 2 : 0,
          unreadAgentCount: i === 0 ? 1 : 0,
          lastMessageSnippet: i === 0 ? 'Thank you! Can you share the latest VIP bonus code?' : 'Welcome to VIP Live Chat!',
        },
      });

      // Add messages
      await prisma.message.create({
        data: {
          conversationId: convo.id,
          senderType: MessageSenderType.SYSTEM,
          senderName: 'System Bot',
          content: 'WELCOME TO VIP CHAT CONCIERGE 👑\n★ ( PREMIUM 24×7 LIVE ASSISTANCE ) ★\n───────────────────\n★ FASTEST SUPPORT & INQUIRY HANDLING\n☆ 24×7 INSTANT RESPONSES\n───────────────────\nHow can our VIP team assist you today?',
          messageType: MessageType.TEXT,
          status: MessageStatus.READ,
          createdAt: new Date(Date.now() - 1000 * 60 * 30),
        },
      });

      await prisma.message.create({
        data: {
          conversationId: convo.id,
          senderType: MessageSenderType.CUSTOMER,
          senderName: cd.fullName,
          content: `Hi there! I am inquiring about joining the VIP club with mobile ${cd.mobileNumber}.`,
          messageType: MessageType.TEXT,
          status: MessageStatus.READ,
          createdAt: new Date(Date.now() - 1000 * 60 * 20),
        },
      });

      if (cd.agent) {
        await prisma.message.create({
          data: {
            conversationId: convo.id,
            senderType: MessageSenderType.AGENT,
            senderUserId: cd.agent.id,
            senderName: cd.agent.fullName,
            content: `Hello ${cd.fullName}! It is an absolute pleasure to assist you. As a high-priority member, you have instant access to our concierge team.`,
            messageType: MessageType.TEXT,
            status: MessageStatus.READ,
            createdAt: new Date(Date.now() - 1000 * 60 * 10),
          },
        });
      }

      if (i === 0) {
        await prisma.message.create({
          data: {
            conversationId: convo.id,
            senderType: MessageSenderType.CUSTOMER,
            senderName: cd.fullName,
            content: 'Thank you! Can you share the latest VIP bonus code?',
            messageType: MessageType.TEXT,
            status: MessageStatus.DELIVERED,
            createdAt: new Date(Date.now() - 1000 * 60 * 2),
          },
        });

        // Add internal note
        await prisma.internalNote.create({
          data: {
            conversationId: convo.id,
            contactId: contact.id,
            authorId: agent1.id,
            content: 'Client requested VIP code. Verified account mobile number and upgraded tier.',
          },
        });
      }
    }
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
