// src/pages/farmer/OrdersManagement.tsx
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  ShoppingBag, Eye, Clock, Truck, CheckCircle, XCircle, 
  Download, X, Search 
} from 'lucide-react';
import { ordersApi } from '../../store/api/ordersApi';
import { RootState } from '../../store/store';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

// Updated interface to match the backend structure
interface Farmer {
  id: number;
  userId: number;
  location: string;
  farmSize: number;
  primaryCrops: string;
}

interface Buyer {
  id: number;
  userId: number;
  companyName: string | null;
  businessType: string | null;
}

interface Product {
  id: number;
  name: string;
  category: string;
  unit: string;
  imageUrl: string | null;
}

interface Listing {
  id: number;
  farmerId: number;
  productId: number;
  quantity: number;
  price: number;
  availableDate: string;
  status: 'active' | 'sold' | 'expired';
  createdAt: string;
  updatedAt: string;
  farmer: Farmer;
  product: Product;
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
  buyer: Buyer;
  listing: Listing;
}



const OrdersManagement = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id;

  // Updated to use the correct query and data structure
  const { 
    data: ordersResponse, 
    isLoading, 
    error 
  } = ordersApi.useGetFarmerOrdersQuery(userId ?? 0, {
    skip: !userId
  });
  
  // Ensure we're accessing the data correctly
  const orders = ordersResponse?.data || [];
  console.log('Orders:', orders);
  const [updateOrder] = ordersApi.useUpdateOrderMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Get order statistics
  const getOrderStats = () => {
    if (!orders || orders.length === 0) return {
      pending: 0,
      in_transit: 0,
      delivered: 0,
      cancelled: 0
    };

    return {
      pending: orders.filter((o: Order) => o.orderStatus === 'pending').length,
      in_transit: orders.filter((o: Order) => o.orderStatus === 'in_transit').length,
      delivered: orders.filter((o: Order) => o.orderStatus === 'delivered').length,
      cancelled: orders.filter((o: Order) => o.orderStatus === 'cancelled').length,
    };
  };

  const stats = getOrderStats();

  // Filter orders based on search term and status
  const filteredOrders = orders?.filter((order: Order) => {
    const buyerInfo = order.buyer.companyName || '';
    const buyerType = order.buyer.businessType || '';
    
    const matchesSearch = 
      order.id.toString().includes(searchTerm.toLowerCase()) ||
      buyerInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyerType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || order.orderStatus === filterStatus;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusColor = (status: Order['orderStatus']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in_transit':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: Order['paymentStatus']) => {
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

  const getStatusIcon = (status: Order['orderStatus']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <ShoppingBag className="w-4 h-4" />;
      case 'in_transit':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

 // Update the handleStatusUpdate function to use the new mutation
 const handleStatusUpdate = async (orderId: number, newStatus: Order['orderStatus']) => {
  try {
    await updateOrder({
      id: orderId,
      updateData: {
        orderStatus: newStatus
      }
    }).unwrap();
    handleCloseModal();
  } catch (error) {
    console.error('Failed to update order status:', error);
  }
}; 
  const handleViewOrder = (order: Order) => {
    setSelectedOrderDetails(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrderDetails(null);
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading orders</div>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-500 mt-1">View and manage your customer orders</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export Orders
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Pending Orders</p>
                  <h3 className="text-2xl font-bold">{stats.pending}</h3>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Truck className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">In Transit</p>
                  <h3 className="text-2xl font-bold">{stats.in_transit}</h3>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Delivered</p>
                  <h3 className="text-2xl font-bold">{stats.delivered}</h3>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Cancelled</p>
                  <h3 className="text-2xl font-bold">{stats.cancelled}</h3>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Recent Orders</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left">Order ID</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Payment</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order: Order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-4 font-medium">#{order.id}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="font-medium">{order.buyer.companyName || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{order.buyer.businessType || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        {order.quantity}x {order.listing.product.name}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium">
                      KES {parseFloat(order.totalPrice).toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                        {getStatusIcon(order.orderStatus)}
                        <span className="ml-1 capitalize">{order.orderStatus}</span>
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => handleViewOrder(order)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrderDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 overflow-y-auto max-h-[90vh]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Order Details</CardTitle>
              <button 
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Order Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Order ID</h3>
                    <p className="mt-1">#{selectedOrderDetails.id}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date</h3>
                    <p className="mt-1">{new Date(selectedOrderDetails.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Customer Information */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Customer</h3>
                  <div className="mt-1">
                    <p className="text-sm font-medium">{selectedOrderDetails.buyer.companyName || 'N/A'}</p>
                    <p className="text-sm text-gray-500">{selectedOrderDetails.buyer.businessType || 'N/A'}</p>
                  </div>
                </div>

                {/* Product Information */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Product</h3>
                  <div className="mt-2 border rounded-lg p-3">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{selectedOrderDetails.listing.product.name}</p>
                        <p className="text-sm text-gray-500">
                          Quantity: {selectedOrderDetails.quantity} {selectedOrderDetails.listing.product.unit}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Category: {selectedOrderDetails.listing.product.category}
                        </p>
                      </div>
                      <p className="font-medium">
                        KES {parseFloat(selectedOrderDetails.totalPrice).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Status */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Current Status</h3>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrderDetails.orderStatus)}`}>
                      {getStatusIcon(selectedOrderDetails.orderStatus)}
                      <span className="ml-1 capitalize">{selectedOrderDetails.orderStatus}</span>
                    </span>
                  </div>
                </div>
                
                {/* Payment Status */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Payment Status</h3>
                  <div className="mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(selectedOrderDetails.paymentStatus)}`}>
                      {selectedOrderDetails.paymentStatus.charAt(0).toUpperCase() + selectedOrderDetails.paymentStatus.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Update Status Section */}
                {selectedOrderDetails.orderStatus === 'pending' && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Update Status</h3>
                    <div className="mt-2 flex space-x-2">
                      <button
                        onClick={() => handleStatusUpdate(selectedOrderDetails.id, 'confirmed')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Confirm Order
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(selectedOrderDetails.id, 'cancelled')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Cancel Order
                      </button>
                    </div>
                  </div>
                )}

                {selectedOrderDetails.orderStatus === 'confirmed' && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Update Status</h3>
                    <div className="mt-2">
                      <button
                        onClick={() => handleStatusUpdate(selectedOrderDetails.id, 'in_transit')}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Mark as In Transit
                      </button>
                    </div>
                  </div>
                )}

                {selectedOrderDetails.orderStatus === 'in_transit' && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Update Status</h3>
                    <div className="mt-2">
                      <button
                        onClick={() => handleStatusUpdate(selectedOrderDetails.id, 'delivered')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Mark as Delivered
                      </button>
                    </div>
                  </div>
                )}

                {/* Close Button */}
                <div className="flex justify-end mt-6">
                  <button 
                    onClick={handleCloseModal}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter to find what you\'re looking for.'
              : 'You haven\'t received any orders yet.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;