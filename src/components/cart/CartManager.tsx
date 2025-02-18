import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { RiShoppingCartLine, RiDeleteBin6Line, RiAddLine, RiSubtractLine } from 'react-icons/ri';
import { toast } from 'react-hot-toast';
import type { CartItem, Order } from '../../types/cart.types';

interface CartManagerProps {
  cartItems: CartItem[];
  onUpdateCart: (items: CartItem[]) => void;
  onCheckout: (order: Order) => void;
}

const CartManager = ({ cartItems, onUpdateCart, onCheckout }: CartManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card' | 'cash'>('mpesa');

  const updateItemQuantity = (itemId: number, change: number) => {
    const updatedItems = cartItems.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) return null;
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter((item): item is CartItem => item !== null);

    onUpdateCart(updatedItems);
  };

  const removeItem = (itemId: number) => {
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    onUpdateCart(updatedItems);
    toast.success('Item removed from cart');
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (parseFloat(item.price) * item.quantity);
    }, 0);
  };

  const handleCheckout = () => {
    if (!deliveryAddress || !phoneNumber) {
      toast.error('Please fill in delivery details');
      return;
    }

    const order: Order = {
      items: cartItems,
      totalAmount: calculateTotal(),
      deliveryAddress,
      phoneNumber,
      paymentMethod
    };

    onCheckout(order);
    setIsOpen(false);
    toast.success('Order placed successfully!');
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <RiShoppingCartLine className="w-5 h-5" />
          {cartItems.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {cartItems.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
        </SheetHeader>

        <div className="mt-6 flex flex-col h-full">
          {cartItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Your cart is empty
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center p-4 border-b">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    
                    <div className="ml-4 flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-500">
                        KES {parseFloat(item.price).toLocaleString()} per {item.unit}
                      </p>
                      <p className="text-xs text-gray-400">{item.farmerLocation}</p>
                      
                      <div className="flex items-center mt-2">
                        <button
                          onClick={() => updateItemQuantity(item.id, -1)}
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <RiSubtractLine />
                        </button>
                        <span className="mx-2">{item.quantity}</span>
                        <button
                          onClick={() => updateItemQuantity(item.id, 1)}
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <RiAddLine />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded-full"
                        >
                          <RiDeleteBin6Line />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mt-auto">
                <div className="mb-4">
                  <p className="font-medium mb-2">Delivery Details</p>
                  <Input
                    placeholder="Delivery Address"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="mb-2"
                  />
                  <Input
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="mb-2"
                  />
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as 'mpesa' | 'card' | 'cash')}
                    className="w-full p-2 border rounded"
                  >
                    <option value="mpesa">M-Pesa</option>
                    <option value="card">Card</option>
                    <option value="cash">Cash on Delivery</option>
                  </select>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium">Total Amount:</span>
                  <span className="text-xl font-bold">
                    KES {calculateTotal().toLocaleString()}
                  </span>
                </div>

                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleCheckout}
                >
                  Checkout
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartManager;