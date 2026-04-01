import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Search,
  Truck,
  Package,
  MapPin,
  Clock,
  Phone,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { ordersApi } from '../../store/api/ordersApi';

// Interfaces
interface LogisticsData {
  id: number;
  orderId: number;
  pickupLocation: string;
  deliveryLocation: string;
  status: 'in_progress' | 'in_transit' | 'delivered' | 'cancelled';
  estimatedDeliveryDate: string;
  actualDeliveryDate?: string;
  deliveredAt?: string;
}

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
  logistics: LogisticsData | null;
}

// Enhanced with logistics data
interface TrackingOrder extends Order {
  trackingNumber: string; // Generated from order ID
  currentLocation: string;
  timeline: {
    status: string;
    location: string;
    timestamp: string;
    description: string;
  }[];
  driver?: {
    name: string;
    phone: string;
    vehicleNumber: string;
  };
}

const TrackOrders = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [trackableOrders, setTrackableOrders] = useState<TrackingOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<TrackingOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders data
  const { 
    data: ordersResponse, 
    isLoading: ordersLoading, 
    error: ordersError
  } = ordersApi.useGetUserOrdersQuery(user?.id || 0, {
    skip: !user?.id
  });

  // Process orders data to create trackable orders
  useEffect(() => {
    if (ordersLoading) {
      setIsLoading(true);
      return;
    }

    if (ordersError) {
      setError('Failed to fetch orders. Please try again.');
      setIsLoading(false);
      return;
    }

    // Extract and process orders with logistics data
    const orders = Array.isArray(ordersResponse) ? ordersResponse : 
                  ordersResponse?.data ? ordersResponse.data : [];

    if (!orders || orders.length === 0) {
      setTrackableOrders([]);
      setIsLoading(false);
      return;
    }

    // Transform orders into TrackingOrder format
    const trackable = orders
      .filter(order => ['in_transit', 'delivered'].includes(order.orderStatus))
      .map(order => {
        // Generate tracking timeline based on order status
        const timeline = generateTimeline(order);
        
        // Get current location based on logistics or default to farmer location
        const currentLocation = order.logistics?.pickupLocation || order.listing.farmer.location;
        
        // Create tracking number from order ID
        const trackingNumber = `TRK${order.id}${new Date(order.createdAt).getFullYear()}`;

        // Mock driver data - in a real app, this would come from the backend
        const driver = order.orderStatus === 'in_transit' ? {
          name: 'John Kimani',
          phone: '+254 712 345 678',
          vehicleNumber: 'KCA 123B'
        } : undefined;

        return {
          ...order,
          trackingNumber,
          currentLocation,
          timeline,
          driver
        };
      });

    setTrackableOrders(trackable);
    
    // Set first order as selected if available and none is currently selected
    if (trackable.length > 0 && !selectedOrder) {
      setSelectedOrder(trackable[0]);
    } else if (selectedOrder) {
      // Update selected order if it exists in the new data
      const updated = trackable.find(order => order.id === selectedOrder.id);
      if (updated) {
        setSelectedOrder(updated);
      } else if (trackable.length > 0) {
        setSelectedOrder(trackable[0]);
      } else {
        setSelectedOrder(null);
      }
    }

    setIsLoading(false);
  }, [ordersResponse, ordersLoading, ordersError, selectedOrder]);

  // Filter orders based on search term
  const filteredOrders = trackableOrders.filter(order => 
    order.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toString().includes(searchTerm) ||
    order.listing.product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Generate timeline based on order data
  function generateTimeline(order: Order) {
    const timeline = [];
    
    // Order placed
    timeline.push({
      status: 'Order Placed',
      location: 'Online',
      timestamp: formatDateTime(order.createdAt),
      description: 'Order confirmed and payment received'
    });

    // Order confirmed
    if (['confirmed', 'in_transit', 'delivered'].includes(order.orderStatus)) {
      timeline.push({
        status: 'Order Confirmed',
        location: order.listing.farmer.location,
        timestamp: formatDateTime(order.updatedAt),
        description: 'Order confirmed by seller'
      });
    }

    // Picked up (if logistics data exists)
    if (order.logistics && ['in_transit', 'delivered'].includes(order.orderStatus)) {
      timeline.push({
        status: 'Picked Up',
        location: order.logistics.pickupLocation,
        timestamp: formatDateTime(order.updatedAt, 2), // Add 2 hours to mock different time
        description: 'Package picked up by delivery partner'
      });
    }

    // In transit
    if (order.orderStatus === 'in_transit') {
      timeline.push({
        status: 'In Transit',
        location: order.logistics?.pickupLocation || order.listing.farmer.location,
        timestamp: formatDateTime(order.updatedAt, 4), // Add 4 hours to mock different time
        description: 'Package is on the way to destination'
      });
    }

    // Delivered
    if (order.orderStatus === 'delivered') {
      timeline.push({
        status: 'Delivered',
        location: order.logistics?.deliveryLocation || 'Destination',
        timestamp: formatDateTime(order.updatedAt, 8), // Add 8 hours to mock different time
        description: 'Package has been delivered successfully'
      });
    }

    return timeline;
  }

  // Helper to format date-time
  function formatDateTime(dateString: string, hoursToAdd = 0) {
    const date = new Date(dateString);
    date.setHours(date.getHours() + hoursToAdd);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Format date for display
  function formatDate(dateString: string) {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'out_for_delivery':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getProgressPercentage = (status: string) => {
    const stages = ['pending', 'confirmed', 'in_transit', 'out_for_delivery', 'delivered'];
    const currentIndex = stages.indexOf(status);
    return (currentIndex / (stages.length - 1)) * 100;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600">Loading tracking information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Error loading tracking data</h3>
        <p className="text-gray-500 mt-2">{error}</p>
        <button 
          onClick={() => navigate('/buyer/orders')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  if (trackableOrders.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Track Orders</h1>
          <p className="text-gray-500 mt-1">Monitor your deliveries in real-time</p>
        </div>
        
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-sm">
          <Package className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No trackable orders found</h3>
          <p className="text-gray-500 mt-2 text-center max-w-md">
            You don't have any orders that are currently in transit or delivered.
            When you have orders being shipped, you'll be able to track them here.
          </p>
          <button 
            onClick={() => navigate('/buyer/orders')}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            View All Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Track Orders</h1>
        <p className="text-gray-500 mt-1">Monitor your deliveries in real-time</p>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Enter order ID or tracking number..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders List */}
        <div className="lg:col-span-1 space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <Card 
                key={order.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  selectedOrder?.id === order.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedOrder(order)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">#{order.id}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.orderStatus)}`}>
                      {formatStatus(order.orderStatus)}
                    </span>
                  </div>
                  <h3 className="font-medium">{order.listing.product.name}</h3>
                  <p className="text-sm text-gray-500">{order.listing.farmer.location}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Estimated: {order.logistics?.estimatedDeliveryDate ? 
                        formatDate(order.logistics.estimatedDeliveryDate) : 
                        'Processing'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No orders match your search criteria</p>
            </div>
          )}
        </div>

        {/* Tracking Details */}
        {selectedOrder && (
          <div className="lg:col-span-2 space-y-6">
            {/* Order Overview */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Order #{selectedOrder.id}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      Tracking Number: {selectedOrder.trackingNumber}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedOrder.orderStatus)}`}>
                    {formatStatus(selectedOrder.orderStatus)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Progress Bar */}
                  <div className="relative pt-4">
                    <div className="h-2 bg-gray-200 rounded">
                      <div 
                        className="h-2 bg-blue-600 rounded transition-all duration-500"
                        style={{ width: `${getProgressPercentage(selectedOrder.orderStatus)}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-sm">
                      <span>Order Placed</span>
                      <span>Confirmed</span>
                      <span>In Transit</span>
                      <span>Out for Delivery</span>
                      <span>Delivered</span>
                    </div>
                  </div>

                  {/* Current Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="font-medium">Current Location</span>
                      </div>
                      <p className="text-gray-600">{selectedOrder.currentLocation}</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Clock className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="font-medium">Estimated Delivery</span>
                      </div>
                      <p className="text-gray-600">
                        {selectedOrder.logistics?.estimatedDeliveryDate ? 
                          formatDate(selectedOrder.logistics.estimatedDeliveryDate) : 
                          'Processing'}
                      </p>
                    </div>
                  </div>

                  {/* Driver Information */}
                  {selectedOrder.driver && (
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-3">Driver Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center">
                          <Package className="h-5 w-5 text-gray-400 mr-2" />
                          <span>{selectedOrder.driver.name}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-5 w-5 text-gray-400 mr-2" />
                          <span>{selectedOrder.driver.phone}</span>
                        </div>
                        <div className="flex items-center">
                          <Truck className="h-5 w-5 text-gray-400 mr-2" />
                          <span>{selectedOrder.driver.vehicleNumber}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  <div>
                    <h3 className="font-medium mb-4">Tracking Timeline</h3>
                    <div className="space-y-4">
                      {selectedOrder.timeline.map((event, index) => (
                        <div key={index} className="flex items-start">
                          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          </div>
                          <div className="flex-1 ml-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{event.status}</h4>
                              <span className="text-sm text-gray-500">{event.timestamp}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                            <p className="text-sm text-gray-500">{event.location}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrders;
