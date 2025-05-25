import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, X, Minimize2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  _id: string;
  text: string;
  senderType: 'user' | 'admin';
  senderId: string;
  receiverId: string;
  timestamp: string;
  isRead: boolean;
}

export const ChatBox = () => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false); // future: socket
  const [adminOnline, setAdminOnline] = useState(true); // future: socket

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch messages from backend
  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chat/conversation/${user.id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      setUnreadCount(0);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message to backend
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          text: newMessage,
          receiverId: 'admin-id', // TODO: replace with actual admin ID
        }),
      });

      const sentMsg = await res.json();
      setMessages((prev) => [...prev, sentMsg]);
      setNewMessage('');
    } catch (err) {
      console.error('Send message failed:', err);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
          <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${adminOnline ? 'bg-green-500' : 'bg-gray-400'
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
                    <div className={`w-2 h-2 rounded-full ${adminOnline ? 'bg-green-400' : 'bg-gray-400'
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
                  <div className={`w-2 h-2 rounded-full ${adminOnline ? 'bg-green-400' : 'bg-gray-400'
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
                  key={message._id}
                  className={`flex ${message.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end space-x-2 max-w-[80%] ${message.senderType === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                    {message.senderType === 'admin' && (
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">SH</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`rounded-lg px-3 py-2 ${message.senderType === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${message.senderType === 'user'
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