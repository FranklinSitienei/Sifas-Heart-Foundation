
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, UserCheck, UserX, Mail, Calendar } from 'lucide-react';

const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    joinDate: '2024-01-15',
    lastLogin: '2024-05-20',
    status: 'active',
    donations: 5,
    totalDonated: 250,
    achievements: ['first_login', 'first_donation', 'generous_donor'],
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    joinDate: '2024-02-10',
    lastLogin: '2024-05-23',
    status: 'active',
    donations: 12,
    totalDonated: 800,
    achievements: ['first_login', 'first_donation', 'super_donor', 'community_hero'],
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    joinDate: '2024-03-05',
    lastLogin: '2024-04-15',
    status: 'inactive',
    donations: 2,
    totalDonated: 100,
    achievements: ['first_login', 'first_donation'],
  },
];

export const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users] = useState(mockUsers);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage and monitor user accounts</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">720</p>
              </div>
              <UserCheck className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">680</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New This Month</p>
                <p className="text-2xl font-bold">45</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Donors</p>
                <p className="text-2xl font-bold">320</p>
              </div>
              <UserCheck className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Donations</TableHead>
                <TableHead>Total Donated</TableHead>
                <TableHead>Achievements</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>{user.joinDate}</TableCell>
                  <TableCell>{user.lastLogin}</TableCell>
                  <TableCell>{user.donations}</TableCell>
                  <TableCell>${user.totalDonated}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.achievements.slice(0, 2).map((achievement) => (
                        <Badge key={achievement} variant="outline" className="text-xs">
                          {achievement.replace('_', ' ')}
                        </Badge>
                      ))}
                      {user.achievements.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{user.achievements.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <UserX className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
