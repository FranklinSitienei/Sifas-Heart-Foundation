
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Trophy, Bell, Heart, MessageCircle, DollarSign, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, achievements, notifications, markNotificationAsRead } = useAuth();

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Please Log In
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          You need to be logged in to view your profile.
        </p>
        <div className="space-x-4">
          <Button asChild>
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    );
  }

  const stats = {
    totalDonations: 3,
    totalAmount: 350,
    commentsPosted: 5,
    achievementsEarned: achievements.length
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="pt-8">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
            <div className="relative">
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-100 dark:border-blue-900"
              />
              {user.isAdmin && (
                <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-600">
                  Admin
                </Badge>
              )}
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {user.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{user.email}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Member since January 2024
                  </span>
                </div>
                <div className="flex items-center">
                  <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {achievements.length} achievements
                  </span>
                </div>
              </div>
            </div>
            <Button variant="outline">
              <User className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stats */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {stats.totalDonations}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Donations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                    ${stats.totalAmount}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Given</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    {stats.commentsPosted}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Comments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                    {stats.achievementsEarned}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Achievements</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">Donated $100</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">2 days ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">Commented on a blog post</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">3 days ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Heart className="h-5 w-5 text-purple-600" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">Liked 5 comments</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">1 week ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {achievements.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                  No achievements yet. Start by making a donation or commenting on blog posts!
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {achievement.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {achievement.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {achievement.earnedAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                  No notifications
                </p>
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 10).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        notification.read
                          ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                          : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                      }`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {notification.timestamp.toLocaleDateString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-1"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/donate">Make a Donation</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/blog">Read Latest Posts</Link>
              </Button>
              <Button variant="outline" className="w-full">
                Share Your Story
              </Button>
            </CardContent>
          </Card>

          {/* Donation History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Donations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Jan 15, 2024</span>
                  <span className="font-medium">$100</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Jan 10, 2024</span>
                  <span className="font-medium">$150</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Jan 5, 2024</span>
                  <span className="font-medium">$100</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
