import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Leaf,
  ShoppingCart,
  DollarSign,
  ChevronUp,
  ChevronDown,
  Package,
  Eye,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ordersApi } from '../../store/api/ordersApi';
import { productsApi } from '../../store/api/productsApi';
import { RootState } from '../../store/store';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

// Define interfaces for the chart data
interface RevenueChartData {
  month: string;
  revenue: number;
}

interface OrdersChartData {
  month: string;
  orders: number;
}

// Define interface for MonthData
interface MonthDataRevenue {
  [key: string]: { month: string; revenue: number };
}

interface MonthDataOrders {
  [key: string]: { month: string; orders: number };
}

// Define interface for Order from API
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
  buyer: {
    id: number;
    userId: number;
    companyName: string | null;
    businessType: string | null;
  };
  listing: {
    id: number;
    farmerId: number;
    productId: number;
    quantity: number;
    price: number;
    availableDate: string;
    status: 'active' | 'sold' | 'expired';
    createdAt: string;
    updatedAt: string;
    farmer: {
      id: number;
      userId: number;
      location: string;
      farmSize: number;
      primaryCrops: string;
    };
    product: {
      id: number;
      name: string;
      category: string;
      unit: string;
      imageUrl: string | null;
    };
  };
}

// Interface for order status counts
interface OrderStatusCounts {
  pending: number;
  confirmed: number;
  inTransit: number;
  delivered: number;
  cancelled: number;
}

