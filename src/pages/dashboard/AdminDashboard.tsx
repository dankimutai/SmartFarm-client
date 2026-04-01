import { useState, useEffect } from 'react';
import { 
  Users, 
  ShoppingBag, 
  Package, 
  DollarSign,
  LucideIcon,
  ArrowRight,
  Loader2,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { usersApi } from '../../store/api/usersApi';
import { ordersApi, Order } from '../../store/api/ordersApi';
import { productsApi } from '../../store/api/productsApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { User } from '../../types/user.types';

// Define interfaces for the chart data
interface SalesChartData {
  month: string;
  sales: number;
}

interface OrdersChartData {
  month: string;
  orders: number;
}

// Define interface for MonthData
interface MonthDataSales {
  [key: string]: { month: string; sales: number };
}

interface MonthDataOrders {
  [key: string]: { month: string; orders: number };
}

// Define interface for StatsCard props
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  colorClass: string;
  isLoading?: boolean;
}

// Interface for order status counts
interface OrderStatusCounts {
  pending: number;
  confirmed: number;
  inTransit: number;
  delivered: number;
  cancelled: number;
}

// Stats card component with loading state
const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  colorClass, 
  isLoading 
}) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div className={`p-2 rounded-lg ${colorClass}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      {trend !== undefined && (
        <span
          className={`flex items-center ${
            trend >= 0 ? 'text-green-600' : 'text-red-600'
          } text-sm`}
        >
          {trend >= 0 ? (
            <ChevronUp className="h-4 w-4 mr-1" />
          ) : (
            <ChevronDown className="h-4 w-4 mr-1" />
          )}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div className="mt-4">
      <p className="text-sm text-gray-500">{title}</p>
      {isLoading ? (
        <div className="flex items-center space-x-2 mt-1">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          <span className="text-gray-400">Loading...</span>
        </div>
      ) : (
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
      )}
    </div>
  </div>
);

const AdminDashboard = () => {
  // State for refresh button
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch users data
  const { 
    data: usersData, 
    isLoading: isUsersLoading,
    refetch: refetchUsers
  } = usersApi.useGetUsersQuery({
    limit: 100 // Get a larger sample for analytics
  });
 
  // Fetch all orders
  const { 
    data: ordersResponse, 
    isLoading: isOrdersLoading,
    refetch: refetchOrders
  } = ordersApi.useGetOrdersQuery();

  // Fetch products with listings
  const { 
    data: productsData, 
    isLoading: isProductsLoading,
    refetch: refetchProducts
  } = productsApi.useGetProductsQuery({
    limit: 100 // Get a larger sample for analytics
  });

  // State for derived statistics
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    revenueChange: 12.5, // Placeholder
    ordersChange: 8.2,    // Placeholder
    productsChange: 5.4,  // Placeholder
    usersChange: 15.8,    // Placeholder
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
  const [salesChartData, setSalesChartData] = useState<SalesChartData[]>([]);
  const [ordersChartData, setOrdersChartData] = useState<OrdersChartData[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [isDataProcessing, setIsDataProcessing] = useState(true);

  // Function to process orders data by month for sales chart
  const processOrdersDataByMonth = (orders: Order[] = []): SalesChartData[] => {
    const monthData: MonthDataSales = {};
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    // Initialize all months with zero
    months.forEach((month) => {
      monthData[month] = { month, sales: 0 };
    });

    // Process orders
    orders.forEach((order: Order) => {
      try {
        const date = new Date(order.createdAt);
        const month = months[date.getMonth()];

        // Only include paid orders
        if (order.paymentStatus === 'paid') {
          monthData[month].sales += parseFloat(order.totalPrice || '0');
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

  // Function to process orders count by month for orders chart
  const processOrdersCountByMonth = (orders: Order[] = []): OrdersChartData[] => {
    const monthData: MonthDataOrders = {};
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
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
    if (salesChartData.length === 0) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      setSalesChartData(months.map(month => ({ month, sales: 0 })));
      setOrdersChartData(months.map(month => ({ month, orders: 0 })));
    }
  }, [salesChartData.length]);

  // Process and transform data when API responses change
  useEffect(() => {
    try {
      // Only process if all data is loaded
      if (ordersResponse && productsData?.data && usersData?.data) {
        setIsDataProcessing(true);
        
        const orders = ordersResponse || [];
        const products = productsData.data || [];
        const users = usersData.data || [];

        // Calculate total revenue from paid orders
        const totalRevenue = orders.reduce((total: number, order: Order) => {
          if (order.paymentStatus === 'paid') {
            return total + (parseFloat(order.totalPrice || '0') || 0);
          }
          return total;
        }, 0);

        // Count orders by status
        const statusCounts: OrderStatusCounts = {
          pending: orders.filter((order: Order) => order.orderStatus === 'pending').length,
          confirmed: orders.filter((order: Order) => order.orderStatus === 'confirmed').length,
          inTransit: orders.filter((order: Order) => order.orderStatus === 'in_transit').length,
          delivered: orders.filter((order: Order) => order.orderStatus === 'delivered').length,
          cancelled: orders.filter((order: Order) => order.orderStatus === 'cancelled').length,
        };

        // Set order status counts
        setOrderStatusCounts(statusCounts);

        // Set overall statistics
        setStats({
          totalRevenue: totalRevenue,
          totalOrders: orders.length,
          totalProducts: products.length,
          totalUsers: users.length,
          revenueChange: 12.5, // Placeholder - in a real app you'd calculate this
          ordersChange: 8.2,    // Placeholder
          productsChange: 5.4,  // Placeholder
          usersChange: 15.8,    // Placeholder
        });

        // Process sales data for chart
        const salesByMonth = processOrdersDataByMonth(orders);
        setSalesChartData(salesByMonth);

        // Process orders data for chart
        const ordersByMonth = processOrdersCountByMonth(orders);
        setOrdersChartData(ordersByMonth);

        // Get recent users (5 most recent)
        const sortedUsers = [...users].sort((a, b) => {
          try {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          } catch {
            return 0;
          }
        }).slice(0, 5);

        setRecentUsers(sortedUsers);
        setIsDataProcessing(false);
      }
    } catch (error) {
      console.error('Error processing dashboard data:', error);
      setIsDataProcessing(false);
    }
  }, [ordersResponse, productsData, usersData]);

  // Function to refresh all data
  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      // Refetch all data sources
      await Promise.all([
        refetchUsers(),
        refetchOrders(),
        refetchProducts()
      ]);
      // Update the refresh timestamp
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Function to get role color
  const getRoleColor = (role: string) => {
    switch(role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'farmer':
        return 'bg-green-100 text-green-800';
      case 'buyer':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Show loading spinner while data is being fetched
  if ((isUsersLoading || isOrdersLoading || isProductsLoading) && !salesChartData.length) {
    return <LoadingSpinner />;
  }

  // Make sure we have arrays even if APIs return null/undefined
  const products = productsData?.data?.slice(0, 5) || []; // Only take the first 5 for display

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Refresh Button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
          Admin Dashboard
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="text-sm text-gray-500">
            Last updated: {lastRefreshTime.toLocaleTimeString()}
          </div>
          <button 
            onClick={handleRefreshData} 
            disabled={isRefreshing}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isRefreshing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard 
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          trend={stats.usersChange}
          colorClass="bg-blue-500"
          isLoading={isUsersLoading}
        />
        <StatsCard 
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingBag}
          trend={stats.ordersChange}
          colorClass="bg-green-500"
          isLoading={isOrdersLoading}
        />
        <StatsCard 
          title="Products Listed"
          value={stats.totalProducts}
          icon={Package}
          trend={stats.productsChange}
          colorClass="bg-purple-500"
          isLoading={isProductsLoading}
        />
        <StatsCard 
          title="Total Revenue"
          value={`Ksh${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={stats.revenueChange}
          colorClass="bg-amber-500"
          isLoading={isOrdersLoading}
        />
      </div>

      {/* Order Status Breakdown */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Order Status Breakdown
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Pending Orders */}
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="bg-yellow-100 rounded-full p-3 inline-block mb-4">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-yellow-700">
              {orderStatusCounts.pending}
            </h3>
            <p className="text-sm text-yellow-600">Pending</p>
          </div>

          {/* Confirmed Orders */}
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="bg-blue-100 rounded-full p-3 inline-block mb-4">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-blue-700">
              {orderStatusCounts.confirmed}
            </h3>
            <p className="text-sm text-blue-600">Confirmed</p>
          </div>

          {/* In Transit Orders */}
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="bg-purple-100 rounded-full p-3 inline-block mb-4">
              <Truck className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-purple-700">
              {orderStatusCounts.inTransit}
            </h3>
            <p className="text-sm text-purple-600">In Transit</p>
          </div>

          {/* Delivered Orders */}
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="bg-green-100 rounded-full p-3 inline-block mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-green-700">
              {orderStatusCounts.delivered}
            </h3>
            <p className="text-sm text-green-600">Delivered</p>
          </div>

          {/* Cancelled Orders */}
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="bg-red-100 rounded-full p-3 inline-block mb-4">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-red-700">
              {orderStatusCounts.cancelled}
            </h3>
            <p className="text-sm text-red-600">Cancelled</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Sales Overview Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Sales Overview
          </h2>
          <div className="h-80">
            {isDataProcessing ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : salesChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white shadow-lg rounded-lg p-4">
                            <p className="font-bold text-gray-700">
                              {payload[0].payload.month} Sales
                            </p>
                            <p className="text-green-600">
                              ${payload[0].value?.toLocaleString() || '0'}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="sales" 
                    fill="#10b981" 
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Package className="h-12 w-12 mb-4" />
                <p>No sales data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Orders Trend Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Orders Trend
          </h2>
          <div className="h-80">
            {isDataProcessing ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : ordersChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ordersChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{stroke: '#10b981', strokeWidth: 2}}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white shadow-lg rounded-lg p-4">
                            <p className="font-bold text-gray-700">
                              {payload[0].payload.month} Orders
                            </p>
                            <p className="text-blue-600">
                              {payload[0].value} Orders
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    dot={{
                      stroke: '#6366f1',
                      strokeWidth: 2,
                      fill: 'white'
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <ShoppingBag className="h-12 w-12 mb-4" />
                <p>No orders data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Recent User Activities
          </h2>
          <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
            View All <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        </div>
        
        {isUsersLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : recentUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Role</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Joined Date</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 flex items-center">
                      {user.image ? (
                        <img 
                          src={user.image} 
                          alt={user.name} 
                          className="h-10 w-10 rounded-full mr-3 object-cover" 
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full mr-3 bg-gray-200 flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-500" />
                        </div>
                      )}
                      <span className="font-medium">{user.name}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-blue-600 hover:text-blue-800">
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4" />
            <p>No recent user activities</p>
          </div>
        )}
      </div>

      {/* Recent Products */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Recent Products
          </h2>
          <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
            View All <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        </div>
        
        {isProductsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left">Product</th>
                  <th className="py-3 px-4 text-left">Category</th>
                  <th className="py-3 px-4 text-left">Unit</th>
                  <th className="py-3 px-4 text-left">Listings</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 flex items-center">
                      <img
                        src={product.imageUrl || '/api/placeholder/64/64'}
                        alt={product.name}
                        className="h-10 w-10 rounded-lg mr-3 object-cover"
                      />
                      <span className="font-medium">{product.name}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {product.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="py-3 px-4">{product.unit}</td>
                    <td className="py-3 px-4">
                      {product.listings?.length || 0} active
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-blue-600 hover:text-blue-800">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4" />
            <p>No products available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
