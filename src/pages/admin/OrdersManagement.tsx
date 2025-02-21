// src/pages/admin/OrdersManagement.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ordersApi } from '../../store/api/ordersApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { 
  Search, 
  Filter,
  Download,
  Eye,
  XCircle,
  CheckCircle,
  Clock,
  Truck
} from 'lucide-react';

const OrdersManagement = () => {
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch orders with RTK Query
  const { 
    data: orders, 
    isLoading, 
    isError,
    error 
  } = ordersApi.useGetOrdersQuery();



  const [updateOrderStatus] = ordersApi.useUpdateOrderStatusMutation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in_transit':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
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

  const handleStatusUpdate = async (orderId: number, status: string) => {
    try {
      await updateOrderStatus({ 
        id: orderId, 
        status: status as 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled'
      }).unwrap();
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  // Filter orders based on status and search term
  const filteredOrders = orders?.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.orderStatus === filterStatus;
    const matchesSearch = !searchTerm || 
      order.id.toString().includes(searchTerm) ||
      order.buyer.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.listing.product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Error loading orders: {(error as any)?.data?.message || 'Something went wrong'}
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-500 mt-1">View and manage customer orders</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export Orders
          </button>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Orders</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {selectedOrders.length} selected
              </span>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
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
            <button className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={selectedOrders.length === filteredOrders?.length}
                      onChange={() => {
                        const allIds = filteredOrders?.map(order => order.id) || [];
                        setSelectedOrders(prev => 
                          prev.length === filteredOrders?.length ? [] : allIds
                        );
                      }}
                    />
                  </th>
                  <th className="px-4 py-3 text-left">Order ID</th>
                  <th className="px-4 py-3 text-left">Buyer</th>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Payment</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders?.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => {
                          setSelectedOrders(prev => 
                            prev.includes(order.id)
                              ? prev.filter(id => id !== order.id)
                              : [...prev, order.id]
                          );
                        }}
                      />
                    </td>
                    <td className="px-4 py-4 font-medium">#{order.id}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <img 
                          src={'/api/placeholder/32/32'}
                          alt={order.buyer.companyName || 'Buyer'}
                          className="h-8 w-8 rounded-full mr-3"
                        />
                        <div>
                          <div className="font-medium">{order.buyer.companyName || 'No Company Name'}</div>
                          <div className="text-sm text-gray-500">{order.buyer.businessType || 'No Business Type'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        {order.listing.product.name}
                        <div className="text-gray-500">
                          {order.quantity} {order.listing.product.unit}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium">
                      ${Number(order.totalPrice).toFixed(2)}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                        {getStatusIcon(order.orderStatus)}
                        <span className="ml-1">
                          {order.orderStatus.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <button 
                          className="text-blue-600 hover:text-blue-800"
                          title="View Order Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <select
                          className="text-sm border rounded px-2 py-1"
                          value={order.orderStatus}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="in_transit">In Transit</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersManagement;