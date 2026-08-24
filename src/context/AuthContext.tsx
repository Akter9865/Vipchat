import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Contact, Conversation } from '../types/index.js';

interface AuthContextType {
  // Customer Auth State
  customer: Contact | null;
  customerConversation: Conversation | null;
  isCustomerLoading: boolean;
  loginCustomer: (fullName: string, mobileNumber: string, emailAddress?: string) => Promise<{ success: boolean; error?: string }>;
  logoutCustomer: () => Promise<void>;

  // Admin Auth State
  adminUser: User | null;
  isAdminLoading: boolean;
  loginAdmin: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  customer: null,
  customerConversation: null,
  isCustomerLoading: true,
  loginCustomer: async () => ({ success: false }),
  logoutCustomer: async () => {},

  adminUser: null,
  isAdminLoading: true,
  loginAdmin: async () => ({ success: false }),
  logoutAdmin: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<Contact | null>(null);
  const [customerConversation, setCustomerConversation] = useState<Conversation | null>(null);
  const [isCustomerLoading, setIsCustomerLoading] = useState(true);

  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [isAdminLoading, setIsAdminLoading] = useState(true);

  // Check persistent customer session on boot
  const checkCustomerSession = async () => {
    try {
      const res = await fetch('/api/auth/customer-session');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.contact) {
          setCustomer(data.contact);
          setCustomerConversation(data.conversation || null);
        }
      }
    } catch (e) {
      console.warn('Customer session check:', e);
    } finally {
      setIsCustomerLoading(false);
    }
  };

  // Check admin session on boot
  const checkAdminSession = async () => {
    try {
      const res = await fetch('/api/auth/admin-session');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setAdminUser(data.user);
        }
      }
    } catch (e) {
      console.warn('Admin session check:', e);
    } finally {
      setIsAdminLoading(false);
    }
  };

  useEffect(() => {
    checkCustomerSession();
    checkAdminSession();
  }, []);

  // Customer Onboarding / Login
  const loginCustomer = async (fullName: string, mobileNumber: string, emailAddress?: string) => {
    try {
      const res = await fetch('/api/auth/customer-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, mobileNumber, emailAddress }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to start chat' };
      }
      setCustomer(data.contact);
      setCustomerConversation(data.conversation);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Connection failed' };
    }
  };

  const logoutCustomer = async () => {
    try {
      await fetch('/api/auth/customer-logout', { method: 'POST' });
    } catch (e) {}
    setCustomer(null);
    setCustomerConversation(null);
  };

  // Admin Login
  const loginAdmin = async (email: string, password: string, rememberMe = true) => {
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Invalid credentials' };
      }
      setAdminUser(data.user);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Server connection error' };
    }
  };

  const logoutAdmin = async () => {
    try {
      await fetch('/api/auth/admin-logout', { method: 'POST' });
    } catch (e) {}
    setAdminUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        customerConversation,
        isCustomerLoading,
        loginCustomer,
        logoutCustomer,
        adminUser,
        isAdminLoading,
        loginAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
