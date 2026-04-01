import  { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { ordersApi } from '../../store/api/ordersApi';
import { toast } from 'react-hot-toast';
import { 
  RiShoppingCartLine, 
  RiMapPinLine, 
  RiTimeLine,
  RiTruckLine,
  RiCheckboxCircleLine,
  RiArrowLeftLine
} from 'react-icons/ri';
import { Button } from '../../components/common/Button';

// Make sure this matches the Cart Item interface
interface CartItem {
  id: number;
  name: string;
  price: string;
  quantity: number;
  unit: string;
  listingId: number;
  availableQuantity: number;
}

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingItem, setProcessingItem] = useState<number | null>(null);
  const [processedItems, setProcessedItems] = useState<number[]>([]);
  const [failedItems, setFailedItems] = useState<number[]>([]);
  
  const [createOrder] = ordersApi.useCreateOrderMutation();
  
  // Get cart items from location state or localStorage
  useEffect(() => {
    if (location.state?.items) {
      setCartItems(location.state.items);
    } else {
      // If no items in state, try to get from localStorage
      const savedCart = localStorage.getItem('smartfarm-cart');
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch (e) {
          console.error('Failed to parse cart from localStorage', e);
          toast.error('Could not load cart items');
          navigate('/marketplace');
        }
      } else {
        // No items in cart, redirect to marketplace
        toast.error('Your cart is empty');
        navigate('/marketplace');
      }
    }
  }, [location.state, navigate]);

  // Calculate subtotal
  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
  };

  // Calculate total
  const calculateTotal = () => {
    // For now, just the subtotal, but you could add shipping/taxes here
    return calculateSubtotal();
  };

  // Handle order placement
  const handlePlaceOrders = async () => {
    if (!user?.buyerId) {
      toast.error('You need to complete your buyer profile first');
      navigate('/buyer/profile');
      return;
    }

    setIsProcessing(true);
    setProcessedItems([]);
    setFailedItems([]);

    try {
      // Process each order sequentially
      for (const item of cartItems) {
        setProcessingItem(item.id);
        
        const orderData = {
          buyerId: parseInt(user.buyerId.toString()),
          listingId: parseInt(item.listingId.toString()),
          quantity: item.quantity,
          totalPrice: parseFloat(item.price) * item.quantity
        };
        
        console.log('Placing order:', orderData);
        
        try {
          await createOrder(orderData).unwrap();
          // Mark as processed
          setProcessedItems(prev => [...prev, item.id]);
        } catch (error) {
          console.error(`Failed to place order for ${item.name}:`, error);
          // Mark as failed
          setFailedItems(prev => [...prev, item.id]);
        }
      }
      
     // If all items succeeded
if (failedItems.length === 0) {
    toast.success('All orders placed successfully!');
    
    // Clear cart in localStorage
    const remainingItems: CartItem[] = []; // Add explicit type annotation here
    localStorage.setItem('smartfarm-cart', JSON.stringify(remainingItems));
    
    // Redirect to orders page
    setTimeout(() => {
      navigate('/buyer/orders');
    }, 1500);
      } else {
        // Some orders failed
        toast.error(`${failedItems.length} orders failed to process`);
        
        // Remove successful orders from localStorage
        const savedCart = localStorage.getItem('smartfarm-cart');
        if (savedCart) {
          try {
            const cart = JSON.parse(savedCart) as CartItem[];
            const updatedCart = cart.filter(item => !processedItems.includes(item.id));
            localStorage.setItem('smartfarm-cart', JSON.stringify(updatedCart));
          } catch (e) {
            console.error('Failed to update localStorage cart', e);
          }
        }
      }
    } catch (error) {
      console.error('Error in order processing:', error);
      toast.error('An error occurred while processing your orders');
    } finally {
      setIsProcessing(false);
      setProcessingItem(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center">
          <button 
            onClick={() => navigate('/marketplace')}
            className="mr-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <RiArrowLeftLine className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <h2 className="text-lg font-semibold flex items-center">
                  <RiShoppingCartLine className="mr-2" />
                  Order Summary
                </h2>
              </div>
              
              {cartItems.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  Your cart is empty
                </div>
              ) : (
                <div>
                  {/* Item list */}
                  <div className="divide-y">
                    {cartItems.map((item) => (
                      <div 
                        key={item.id} 
                        className={`p-4 flex items-start ${
                          processingItem === item.id ? 'bg-blue-50' : 
                          processedItems.includes(item.id) ? 'bg-green-50' : 
                          failedItems.includes(item.id) ? 'bg-red-50' : ''
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-medium">{item.name}</h3>
                            <div className="text-right">
                              <p className="font-semibold">KES {(parseFloat(item.price) * item.quantity).toLocaleString()}</p>
                              <p className="text-sm text-gray-500">{item.quantity} {item.unit} × KES {parseFloat(item.price).toLocaleString()}</p>
                            </div>
                          </div>
                          
                          {/* Item status during processing */}
                          {isProcessing && (
                            <div className="mt-2">
                              {processingItem === item.id && (
                                <div className="flex items-center text-blue-600">
                                  <RiTimeLine className="mr-1" />
                                  <span className="text-sm">Processing...</span>
                                </div>
                              )}
                              {processedItems.includes(item.id) && (
                                <div className="flex items-center text-green-600">
                                  <RiCheckboxCircleLine className="mr-1" />
                                  <span className="text-sm">Order placed successfully</span>
                                </div>
                              )}
                              {failedItems.includes(item.id) && (
                                <div className="flex items-center text-red-600">
                                  <RiCheckboxCircleLine className="mr-1" />
                                  <span className="text-sm">Failed to place order</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Totals */}
                  <div className="p-4 bg-gray-50 border-t">
                    <div className="flex justify-between mb-2">
                      <span>Subtotal</span>
                      <span>KES {calculateSubtotal().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>KES {calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Order actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-4">Order Details</h2>
              
              {user ? (
                <div className="mb-6">
                  <div className="flex items-start mb-3">
                    <RiMapPinLine className="w-5 h-5 mt-0.5 mr-2 text-gray-500" />
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      {user.phone && <p className="text-sm text-gray-600">{user.phone}</p>}
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <RiTruckLine className="w-5 h-5 mt-0.5 mr-2 text-gray-500" />
                    <div>
                      <p className="font-medium">Delivery Method</p>
                      <p className="text-sm text-gray-600">Coordinate with seller after order confirmation</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-md">
                  Please log in to continue with your order.
                </div>
              )}
              
              <Button
                onClick={handlePlaceOrders}
                disabled={isProcessing || cartItems.length === 0 || !user?.buyerId}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg"
              >
                {isProcessing ? 'Processing Orders...' : 'Place Orders'}
              </Button>
              
              {!user?.buyerId && user && (
                <p className="mt-2 text-sm text-center text-red-600">
                  Please complete your buyer profile first
                </p>
              )}
              
              <div className="mt-4 text-sm text-gray-500">
                <p>By placing your order, you agree to SmartFarm's terms and conditions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
