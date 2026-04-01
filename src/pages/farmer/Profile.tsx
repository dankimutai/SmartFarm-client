import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Leaf,
  User,
  Mail,
  Phone,
  MapPin,
  Edit2,
  TrendingUp,
  Truck,
  Award,
  Save,
  Loader,
  AlertCircle,
  X
} from 'lucide-react';
import { RootState } from '../../store/store';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {farmersApi} from '../../store/api/farmersProfileAPi';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  
  // Get user ID from auth state
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id ?? 9; // Fallback to 9 for testing purposes
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    location: '',
    farmSize: 0,
    primaryCrops: '',
  });

  // Fetch farmer data
  const {
    data: farmerData,
    isLoading,
    error,
    refetch
  } = farmersApi.useGetFarmerByUserIdQuery(userId);

  // Update farmer mutation
  const [updateFarmer, { isLoading: isUpdating }] = farmersApi.useUpdateFarmerMutation();

  // Initialize form data when farmer data is loaded
  useEffect(() => {
    if (farmerData) {
      setFormData({
        name: farmerData.name,
        email: farmerData.email,
        phoneNumber: farmerData.phoneNumber,
        location: farmerData.location,
        farmSize: farmerData.farmSize || 0,
        primaryCrops: farmerData.primaryCrops || '',
      });
    }
  }, [farmerData]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'farmSize' ? parseFloat(value) || 0 : value,
    }));
  };

  // Handle form submission
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setUpdateError(null);
      
      await updateFarmer({
        id: userId,
        data: {
          location: formData.location,
          farmSize: String(formData.farmSize),
          primaryCrops: formData.primaryCrops,
        }
      }).unwrap();
      
      // Show success message
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
      
      // Exit edit mode
      setIsEditing(false);
      
      // Refresh data
      refetch();
      
    } catch (error) {
      console.error('Failed to update profile:', error);
      setUpdateError('Failed to update profile. Please try again.');
    }
  };

  // Show loading spinner while data is being fetched
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Show error message if there's an error fetching data
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Error loading profile: {(error as any)?.data?.error || 'Something went wrong'}
      </div>
    );
  }

  // Show empty state if no profile found
  if (!farmerData) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Profile Not Found</h3>
              <p className="mt-1 text-sm text-yellow-700">
                Your farmer profile has not been set up yet. Please contact support for assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Farmer Profile</h1>
          <p className="text-gray-500 mt-1">Manage your profile and farm information</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={isUpdating}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleProfileUpdate}
                className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Success/Error Messages */}
      {updateSuccess && (
        <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-lg border border-green-200">
          Profile updated successfully!
        </div>
      )}
      
      {updateError && (
        <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-lg border border-red-200">
          {updateError}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                {/* Using human avatar icon instead of placeholder image */}
                <div className="w-32 h-32 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <User className="w-16 h-16" />
                </div>
              </div>
              <h2 className="mt-4 text-xl font-semibold">{farmerData.name}</h2>
              <p className="text-gray-500">{farmerData.primaryCrops || 'Farmer'}</p>
              
              {/* Quick Stats - Using placeholder values since they're not in the API */}
              <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-6 w-full">
                <div className="text-center">
                  <TrendingUp className="w-5 h-5 mx-auto text-emerald-600" />
                  <p className="mt-1 text-sm text-gray-500">Farm Size</p>
                  <p className="font-semibold">{farmerData.farmSize || 0} acres</p>
                </div>
                <div className="text-center">
                  <Truck className="w-5 h-5 mx-auto text-emerald-600" />
                  <p className="mt-1 text-sm text-gray-500">Location</p>
                  <p className="font-semibold text-xs">{farmerData.location.split(' ')[0]}</p>
                </div>
                <div className="text-center">
                  <Award className="w-5 h-5 mx-auto text-emerald-600" />
                  <p className="mt-1 text-sm text-gray-500">Crops</p>
                  <p className="font-semibold">{farmerData.primaryCrops?.split(',').length || 0}</p>
                </div>
              </div>
              
              {/* Crops */}
              {farmerData.primaryCrops && (
                <div className="mt-6 border-t pt-6 w-full">
                  <h3 className="text-sm uppercase tracking-wider font-semibold text-gray-500 mb-3">
                    My Crops
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {farmerData.primaryCrops.split(',').map((crop, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm"
                      >
                        {crop.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <div className="mt-1 flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-2" />
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    ) : (
                      <span className="text-gray-900">{farmerData.name}</span>
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
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    ) : (
                      <span className="text-gray-900">{farmerData.email}</span>
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
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    ) : (
                      <span className="text-gray-900">{farmerData.phoneNumber}</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <div className="mt-1 flex items-center">
                    <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                    {isEditing ? (
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    ) : (
                      <span className="text-gray-900">{farmerData.location}</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Farm Size (Acres)</label>
                  <div className="mt-1 flex items-center">
                    <Leaf className="w-5 h-5 text-gray-400 mr-2" />
                    {isEditing ? (
                      <input
                        type="number"
                        name="farmSize"
                        value={formData.farmSize}
                        onChange={handleInputChange}
                        step="0.1"
                        min="0"
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    ) : (
                      <span className="text-gray-900">{farmerData.farmSize || 0} acres</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Primary Crops</label>
                  <div className="mt-1 flex items-center">
                    <Leaf className="w-5 h-5 text-gray-400 mr-2" />
                    {isEditing ? (
                      <input
                        type="text"
                        name="primaryCrops"
                        value={formData.primaryCrops}
                        onChange={handleInputChange}
                        placeholder="e.g., Maize, Beans, Potatoes"
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    ) : (
                      <span className="text-gray-900">{farmerData.primaryCrops || 'Not specified'}</span>
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
