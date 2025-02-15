import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  CreditCard,
  Shield,
  Bell,
  Camera,
  Edit2,
  Save,
  X,
} from 'lucide-react';

interface BusinessProfile {
  name: string;
  type: string;
  registrationNumber: string;
  phone: string;
  email: string;
  website: string;
  address: {
    street: string;
    city: string;
    county: string;
    postalCode: string;
  };
  taxInfo: {
    pinNumber: string;
    vatNumber: string;
  };
}

const mockProfile: BusinessProfile = {
  name: 'Green Valley Distributors',
  type: 'Wholesale',
  registrationNumber: 'BUS123456',
  phone: '+254 712 345 678',
  email: 'contact@greenvalley.com',
  website: 'www.greenvalley.com',
  address: {
    street: '123 Business Park',
    city: 'Nairobi',
    county: 'Nairobi',
    postalCode: '00100',
  },
  taxInfo: {
    pinNumber: 'P123456789Q',
    vatNumber: 'VAT123456',
  },
};

const BuyerProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(mockProfile);
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
          <p className="text-gray-500 mt-1">Manage your business information and settings</p>
        </div>
        <div className="mt-4 md:mt-0">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setProfile({ ...profile });
                  setIsEditing(false);
                }}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Navigation */}
      <div className="mb-6 border-b">
        <nav className="flex space-x-6">
          <button
            className={`pb-4 px-2 ${
              activeTab === 'profile'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`pb-4 px-2 ${
              activeTab === 'settings'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
          <button
            className={`pb-4 px-2 ${
              activeTab === 'security'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
        </nav>
      </div>

      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Image */}
          <Card className="md:col-span-1">
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <img
                    src="/api/placeholder/150/150"
                    alt="Company Logo"
                    className="w-32 h-32 rounded-lg"
                  />
                  <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="mt-4 font-semibold text-lg">{profile.name}</h3>
                <p className="text-gray-500">{profile.type}</p>
              </div>
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Name</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                    value={profile.name}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Business Type</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                    value={profile.type}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                    value={profile.registrationNumber}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                    value={profile.phone}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                    value={profile.email}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Website</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                    value={profile.website}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Street Address</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                    value={profile.address.street}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                    value={profile.address.city}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">County</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                    value={profile.address.county}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                    value={profile.address.postalCode}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax Information */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Tax Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">PIN Number</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                    value={profile.taxInfo.pinNumber}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">VAT Number</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                    value={profile.taxInfo.vatNumber}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'settings' && (
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-gray-500">Receive order updates and alerts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">SMS Notifications</h4>
                  <p className="text-sm text-gray-500">Receive delivery notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium">Change Password</h4>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                      />
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Enable 2FA</h4>
                  <p className="text-sm text-gray-500">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Login Sessions</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Shield className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Current Session</h4>
                      <p className="text-sm text-gray-500">Nairobi, Kenya • Chrome on Windows</p>
                    </div>
                  </div>
                  <span className="text-sm text-green-600">Active Now</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Shield className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Previous Session</h4>
                      <p className="text-sm text-gray-500">Mombasa, Kenya • Safari on iPhone</p>
                    </div>
                  </div>
                  <button className="text-sm text-red-600 hover:text-red-700">Terminate</button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Security</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Payment Verification</h4>
                    <p className="text-sm text-gray-500">Require authentication for all payments</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Transaction Limits</h4>
                    <p className="text-sm text-gray-500">Set maximum transaction amount</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      className="w-32 px-3 py-2 border rounded-lg"
                      placeholder="Amount"
                    />
                    <span className="text-gray-500">KES</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Access</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">API Keys</h4>
                    <p className="text-sm text-gray-500">Manage API access for integrations</p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Generate New Key
                  </button>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Production Key</span>
                    <button className="text-sm text-red-600 hover:text-red-700">Revoke</button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value="sk_live_xxxxxxxxxxxxxxxxxxxxx"
                      className="flex-1 px-3 py-2 bg-white border rounded-lg"
                      readOnly
                    />
                    <button className="px-3 py-2 text-blue-600 hover:text-blue-700">Copy</button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h4 className="font-medium mb-2">Recent Activity</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <CreditCard className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Payment method updated</p>
                          <p className="text-xs text-gray-500">Yesterday at 2:45 PM</p>
                        </div>
                      </div>
                      <button className="text-sm text-blue-600 hover:text-blue-700">View</button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Bell className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Email notifications enabled</p>
                          <p className="text-xs text-gray-500">3 days ago</p>
                        </div>
                      </div>
                      <button className="text-sm text-blue-600 hover:text-blue-700">View</button>
                    </div>
                  </div>
                </div>

                <button className="text-sm text-blue-600 hover:text-blue-700">
                  View Full Activity Log
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BuyerProfile;
