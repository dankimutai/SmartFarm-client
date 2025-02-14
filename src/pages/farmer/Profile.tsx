// src/pages/farmer/Profile.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Leaf,
  User,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Camera,
  Star,
  TrendingUp,
  Truck,
  Award,
} from 'lucide-react';

interface FarmerProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  farmName: string;
  farmingType: string;
  joinDate: string;
  avatar: string;
  rating: number;
  totalSales: number;
  totalDeliveries: number;
  badges: string[];
}

const mockProfile: FarmerProfile = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+254 123 456 789',
  address: '123 Farm Road, Nairobi',
  farmName: 'Green Valley Farm',
  farmingType: 'Organic Farming',
  joinDate: 'January 2024',
  avatar: '/api/placeholder/150/150',
  rating: 4.8,
  totalSales: 15000,
  totalDeliveries: 234,
  badges: ['Verified Farmer', 'Top Seller', 'Organic Certified'],
};

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<FarmerProfile>(mockProfile);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    // Here you would typically make an API call to update the profile
    console.log('Profile updated:', profile);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Farmer Profile</h1>
          <p className="text-gray-500 mt-1">Manage your profile and farm information</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          <Edit2 className="w-4 h-4 mr-2" />
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-32 h-32 rounded-full object-cover"
                />
                {isEditing && (
                  <button className="absolute bottom-0 right-0 p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              <h2 className="mt-4 text-xl font-semibold">{profile.name}</h2>
              <p className="text-gray-500">{profile.farmName}</p>
              <div className="flex items-center mt-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="ml-1">{profile.rating} Rating</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {profile.badges.map((badge, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-sm"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-6">
              <div className="text-center">
                <TrendingUp className="w-5 h-5 mx-auto text-emerald-600" />
                <p className="mt-1 text-sm text-gray-500">Sales</p>
                <p className="font-semibold">${profile.totalSales}</p>
              </div>
              <div className="text-center">
                <Truck className="w-5 h-5 mx-auto text-emerald-600" />
                <p className="mt-1 text-sm text-gray-500">Deliveries</p>
                <p className="font-semibold">{profile.totalDeliveries}</p>
              </div>
              <div className="text-center">
                <Award className="w-5 h-5 mx-auto text-emerald-600" />
                <p className="mt-1 text-sm text-gray-500">Badges</p>
                <p className="font-semibold">{profile.badges.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleProfileUpdate}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <div className="mt-1 flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-2" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    ) : (
                      <span className="text-gray-900">{profile.name}</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="mt-1 flex items-center">
                    <Mail className="w-5 h-5 text-gray-400 mr-2" />
                    {isEditing ? (
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    ) : (
                      <span className="text-gray-900">{profile.email}</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <div className="mt-1 flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-2" />
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    ) : (
                      <span className="text-gray-900">{profile.phone}</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <div className="mt-1 flex items-center">
                    <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.address}
                        onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    ) : (
                      <span className="text-gray-900">{profile.address}</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Farm Name</label>
                  <div className="mt-1 flex items-center">
                    <Leaf className="w-5 h-5 text-gray-400 mr-2" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.farmName}
                        onChange={(e) => setProfile({ ...profile, farmName: e.target.value })}
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    ) : (
                      <span className="text-gray-900">{profile.farmName}</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Farming Type</label>
                  <div className="mt-1 flex items-center">
                    <Leaf className="w-5 h-5 text-gray-400 mr-2" />
                    {isEditing ? (
                      <select
                        value={profile.farmingType}
                        onChange={(e) => setProfile({ ...profile, farmingType: e.target.value })}
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="Organic Farming">Organic Farming</option>
                        <option value="Traditional Farming">Traditional Farming</option>
                        <option value="Hydroponic">Hydroponic</option>
                      </select>
                    ) : (
                      <span className="text-gray-900">{profile.farmingType}</span>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
