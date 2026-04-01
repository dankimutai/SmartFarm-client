import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Settings,
  Bell,
  Mail,
  Smartphone,
  Globe,
  DollarSign,
  ShieldCheck,
  Languages,
  Moon,
  Sun,
  Eye,
  Clock,
  AlertTriangle,
  Save,
  Download
} from 'lucide-react';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  email: boolean;
  sms: boolean;
  push: boolean;
}

const notificationSettings: NotificationSetting[] = [
  {
    id: 'orders',
    title: 'Order Updates',
    description: 'Get notified about order status changes and updates',
    email: true,
    sms: true,
    push: true
  },
  {
    id: 'delivery',
    title: 'Delivery Updates',
    description: 'Receive notifications about delivery status and tracking',
    email: true,
    sms: true,
    push: false
  },
  {
    id: 'payments',
    title: 'Payment Updates',
    description: 'Get notified about payment confirmations and issues',
    email: true,
    sms: false,
    push: true
  },
  {
    id: 'promotions',
    title: 'Promotions',
    description: 'Receive updates about deals and promotions',
    email: true,
    sms: false,
    push: false
  }
];

const BuyerSettings = () => {
  const [activeTab, setActiveTab] = useState('notifications');
  const [notifications, setNotifications] = useState(notificationSettings);
  const [language, setLanguage] = useState('english');
  const [currency, setCurrency] = useState('KES');
  const [theme, setTheme] = useState('light');

  const handleNotificationChange = (
    settingId: string,
    channel: 'email' | 'sms' | 'push',
    value: boolean
  ) => {
    setNotifications(
      notifications.map(setting =>
        setting.id === settingId ? { ...setting, [channel]: value } : setting
      )
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account preferences and settings</p>
      </div>

      {/* Settings Navigation */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-3">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                <button
                  className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    activeTab === 'notifications'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('notifications')}
                >
                  <Bell className="w-5 h-5" />
                  <span>Notifications</span>
                </button>
                <button
                  className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    activeTab === 'preferences'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('preferences')}
                >
                  <Settings className="w-5 h-5" />
                  <span>Preferences</span>
                </button>
                <button
                  className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    activeTab === 'privacy'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('privacy')}
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Privacy</span>
                </button>
              </nav>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 md:col-span-9 space-y-6">
          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {notifications.map((setting) => (
                    <div key={setting.id} className="border-b pb-6 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-medium">{setting.title}</h4>
                          <p className="text-sm text-gray-500">{setting.description}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">Email</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={setting.email}
                              onChange={(e) =>
                                handleNotificationChange(setting.id, 'email', e.target.checked)
                              }
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Smartphone className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">SMS</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={setting.sms}
                              onChange={(e) =>
                                handleNotificationChange(setting.id, 'sms', e.target.checked)
                              }
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Bell className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">Push</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={setting.push}
                              onChange={(e) =>
                                handleNotificationChange(setting.id, 'push', e.target.checked)
                              }
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preferences Settings */}
          {activeTab === 'preferences' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>General Preferences</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Language */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Languages className="w-5 h-5 text-gray-500" />
                        <div>
                          <h4 className="font-medium">Language</h4>
                          <p className="text-sm text-gray-500">Select your preferred language</p>
                        </div>
                      </div>
                      <select
                        className="px-3 py-2 border rounded-lg"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                      >
                        <option value="english">English</option>
                        <option value="swahili">Swahili</option>
                        <option value="french">French</option>
                      </select>
                    </div>

                    {/* Currency */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-5 h-5 text-gray-500" />
                        <div>
                          <h4 className="font-medium">Currency</h4>
                          <p className="text-sm text-gray-500">Choose your preferred currency</p>
                        </div>
                      </div>
                      <select
                        className="px-3 py-2 border rounded-lg"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                      >
                        <option value="KES">KES - Kenyan Shilling</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                      </select>
                    </div>

                    {/* Theme */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {theme === 'light' ? (
                          <Sun className="w-5 h-5 text-gray-500" />
                        ) : (
                          <Moon className="w-5 h-5 text-gray-500" />
                        )}
                        <div>
                          <h4 className="font-medium">Theme</h4>
                          <p className="text-sm text-gray-500">Choose your preferred theme</p>
                        </div>
                      </div>
                      <select
                        className="px-3 py-2 border rounded-lg"
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Display Settings</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Date Format */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-gray-500" />
                        <div>
                          <h4 className="font-medium">Date Format</h4>
                          <p className="text-sm text-gray-500">Choose how dates are displayed</p>
                        </div>
                      </div>
                      <select className="px-3 py-2 border rounded-lg">
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>

                    {/* Timezone */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-5 h-5 text-gray-500" />
                        <div>
                          <h4 className="font-medium">Timezone</h4>
                          <p className="text-sm text-gray-500">Set your local timezone</p>
                        </div>
                      </div>
                      <select className="px-3 py-2 border rounded-lg">
                        <option value="UTC+3">East Africa Time (UTC+3)</option>
                        <option value="UTC">UTC</option>
                        <option value="UTC+1">Central European Time (UTC+1)</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Privacy Settings */}
          {activeTab === 'privacy' && (
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Profile Visibility */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-5 h-5 text-gray-500" />
                      <div>
                        <h4 className="font-medium">Profile Visibility</h4>
                        <p className="text-sm text-gray-500">Control who can see your profile</p>
                      </div>
                    </div>
                    <select className="px-3 py-2 border rounded-lg">
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="verified">Verified Users Only</option>
                      </select>
                  </div>

                  {/* Activity Tracking */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-gray-500" />
                      <div>
                        <h4 className="font-medium">Activity Tracking</h4>
                        <p className="text-sm text-gray-500">Manage how your activity is tracked</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Data Sharing */}
                  <div className="border-t pt-6">
                    <h4 className="font-medium mb-4">Data Sharing Preferences</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Share Purchase History</p>
                          <p className="text-sm text-gray-500">Allow sellers to view your order history</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Anonymous Analytics</p>
                          <p className="text-sm text-gray-500">Share anonymous usage data to improve services</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Marketing Communications</p>
                          <p className="text-sm text-gray-500">Receive personalized offers and updates</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Data Export */}
                  <div className="border-t pt-6">
                    <h4 className="font-medium mb-4">Data Management</h4>
                    <div className="space-y-4">
                      <button className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100">
                        <span>Export Account Data</span>
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="w-full flex items-center justify-between px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100">
                        <span>Delete Account</span>
                        <AlertTriangle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Changes Button */}
          <div className="flex justify-end">
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerSettings;
