import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import {
  Search,
  Heart,
  MapPin,
  Truck,
  AlertCircle,
  Loader2,
  Calendar,
  ShoppingBag
} from 'lucide-react';
import { marketplaceApi } from '../../store/api/marketPlaceApi';
import { ordersApi } from '../../store/api/ordersApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import type { Listing } from '../../types/marketplace.types';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Button } from '../../components/common/Button';
import PaymentModal from '../payments/paymentModal';

const categories = [
  'All Categories',
  'Vegetables',
  'Fruits',
  'Grains',
  'Root Vegetables',
  'Legumes'
];

const locations = [
  'All Locations',
  'Nairobi',
  'Nakuru',
  'Mombasa',
  'Kisumu',
  'Eldoret'
];

const BuyerMarketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [currentPage, setCurrentPage] = useState(1);
  
  // Order related states
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [currentListing, setCurrentListing] = useState<Listing | null>(null);
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  
  // Payment modal states
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderId, setOrderId] = useState<number | null>(null);

  const { user } = useSelector((state: RootState) => state.auth);
  const [createOrder] = ordersApi.useCreateOrderMutation();
  
  const { data, error, isLoading, isFetching } = marketplaceApi.useGetListingsQuery({
    page: currentPage,
    limit: 12,
    search: searchTerm,
    category: selectedCategory !== 'All Categories' ? selectedCategory : undefined,
    location: selectedLocation !== 'All Locations' ? selectedLocation : undefined,
    sortBy,
    minPrice: priceRange.min ? Number(priceRange.min) : undefined,
    maxPrice: priceRange.max ? Number(priceRange.max) : undefined,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, selectedLocation, sortBy, priceRange]);

  // Reset error when order dialog opens or closes
  useEffect(() => {
    if (!isOrderDialogOpen) {
      setOrderError(null);
    }
  }, [isOrderDialogOpen]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handlePlaceOrder = (listing: Listing) => {
    if (!user || !user.buyerId) {
      toast.error('Please complete your buyer profile before placing orders');
      return;
    }
    
    setCurrentListing(listing);
    setOrderQuantity(1);
    setOrderError(null);
    setIsOrderDialogOpen(true);
  };

  const submitOrder = async () => {
    if (!currentListing || !user?.buyerId) return;
    
    try {
      setOrderProcessing(true);
      setOrderError(null);
      
      // Calculate total price - use parseFloat to convert string to number
      const totalPrice = orderQuantity * parseFloat(currentListing.price.toString());
      
      const orderData = {
        buyerId: parseInt(user.buyerId.toString()),
        listingId: currentListing.id,
        quantity: orderQuantity,
        totalPrice: totalPrice
      };
      
      console.log('Submitting order:', orderData);
      
      const response = await createOrder(orderData).unwrap();
      
      if (response.success && response.data) {
        // Close the order dialog
        setIsOrderDialogOpen(false);
        
        // Set order data for payment
        setOrderId(response.data.id);
        setOrderTotal(totalPrice);
        
        // Open payment modal
        setIsPaymentModalOpen(true);
        
        toast.success('Order placed successfully!');
      } else {
        // TypeScript-safe way to handle API success: false response
        // Use type assertion or optional chaining with fallback
        const errorMessage = response.success === false && 'message' in response
          ? (response as any).message || 'Failed to place order'
          : 'Failed to place order. Please try again.';
        
        setOrderError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error('Failed to place order:', error);
      
      // Extract error message from different possible error structures
      let errorMessage = 'Failed to place order. Please try again.';
      
      if (error.data) {
        if (typeof error.data === 'object' && error.data !== null) {
          // Check for common error message properties
          errorMessage = error.data.message || error.data.error || error.data.errorMessage || errorMessage;
        } else if (typeof error.data === 'string') {
          // Handle string error response
          errorMessage = error.data;
        }
      } else if (error.message) {
        // Handle error objects with message property
        errorMessage = error.message;
      }
      
      setOrderError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setOrderProcessing(false);
    }
  };

  const handlePaymentSuccess = () => {
    // Handle successful payment
    toast.success('Payment successful! Your order has been placed.');
    
    // Close payment modal after a short delay
    setTimeout(() => {
      setIsPaymentModalOpen(false);
    }, 2000);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Error loading products</h3>
        <p className="text-gray-500 mt-2">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header section remains the same */}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <select
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Location Filter */}
          <select
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            {locations.map((location) => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>

          {/* Sort By */}
          <select
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        {/* Advanced Filters */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Price Range */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Price Range (KES):</label>
            <input
              type="number"
              placeholder="Min"
              className="w-24 px-2 py-1 border rounded-lg"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Max"
              className="w-24 px-2 py-1 border rounded-lg"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {(isLoading || isFetching) && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading products...</span>
        </div>
      )}

      {/* Product Grid */}
      {!isLoading && data?.data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.data.map((listing: Listing) => (
            <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={listing.product.imageUrl || '/api/placeholder/400/300'}
                  alt={listing.product.name}
                  className="w-full h-48 object-cover"
                />
                <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
                  <Heart className="h-4 w-4 text-gray-600" />
                </button>
                <span className={`absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800`}>
                  {listing.status}
                </span>
              </div>
              
              <CardContent className="p-4">
                <div className="mb-2">
                  <h3 className="font-semibold text-lg">{listing.product.name}</h3>
                  <p className="text-sm text-gray-500">Category: {listing.product.category}</p>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {listing.farmer.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(listing.availableDate)}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      KES {parseFloat(listing.price.toString()).toLocaleString()}/{listing.product.unit}
                    </p>
                    <p className="text-sm text-gray-500">
                      {parseFloat(listing.quantity.toString()).toLocaleString()} {listing.product.unit} available
                    </p>
                  </div>
                </div>

                <button 
                  className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                  onClick={() => handlePlaceOrder(listing)}
                >
                  <ShoppingBag className="h-4 w-4" />
                  Place Order
                </button>

                <div className="mt-3 flex items-center justify-center text-sm text-gray-500">
                  <Truck className="h-4 w-4 mr-1" />
                  <span>Delivery available</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && data?.data.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No products found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Order Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Place Order</DialogTitle>
          </DialogHeader>
          
          {currentListing && (
            <div className="py-4">
              <div className="mb-4">
                <h3 className="font-medium text-lg">{currentListing.product.name}</h3>
                <p className="text-gray-600">
                  KES {parseFloat(currentListing.price.toString()).toLocaleString()} per {currentListing.product.unit}
                </p>
              </div>
              
              {/* Display error message if present */}
              {orderError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm">{orderError}</p>
                  </div>
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity ({currentListing.product.unit})
                </label>
                <div className="flex items-center">
                  <button 
                    className="p-2 bg-gray-200 rounded-l-md"
                    onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                  >
                    -
                  </button>
                  <input
                    id="quantity"
                    type="number"
                    value={orderQuantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value > 0 && value <= parseFloat(currentListing.quantity.toString())) {
                        setOrderQuantity(value);
                      }
                    }}
                    min="1"
                    max={parseFloat(currentListing.quantity.toString())}
                    className="p-2 w-20 text-center border-t border-b"
                  />
                  <button 
                    className="p-2 bg-gray-200 rounded-r-md"
                    onClick={() => setOrderQuantity(Math.min(parseFloat(currentListing.quantity.toString()), orderQuantity + 1))}
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Available: {parseFloat(currentListing.quantity.toString())} {currentListing.product.unit}
                </p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md mb-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span>KES {(parseFloat(currentListing.price.toString()) * orderQuantity).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>KES {(parseFloat(currentListing.price.toString()) * orderQuantity).toLocaleString()}</span>
                </div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-md mb-4 text-sm text-blue-800 flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <p>
                  You'll need to pay for your order through M-Pesa after confirming.
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitOrder} 
              disabled={orderProcessing || !currentListing}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {orderProcessing ? 'Processing...' : 'Confirm Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      {orderId && (
        <PaymentModal 
          isOpen={isPaymentModalOpen} 
          onClose={() => setIsPaymentModalOpen(false)} 
          orderId={orderId} 
          amount={orderTotal} 
          onSuccess={handlePaymentSuccess} 
        />
      )}
    </div>
  );
};

export default BuyerMarketplace;