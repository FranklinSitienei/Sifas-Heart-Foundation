
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  isAdmin?: boolean;
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate login
    const mockUser: User = {
      id: '1',
      name: 'John Doe',
      email,
      profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      isAdmin: email === 'admin@sifasheart.org'
    };
    
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    addAchievement({
      title: 'Welcome Back!',
      description: 'You have successfully logged in',
      icon: '👋'
    });
    
    toast({
      title: "Welcome back!",
      description: `Hello ${mockUser.name}, you've successfully logged in.`,
    });
    
    return true;
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    // Simulate signup
    const mockUser: User = {
      id: Date.now().toString(),
      name,
      email,
      profilePicture: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face`,
      isAdmin: false
    };
    
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    addAchievement({
      title: 'Welcome to Sifas Heart!',
      description: 'Thank you for joining our mission',
      icon: '🎉'
    });
    
    toast({
      title: "Welcome to Sifas Heart Foundation!",
      description: `Hello ${name}, your account has been created successfully.`,
    });
    
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast({
      title: "Goodbye!",
      description: "You have been logged out successfully.",
    });
  };

  const addAchievement = (achievement: Omit<Achievement, 'id' | 'earnedAt'>) => {
    const newAchievement: Achievement = {
      ...achievement,
      id: Date.now().toString(),
      earnedAt: new Date()
    };
    setAchievements(prev => [newAchievement, ...prev]);
    
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
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      achievements,
      notifications,
      markNotificationAsRead,
      addAchievement,
      addNotification
    }}>
      {children}
    </AuthContext.Provider>
  );
};
