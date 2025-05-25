import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  token: string;
  timestamp: Date;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

interface Notification {
  id: string;
  type: 'achievement' | 'blog' | 'donation' | 'feedback';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  achievements: Achievement[];
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  addAchievement: (achievement: Omit<Achievement, 'id' | 'earnedAt'>) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      const authUser = {
        ...data.user,
        token: data.token
      };
      setUser(authUser);
      localStorage.setItem('user', JSON.stringify(authUser));


      addAchievement({
        title: 'Welcome Back!',
        description: 'You have successfully logged in',
        icon: '👋'
      });

      toast({ title: 'Login Success', description: `Welcome ${data.user.name}` });
      return true;
    } catch (err) {
      toast({ title: 'Login Failed', description: 'Invalid credentials.', variant: 'destructive' });
      return false;
    }
  };

  // Inside AuthContext.tsx
  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('http://localhost:5000/api/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      const { user, token } = data;

      const authUser = {
        ...user,
        token
      };

      setUser(authUser);
      localStorage.setItem('user', JSON.stringify(authUser));

      addAchievement({
        title: 'Welcome to Sifas Heart!',
        description: 'Thank you for joining our mission',
        icon: '🎉'
      });

      toast({
        title: "Account created!",
        description: `Welcome, ${user.name}!`,
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Signup Error",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast({ title: 'Logged Out', description: 'Goodbye for now.' });
  };

  const addAchievement = (achievement: Omit<Achievement, 'id' | 'earnedAt'>) => {
    const newAchievement: Achievement = {
      ...achievement,
      id: Date.now().toString(),
      earnedAt: new Date()
    };
    setAchievements((prev) => [newAchievement, ...prev]);
    addNotification({
      type: 'achievement',
      title: 'New Achievement!',
      message: `You earned: ${achievement.title}`
    });
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        achievements,
        notifications,
        markNotificationAsRead,
        addAchievement,
        addNotification
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
