// src/pages/farmer/ProductManagement.tsx
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { productsApi } from '../../store/api/productsApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { RootState } from '../../store/store';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
  ListPlus
} from 'lucide-react';
import AddProductModal from '../../components/farmer/AddProductModal';
import AddListingModal from '../../components/farmer/AddListingModal';

const ProductManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  
  // Modal states
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isAddListingModalOpen, setIsAddListingModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | undefined>(undefined);

  // Get farmerId directly from auth state
  const user = useSelector((state: RootState) => state.auth.user);
  const farmerId = user?.farmerId;
  console.log(farmerId)

  // Fetch farmer's listings using farmerId
  const { 
    data: listingsResponse, 
    isError,
    isLoading,
    error,
    refetch 
  } = productsApi.useGetFarmerListingsQuery(farmerId!, {
    skip: !farmerId
  });

  const listings = listingsResponse?.data || [];

  // Handler for product added
  const handleProductAdded = (productId: number) => {
    // Open listing modal with the new product selected
    setSelectedProductId(productId);
    setIsAddListingModalOpen(true);
  };

  // Handler for listing added
  const handleListingAdded = () => {
    // Refetch listings to update the UI
    refetch();
  };

  // Filter listings based on search and category
  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      searchTerm === '' ||
      listing.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.product.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      filterCategory === 'all' ||
      listing.product.category.toLowerCase() === filterCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  if (!user || user.role !== 'farmer' || !farmerId) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Access denied. This page is only for farmers.
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Error loading products: {(error as any)?.data?.message || 'Something went wrong'}
      </div>
    );
  }

  // Get unique categories from listings
  const categories = Array.from(new Set(listings.map((listing) => listing.product.category)));

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-500 mt-1">Welcome {user.name} - Manage your product listings</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <button 
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => setIsAddProductModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Product
          </button>
          
          <button 
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            onClick={() => setIsAddListingModalOpen(true)}
          >
            <ListPlus className="w-4 h-4 mr-2" />
            Add New Listing
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Package className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Listings</p>
                <h3 className="text-2xl font-bold">{listings.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Listings</p>
                <h3 className="text-2xl font-bold">
                  {listings.filter(l => l.status === 'active').length}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Eye className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Sold Items</p>
                <h3 className="text-2xl font-bold">
                  {listings.filter(l => l.status === 'sold').length}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Expired Listings</p>
                <h3 className="text-2xl font-bold">
                  {listings.filter(l => l.status === 'expired').length}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Your Listings</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search listings..."
                  className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category.toLowerCase()}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Price (KES)</th>
                  <th className="px-4 py-3 text-left">Quantity</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Available Date</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredListings.map((listing) => (
                  <tr key={listing.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <img 
                          src={listing.product.imageUrl || '/api/placeholder/64/64'}
                          alt={listing.product.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{listing.product.name}</div>
                          <div className="text-sm text-gray-500">{listing.product.unit}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {listing.product.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-medium">
                      {listing.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      {listing.quantity} {listing.product.unit}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        listing.status === 'active' ? 'bg-green-100 text-green-800' :
                        listing.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-500">
                      {new Date(listing.availableDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <button className="text-gray-600 hover:text-gray-800">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-800">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Product Modal */}
      <AddProductModal 
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onProductAdded={handleProductAdded}
      />

      {/* Add Listing Modal */}
      <AddListingModal 
        isOpen={isAddListingModalOpen}
        onClose={() => {
          setIsAddListingModalOpen(false);
          setSelectedProductId(undefined);
          handleListingAdded();
        }}
        productId={selectedProductId}
      />
    </div>
  );
};

export default ProductManagement;