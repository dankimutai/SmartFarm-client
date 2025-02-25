import React, { useState } from 'react';
import { RiCloseLine, RiDeleteBinLine, RiShoppingCartLine } from 'react-icons/ri';
import { Button } from './Button';
import { useNavigate } from 'react-router-dom';
import { ordersApi } from '../../store/api/ordersApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { toast } from 'react-hot-toast';

// Make sure this interface matches exactly with the one in Marketplace.tsx
interface CartItem {
  id: number;
  name: string;
  price: string;
  quantity: number;
  unit: string;
  listingId: number;
  availableQuantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  onCheckout?: (items: CartItem[]) => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, cart, setCart, onCheckout }) => {
  const [processingOrder, setProcessingOrder] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [createOrder] = ordersApi.useCreateOrderMutation();

  if (!isOpen) return null;

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCart(
      cart.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
    );
  };

  const removeItem = (id: number) => {
    setCart(cart.filter((item) => item.id !== id));
    setSelectedItems(selectedItems.filter(itemId => itemId !== id));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedItems([]);
  };

  const calculateTotal = () => {
    return cart
      .filter(item => selectedItems.includes(item.id))
      .reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
  };

  const toggleSelectItem = (id: number) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.map(item => item.id));
    }
  };

  const handleCheckout = async () => {
    if (!user?.buyerId) {
      toast.error('You need to complete your buyer profile first');
      navigate('/buyer/profile');
      return;
    }
  
    if (selectedItems.length === 0) {
      toast.error('Please select items to checkout');
      return;
    }
  
    try {
      setProcessingOrder(true);
      
      // If onCheckout prop is provided, use that
      if (onCheckout) {
        const selectedCartItems = cart.filter(item => selectedItems.includes(item.id));
        onCheckout(selectedCartItems);
        onClose();
        return;
      }
  
      // Otherwise, process orders directly here
      const selectedCartItems = cart.filter(item => selectedItems.includes(item.id));
      
      // Process each order sequentially
      for (const item of selectedCartItems) {
        const orderData = {
          buyerId: parseInt(user.buyerId.toString()), // Ensure buyerId is a number
          listingId: parseInt(item.listingId.toString()), // Ensure listingId is a number
          quantity: item.quantity, // Send as a number, not a string
          totalPrice: parseFloat(item.price) * item.quantity // Send as a number, not a string
        };
        
        console.log('Sending order data:', orderData);
        
        await createOrder(orderData).unwrap();
      }
      
      // Remove checked out items from cart
      setCart(cart.filter(item => !selectedItems.includes(item.id)));
      setSelectedItems([]);
      
      toast.success('Orders placed successfully!');
      onClose();
      navigate('/buyer/orders');
    } catch (error) {
      console.error('Checkout failed', error);
      toast.error('Failed to place orders. Please try again.');
    } finally {
      setProcessingOrder(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-xl">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-emerald-600 text-white">
          <div className="flex items-center">
            <RiShoppingCartLine className="w-6 h-6 mr-2" />
            <h2 className="text-xl font-semibold">Your Cart</h2>
            <span className="ml-2 bg-white text-emerald-600 px-2 py-0.5 rounded-full text-sm">
              {cart.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-emerald-700 transition-colors"
          >
            <RiCloseLine className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <RiShoppingCartLine className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Your cart is empty</p>
              <button
                onClick={() => {
                  onClose();
                  navigate('/marketplace');
                }}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4 flex justify-between items-center">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="select-all"
                    checked={selectedItems.length === cart.length && cart.length > 0}
                    onChange={handleSelectAll}
                    className="mr-2 h-4 w-4"
                  />
                  <label htmlFor="select-all" className="text-sm font-medium">
                    Select All
                  </label>
                </div>
                <button
                  onClick={clearCart}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Clear Cart
                </button>
              </div>
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className={`border p-3 rounded-lg ${
                      selectedItems.includes(item.id) ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleSelectItem(item.id)}
                        className="mt-1 mr-3 h-4 w-4"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-emerald-600">
                          KES {parseFloat(item.price).toLocaleString()} per {item.unit}
                        </p>
                        
                        <div className="flex items-center mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 bg-gray-200 rounded-l-md"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (value > 0 && value <= item.availableQuantity) updateQuantity(item.id, value);
                            }}
                            className="p-1 w-12 text-center border-t border-b"
                            min="1"
                            max={item.availableQuantity}
                          />
                          <button
                            onClick={() => updateQuantity(item.id, Math.min(item.availableQuantity, item.quantity + 1))}
                            className="p-1 bg-gray-200 rounded-r-md"
                          >
                            +
                          </button>
                          
                          <span className="ml-2 text-sm text-gray-500">
                            {item.unit}
                          </span>
                        </div>
                        
                        <div className="mt-2 text-sm text-gray-500">
                          Available: {item.availableQuantity} {item.unit}
                        </div>
                        
                        <div className="mt-2 font-medium">
                          Subtotal: KES {(parseFloat(item.price) * item.quantity).toLocaleString()}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <RiDeleteBinLine className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t p-4 bg-gray-50">
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Selected Items:</span>
                <span>{selectedItems.length}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>KES {calculateTotal().toLocaleString()}</span>
              </div>
            </div>
            <Button
              onClick={handleCheckout}
              disabled={selectedItems.length === 0 || processingOrder}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3"
            >
              {processingOrder ? 'Processing...' : 'Checkout'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;