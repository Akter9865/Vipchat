# VIPChat Live CRM 👑
> **Production-Ready WhatsApp-Inspired Customer Live Support & Enterprise CRM Platform**

A modern, high-performance, self-hostable customer live chat and CRM dashboard platform built with **Node.js, Express, Socket.IO, PostgreSQL, Prisma ORM, React, TypeScript, and Tailwind CSS**.

Deployable on any VPS using **Docker + Dokploy + GitHub** with **zero dependency on Supabase, Firebase, or external managed cloud backends**.

---

## 🌟 Key Features

### 1. Public Customer Experience (`/`, `/login`, `/chat`)
- **Luxury Gold & Dark Onboarding**: Full Name, Mobile Number, Email (Optional). Instant session creation with zero OTP friction.
- **Persistent Server-Side Sessions**: HttpOnly SameSite secure cookie management (`customer_session`), session rotation, device tracking, and instant auto-login for returning visitors.
- **WhatsApp-Inspired Live Chat Layout**:
  - Top header with support avatar, verified checkmark badge, and live online status dot.
  - Showcase Audio & Video Call buttons with feature showcase modals.
  - Date pills and patterned wallpaper chat stream.
  - Formatted messages with auto-URL preview, image lightbox zoom, inline video player, custom audio waveforms, and document download badges.
  - Single/Double/Blue Double checkmark delivery and read receipts.
  - Auto-expanding message composer with emoji picker popup, attachment drawer (Photos, Videos, Audio, Documents), voice recording UI with live timer, and quoted message replies.

### 2. Powerful Admin CRM Console (`/admin/*`)
- **Admin Dashboard**: 10 real-time KPI metrics, daily leads timeline, conversation volume, status donut distribution, and agent performance table.
- **Live Agent Inbox (`/admin/conversations`)**: 3-column powerhouse with filters (All, Unread, Active, Waiting, Assigned to me, VIP Priority, Starred), canned response variable interpolation (`{{name}}`, `{{mobile}}`, etc.), internal private yellow team notes, and real-time Socket.IO synchronization.
- **Contacts CRM (`/admin/contacts`)**: Multi-filter table, column sorting, pagination, bulk status/tag/agent updates, and instant export to **CSV** and **Excel (.xlsx)**.
- **Lead Pipeline / Kanban (`/admin/leads`)**: Visual stages (New Lead, Contacted, Qualified, Confirmed, High Value VIP, Follow Up, Converted, Closed).
- **Automation Rule Engine (`/admin/automations`)**: Visual Trigger → Conditions → Actions engine (Auto-welcome, keyword auto-replies, inactivity follow-ups, auto-tagging).
- **Appearance & Brand Customizer (`/admin/settings`)**: Live editing of brand name, support avatar, header title, online/offline text, auto-welcome message delays, colors, and legal URLs without code changes.
- **Team & RBAC Access (`/admin/users`)**: Super Admin, Admin, and Support Agent roles with active device session monitoring and instant session revocation.
- **Forensic Audit Logs (`/admin/audit-logs`)**: Immutable logging of all admin actions, logins, exports, and security events.

---

## 🚀 Quick Start (Local Development)

### 1. Clone and Install Dependencies
```bash
git clone https://github.com/your-username/vipchat.git
cd vipchat
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Generate Prisma Client & Run Seeds
```bash
npm run db:generate
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```
- Customer Live Chat: [http://localhost:5173](http://localhost:5173)
- Admin CRM Console: [http://localhost:5173/admin/login](http://localhost:5173/admin/login)

**Pre-seeded Credentials:**
- **Super Admin**: `admin@vipchat.live` / `VipAdmin@2026!`
- **Support Agent**: `sophia.agent@vipchat.live` / `Agent@2026!`

---

## 🐳 Docker Deployment

The project includes a multi-stage production `Dockerfile` and `docker-compose.yml` with a self-hosted PostgreSQL 16 database and persistent volumes for media and data.

### Deploy with Docker Compose:
```bash
docker compose up -d --build
```
Persistent volumes created:
- `postgres_data`: PostgreSQL database storage
- `media_storage`: Uploaded images, videos, audio, and documents (`/app/storage/uploads`)

Check health status:
```bash
curl http://localhost:3000/api/health
```

---

## 🌐 Dokploy Deployment Guide

Dokploy is a self-hosted PaaS that makes deploying from GitHub seamless:

1. **Create Application in Dokploy**:
   - Go to your Dokploy Dashboard → Click **Create Application**.
   - Connect your GitHub Repository: `your-username/vipchat`.
   - Build Type: **Docker Compose** or **Dockerfile**.
2. **Environment Variables**:
   Add the following environment variables in Dokploy:
   ```env
   NODE_ENV=production
   PORT=3000
   APP_URL=https://chat.yourdomain.com
   CORS_ORIGIN=https://chat.yourdomain.com
   DATABASE_URL=postgresql://postgres:postgres_secure_pass@postgres:5432/vipchat?schema=public
   SESSION_SECRET=generate_a_random_32_character_string
   JWT_SECRET=generate_a_random_32_character_string
   SUPERADMIN_EMAIL=admin@yourdomain.com
   SUPERADMIN_PASSWORD=YourStrongPassword2026!
   STORAGE_PATH=/app/storage/uploads
   MAX_UPLOAD_SIZE_MB=50
   ```
3. **Persistent Volume Mounts in Dokploy**:
   - `/app/storage/uploads` → Points to host `/var/lib/dokploy/vipchat_storage`
4. **Deploy**:
   - Click **Deploy**. Dokploy will pull the latest commit, build the container, execute Prisma migrations, and route SSL through Traefik/Nginx reverse proxy.

---

## 🔒 Security Architecture

- **HttpOnly Cookies**: Prevents XSS-based token theft; authentication secrets are never exposed to insecure `localStorage`.
- **RBAC Enforcement**: Middleware strictly blocks agents from touching security settings, users, or audit logs.
- **Rate Limiting**: Protects login and API endpoints against brute force attacks.
- **MIME & File Verification**: File uploads undergo MIME inspection and size limits (50MB default) before saving to isolated `/storage/uploads/` directories.

---

## 📦 Automated Backups

Run the included automated backup script via cron:
```bash
# Add to crontab for daily 3:00 AM backup
0 3 * * * /app/scripts/backup.sh
```
Backups are archived into `/app/backups/db` and `/app/backups/media` with a 14-day automated retention policy.

---

## 🧪 Automated Testing

Run the Vitest test suite:
```bash
npm test
```
Verifies authentication, persistent sessions, contacts CRM, real-time messaging, and RBAC permissions.
