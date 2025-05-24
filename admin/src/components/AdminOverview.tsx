
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Users, FileText, TrendingUp } from 'lucide-react';

const donationData = [
  { month: 'Jan', amount: 12000 },
  { month: 'Feb', amount: 15000 },
  { month: 'Mar', amount: 18000 },
  { month: 'Apr', amount: 22000 },
  { month: 'May', amount: 25000 },
  { month: 'Jun', amount: 28000 },
];

const userGrowthData = [
  { month: 'Jan', users: 150 },
  { month: 'Feb', users: 230 },
  { month: 'Mar', users: 320 },
  { month: 'Apr', users: 450 },
  { month: 'May', users: 580 },
  { month: 'Jun', users: 720 },
];

const paymentMethodData = [
  { name: 'Visa', value: 40, color: '#0070f3' },
  { name: 'Mastercard', value: 30, color: '#ff6b6b' },
  { name: 'PayPal', value: 20, color: '#4ecdc4' },
  { name: 'Mobile Money', value: 10, color: '#45b7d1' },
];

export const AdminOverview = () => {
  const stats = [
    {
      title: 'Total Donations',
      value: '$120,000',
      change: '+12%',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Active Users',
      value: '720',
      change: '+24%',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Blog Posts',
      value: '45',
      change: '+8%',
      icon: FileText,
      color: 'text-purple-600',
    },
    {
      title: 'Growth Rate',
      value: '23%',
      change: '+5%',
      icon: TrendingUp,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Overview</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's what's happening with Sifa's Heart Foundation.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className={`text-sm ${stat.color}`}>{stat.change} from last month</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donations Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={donationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Donations']} />
                <Bar dataKey="amount" fill="#3b82f6" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentMethodData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {paymentMethodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
