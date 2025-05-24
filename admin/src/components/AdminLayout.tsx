import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  BarChart3,
  Users,
  FileText,
  MessageSquare,
  Settings,
  Flag,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationCenter } from '@/components/NotificationCenter';

export const AdminLayout: React.FC = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Overview', href: '/', icon: BarChart3 },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Blog Management', href: '/blogs', icon: FileText },
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Reports', href: '/reports', icon: Flag },
    { name: 'Profile', href: '/profile', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen min-w-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-blue-600 font-bold text-xl">
                Admin Dashboard
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationCenter />
              <Button variant="outline" asChild>
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Site
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white dark:bg-gray-800 shadow-sm h-screen sticky top-16">
          <div className="p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive(item.href)
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                          : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
