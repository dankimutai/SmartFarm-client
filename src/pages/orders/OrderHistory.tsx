import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store/store';
import { ordersApi } from '../../store/api/ordersApi';
import { 
  RiTimeLine, 
  RiCheckLine, 
  RiTruckLine, 
  RiCloseLine,
  RiArchiveLine,
  RiFilter3Line,
  RiCalendarLine,
  RiSearchLine,
  RiRefreshLine,
  RiEyeLine
} from 'react-icons/ri';
import { Button } from '../../components/common/Button';


// Define the status badge component
interface OrderStatusBadgeProps {
  status: string;
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';
  let icon = <RiArchiveLine className="w-4 h-4 mr-1" />;

  switch (status) {
    case 'pending':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      icon = <RiTimeLine className="w-4 h-4 mr-1" />;
      break;
    case 'confirmed':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      icon = <RiCheckLine className="w-4 h-4 mr-1" />;
      break;
    case 'in_transit':
      bgColor = 'bg-purple-100';
      textColor = 'text-purple-800';
      icon = <RiTruckLine className="w-4 h-4 mr-1" />;
      break;
    case 'delivered':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      icon = <RiCheckLine className="w-4 h-4 mr-1" />;
      break;
    case 'cancelled':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      icon = <RiCloseLine className="w-4 h-4 mr-1" />;
      break;
  }

  return (
    <span className={`${bgColor} ${textColor} px-2 py-1 rounded-full text-xs flex items-center w-fit`}>
      {icon}
      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
    </span>
  );
};

const OrderHistory = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Get orders based on user role
  const { 
    data: ordersResponse, 
    isLoading, 
    error,
    refetch 
  } = ordersApi.useGetBuyerOrdersQuery(user?.buyerId || 0, {
    skip: !user?.buyerId
  });

  const orders = ordersResponse?.data || [];

  // Filter orders based on status, search term, and date
  const filteredOrders = orders.filter(order => {
    // Status filter
    if (statusFilter !== 'all' && order.orderStatus !== statusFilter) {
      return false;
    }

    // Search filter - check product name or order ID
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesProduct = order.listing.product.name.toLowerCase().includes(searchLower);
      const matchesId = order.id.toString().includes(searchLower);
      if (!matchesProduct && !matchesId) {
        return false;
      }
    }

    // Date filter
    if (dateFilter !== 'all') {
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      
      switch(dateFilter) {
        case 'today':
          // Check if order date is today
          return orderDate.toDateString() === now.toDateString();
        case 'week':
          // Check if order date is within the last 7 days
          const weekAgo = new Date(now);
          weekAgo.setDate(now.getDate() - 7);
          return orderDate >= weekAgo;
        case 'month':
          // Check if order date is within the last 30 days
          const monthAgo = new Date(now);
          monthAgo.setDate(now.getDate() - 30);
          return orderDate >= monthAgo;
        case 'year':
          // Check if order date is within the last 365 days
          const yearAgo = new Date(now);
          yearAgo.setDate(now.getDate() - 365);
          return orderDate >= yearAgo;
      }
    }

    return true;
  });

  // Calculate overall stats
  const totalSpent = filteredOrders.reduce((sum, order) => {
    // Skip cancelled orders
    if (order.orderStatus === 'cancelled') return sum;
    return sum + parseFloat(order.totalPrice);
  }, 0);

  const orderCounts = {
    all: filteredOrders.length,
    pending: filteredOrders.filter(order => order.orderStatus === 'pending').length,
    confirmed: filteredOrders.filter(order => order.orderStatus === 'confirmed').length,
    in_transit: filteredOrders.filter(order => order.orderStatus === 'in_transit').length,
    delivered: filteredOrders.filter(order => order.orderStatus === 'delivered').length,
    cancelled: filteredOrders.filter(order => order.orderStatus === 'cancelled').length,
  };

  // Handle viewing order details
  const handleViewOrder = (orderId: number) => {
    navigate(`/track-order?id=${orderId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
            <p className="text-gray-600">View and track all your past and current orders</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button 
              onClick={() => refetch()} 
              className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <RiRefreshLine className="w-5 h-5" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-500 mb-1">Total Orders</div>
            <div className="text-2xl font-bold">{orderCounts.all}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-500 mb-1">Total Spent</div>
            <div className="text-2xl font-bold">KES {totalSpent.toLocaleString()}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-500 mb-1">Active Orders</div>
            <div className="text-2xl font-bold">
              {orderCounts.pending + orderCounts.confirmed + orderCounts.in_transit}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-500 mb-1">Completed Orders</div>
            <div className="text-2xl font-bold">{orderCounts.delivered}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Order Status
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <RiFilter3Line className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            {/* Date Filter */}
            <div>
              <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Time Period
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <RiCalendarLine className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="date-filter"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Past Week</option>
                  <option value="month">Past Month</option>
                  <option value="year">Past Year</option>
                </select>
              </div>
            </div>
            
            {/* Search */}
            <div>
              <label htmlFor="search-orders" className="block text-sm font-medium text-gray-700 mb-1">
                Search Orders
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <RiSearchLine className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search-orders"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by product or order ID"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            <p className="mt-4 text-gray-600">Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-6 text-center">
            <p>There was an error loading your orders. Please try again later.</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <RiArchiveLine className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">
              {orders.length === 0 
                ? "You haven't made any orders yet." 
                : "No orders match your current filters."}
            </p>
            
            {orders.length > 0 && (
              <Button
                onClick={() => {
                  setStatusFilter('all');
                  setDateFilter('all');
                  setSearchTerm('');
                }}
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Clear Filters
              </Button>
            )}
            
            {orders.length === 0 && (
              <Button
                onClick={() => navigate('/marketplace')}
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Browse Marketplace
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden bg-white rounded-lg shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md overflow-hidden">
                            <img 
                              src={order.listing.product.imageUrl || "/placeholder-product.jpg"} 
                              alt={order.listing.product.name}
                              className="h-10 w-10 object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{order.listing.product.name}</div>
                            <div className="text-sm text-gray-500">
                              {parseFloat(order.quantity).toLocaleString()} {order.listing.product.unit}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        KES {parseFloat(order.totalPrice).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <OrderStatusBadge status={order.orderStatus} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          onClick={() => handleViewOrder(order.id)}
                          className="flex items-center gap-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800"
                          size="sm"
                        >
                          <RiEyeLine className="w-4 h-4" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination could be added here if needed */}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;