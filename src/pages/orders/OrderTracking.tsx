import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ordersApi } from '../../store/api/ordersApi';
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle, 
} from '../../components/ui/card';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Calendar,
  Info,
  AlertTriangle,
  Loader2,
  AlertCircle
} from 'lucide-react';

// Updated Order type to match our use cases
interface Order {
  id: number;
  buyerId: number;
  listingId: number;
  quantity: string;
  totalPrice: string;
  orderStatus: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
  updatedAt: string;
  listing: {
    id: number;
    product: {
      name: string;
      category: string;
      unit: string;
      imageUrl: string | null;
    };
    farmer: {
      location: string;
    };
    price: number;
  };
  logistics: any | null;
}

const OrderTracking = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  
  // Mock tracking location data with timestamps
  const [currentLocation] = useState({
    location: 'Nairobi Distribution Center',
    status: 'In Transit',
    lastUpdated: new Date().toISOString(),
    estimatedDelivery: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
  });
  
  // Mock route stops
  const routeStops = [
    { id: 1, name: 'Farmer Warehouse', status: 'completed', time: '8:30 AM' },
    { id: 2, name: 'Sorting Facility', status: 'completed', time: '10:15 AM' },
    { id: 3, name: 'Nairobi Distribution Center', status: 'current', time: 'Current Location' },
    { id: 4, name: 'Local Delivery Hub', status: 'pending', time: 'Estimated: 2:30 PM' },
    { id: 5, name: 'Delivery Address', status: 'pending', time: 'Estimated: 4:00 PM' }
  ];
  
  // Fetch order details
  const { 
    data: orderResponse, 
    isLoading, 
    error 
  } = ordersApi.useGetOrderByIdQuery(orderId || '');
  
  // Extract order from response (handle both response formats)
  const orderData = orderResponse && 'data' in orderResponse 
    ? orderResponse.data 
    : orderResponse;

  // Cast the order to our defined interface to ensure TypeScript knows the valid states
  const order = orderData as Order;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600">Loading tracking information...</p>
      </div>
    );
  }
  
  // Show error state
  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">Order not found</h3>
        <p className="text-gray-500 mb-6">We couldn't find the tracking information you're looking for.</p>
        <button 
          onClick={() => navigate('/buyer/orders')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Orders
        </button>
      </div>
    );
  }
  
  // Filter conditions for trackable orders
  const isTrackable = ['in_transit', 'delivered'].includes(order.orderStatus);
  
  // Check if order is trackable (in transit or delivered)
  if (!isTrackable) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate('/buyer/orders')}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
            aria-label="Go back to orders"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Track Order</h1>
            <p className="text-gray-500">Order #{order.id}</p>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center py-8">
              <div className="bg-yellow-100 p-4 rounded-full mb-4">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-medium mb-2">This order is not in transit yet</h3>
              <p className="text-gray-500 max-w-md mb-6">
                {order.orderStatus === 'pending' 
                  ? 'This order is pending confirmation from the farmer. Once confirmed, it will be prepared for shipping.'
                  : order.orderStatus === 'confirmed'
                  ? 'This order has been confirmed and is being prepared. Tracking will be available once it ships.'
                  : order.orderStatus === 'cancelled'
                  ? 'This order has been cancelled.'
                  : 'This order cannot be tracked at the moment.'}
              </p>
              <Link 
                to={`/buyer/orders/${order.id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                View Order Details
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-500">Order Status</p>
            <p className="font-medium text-lg capitalize">
              {order.orderStatus === 'in_transit' 
                ? 'In Transit' 
                : order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Order Date</p>
            <p className="font-medium">{formatDate(order.createdAt)}</p>
          </div>
        </div>
      </div>
    );
  }

  // If order is trackable, show full tracking interface
  const isDelivered = order.orderStatus === 'delivered';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back button and Header */}
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/buyer/orders')}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
          aria-label="Go back to orders"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Track Order</h1>
          <p className="text-gray-500">Order #{order.id} • {order.listing.product.name}</p>
        </div>
      </div>
      
      {/* Delivery Status Card */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <Truck className="h-5 w-5 mr-2 text-blue-600" />
            Delivery Status
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {isDelivered ? (
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="font-medium">Delivered</p>
                  <p className="text-sm text-gray-600">Your order was delivered on {formatDate(order.updatedAt)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="font-medium">In Transit</p>
                  <p className="text-sm text-gray-600">Estimated delivery: {formatDate(currentLocation.estimatedDelivery)}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div>
              <h3 className="font-medium mb-2 flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                Current Location
              </h3>
              {isDelivered ? (
                <p>Delivered to destination</p>
              ) : (
                <>
                  <p className="font-medium">{currentLocation.location}</p>
                  <p className="text-sm text-gray-500">Last updated: {formatTime(currentLocation.lastUpdated)}</p>
                </>
              )}
            </div>
            <div>
              <h3 className="font-medium mb-2 flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                Estimated Delivery
              </h3>
              {isDelivered ? (
                <p>Delivered on {formatDate(order.updatedAt)}</p>
              ) : (
                <>
                  <p className="font-medium">{formatDate(currentLocation.estimatedDelivery)}</p>
                  <p className="text-sm text-gray-500">By end of day</p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Product Information Card */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2 text-blue-600" />
            Product Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-start">
            <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 mr-4">
              {order.listing.product.imageUrl ? (
                <img 
                  src={order.listing.product.imageUrl} 
                  alt={order.listing.product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="font-medium">{order.listing.product.name}</h3>
              <p className="text-sm text-gray-500">{order.listing.product.category}</p>
              
              <div className="flex flex-wrap gap-4 mt-2">
                <div>
                  <p className="text-xs text-gray-500">Quantity</p>
                  <p className="text-sm font-medium">{parseFloat(order.quantity)} {order.listing.product.unit}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-sm font-medium">KES {parseFloat(order.totalPrice).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Order Date</p>
                  <p className="text-sm font-medium">{formatDate(order.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tracking Timeline */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-600" />
            Tracking Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="relative">
            <div className="absolute left-3.5 top-0 h-full w-0.5 bg-gray-200"></div>
            
            <div className="space-y-6">
              {routeStops.map((stop) => (
                <div key={stop.id} className="relative flex items-start">
                  <div className={`absolute left-0 rounded-full w-7 h-7 flex items-center justify-center ${
                    stop.status === 'completed' 
                      ? 'bg-green-100' 
                      : stop.status === 'current' 
                      ? 'bg-blue-100' 
                      : 'bg-gray-100'
                  }`}>
                    {stop.status === 'completed' && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    {stop.status === 'current' && (
                      <Clock className="h-4 w-4 text-blue-600" />
                    )}
                    {stop.status === 'pending' && (
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="ml-10">
                    <p className={`font-medium ${
                      stop.status === 'current' ? 'text-blue-600' : ''
                    }`}>
                      {stop.name}
                    </p>
                    <p className="text-sm text-gray-500">{stop.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Logistics Provider Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <Info className="h-5 w-5 mr-2 text-blue-600" />
            Delivery Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Logistics Provider</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="mb-1">FastTrack Logistics</p>
                <p className="mb-1">Vehicle Type: Delivery Truck</p>
                <p className="mb-1">Driver: John Kimani</p>
                <button className="mt-2 flex items-center text-blue-600 hover:text-blue-800">
                  <Phone className="h-4 w-4 mr-1" />
                  <span className="text-sm">+254 712 345 678</span>
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Delivery Notes</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm">
                  Your package is being transported in a temperature-controlled vehicle to maintain product freshness.
                </p>
                <p className="text-sm mt-2">
                  The driver will call you 15 minutes before arrival.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between">
              <button 
                onClick={() => navigate(`/buyer/orders/${order.id}`)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                View Order Details
              </button>
              
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Contact Support
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderTracking;