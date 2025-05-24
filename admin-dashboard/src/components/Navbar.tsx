
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Menu, X, Bell, User, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Donate', href: '/donate' },
    { name: 'Blog', href: '/blog' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-blue-600" fill="currentColor" />
              <span className="text-xl font-bold text-blue-600">Sifa's Heart Foundation</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActive(item.href)
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                    : 'text-muted-foreground'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative">
                      <Bell className="h-5 w-5" />
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">3</Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="p-2">
                      <p className="font-semibold">Notifications</p>
                      <div className="mt-2 space-y-2">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                          <p className="text-sm">🎉 Achievement unlocked: First Donation!</p>
                        </div>
                        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
                          <p className="text-sm">✅ Donation confirmed: $50.00</p>
                        </div>
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                          <p className="text-sm">📝 New blog post by Sifa's Heart Foundation</p>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <img
                        className="h-8 w-8 rounded-full"
                        src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=3b82f6&color=fff`}
                        alt={user.name}
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.name}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="flex items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 text-base font-medium rounded-md ${
                    isActive(item.href)
                      ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-muted-foreground hover:text-blue-600 hover:bg-muted'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
