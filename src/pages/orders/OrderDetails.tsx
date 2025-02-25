import { useParams, useNavigate } from 'react-router-dom';
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
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  DollarSign,
  User,
  Phone,
  MessageSquare,
  Loader2,
  AlertCircle
} from 'lucide-react';

const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  
  // Fetch order details
  const { 
    data: orderResponse, 
    isLoading, 
    error 
  } = ordersApi.useGetOrderByIdQuery(orderId || '');
  
  // Extract order from response (handle both response formats)
  const order = orderResponse && 'data' in orderResponse 
    ? orderResponse.data 
    : orderResponse;
  
  // Status and payment status styling functions
  // Remove unused function or use it in the component
  // For now removing it since it's not being used anywhere
  
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5" />;
      case 'in_transit':
        return <Truck className="h-5 w-5" />;
      case 'confirmed':
        return <Clock className="h-5 w-5" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5" />;
      case 'pending':
        return <Clock className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Generate order timeline based on status
  const getOrderTimeline = () => {
    if (!order) return [];
    
    const timeline = [];
    
    // Always add order placed
    timeline.push({
      title: 'Order Placed',
      date: formatDateTime(order.createdAt),
      icon: <Package className="h-5 w-5 text-blue-600" />,
      description: 'Your order has been received by the farmer.'
    });
    
    // Add payment confirmation if paid
    if (order.paymentStatus === 'paid') {
      timeline.push({
        title: 'Payment Confirmed',
        date: 'Payment processed successfully',
        icon: <DollarSign className="h-5 w-5 text-green-600" />,
        description: 'Your payment has been confirmed for this order.'
      });
    }
    
    // Add confirmation if confirmed, in transit, or delivered
    if (['confirmed', 'in_transit', 'delivered'].includes(order.orderStatus)) {
      timeline.push({
        title: 'Order Confirmed',
        date: 'Farmer has confirmed your order',
        icon: <CheckCircle className="h-5 w-5 text-yellow-600" />,
        description: 'The farmer has confirmed your order and is preparing it for shipping.'
      });
    }
    
    // Add in transit if in transit or delivered
    if (['in_transit', 'delivered'].includes(order.orderStatus)) {
      timeline.push({
        title: 'In Transit',
        date: 'Your order is on the way',
        icon: <Truck className="h-5 w-5 text-blue-600" />,
        description: 'Your order has been dispatched and is on its way to you.'
      });
    }
    
    // Add delivered if delivered
    if (order.orderStatus === 'delivered') {
      timeline.push({
        title: 'Delivered',
        date: 'Your order has been delivered',
        icon: <CheckCircle className="h-5 w-5 text-green-600" />,
        description: 'Your order has been successfully delivered to your location.'
      });
    }
    
    // Add cancelled if cancelled
    if (order.orderStatus === 'cancelled') {
      timeline.push({
        title: 'Cancelled',
        date: formatDateTime(order.updatedAt),
        icon: <XCircle className="h-5 w-5 text-red-600" />,
        description: 'This order has been cancelled.'
      });
    }
    
    return timeline;
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600">Loading order details...</p>
      </div>
    );
  }
  
  // Show error state
  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">Order not found</h3>
        <p className="text-gray-500 mb-6">We couldn't find the order details you're looking for.</p>
        <button 
          onClick={() => navigate('/buyer/orders')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
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
          <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
          <p className="text-gray-500">Order #{order.id}</p>
        </div>
      </div>
      
      {/* Order Status Banner */}
      <div className={`p-4 rounded-lg mb-6 ${
        order.orderStatus === 'delivered' ? 'bg-green-50' :
        order.orderStatus === 'in_transit' ? 'bg-blue-50' :
        order.orderStatus === 'confirmed' ? 'bg-yellow-50' :
        order.orderStatus === 'cancelled' ? 'bg-red-50' :
        'bg-gray-50'
      }`}>
        <div className="flex items-center">
          <div className={`p-3 rounded-full mr-4 ${
            order.orderStatus === 'delivered' ? 'bg-green-100' :
            order.orderStatus === 'in_transit' ? 'bg-blue-100' :
            order.orderStatus === 'confirmed' ? 'bg-yellow-100' :
            order.orderStatus === 'cancelled' ? 'bg-red-100' :
            'bg-gray-100'
          }`}>
            {getStatusIcon(order.orderStatus)}
          </div>
          <div>
            <p className="font-medium text-lg capitalize">
              {order.orderStatus === 'in_transit' 
                ? 'In Transit' 
                : order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
            </p>
            <p className="text-gray-600">
              {order.orderStatus === 'delivered' 
                ? 'Your order has been delivered successfully.' 
                : order.orderStatus === 'in_transit'
                ? 'Your order is on its way to you.'
                : order.orderStatus === 'confirmed'
                ? 'The farmer has confirmed your order and is preparing it.'
                : order.orderStatus === 'cancelled'
                ? 'This order has been cancelled.'
                : 'Your order is being processed.'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start">
                <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 mr-4">
                  {order.listing.product.imageUrl ? (
                    <img 
                      src={order.listing.product.imageUrl} 
                      alt={order.listing.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium text-lg">{order.listing.product.name}</h3>
                  <p className="text-gray-500">{order.listing.product.category}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-500">Quantity</p>
                      <p className="font-medium">{parseFloat(order.quantity)} {order.listing.product.unit}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Unit Price</p>
                      <p className="font-medium">KES {order.listing.price} / {order.listing.product.unit}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="flex justify-between items-center">
                  <p className="font-medium">Total Amount</p>
                  <p className="font-bold text-xl">KES {parseFloat(order.totalPrice).toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 z-0"></div>
                <div className="space-y-8 relative z-10">
                  {getOrderTimeline().map((item, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center bg-blue-50">
                        {item.icon}
                      </div>
                      <div className="ml-4 mt-2">
                        <h3 className="font-medium text-lg">{item.title}</h3>
                        <p className="text-gray-500">{item.date}</p>
                        <p className="mt-1">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Delivery Details if In Transit or Delivered */}
          {['in_transit', 'delivered'].includes(order.orderStatus) && (
            <Card>
              <CardHeader>
                <CardTitle>Delivery Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Logistics Provider</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="mb-1">FastTrack Logistics</p>
                      <p className="mb-1">Vehicle: Delivery Truck</p>
                      <p className="mb-1">Driver: John Kamau</p>
                      <p className="text-blue-600">+254 712 345 678</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Tracking Information</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="mb-1">Tracking ID: TRK{order.id}2025</p>
                      <p className="mb-1">Current Location: Distribution Center</p>
                      {order.orderStatus === 'in_transit' && (
                        <p className="font-medium text-green-600">Estimated Delivery: Tomorrow</p>
                      )}
                      {order.orderStatus === 'delivered' && (
                        <p className="font-medium text-green-600">Delivered on {formatDate(order.updatedAt)}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Right Column - Seller and Order Info */}
        <div className="space-y-6">
          {/* Order Information */}
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-medium">#{order.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Order Date</p>
                <p className="font-medium">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium">Mobile Money</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Seller Information */}
          <Card>
            <CardHeader>
              <CardTitle>Seller Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">{order.listing.farmer.location} Farm</p>
                  <p className="text-sm text-gray-500">Verified Seller</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                  {order.listing.farmer.location}, Kenya
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Primary Crops</p>
                <p className="font-medium">{order.listing.farmer.primaryCrops}</p>
              </div>
              
              <div className="pt-2 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Seller
                  </button>
                  <button className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">Home Address</p>
                <p className="text-gray-500">123 Moi Avenue</p>
                <p className="text-gray-500">Nairobi, Kenya</p>
                <p className="text-gray-500">Phone: +254 712 345 678</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Action Buttons */}
          {['pending', 'confirmed'].includes(order.orderStatus) && (
            <Card>
              <CardContent className="p-4">
                <button className="w-full mb-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Cancel Order
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  Contact Support
                </button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;