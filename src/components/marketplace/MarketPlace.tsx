import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { marketplaceApi } from '../../store/api/marketPlaceApi';
import { ordersApi } from '../../store/api/ordersApi';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../store/store';
import CartDrawer from '../common/CartDrawer';
import PaymentModal from '../../pages/payments/paymentModal';
import {
  RiSearchLine,
  RiHeartLine,
  RiMapPinLine,
  RiShoppingCartLine,
  RiCalendarLine,
  RiPlantLine,
  RiFilterLine,
  RiEyeLine,
} from 'react-icons/ri';
import { toast } from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { Button } from '../common/Button';

interface CartItem {
  id: number;
  name: string;
  price: string;
  quantity: number;
  unit: string;
  listingId: number;
  availableQuantity: number;
}

const Marketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [currentOrderItem, setCurrentOrderItem] = useState<CartItem | null>(null);
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [orderAmount, setOrderAmount] = useState<number>(0);

  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const { data: listingsResponse, isLoading, error } = marketplaceApi.useGetListingsQuery();
  const [createOrder] = ordersApi.useCreateOrderMutation();

  const listings = listingsResponse?.data || [];

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('smartfarm-cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart from localStorage', e);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('smartfarm-cart', JSON.stringify(cart));
  }, [cart]);

  // Extract unique categories from listings
  const categories = useMemo(() => {
    const uniqueCategories = new Set(listings.map((listing) => listing.product.category));
    return ['All Categories', ...Array.from(uniqueCategories)];
  }, [listings]);

  // Modify the addToCart function to check authentication
  const addToCart = (listing: any) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/auth/login');
      return;
    }

    const existingItem = cart.find((item) => item.id === listing.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === listing.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          id: listing.id,
          listingId: listing.id, // Ensure we have the listingId for API calls
          name: listing.product.name,
          price: listing.price,
          quantity: 1,
          unit: listing.product.unit,
          availableQuantity: parseFloat(listing.quantity),
        },
      ]);
    }

    toast.success(`Added ${listing.product.name} to cart`);
  };

  // Handle direct purchase
  const handleBuyNow = (listing: any) => {
    if (!isAuthenticated) {
      toast.error('Please login to make a purchase');
      navigate('/auth/login');
      return;
    }

    setCurrentOrderItem({
      id: listing.id,
      listingId: listing.id,
      name: listing.product.name,
      price: listing.price,
      quantity: 1,
      unit: listing.product.unit,
      availableQuantity: parseFloat(listing.quantity),
    });
    setOrderQuantity(1);
    setIsOrderDialogOpen(true);
  };

  // Handle order submission
  const handlePlaceOrder = async () => {
    if (!currentOrderItem || !user || !user.buyerId) {
      toast.error('User profile is incomplete. Please update your buyer profile first.');
      return;
    }

    try {
      setOrderProcessing(true);

      // Calculate the total price based on quantity and item price
      const totalPrice = orderQuantity * parseFloat(currentOrderItem.price);

      const orderData = {
        buyerId: parseInt(user.buyerId.toString()), // Ensure buyerId is a number
        listingId: parseInt(currentOrderItem.listingId.toString()), // Ensure listingId is a number
        quantity: orderQuantity, // Send as a number, not a string
        totalPrice: totalPrice, // Send as a number, not a string
      };

      console.log('Sending order data:', orderData);

      const result = await createOrder(orderData).unwrap();
      console.log("Order created:", result.data);




      toast.success('Order created! Proceed to payment.');
      setIsOrderDialogOpen(false);

      // Set the order ID and amount for payment
      setOrderId(result.data.id);
      setOrderAmount(totalPrice);
      
      // Open the payment modal
      setIsPaymentModalOpen(true);

      

      // Remove the ordered item from the cart if it exists
      const updatedCart = cart.filter((item) => item.id !== currentOrderItem.id);
      setCart(updatedCart);

    } catch (error) {
      console.error('Order failed', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setOrderProcessing(false);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = (transactionId: number) => {
    console.log('Payment successful, transaction ID:', transactionId);
    // Close the payment modal after a short delay
    setTimeout(() => {
      setIsPaymentModalOpen(false);
      // Redirect to orders page
      navigate('/buyer/orders');
    }, 2000);
  };

  // Filter listings based on search term and selected category
  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchesSearch =
        listing.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.farmer.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All Categories' || listing.product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [listings, searchTerm, selectedCategory]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Error Loading Listings</p>
          <p>Please try again later</p>
        </div>
      </div>
    );
  }

  const handleCartClick = () => {
    if (!isAuthenticated) {
      toast.error('Please login to view cart');
      navigate('/auth/login');
      return;
    }
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-emerald-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">Farm Fresh Marketplace</h1>
              <p className="text-emerald-100 text-lg">
                Connect directly with farmers and source fresh produce
              </p>
            </div>
            <div className="relative cursor-pointer" onClick={handleCartClick}>
              <RiShoppingCartLine className="w-8 h-8" />
              {isAuthenticated && cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  {cart.length}
                </span>
              )}
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 relative">
              <RiSearchLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, categories, or locations..."
                className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative min-w-[200px]">
              <RiFilterLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 appearance-none bg-white"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Category Summary */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {selectedCategory === 'All Categories' ? 'All Products' : selectedCategory}
          </h2>
          <p className="text-gray-600">
            Showing {filteredListings.length}{' '}
            {filteredListings.length === 1 ? 'product' : 'products'}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Card content remains the same */}
              <div className="relative aspect-w-16 aspect-h-9">
                <img
                  src={listing.product.imageUrl}
                  alt={listing.product.name}
                  className="w-full h-48 object-cover"
                />
                <button
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                  onClick={() => toast.success('Added to favorites!')}
                >
                  <RiHeartLine className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <CardContent className="p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-lg">{listing.product.name}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
                      {listing.product.category}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <RiMapPinLine className="w-4 h-4 mr-2" />
                    {listing.farmer.location}
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <RiPlantLine className="w-4 h-4 mr-2" />
                    Farm Size: {listing.farmer.farmSize} acres
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <RiCalendarLine className="w-4 h-4 mr-2" />
                    Available: {new Date(listing.availableDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold text-emerald-600">
                      KES {parseFloat(listing.price).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">per {listing.product.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {parseFloat(listing.quantity).toLocaleString()} {listing.product.unit}
                    </p>
                    <p className="text-sm text-gray-500">available</p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => navigate(`/marketplace/${listing.id}`)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <RiEyeLine className="w-4 h-4" />
                    View Details
                  </button>

                  <button
                    onClick={() => addToCart(listing)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <RiShoppingCartLine className="w-4 h-4" />
                    Add to Cart
                  </button>

                  <button
                    onClick={() => handleBuyNow(listing)}
                    className="col-span-2 px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2 mt-2 text-sm"
                  >
                    Buy Now
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredListings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No products found {searchTerm && 'matching your search'}
              {selectedCategory !== 'All Categories' && ` in ${selectedCategory}`}.
            </p>
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        setCart={setCart}
        onCheckout={(items) => {
          // Handle checkout from cart
          if (items.length === 0) {
            toast.error('Your cart is empty');
            return;
          }

          // Navigate to the checkout page with the selected items
          navigate('/buyer/checkout', {
            state: {
              items: items,
            },
          });
        }}
      />
      
      {/* Order Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Your Order</DialogTitle>
          </DialogHeader>

          {currentOrderItem && (
            <div className="py-4">
              <div className="mb-4">
                <h3 className="font-medium text-lg">{currentOrderItem.name}</h3>
                <p className="text-gray-600">
                  KES {parseFloat(currentOrderItem.price).toLocaleString()} per{' '}
                  {currentOrderItem.unit}
                </p>
              </div>

              <div className="mb-4">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity ({currentOrderItem.unit})
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
                      if (value > 0 && value <= currentOrderItem.availableQuantity) {
                        setOrderQuantity(value);
                      }
                    }}
                    min="1"
                    max={currentOrderItem.availableQuantity}
                    className="p-2 w-20 text-center border-t border-b"
                  />
                  <button
                    className="p-2 bg-gray-200 rounded-r-md"
                    onClick={() =>
                      setOrderQuantity(
                        Math.min(currentOrderItem.availableQuantity, orderQuantity + 1)
                      )
                    }
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Available: {currentOrderItem.availableQuantity} {currentOrderItem.unit}
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-md mb-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span>
                    KES {(parseFloat(currentOrderItem.price) * orderQuantity).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>
                    KES {(parseFloat(currentOrderItem.price) * orderQuantity).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePlaceOrder}
              disabled={orderProcessing || !currentOrderItem}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {orderProcessing ? 'Processing...' : 'Place Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      {orderId && orderAmount > 0 && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          orderId={orderId}
          amount={orderAmount}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default Marketplace;