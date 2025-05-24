
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { User, Mail, Phone, MapPin, Camera, Bell, Shield, Key } from 'lucide-react';

export const AdminProfile = () => {
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@sifaheart.org',
    phone: '+1 (555) 123-4567',
    location: 'New York, USA',
    bio: 'Administrator at Sifa\'s Heart Foundation, dedicated to supporting communities affected by conflict.',
    avatar: '',
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    donationAlerts: true,
    newUserAlerts: false,
    reportAlerts: true,
  });

  const handleProfileUpdate = () => {
    console.log('Updating profile:', profile);
  };

  const handleNotificationUpdate = () => {
    console.log('Updating notifications:', notifications);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your admin account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar} />
                <AvatarFallback className="text-lg">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" className="flex items-center">
                <Camera className="h-4 w-4 mr-2" />
                Change Avatar
              </Button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  rows={3}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                />
              </div>
            </div>

            <Button onClick={handleProfileUpdate} className="w-full">
              Update Profile
            </Button>
          </CardContent>
        </Card>

        {/* Settings */}
        <div className="space-y-6">
          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-gray-500">Receive browser notifications</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={notifications.pushNotifications}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, pushNotifications: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="donation-alerts">Donation Alerts</Label>
                  <p className="text-sm text-gray-500">Get notified of new donations</p>
                </div>
                <Switch
                  id="donation-alerts"
                  checked={notifications.donationAlerts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, donationAlerts: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="new-user-alerts">New User Alerts</Label>
                  <p className="text-sm text-gray-500">Get notified of new user registrations</p>
                </div>
                <Switch
                  id="new-user-alerts"
                  checked={notifications.newUserAlerts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, newUserAlerts: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="report-alerts">Report Alerts</Label>
                  <p className="text-sm text-gray-500">Get notified of user reports</p>
                </div>
                <Switch
                  id="report-alerts"
                  checked={notifications.reportAlerts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, reportAlerts: checked })}
                />
              </div>

              <Button onClick={handleNotificationUpdate} className="w-full">
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full flex items-center justify-center">
                <Key className="h-4 w-4 mr-2" />
                Change Password
              </Button>

              <Button variant="outline" className="w-full flex items-center justify-center">
                <Shield className="h-4 w-4 mr-2" />
                Enable Two-Factor Authentication
              </Button>

              <Separator />

              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-red-800 dark:text-red-300">Danger Zone</h4>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  These actions cannot be undone. Please be careful.
                </p>
                <Button variant="destructive" className="mt-3">
                  Deactivate Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
