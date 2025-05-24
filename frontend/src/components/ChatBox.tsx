
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, X, Minimize2, Phone, Video } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  timestamp: Date;
  isRead: boolean;
}

const mockMessages: Message[] = [
  {
    id: '1',
    text: 'Hello! How can I help you today?',
    sender: 'admin',
    timestamp: new Date(Date.now() - 300000),
    isRead: true,
  },
  {
    id: '2', 
    text: 'Hi, I wanted to know more about your water well project.',
    sender: 'user',
    timestamp: new Date(Date.now() - 240000),
    isRead: true,
  },
  {
    id: '3',
    text: 'Great question! Our water well project aims to provide clean drinking water to rural communities. Would you like me to share more details or connect you with our project coordinator?',
    sender: 'admin',
    timestamp: new Date(Date.now() - 180000),
    isRead: true,
  },
];

export const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [adminOnline, setAdminOnline] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Simulate user going online when chat is opened
    if (isOpen) {
      setIsOnline(true);
      // Mark messages as read when chat is opened
      setUnreadCount(0);
      setMessages(prev => prev.map(msg => ({ ...msg, isRead: true })));
    }
  }, [isOpen]);

  useEffect(() => {
    // Simulate receiving new messages and admin typing
    const interval = setInterval(() => {
      if (Math.random() > 0.95 && adminOnline) {
        setIsTyping(true);
        setTimeout(() => {
          const newMsg: Message = {
            id: Date.now().toString(),
            text: 'Is there anything else I can help you with?',
            sender: 'admin',
            timestamp: new Date(),
            isRead: isOpen,
          };
          setMessages(prev => [...prev, newMsg]);
          setIsTyping(false);
          if (!isOpen) {
            setUnreadCount(prev => prev + 1);
          }
        }, 2000);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isOpen, adminOnline]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage,
        sender: 'user',
        timestamp: new Date(),
        isRead: true,
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');

      // Simulate admin response
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          const adminResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: 'Thank you for your message! I\'ll get back to you shortly.',
            sender: 'admin',
            timestamp: new Date(),
            isRead: isOpen,
          };
          setMessages(prev => [...prev, adminResponse]);
          setIsTyping(false);
          if (!isOpen) {
            setUnreadCount(prev => prev + 1);
          }
        }, 1500);
      }, 500);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 relative"
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white min-w-[20px] h-5 flex items-center justify-center rounded-full text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          }`} />
        </Button>
      </div>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-80 shadow-xl">
          <CardHeader className="p-3 bg-primary text-primary-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-white text-primary">SH</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Sifa Heart Support</p>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${
                      adminOnline ? 'bg-green-400' : 'bg-gray-400'
                    }`} />
                    <span className="text-xs">
                      {adminOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(false)}
                  className="h-6 w-6 p-0 hover:bg-white/20"
                >
                  <Minimize2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0 hover:bg-white/20"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 h-96 shadow-xl flex flex-col">
        <CardHeader className="p-3 bg-primary text-primary-foreground flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-white text-primary text-sm">SH</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">Sifa Heart Support</p>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${
                    adminOnline ? 'bg-green-400' : 'bg-gray-400'
                  }`} />
                  <span className="text-xs">
                    {adminOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {/* <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-white/20"
              >
                <Phone className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-white/20"
              >
                <Video className="h-4 w-4" />
              </Button> */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="h-8 w-8 p-0 hover:bg-white/20"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end space-x-2 max-w-[80%] ${
                    message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    {message.sender === 'admin' && (
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">SH</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`rounded-lg px-3 py-2 ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user'
                          ? 'text-primary-foreground/70'
                          : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-end space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">SH</AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          <div className="p-3 border-t">
            <div className="flex space-x-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} size="sm">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};