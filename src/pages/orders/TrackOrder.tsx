import { useState } from 'react';
import { ordersApi } from '../../store/api/ordersApi';
import { 
  RiMapPinLine, 
  RiTimeLine, 
  RiTruckLine, 
  RiCheckboxCircleLine, 
  RiCloseLine,
  RiSearch2Line
} from 'react-icons/ri';
import { Button } from '../../components/common/Button';
import { toast } from 'react-hot-toast';

const TrackOrder = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [searchedOrderId, setSearchedOrderId] = useState<number | null>(null);

  
  const { data: orderData, isLoading, error } = ordersApi.useGetOrderByIdQuery(
    searchedOrderId?.toString() || '', 
    { skip: searchedOrderId === null }
  );

  const order = orderData?.data;
  console.log(order);
  
  const handleSearch = () => {
    if (!orderNumber.trim()) {
      toast.error('Please enter an order number');
      return;
    }
    
    const id = parseInt(orderNumber);
    if (isNaN(id)) {
      toast.error('Please enter a valid order number');
      return;
    }
    
    setSearchedOrderId(id);
  };

  const getStatusStep = (status: string) => {
    switch(status) {
      case 'pending': return 1;
      case 'confirmed': return 2;
      case 'in_transit': return 3;
      case 'delivered': return 4;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  const renderStatusBadge = (status: string) => {
    const statusColors: Record<string, { bg: string, text: string, icon: JSX.Element }> = {
      pending: { 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-800',
        icon: <RiTimeLine className="w-4 h-4 mr-1" />
      },
      confirmed: { 
        bg: 'bg-blue-100', 
        text: 'text-blue-800',
        icon: <RiCheckboxCircleLine className="w-4 h-4 mr-1" />
      },
      in_transit: { 
        bg: 'bg-purple-100', 
        text: 'text-purple-800',
        icon: <RiTruckLine className="w-4 h-4 mr-1" />
      },
      delivered: { 
        bg: 'bg-green-100', 
        text: 'text-green-800',
        icon: <RiCheckboxCircleLine className="w-4 h-4 mr-1" />
      },
      cancelled: { 
        bg: 'bg-red-100', 
        text: 'text-red-800',
        icon: <RiCloseLine className="w-4 h-4 mr-1" />
      },
    };

    const statusInfo = statusColors[status] || statusColors.pending;

    return (
      <span className={`${statusInfo.bg} ${statusInfo.text} flex items-center px-3 py-1 rounded-full text-sm`}>
        {statusInfo.icon}
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Track Your Order</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="max-w-2xl mx-auto">
            <p className="text-gray-600 mb-6">
              Enter your order number to track the status of your delivery
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <RiSearch2Line className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Enter order number"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch();
                  }}
                />
              </div>
              <Button
                onClick={handleSearch}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
              >
                Track Order
              </Button>
            </div>
          </div>
        </div>
        
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            <p className="mt-4 text-gray-600">Looking for your order...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 mb-2">Sorry, we couldn't find that order</div>
            <p className="text-gray-600">Please check your order number and try again</p>
          </div>
        )}
        
        {order && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Order #{order.id}</h2>
                  <p className="text-gray-600">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  {renderStatusBadge(order.orderStatus)}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-gray-600">Product</div>
                  <div className="font-medium">{order.listing.product.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Quantity</div>
                  <div className="font-medium">
                    {parseFloat(order.quantity).toLocaleString()} {order.listing.product.unit}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Price</div>
                  <div className="font-medium text-emerald-600">
                    KES {parseFloat(order.totalPrice).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tracking Timeline */}
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-6">Order Timeline</h3>
              
              <div className="relative">
                {/* Track Line */}
                <div className="absolute left-8 top-0 bottom-0 w-px bg-gray-200"></div>
                
                {/* Order Placed */}
                <div className="relative flex items-start mb-8">
                  <div className={`absolute left-8 w-4 h-4 -ml-2 rounded-full z-10 border-2 border-white
                    ${getStatusStep(order.orderStatus) >= 1 ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                  <div className="bg-white ml-16">
                    <h4 className="font-medium">Order Placed</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {/* Order Confirmed */}
                <div className="relative flex items-start mb-8">
                  <div className={`absolute left-8 w-4 h-4 -ml-2 rounded-full z-10 border-2 border-white
                    ${getStatusStep(order.orderStatus) >= 2 ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                  <div className="bg-white ml-16">
                    <h4 className="font-medium">Order Confirmed</h4>
                    <p className="text-sm text-gray-600">
                      {getStatusStep(order.orderStatus) >= 2 
                        ? 'Your order has been confirmed by the farmer'
                        : 'Waiting for confirmation from the farmer'}
                    </p>
                  </div>
                </div>
                
                {/* In Transit */}
                <div className="relative flex items-start mb-8">
                  <div className={`absolute left-8 w-4 h-4 -ml-2 rounded-full z-10 border-2 border-white
                    ${getStatusStep(order.orderStatus) >= 3 ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                  <div className="bg-white ml-16">
                    <h4 className="font-medium">In Transit</h4>
                    <p className="text-sm text-gray-600">
                      {getStatusStep(order.orderStatus) >= 3 
                        ? 'Your order is on the way to you'
                        : 'Your order has not yet been dispatched'}
                    </p>
                  </div>
                </div>
                
                {/* Delivered */}
                <div className="relative flex items-start">
                  <div className={`absolute left-8 w-4 h-4 -ml-2 rounded-full z-10 border-2 border-white
                    ${getStatusStep(order.orderStatus) >= 4 ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                  <div className="bg-white ml-16">
                    <h4 className="font-medium">Delivered</h4>
                    <p className="text-sm text-gray-600">
                      {getStatusStep(order.orderStatus) >= 4 
                        ? 'Your order has been delivered successfully'
                        : 'Your order has not yet been delivered'}
                    </p>
                  </div>
                </div>
                
                {/* Cancelled (if applicable) */}
                {getStatusStep(order.orderStatus) === -1 && (
                  <div className="relative flex items-start mt-8">
                    <div className="absolute left-8 w-4 h-4 -ml-2 rounded-full z-10 border-2 border-white bg-red-500"></div>
                    <div className="bg-white ml-16">
                      <h4 className="font-medium text-red-600">Cancelled</h4>
                      <p className="text-sm text-gray-600">
                        Your order has been cancelled
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Delivery Information */}
            <div className="p-6 bg-gray-50 border-t">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Product Information</h3>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-md overflow-hidden">
                      <img 
                        src={order.listing.product.imageUrl || "/placeholder-product.jpg"} 
                        alt={order.listing.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium">{order.listing.product.name}</div>
                      <div className="text-sm text-gray-600">Category: {order.listing.product.category}</div>
                      <div className="text-sm text-gray-600">
                        {parseFloat(order.quantity).toLocaleString()} {order.listing.product.unit} at 
                        KES {Number(order.listing.price).toLocaleString()} per {order.listing.product.unit}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Farmer Information</h3>
                  <div className="flex items-start">
                    <RiMapPinLine className="w-5 h-5 mt-0.5 mr-2 text-gray-500" />
                    <div>
                      <p className="font-medium">Farmer's Location</p>
                      <p className="text-sm text-gray-600">{order.listing.farmer.location}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="text-sm text-gray-600">
                  <p>Need help with your order? Contact our support team for assistance.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {searchedOrderId && !order && !isLoading && !error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <div className="text-yellow-700 mb-2">Order not found</div>
            <p className="text-gray-600">Please check your order number and try again</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
