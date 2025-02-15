import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Search,
  Truck,
  Package,
  MapPin,
  Clock,
  Phone,
} from 'lucide-react';

// Interfaces
interface TrackingOrder {
  id: string;
  product: string;
  seller: string;
  trackingNumber: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered';
  estimatedDelivery: string;
  currentLocation: string;
  deliveryAddress: string;
  orderDate: string;
  driver?: {
    name: string;
    phone: string;
    vehicleNumber: string;
  };
  timeline: {
    status: string;
    location: string;
    timestamp: string;
    description: string;
  }[];
}

// Mock Data
const mockTrackingOrders: TrackingOrder[] = [
  {
    id: 'ORD-001',
    product: 'Fresh Tomatoes',
    seller: 'Green Farms Ltd',
    trackingNumber: 'TRK123456',
    status: 'in_transit',
    estimatedDelivery: '2024-02-18',
    currentLocation: 'Nakuru',
    deliveryAddress: '123 Market Street, Nairobi',
    orderDate: '2024-02-15',
    driver: {
      name: 'John Doe',
      phone: '+254 712 345 678',
      vehicleNumber: 'KCA 123B'
    },
    timeline: [
      {
        status: 'Order Placed',
        location: 'Online',
        timestamp: '2024-02-15 09:00',
        description: 'Order confirmed and payment received'
      },
      {
        status: 'Picked Up',
        location: 'Nakuru Warehouse',
        timestamp: '2024-02-15 14:30',
        description: 'Package picked up by delivery partner'
      },
      {
        status: 'In Transit',
        location: 'Nakuru',
        timestamp: '2024-02-15 16:45',
        description: 'Package is on the way to destination'
      }
    ]
  },
  // Add more mock orders...
];

const TrackOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<TrackingOrder | null>(mockTrackingOrders[0]);

  const getStatusColor = (status: TrackingOrder['status']) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'out_for_delivery':
        return 'bg-yellow-100 text-yellow-800';
      case 'picked_up':
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

  const getProgressPercentage = (status: TrackingOrder['status']) => {
    const stages = ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'];
    const currentIndex = stages.indexOf(status);
    return (currentIndex / (stages.length - 1)) * 100;
  };

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
          {mockTrackingOrders.map((order) => (
            <Card 
              key={order.id}
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                selectedOrder?.id === order.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedOrder(order)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">{order.id}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                    {formatStatus(order.status)}
                  </span>
                </div>
                <h3 className="font-medium">{order.product}</h3>
                <p className="text-sm text-gray-500">{order.seller}</p>
                <div className="mt-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Estimated: {order.estimatedDelivery}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tracking Details */}
        {selectedOrder && (
          <div className="lg:col-span-2 space-y-6">
            {/* Order Overview */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Order {selectedOrder.id}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      Tracking Number: {selectedOrder.trackingNumber}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedOrder.status)}`}>
                    {formatStatus(selectedOrder.status)}
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
                        style={{ width: `${getProgressPercentage(selectedOrder.status)}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-sm">
                      <span>Order Placed</span>
                      <span>Picked Up</span>
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
                      <p className="text-gray-600">{selectedOrder.estimatedDelivery}</p>
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