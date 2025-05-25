import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface Admin {
  id: string;
  name: string;
  email: string;
  token: string;
  isAdmin: true;
}

interface AdminAuthContextType {
  admin: Admin | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return context;
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('admin');
    if (saved) setAdmin(JSON.parse(saved));
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) throw new Error('Admin login failed');
      const data = await res.json();

      setAdmin(data.admin);
      localStorage.setItem('admin', JSON.stringify(data.admin));
      toast({ title: 'Admin Login Success', description: `Welcome ${data.admin.name}` });
      return true;
    } catch (err) {
      toast({ title: 'Login Failed', description: 'Invalid admin credentials', variant: 'destructive' });
      return false;
    }
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('admin');
    toast({ title: 'Admin Logged Out', description: 'Goodbye admin.' });
  };

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