const FarmerDashboard = () => {
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id ?? 0;
  const farmerId = user?.farmerId ?? 0;

  // State to hold derived statistics
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeOrders: 0,
    productsListed: 0,
    activeCategories: 0,
    revenueChange: 0,
    ordersChange: 0,
    productsChange: 0,
    categoriesChange: 0,
  });

  // State for order status counts
  const [orderStatusCounts, setOrderStatusCounts] = useState<OrderStatusCounts>({
    pending: 0,
    confirmed: 0,
    inTransit: 0,
    delivered: 0,
    cancelled: 0,
  });

  // State to hold chart data
  const [revenueChartData, setRevenueChartData] = useState<RevenueChartData[]>([]);
  const [ordersChartData, setOrdersChartData] = useState<OrdersChartData[]>([]);

  // Fetch farmer orders using the same pattern as ProductManagement
  const {
    data: ordersResponse,
    isLoading: ordersLoading,
  } = ordersApi.useGetFarmerOrdersQuery(userId, {
    skip: !userId,
  });

  // Fetch farmer listings using the same pattern as ProductManagement
  const {
    data: listingsResponse,
    isLoading: listingsLoading,
  } = productsApi.useGetFarmerListingsQuery(farmerId, {
    skip: !farmerId,
  });

  // Function to process orders data by month for revenue chart
  const processOrdersDataByMonth = (orders: Order[] = []): RevenueChartData[] => {
    const monthData: MonthDataRevenue = {};
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    // Initialize all months with zero
    months.forEach((month) => {
      monthData[month] = { month, revenue: 0 };
    });

    // Process orders
    orders.forEach((order: Order) => {
      try {
        const date = new Date(order.createdAt);
        const month = months[date.getMonth()];

        // Only include orders that aren't cancelled
        if (order.orderStatus !== 'cancelled') {
          monthData[month].revenue += parseFloat(order.totalPrice || '0');
        }
      } catch (error) {
        console.error('Error processing order:', error);
      }
    });

    // Convert to array and return only the last 6 months
    const currentMonth = new Date().getMonth();
    return months
      .slice(currentMonth - 5 >= 0 ? currentMonth - 5 : currentMonth + 7)
      .slice(0, 6)
      .map((month) => monthData[month]);
  };

  // Function to process orders data by month for orders chart
  const processOrdersCountByMonth = (orders: Order[] = []): OrdersChartData[] => {
    const monthData: MonthDataOrders = {};
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    // Initialize all months with zero
    months.forEach((month) => {
      monthData[month] = { month, orders: 0 };
    });

    // Process orders
    orders.forEach((order: Order) => {
      try {
        const date = new Date(order.createdAt);
        const month = months[date.getMonth()];

        // Count orders
        monthData[month].orders += 1;
      } catch (error) {
        console.error('Error processing order count:', error);
      }
    });

    // Convert to array and return only the last 6 months
    const currentMonth = new Date().getMonth();
    return months
      .slice(currentMonth - 5 >= 0 ? currentMonth - 5 : currentMonth + 7)
      .slice(0, 6)
      .map((month) => monthData[month]);
  };

  // Initialize empty chart data if needed
  useEffect(() => {
    if (revenueChartData.length === 0) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      setRevenueChartData(months.map(month => ({ month, revenue: 0 })));
      setOrdersChartData(months.map(month => ({ month, orders: 0 })));
    }
  }, [revenueChartData.length]);

  // Process and transform data when API responses change
  useEffect(() => {
    try {
      // Get orders and listings data safely
      const orders = ordersResponse?.data || [];
      const listings = listingsResponse?.data || [];

      // Calculate total revenue safely
      const totalRevenue = orders.reduce((total, order) => {
        return total + (parseFloat(order.totalPrice || '0') || 0);
      }, 0);

      // Count active orders (pending, confirmed, in_transit)
      const activeOrders = orders.filter((order) =>
        ['pending', 'confirmed', 'in_transit'].includes(order.orderStatus)
      ).length;

      // Count products listed (active listings)
      const productsListed = listings.filter((listing) => listing.status === 'active').length;

      // Count unique categories safely
      const categoriesSet = new Set<string>();
      listings.forEach(listing => {
        if (listing.product?.category) {
          categoriesSet.add(listing.product.category);
        }
      });
      const activeCategories = categoriesSet.size;

      // Get revenue by month for chart
      const revenueByMonth = processOrdersDataByMonth(orders);

      // Get orders by month for chart
      const ordersByMonth = processOrdersCountByMonth(orders);

      // Count orders by status for more detailed statistics
      const statusCounts: OrderStatusCounts = {
        pending: orders.filter((order) => order.orderStatus === 'pending').length,
        confirmed: orders.filter((order) => order.orderStatus === 'confirmed').length,
        inTransit: orders.filter((order) => order.orderStatus === 'in_transit').length,
        delivered: orders.filter((order) => order.orderStatus === 'delivered').length,
        cancelled: orders.filter((order) => order.orderStatus === 'cancelled').length,
      };

      // Set order status counts
      setOrderStatusCounts(statusCounts);

      // Set statistics
      setStats({
        totalRevenue,
        activeOrders,
        productsListed,
        activeCategories,
        // Mock changes (in a real app, you'd calculate based on previous period)
        revenueChange: 12.5,
        ordersChange: 8.2,
        productsChange: -3.1,
        categoriesChange: 5.4,
      });

      // Set chart data
      setRevenueChartData(revenueByMonth);
      setOrdersChartData(ordersByMonth);
    } catch (error) {
      console.error('Error processing dashboard data:', error);
    }
  }, [ordersResponse, listingsResponse]);

  // Show loading spinner while data is being fetched
  if (ordersLoading || listingsLoading) {
    return <LoadingSpinner />;
  }

  // Get orders and listings data - ensure they are arrays even if API returns null/undefined
  const orders = ordersResponse?.data || [];
  const listings = listingsResponse?.data || [];

  // Sort orders by date (most recent first)
  const recentOrders = [...orders]
    .sort((a, b) => {
      try {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } catch {
        return 0;
      }
    })
    .slice(0, 5); // Get only the 5 most recent orders

  // Get unique categories from listings - with null safety
  const categoriesSet = new Set<string>();
  listings.forEach(listing => {
    if (listing.product?.category) {
      categoriesSet.add(listing.product.category);
    }
  });
  const categories = Array.from(categoriesSet);

  // Filter listings based on search and category - with null safety
  const filteredListings = listings.filter((listing) => {
    const productName = listing.product?.name || '';
    const productCategory = listing.product?.category || '';
    
    const matchesSearch =
      searchTerm === '' ||
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productCategory.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      filterCategory === 'all' ||
      productCategory.toLowerCase() === filterCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Get only the 3 most recent listings
  const recentListings = [...filteredListings]
    .sort((a, b) => {
      try {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } catch {
        return 0;
      }
    })
    .slice(0, 3);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name || 'Farmer'}!
          </h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your farm today</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Revenue */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
              <span
                className={`flex items-center ${stats.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'} text-sm`}
              >
                {stats.revenueChange >= 0 ? (
                  <ChevronUp className="h-4 w-4 mr-1" />
                ) : (
                  <ChevronDown className="h-4 w-4 mr-1" />
                )}
                {Math.abs(stats.revenueChange)}%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <h3 className="text-2xl font-bold mt-1">
                KES{' '}
                {stats.totalRevenue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h3>
            </div>
          </CardContent>
        </Card>

        {/* Active Orders (styled like Product Management) - Enhanced */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Orders</p>
                <div className="flex items-center">
                  <h3 className="text-2xl font-bold">{stats.activeOrders}</h3>
                  <span className="ml-2 text-xs text-gray-500">
                    {orderStatusCounts.pending +
                      orderStatusCounts.confirmed +
                      orderStatusCounts.inTransit}{' '}
                    total
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Listed (styled like Product Management) */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Products Listed</p>
                <h3 className="text-2xl font-bold">{stats.productsListed}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Categories (styled like Product Management) */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Leaf className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Product Categories</p>
                <h3 className="text-2xl font-bold">{stats.activeCategories}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Status Breakdown */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Pending Orders */}
            <div className="flex flex-col items-center p-4 rounded-lg bg-gray-50">
              <div className="p-3 bg-yellow-100 rounded-full mb-2">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <h4 className="text-lg font-bold">{orderStatusCounts.pending}</h4>
              <p className="text-sm text-gray-500">Pending</p>
            </div>

            {/* Confirmed Orders */}
            <div className="flex flex-col items-center p-4 rounded-lg bg-gray-50">
              <div className="p-3 bg-blue-100 rounded-full mb-2">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="text-lg font-bold">{orderStatusCounts.confirmed}</h4>
              <p className="text-sm text-gray-500">Confirmed</p>
            </div>

            {/* In Transit Orders */}
            <div className="flex flex-col items-center p-4 rounded-lg bg-gray-50">
              <div className="p-3 bg-purple-100 rounded-full mb-2">
                <Truck className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="text-lg font-bold">{orderStatusCounts.inTransit}</h4>
              <p className="text-sm text-gray-500">In Transit</p>
            </div>

            {/* Delivered Orders */}
            <div className="flex flex-col items-center p-4 rounded-lg bg-gray-50">
              <div className="p-3 bg-green-100 rounded-full mb-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="text-lg font-bold">{orderStatusCounts.delivered}</h4>
              <p className="text-sm text-gray-500">Delivered</p>
            </div>

            {/* Cancelled Orders */}
            <div className="flex flex-col items-center p-4 rounded-lg bg-gray-50">
              <div className="p-3 bg-red-100 rounded-full mb-2">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <h4 className="text-lg font-bold">{orderStatusCounts.cancelled}</h4>
              <p className="text-sm text-gray-500">Cancelled</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {revenueChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [`KES ${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Revenue"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No revenue data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Orders Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Orders Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {ordersChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ordersChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#6366f1" name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No orders data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Recent Orders</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left">Order ID</th>
                    <th className="px-4 py-3 text-left">Customer</th>
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-left">Quantity</th>
                    <th className="px-4 py-3 text-left">Total</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-4 font-medium">#{order.id}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div>
                            <div className="font-medium">
                              {order.buyer?.companyName || 'Individual'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.buyer?.businessType || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {order.listing?.product?.name || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {order.quantity} {order.listing?.product?.unit || 'units'}
                      </td>
                      <td className="px-4 py-4 font-medium">
                        KES {parseFloat(order.totalPrice || '0').toLocaleString()}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            order.orderStatus === 'delivered'
                              ? 'bg-green-100 text-green-800'
                              : order.orderStatus === 'in_transit'
                                ? 'bg-purple-100 text-purple-800'
                                : order.orderStatus === 'confirmed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : order.orderStatus === 'cancelled'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {order.orderStatus.charAt(0).toUpperCase() +
                            order.orderStatus.slice(1).replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-3">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Your orders will appear here once you start selling
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Listings */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Recent Listings</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search listings..."
                  className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category.toLowerCase()}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {recentListings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">Price (KES)</th>
                    <th className="px-4 py-3 text-left">Quantity</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Available Date</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentListings.map((listing) => (
                    <tr key={listing.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <img
                            src={listing.product?.imageUrl || '/api/placeholder/64/64'}
                            alt={listing.product?.name || 'Product'}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{listing.product?.name || 'Unnamed product'}</div>
                            <div className="text-sm text-gray-500">{listing.product?.unit || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {listing.product?.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-medium">{(listing.price || 0).toLocaleString()}</td>
                      <td className="px-4 py-4">
                        {listing.quantity} {listing.product?.unit || 'units'}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            listing.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : listing.status === 'sold'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {listing.status?.charAt(0).toUpperCase() + (listing.status?.slice(1) || '')}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-500">
                        {listing.availableDate ? new Date(listing.availableDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-3 relative">
                          <button className="text-gray-600 hover:text-gray-800">
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No listings found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterCategory !== 'all'
                  ? "Try adjusting your search or filter to find what you're looking for."
                  : 'Add products to see them here.'}
              </p>
              
              {/* Add a button to create a new listing when there are no listings */}
              <div className="mt-4">
                <button 
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  onClick={() => window.location.href = '/marketplace/create-listing'}
                >
                  Add Your First Product
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FarmerDashboard;