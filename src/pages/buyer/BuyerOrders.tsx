// src/pages/buyer/BuyerOrders.tsx

import { useState, useMemo } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {ordersApi} from '../../store/api/ordersApi';
import {
  Search,
  Package,
  Truck,
  Calendar,
  DollarSign,
  Download,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const BuyerOrders = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Fetch orders data using the user ID directly
  const { 
    data: orders, 
    isLoading, 
    error,
    refetch 
  } = ordersApi.useGetOrdersQuery(user?.id || 0, {
    skip: !user?.id
  });

  console.log('User ID:', user?.id);
  console.log('Orders data:', orders);

  // Filter orders based on search term, status, and date
  const filteredOrders = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return [];
    
    return orders.filter(order => {
      // Search filter
      const searchMatch = 
        searchTerm === '' || 
        order.listing.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toString().includes(searchTerm);

      // Status filter
      const statusMatch = 
        statusFilter === 'all' || 
        order.orderStatus === statusFilter;

      // Date filter
      let dateMatch = true;
      if (dateFilter !== 'all') {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        
        switch(dateFilter) {
          case 'today':
            dateMatch = orderDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date();
            weekAgo.setDate(now.getDate() - 7);
            dateMatch = orderDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date();
            monthAgo.setMonth(now.getMonth() - 1);
            dateMatch = orderDate >= monthAgo;
            break;
          case 'year':
            const yearAgo = new Date();
            yearAgo.setFullYear(now.getFullYear() - 1);
            dateMatch = orderDate >= yearAgo;
            break;
        }
      }

      return searchMatch && statusMatch && dateMatch;
    });
  }, [orders, searchTerm, statusFilter, dateFilter]);

  // Calculate order statistics
  const orderStats = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return { activeOrders: 0, inTransitOrders: 0, totalSpent: 0, thisMonthOrders: 0 };
    
    const activeOrders = orders.filter(order => 
      ['pending', 'confirmed', 'in_transit'].includes(order.orderStatus)
    ).length;
    
    const inTransitOrders = orders.filter(order => 
      order.orderStatus === 'in_transit'
    ).length;
    
    const totalSpent = orders
      .filter(order => order.orderStatus !== 'cancelled')
      .reduce((sum, order) => sum + parseFloat(order.totalPrice), 0);
    
    const thisMonth = new Date();
    const firstDayOfMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
    const thisMonthOrders = orders.filter(order => 
      new Date(order.createdAt) >= firstDayOfMonth
    ).length;
    
    return {
      activeOrders,
      inTransitOrders,
      totalSpent,
      thisMonthOrders
    };
  }, [orders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleTrackOrder = (orderId: number) => {
    navigate(`/track-order/${orderId}`);
  };

  const handleViewDetails = (orderId: number) => {
    navigate(`/buyer/orders/${orderId}`);
  };

  // Download orders as CSV
  const downloadOrdersCSV = () => {
    if (filteredOrders.length === 0) {
      toast.error('No orders to download');
      return;
    }

    // Create CSV header
    let csv = 'Order ID,Product,Seller,Quantity,Total,Status,Payment Status,Order Date\n';
    
    // Add order data
    filteredOrders.forEach(order => {
      csv += `${order.id},`;
      csv += `"${order.listing.product.name}",`;
      csv += `"${order.listing.farmer.location}",`;
      csv += `${order.quantity},`;
      csv += `${order.totalPrice},`;
      csv += `${order.orderStatus},`;
      csv += `${order.paymentStatus},`;
      csv += `${formatDate(order.createdAt)}\n`;
    });
    
    // Create and download the file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'orders.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast.success('Orders downloaded successfully');
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600">Loading your orders...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Error loading orders</h3>
        <p className="text-gray-500 mt-2">Please try again later</p>
        <button 
          onClick={() => refetch()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-500 mt-1">Track and manage your orders</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Orders</p>
                <h3 className="text-2xl font-bold">{orderStats.activeOrders}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Truck className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">In Transit</p>
                <h3 className="text-2xl font-bold">{orderStats.inTransitOrders}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Spent</p>
                <h3 className="text-2xl font-bold">KES {orderStats.totalSpent.toLocaleString()}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">This Month</p>
                <h3 className="text-2xl font-bold">{orderStats.thisMonthOrders} Orders</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <button 
              className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 flex items-center gap-2"
              onClick={downloadOrdersCSV}
            >
              <Download className="h-4 w-4" />
              <span className="hidden md:inline">Export</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                        {order.listing.product.imageUrl ? (
                          <img 
                            src={order.listing.product.imageUrl} 
                            alt={order.listing.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{order.listing.product.name}</h3>
                        <p className="text-sm text-gray-500">Order ID: #{order.id}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Seller</p>
                        <p className="font-medium">{order.listing.farmer.location}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Quantity</p>
                        <p className="font-medium">{parseFloat(order.quantity)} {order.listing.product.unit}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="font-medium">KES {parseFloat(order.totalPrice).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Order Date</p>
                        <p className="font-medium">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end">
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus.split('_').map((word: string) => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                      <button 
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        onClick={() => handleTrackOrder(order.id)}
                      >
                        Track Order
                      </button>
                      <button 
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        onClick={() => handleViewDetails(order.id)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
            <p className="text-gray-500 mt-2">
              {!orders || !orders.data || orders.data.length === 0 
                  ? "You haven't placed any orders yet."
                  : "Try adjusting your search or filter criteria."}
            </p>
            {(!orders || !orders.data || orders.data.length === 0) && (
              <button 
                onClick={() => navigate('/marketplace')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Browse Marketplace
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerOrders;