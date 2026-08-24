import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

export async function connectDb() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL database via Prisma');
    await initDefaultSettings();
  } catch (error) {
    console.error('⚠️ Could not connect to PostgreSQL database:', (error as Error).message);
    console.log('Please ensure DATABASE_URL is configured and PostgreSQL is running.');
  }
}

export async function initDefaultSettings() {
  try {
    const existing = await prisma.systemSetting.findUnique({
      where: { key: 'appearance' },
    });

    if (!existing) {
      await prisma.systemSetting.create({
        data: {
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
      console.log('✅ Initialized default appearance settings');
    }
  } catch (err) {
    // Graceful check if tables not yet migrated
  }
}
