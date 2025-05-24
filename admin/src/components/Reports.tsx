
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Flag, AlertTriangle, CheckCircle, XCircle, Calendar, User } from 'lucide-react';

const mockReports = [
  {
    id: '1',
    type: 'spam',
    reportedBy: 'John Doe',
    reportedUser: 'SpamUser123',
    content: 'Inappropriate promotional content in comments',
    status: 'pending',
    createdDate: '2024-05-20',
    priority: 'medium',
  },
  {
    id: '2',
    type: 'harassment',
    reportedBy: 'Jane Smith',
    reportedUser: 'BadUser456',
    content: 'Harassing comments on blog post',
    status: 'resolved',
    createdDate: '2024-05-19',
    priority: 'high',
  },
  {
    id: '3',
    type: 'misinformation',
    reportedBy: 'Mike Johnson',
    reportedUser: 'FakeNews789',
    content: 'Spreading false information about donations',
    status: 'investigating',
    createdDate: '2024-05-18',
    priority: 'high',
  },
];

export const Reports = () => {
  const [reports] = useState(mockReports);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
      investigating: { color: 'bg-blue-100 text-blue-800', icon: Flag },
      resolved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      dismissed: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || Flag;

    return (
      <Badge className={config?.color || 'bg-gray-100 text-gray-800'}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityColors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-orange-100 text-orange-800',
      high: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={priorityColors[priority as keyof typeof priorityColors]}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const handleReportAction = (reportId: string, action: string) => {
    console.log(`${action} report ${reportId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Review and manage user reports</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold">23</p>
              </div>
              <Flag className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Investigating</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <Flag className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold">10</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Type</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Reported User</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {report.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      {report.reportedBy}
                    </div>
                  </TableCell>
                  <TableCell>{report.reportedUser}</TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={report.content}>
                      {report.content}
                    </div>
                  </TableCell>
                  <TableCell>{getPriorityBadge(report.priority)}</TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {report.createdDate}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReportAction(report.id, 'investigate')}
                      >
                        Investigate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600"
                        onClick={() => handleReportAction(report.id, 'resolve')}
                      >
                        Resolve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                        onClick={() => handleReportAction(report.id, 'dismiss')}
                      >
                        Dismiss
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
