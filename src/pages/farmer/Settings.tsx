import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Bell,
  Mail,
  Smartphone,
  Lock,
  Globe,
  CreditCard,
  Shield,
  MapPin,
  AlertTriangle,
  Plus,
  Trash2,
} from 'lucide-react';

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  orderUpdates: boolean;
  marketingEmails: boolean;
  securityAlerts: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private';
  showContactInfo: boolean;
  showFarmLocation: boolean;
}

interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  expiryDate: string;
  isDefault: boolean;
}

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'Visa',
    last4: '4242',
    expiryDate: '12/24',
    isDefault: true,
  },
  {
    id: '2',
    type: 'Mastercard',
    last4: '5555',
    expiryDate: '10/25',
    isDefault: false,
  },
];

const Settings = () => {
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    orderUpdates: true,
    marketingEmails: false,
    securityAlerts: true,
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showContactInfo: true,
    showFarmLocation: true,
  });

  const [activeTab, setActiveTab] = useState('notifications');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedRegion, setSelectedRegion] = useState('KE');

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePrivacyChange = (key: keyof PrivacySettings) => {
    if (key === 'profileVisibility') {
      setPrivacy((prev) => ({
        ...prev,
        profileVisibility: prev.profileVisibility === 'public' ? 'private' : 'public',
      }));
    } else {
      setPrivacy((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    }
  };

  const handleSetDefaultPayment = (id: string) => {
    setPaymentMethods((methods) =>
      methods.map((method) => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
  };

  const handleDeletePayment = (id: string) => {
    setPaymentMethods((methods) => methods.filter((method) => method.id !== id));
  };

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'payment', label: 'Payment Methods', icon: CreditCard },
    { id: 'language', label: 'Language & Region', icon: Globe },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notifications':
        return (
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-500">
                        Receive email updates about your orders
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.emailNotifications}
                      onChange={() => handleNotificationChange('emailNotifications')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-gray-500">
                        Get push notifications on your mobile device
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.pushNotifications}
                      onChange={() => handleNotificationChange('pushNotifications')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Order Updates</p>
                      <p className="text-sm text-gray-500">Get updates about your order status</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.orderUpdates}
                      onChange={() => handleNotificationChange('orderUpdates')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Security Alerts</p>
                      <p className="text-sm text-gray-500">Get important security notifications</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.securityAlerts}
                      onChange={() => handleNotificationChange('securityAlerts')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'privacy':
        return (
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Privacy & Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Profile Visibility</p>
                      <p className="text-sm text-gray-500">Control who can see your profile</p>
                    </div>
                  </div>
                  <select
                    value={privacy.profileVisibility}
                    onChange={(e) =>
                      setPrivacy((prev) => ({
                        ...prev,
                        profileVisibility: e.target.value as 'public' | 'private',
                      }))
                    }
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Show Contact Information</p>
                      <p className="text-sm text-gray-500">
                        Display your contact details to buyers
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacy.showContactInfo}
                      onChange={() => handlePrivacyChange('showContactInfo')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Show Farm Location</p>
                      <p className="text-sm text-gray-500">
                        Display your farm's location on the map
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacy.showFarmLocation}
                      onChange={() => handlePrivacyChange('showFarmLocation')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h3 className="text-lg font-medium mb-4">Security Settings</h3>
                <button className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg">
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </button>
                <button className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg mt-2">
                  <Shield className="w-4 h-4 mr-2" />
                  Enable Two-Factor Authentication
                </button>
              </div>
            </CardContent>
          </Card>
        );

      case 'payment':
        return (
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <CreditCard
                        className={`w-8 h-8 ${method.type === 'Visa' ? 'text-blue-600' : 'text-red-600'}`}
                      />
                      <div>
                        <p className="font-medium">
                          {method.type} ending in {method.last4}
                        </p>
                        <p className="text-sm text-gray-500">Expires {method.expiryDate}</p>
                      </div>
                      {method.isDefault && (
                        <span className="px-2 py-1 text-xs bg-emerald-100 text-emerald-600 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {!method.isDefault && (
                        <button
                          onClick={() => handleSetDefaultPayment(method.id)}
                          className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDeletePayment(method.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <button className="flex items-center px-4 py-2 mt-4 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg border-2 border-dashed border-emerald-200 w-full justify-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Payment Method
                </button>
              </div>
            </CardContent>
          </Card>
        );

      case 'language':
        return (
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Language & Region Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="en">English</option>
                    <option value="sw">Swahili</option>
                    <option value="fr">French</option>
                    <option value="ar">Arabic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="KE">Kenya</option>
                    <option value="UG">Uganda</option>
                    <option value="TZ">Tanzania</option>
                    <option value="RW">Rwanda</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                  <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="EAT">East Africa Time (GMT+3)</option>
                    <option value="CAT">Central Africa Time (GMT+2)</option>
                    <option value="WAT">West Africa Time (GMT+1)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="KES">Kenyan Shilling (KES)</option>
                    <option value="USD">US Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                  </select>
                </div>

                <div className="pt-4">
                  <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                    Save Language & Region Settings
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account preferences and settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <Card className="lg:col-span-1">
          <CardContent className="p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center px-3 py-2 text-sm rounded-lg
                      ${
                        activeTab === tab.id
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Content Area */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Settings;
