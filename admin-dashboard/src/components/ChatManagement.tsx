
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Search, Circle } from 'lucide-react';

const mockChats = [
  {
    id: '1',
    user: {
      name: 'John Doe',
      avatar: '',
      email: 'john@example.com',
      isOnline: true,
      lastSeen: 'now',
    },
    lastMessage: 'Thank you for your quick response regarding my donation!',
    timestamp: '2 min ago',
    unread: 2,
  },
  {
    id: '2',
    user: {
      name: 'Jane Smith',
      avatar: '',
      email: 'jane@example.com',
      isOnline: false,
      lastSeen: '5 min ago',
    },
    lastMessage: 'I have a question about the Congo relief project...',
    timestamp: '1 hour ago',
    unread: 0,
  },
  {
    id: '3',
    user: {
      name: 'Mike Johnson',
      avatar: '',
      email: 'mike@example.com',
      isOnline: true,
      lastSeen: 'now',
    },
    lastMessage: 'How can I volunteer for your upcoming events?',
    timestamp: '3 hours ago',
    unread: 1,
  },
];

const mockMessages = [
  {
    id: '1',
    sender: 'user',
    content: 'Hello, I have a question about my recent donation.',
    timestamp: '10:30 AM',
  },
  {
    id: '2',
    sender: 'admin',
    content: 'Hello! I\'d be happy to help you with any questions about your donation. What would you like to know?',
    timestamp: '10:32 AM',
  },
  {
    id: '3',
    sender: 'user',
    content: 'I donated $100 last week but haven\'t received a confirmation email yet.',
    timestamp: '10:35 AM',
  },
  {
    id: '4',
    sender: 'admin',
    content: 'Let me check that for you right away. Can you please provide me with the transaction ID or the email address you used for the donation?',
    timestamp: '10:36 AM',
  },
  {
    id: '5',
    sender: 'user',
    content: 'Thank you for your quick response regarding my donation!',
    timestamp: '10:45 AM',
  },
];

export const ChatManagement = () => {
  const [selectedChat, setSelectedChat] = useState(mockChats[0]);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChats = mockChats.filter(chat =>
    chat.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  const getOnlineStatus = (isOnline: boolean, lastSeen: string) => {
    return isOnline ? (
      <div className="flex items-center text-green-600">
        <Circle className="h-2 w-2 fill-current mr-1" />
        <span className="text-xs">Online</span>
      </div>
    ) : (
      <span className="text-xs text-gray-500">Last seen {lastSeen}</span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Chat Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Communicate with users and supporters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Chat List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Conversations</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedChat.id === chat.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-600'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={chat.user.avatar} />
                        <AvatarFallback>{chat.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {chat.user.isOnline && (
                        <Circle className="absolute -bottom-1 -right-1 h-3 w-3 text-green-500 fill-current border-2 border-white dark:border-gray-800 rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {chat.user.name}
                        </p>
                        {chat.unread > 0 && (
                          <Badge className="bg-blue-600 text-white text-xs h-5 w-5 p-0 flex items-center justify-center rounded-full">
                            {chat.unread}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                      <div className="flex items-center justify-between mt-1">
                        {getOnlineStatus(chat.user.isOnline, chat.user.lastSeen)}
                        <span className="text-xs text-gray-400">{chat.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="lg:col-span-2 flex flex-col">
          {/* Chat Header */}
          <CardHeader className="border-b">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedChat.user.avatar} />
                <AvatarFallback>{selectedChat.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedChat.user.name}</p>
                {getOnlineStatus(selectedChat.user.isOnline, selectedChat.user.lastSeen)}
              </div>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {mockMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.sender === 'admin'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender === 'admin' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>

          {/* Message Input */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
