// src/pages/farmer/ProductManagement.tsx
import { useState, useEffect } from 'react';
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
  ListPlus,
  Check
} from 'lucide-react';
import AddProductModal from '../../components/farmer/AddProductModal';
import AddListingModal from '../../components/farmer/AddListingModal';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';

const ProductManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  
  // Modal states
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isAddListingModalOpen, setIsAddListingModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | undefined>(undefined);
  const [editingStatus, setEditingStatus] = useState<{ id: number, open: boolean } | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<number | null>(null);

  // Get farmerId directly from auth state
  const user = useSelector((state: RootState) => state.auth.user);
  const farmerId = user?.farmerId ?? 0;

  // Fetch farmer's listings using farmerId
  const { 
    data: listingsResponse, 
    isError,
    isLoading,
    error,
    refetch 
  } = productsApi.useGetFarmerListingsQuery(farmerId, {
    skip: !farmerId
  });

  // Status update and delete mutations
  const [updateListingStatus, { isLoading: isUpdatingStatus }] = productsApi.useUpdateListingStatusMutation();
  const [deleteListing, { isLoading: isDeleting }] = productsApi.useDeleteListingMutation();

  // Safely get listings with fallback to empty array
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

  // Handle status update
  const handleStatusUpdate = async (listingId: number, newStatus: 'active' | 'sold' | 'expired') => {
    try {
      await updateListingStatus({
        id: listingId,
        status: newStatus
      }).unwrap();
      
      // Close the popover after successful update
      setEditingStatus(null);
    } catch (error) {
      console.error('Failed to update listing status:', error);
    }
  };

  // Handle delete listing
  const handleDeleteListing = async (listingId: number) => {
    try {
      await deleteListing(listingId).unwrap();
      // Clear the delete confirmation
      setDeleteConfirmation(null);
      // Success message could be added here
    } catch (error) {
      console.error('Failed to delete listing:', error);
      // Error message could be added here
    }
  };

  // Close delete confirmation when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (deleteConfirmation && !(event.target as HTMLElement).closest('[data-delete-dialog]')) {
        setDeleteConfirmation(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [deleteConfirmation]);

  // Filter listings based on search and category with null safety
  const filteredListings = listings.filter((listing) => {
    try {
      const productName = listing.product?.name || '';
      const productCategory = listing.product?.category || '';
      
      const matchesSearch =
        searchTerm === '' ||
        productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        productCategory.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        filterCategory === 'all' ||
        productCategory.toLowerCase() === filterCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    } catch (error) {
      console.error('Error filtering listing:', error);
      return false;
    }
  });

  if (!user || user.role !== 'farmer') {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Access denied. This page is only for farmers.
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Don't treat "No listings found" as an error - just show empty state
  if (isError && ((error as any)?.data?.message !== 'No listings found for this farmer')) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Error loading products: {(error as any)?.data?.message || 'Something went wrong'}
      </div>
    );
  }
  
  // We'll continue to render the empty state even if there's an error about no listings

  // Get unique categories from listings with null safety
  const categoriesSet = new Set<string>();
  listings.forEach(listing => {
    if (listing.product?.category) {
      categoriesSet.add(listing.product.category);
    }
  });
  const categories = Array.from(categoriesSet);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-500 mt-1">Welcome {user.name || 'Farmer'} - Manage your product listings</p>
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
          {filteredListings.length > 0 ? (
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
                            src={listing.product?.imageUrl || '/api/placeholder/64/64'}
                            alt={listing.product?.name || 'Product'}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{listing.product?.name || 'Unnamed product'}</div>
                            <div className="text-sm text-gray-500">{listing.product?.unit || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {listing.product?.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-medium">
                        {(listing.price || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-4">
                        {listing.quantity} {listing.product?.unit || 'units'}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          listing.status === 'active' ? 'bg-green-100 text-green-800' :
                          listing.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {(listing.status?.charAt(0).toUpperCase() + listing.status?.slice(1)) || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-500">
                        {listing.availableDate ? new Date(listing.availableDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-3 relative">
                          <button className="text-gray-600 hover:text-gray-800">
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          {/* Edit Status with Popover */}
                          <Popover open={editingStatus?.id === listing.id && editingStatus.open} 
                                  onOpenChange={(open) => setEditingStatus(open ? { id: listing.id, open } : null)}>
                            <PopoverTrigger asChild>
                              <button className="text-blue-600 hover:text-blue-800">
                                <Edit2 className="h-4 w-4" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-40 p-0">
                              <div className="py-2">
                                <h4 className="px-3 py-1 text-sm font-medium text-gray-900">Update Status</h4>
                                <div className="mt-1 border-t">
                                  <button
                                    disabled={isUpdatingStatus}
                                    onClick={() => handleStatusUpdate(listing.id, 'active')}
                                    className={`w-full px-3 py-1.5 text-left text-sm flex items-center ${
                                      listing.status === 'active' ? 'bg-green-50 text-green-800 font-medium' : 'hover:bg-gray-50'
                                    }`}
                                  >
                                    {listing.status === 'active' && <Check className="h-3.5 w-3.5 mr-2" />}
                                    Active
                                  </button>
                                  <button
                                    disabled={isUpdatingStatus}
                                    onClick={() => handleStatusUpdate(listing.id, 'sold')}
                                    className={`w-full px-3 py-1.5 text-left text-sm flex items-center ${
                                      listing.status === 'sold' ? 'bg-blue-50 text-blue-800 font-medium' : 'hover:bg-gray-50'
                                    }`}
                                  >
                                    {listing.status === 'sold' && <Check className="h-3.5 w-3.5 mr-2" />}
                                    Sold
                                  </button>
                                  <button
                                    disabled={isUpdatingStatus}
                                    onClick={() => handleStatusUpdate(listing.id, 'expired')}
                                    className={`w-full px-3 py-1.5 text-left text-sm flex items-center ${
                                      listing.status === 'expired' ? 'bg-red-50 text-red-800 font-medium' : 'hover:bg-gray-50'
                                    }`}
                                  >
                                    {listing.status === 'expired' && <Check className="h-3.5 w-3.5 mr-2" />}
                                    Expired
                                  </button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                          
                          {/* Delete Button and Confirmation */}
                          <div className="relative">
                            <button 
                              className="text-red-600 hover:text-red-800"
                              onClick={() => setDeleteConfirmation(listing.id)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            
                            {/* Delete Confirmation Dropdown */}
                            {deleteConfirmation === listing.id && (
                              <div 
                                data-delete-dialog
                                className="absolute z-50 right-0 top-6 w-48 bg-white border border-gray-200 rounded-md shadow-md p-3"
                              >
                                <p className="text-sm text-gray-700 mb-2">Delete this listing?</p>
                                <div className="flex justify-end space-x-2">
                                  <button 
                                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200" 
                                    onClick={() => setDeleteConfirmation(null)}
                                  >
                                    Cancel
                                  </button>
                                  <button 
                                    className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                    onClick={() => handleDeleteListing(listing.id)}
                                    disabled={isDeleting}
                                  >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No listings found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterCategory !== 'all'
                  ? "Try adjusting your search or filter to find what you're looking for."
                  : "You don't have any product listings yet."}
              </p>
              
              {/* Add clear CTA buttons when no listings */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <button 
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 justify-center"
                  onClick={() => setIsAddProductModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Product
                </button>
                
                <button 
                  className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 justify-center"
                  onClick={() => setIsAddListingModalOpen(true)}
                >
                  <ListPlus className="w-4 h-4 mr-2" />
                  Create Your First Listing
                </button>
              </div>
            </div>
          )}
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
