import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Settings as SettingsIcon,
  User as UserIcon,
  Bell,
  Shield,
  Globe,
  CreditCard,
  Save,
  Loader2,
} from 'lucide-react';
import { usersApi } from '../../store/api/usersApi';
import { RootState } from '../../store/store';

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  productUpdates: boolean;
  securityAlerts: boolean;
  marketingEmails: boolean;
}

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: false,
    productUpdates: true,
    securityAlerts: true,
    marketingEmails: false
  });
  const [profileFormData, setProfileFormData] = useState<{
    name: string;
    phoneNumber: string;
  }>({
    name: '',
    phoneNumber: ''
  });
  const [error, setError] = useState<string | null>(null);
  
  // Get current user ID from Redux auth state
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id;
  
  // Use the RTK Query hooks from usersApi with correct parameters
  // According to UsersQueryParams type, we should use search instead of id
  const { data: userData, isLoading: isUserDataLoading } = usersApi.useGetUsersQuery(
    // Pass valid parameters according to the UsersQueryParams type
    { 
      page: 1,
      limit: 1,
      search: userId?.toString() // Convert ID to string for search parameter
    }, 
    {
      // Skip the query if userId is undefined
      skip: !userId
    }
  );
  
  const [updateUser, { isLoading: isUpdating }] = usersApi.useUpdateUserMutation();
  
  // Set form data when user data is loaded
  useEffect(() => {
    if (userData && userData.data && userData.data.length > 0) {
      const user = userData.data[0];
      setProfileFormData({
        name: user.name || '',
        phoneNumber: user.phoneNumber || ''
      });
    }
  }, [userData]);
  
  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle profile update
  const handleProfileUpdate = async () => {
    if (!userData?.data?.[0] || !userId) return;
    
    try {
      setError(null);
      
      await updateUser({
        id: userId,
        data: {
          name: profileFormData.name,
          phoneNumber: profileFormData.phoneNumber
        }
      }).unwrap();
      
      // Success notification could be added here
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile. Please try again.');
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Globe },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Platform Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-emerald-500"
                  defaultValue="SmartFarm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                <input
                  type="email"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-emerald-500"
                  defaultValue="admin@smartfarm.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Language</label>
                <select className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-emerald-500">
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Timezone</label>
                <select className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-emerald-500">
                  <option value="UTC">UTC</option>
                  <option value="EST">EST</option>
                  <option value="PST">PST</option>
                </select>
              </div>
            </CardContent>
          </Card>
        );

      case 'profile':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!userId ? (
                <div className="p-4 bg-yellow-50 text-yellow-600 rounded-md">
                  You need to be logged in to view profile settings.
                </div>
              ) : isUserDataLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                </div>
              ) : error ? (
                <div className="bg-red-50 p-4 rounded-md text-red-800">
                  {error}
                </div>
              ) : userData?.data && userData.data.length > 0 ? (
                <>
                  <div className="flex items-center space-x-4">
                    {userData.data[0].image ? (
                      <img
                        src={userData.data[0].image}
                        alt="Profile"
                        className="h-20 w-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                        <UserIcon className="h-10 w-10" />
                      </div>
                    )}
                    <div>
                      <button 
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                        disabled={isUpdating}
                      >
                        Change Photo
                      </button>
                      <p className="text-xs text-gray-500 mt-1">
                        Recommended: 400x400px, JPG or PNG
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-emerald-500"
                      value={profileFormData.name}
                      onChange={handleProfileChange}
                    />
                  </div>
                  
                  {userData.data[0].email && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50"
                        value={userData.data[0].email}
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="text"
                      name="phoneNumber"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-emerald-500"
                      value={profileFormData.phoneNumber}
                      onChange={handleProfileChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50"
                      value={userData.data[0].role}
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">Role cannot be changed</p>
                  </div>
                  
                  <div className="flex justify-end">
                    <button 
                      className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-emerald-300"
                      onClick={handleProfileUpdate}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Profile
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-yellow-50 text-yellow-600 rounded-md">
                  No user data found. Please refresh the page or contact support.
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'notifications':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Receive notifications for {key.toLowerCase()}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => setNotifications(prev => ({
                        ...prev,
                        [key]: !prev[key as keyof NotificationSettings]
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>
        );

      case 'security':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Password</label>
                    <input
                      type="password"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                    <input
                      type="password"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                    <input
                      type="password"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                  Enable 2FA
                </button>
              </div>
            </CardContent>
          </Card>
        );

      case 'integrations':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {['Google Analytics', 'Payment Gateway', 'Email Service', 'SMS Gateway'].map((integration) => (
                  <div key={integration} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{integration}</h3>
                      <p className="text-sm text-gray-500">Connected</p>
                    </div>
                    <button className="px-4 py-2 text-sm text-red-600 hover:text-red-800">
                      Disconnect
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 'billing':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Billing & Subscription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-emerald-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-emerald-800">Current Plan: Premium</h3>
                <p className="text-sm text-emerald-600 mt-1">Your subscription renews on April 1, 2024</p>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Payment Method</h3>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center">
                    <CreditCard className="h-6 w-6 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">•••• •••• •••• 4242</p>
                      <p className="text-sm text-gray-500">Expires 12/24</p>
                    </div>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-800">Edit</button>
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account settings and preferences</p>
        </div>
        {activeTab !== 'profile' && (
          <button className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </button>
        )}
      </div>

      <div className="flex gap-6">
        {/* Settings Navigation */}
        <Card className="w-64 h-fit">
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
                      ${activeTab === tab.id
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

        {/* Settings Content */}
        <div className="flex-1">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;