import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext.js';
import { AuthProvider } from './context/AuthContext.js';
import { SocketProvider } from './context/SocketContext.js';

// Customer Pages
import { OnboardingPage } from './pages/customer/OnboardingPage.js';
import { ChatPage } from './pages/customer/ChatPage.js';
import { PrivacyPage } from './pages/customer/PrivacyPage.js';
import { TermsPage } from './pages/customer/TermsPage.js';

// Admin Pages & Layout
import { AdminLayout } from './components/admin/AdminLayout.js';
import { AdminLoginPage } from './pages/admin/AdminLoginPage.js';
import { DashboardPage } from './pages/admin/DashboardPage.js';
import { ConversationsPage } from './pages/admin/ConversationsPage.js';
import { ContactsPage } from './pages/admin/ContactsPage.js';
import { LeadsPipelinePage } from './pages/admin/LeadsPipelinePage.js';
import { TemplatesPage } from './pages/admin/TemplatesPage.js';
import { TagsPage } from './pages/admin/TagsPage.js';
import { AutomationsPage } from './pages/admin/AutomationsPage.js';
import { MediaLibraryPage } from './pages/admin/MediaLibraryPage.js';
import { UsersPage } from './pages/admin/UsersPage.js';
import { ReportsPage } from './pages/admin/ReportsPage.js';
import { SettingsPage } from './pages/admin/SettingsPage.js';
import { AuditLogsPage } from './pages/admin/AuditLogsPage.js';

export const App: React.FC = () => {
  return (
    <SettingsProvider>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Customer Routes */}
              <Route path="/" element={<OnboardingPage />} />
              <Route path="/login" element={<OnboardingPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />

              {/* Admin Auth */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Admin Dashboard Protected Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="conversations" element={<ConversationsPage />} />
                <Route path="contacts" element={<ContactsPage />} />
                <Route path="leads" element={<LeadsPipelinePage />} />
                <Route path="templates" element={<TemplatesPage />} />
                <Route path="tags" element={<TagsPage />} />
                <Route path="automations" element={<AutomationsPage />} />
                <Route path="media" element={<MediaLibraryPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="audit-logs" element={<AuditLogsPage />} />
              </Route>

              {/* 404 Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </SettingsProvider>
  );
};
export default App;
