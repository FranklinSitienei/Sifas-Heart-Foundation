
import React, { useState } from 'react';
import { Bell, MessageCircle, Heart, Users, Gift, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

const mockNotifications = [
  {
    id: '1',
    type: 'comment',
    title: 'New comment on your post',
    message: 'John Doe commented on "Supporting Congo Crisis Relief Efforts"',
    timestamp: '2 minutes ago',
    read: false,
    avatar: '',
    icon: MessageCircle,
    iconColor: 'text-blue-500',
  },
  {
    id: '2',
    type: 'like',
    title: 'Someone liked your comment',
    message: 'Sarah Johnson liked your comment',
    timestamp: '5 minutes ago',
    read: false,
    avatar: '',
    icon: Heart,
    iconColor: 'text-red-500',
  },
  {
    id: '3',
    type: 'reply',
    title: 'Reply to your comment',
    message: 'Mike Smith replied to your comment on water well project',
    timestamp: '10 minutes ago',
    read: false,
    avatar: '',
    icon: MessageCircle,
    iconColor: 'text-green-500',
  },
  {
    id: '4',
    type: 'chat',
    title: 'New message',
    message: 'You have a new message from Admin',
    timestamp: '15 minutes ago',
    read: true,
    avatar: '',
    icon: MessageCircle,
    iconColor: 'text-purple-500',
  },
  {
    id: '5',
    type: 'donation',
    title: 'Donation confirmed',
    message: 'Your donation of $50 has been processed successfully',
    timestamp: '1 hour ago',
    read: true,
    avatar: '',
    icon: Gift,
    iconColor: 'text-emerald-500',
  },
  {
    id: '6',
    type: 'achievement',
    title: 'Achievement unlocked!',
    message: 'You earned the "First Donation" badge',
    timestamp: '2 hours ago',
    read: true,
    avatar: '',
    icon: Gift,
    iconColor: 'text-yellow-500',
  },
  {
    id: '7',
    type: 'blog',
    title: 'New blog post',
    message: 'Sifa Heart Foundation published "Educational Support Program Launch"',
    timestamp: '3 hours ago',
    read: true,
    avatar: '',
    icon: Users,
    iconColor: 'text-blue-600',
  },
];

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id 
        ? { ...notification, read: true }
        : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => 
      ({ ...notification, read: true })
    ));
  };

  const removeNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const getNotificationIcon = (notification) => {
    const Icon = notification.icon;
    return <Icon className={`h-4 w-4 ${notification.iconColor}`} />;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-blue-600 hover:text-blue-800"
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {notification.avatar ? (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={notification.avatar} />
                          <AvatarFallback>
                            {notification.message.split(' ')[0]?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-8 w-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                          {getNotificationIcon(notification)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {notification.timestamp}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeNotification(notification.id)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <div className="p-4 border-t">
            <Button 
              variant="ghost" 
              className="w-full text-blue-600 hover:text-blue-800"
              onClick={() => setIsOpen(false)}
            >
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
