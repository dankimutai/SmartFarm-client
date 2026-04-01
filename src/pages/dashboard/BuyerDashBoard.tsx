import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ShoppingCart, DollarSign, ChevronUp, ChevronDown, Package, Truck } from 'lucide-react';
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
import { useSelector } from 'react-redux';
import { ordersApi } from '../../store/api/ordersApi';
import { RootState } from '../../store/store';
import { useMemo } from 'react';

// Define chart data type
interface ChartDataPoint {
  month: string;
  spending: number;
  orders: number;
}

// Status Badge Component
interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let bgColor = 'bg-blue-100 text-blue-800';
  
  switch (status) {
    case 'delivered':
      bgColor = 'bg-green-100 text-green-800';
      break;
    case 'in_transit':
      bgColor = 'bg-yellow-100 text-yellow-800';
      break;
    case 'pending':
      bgColor = 'bg-blue-100 text-blue-800';
      break;
    case 'cancelled':
      bgColor = 'bg-red-100 text-red-800';
      break;
    default:
      bgColor = 'bg-gray-100 text-gray-800';
  }

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${bgColor}`}>
      {status
        .split('_')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')}
    </span>
  );
};

const BuyerDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Use the user ID directly instead of buyerId
  const userId = user?.id || 0;
  
  // Fetch order data using userId
  const { 
    data: ordersData, 
    isLoading: ordersLoading,
    error
  } = ordersApi.useGetUserOrdersQuery(userId, {
    skip: !userId
  });
  
  console.log('User ID:', userId);
  console.log('Orders Response:', ordersData);
  console.log('Loading:', ordersLoading);
  console.log('Error:', error);
  
  // Orders data - handle both possible response formats
  // If the response is an array, use it directly
  // If it has a data property, use that
  const orders = useMemo(() => {
    if (!ordersData) return [];
    
    if (Array.isArray(ordersData)) {
      return ordersData;
    } else if (ordersData.data && Array.isArray(ordersData.data)) {
      return ordersData.data;
    }
    
    return [];
  }, [ordersData]);
  
  // Calculate order statistics
  const orderStats = useMemo(() => {
    if (!orders.length) return {
      totalSpent: 0,
      activeOrders: 0,
      inTransitOrders: 0,
      savedFarmers: 0
    };
    
    // Get unique farmer IDs to count saved farmers
    const uniqueFarmerIds = new Set(orders.map(order => order.listing.farmerId));
    
    return {
      totalSpent: orders.reduce((sum, order) => sum + parseFloat(order.totalPrice), 0),
      activeOrders: orders.filter(order => ['pending', 'confirmed', 'in_transit'].includes(order.orderStatus)).length,
      inTransitOrders: orders.filter(order => order.orderStatus === 'in_transit').length,
      savedFarmers: uniqueFarmerIds.size
    };
  }, [orders]);
  
  // Generate monthly spending data for charts
  const chartData = useMemo(() => {
    if (!orders.length) return [] as ChartDataPoint[];
    
    const monthlyData: Record<string, ChartDataPoint> = {};
    const now = new Date();
    
    // Initialize last 6 months with empty data
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = month.toLocaleString('default', { month: 'short' });
      monthlyData[monthKey] = { month: monthKey, spending: 0, orders: 0 };
    }
    
    // Fill in data from orders
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const monthKey = orderDate.toLocaleString('default', { month: 'short' });
      
      // Only include orders from the last 6 months
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].spending += parseFloat(order.totalPrice);
        monthlyData[monthKey].orders += 1;
      }
    });
    
    return Object.values(monthlyData);
  }, [orders]);
  
  // Get most recent orders for display
  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [orders]);
  
  // Calculate percentage changes (mock data for demonstration)
  const percentageChanges = {
    totalSpent: 8.5,
    activeOrders: 12.2,
    inTransitOrders: -2.1,
    savedFarmers: 4.4
  };

  // Show loading state
  if (ordersLoading && !orders.length) {
    return <div className="p-6 text-center">Loading dashboard data...</div>;
  }

  // Show error state if there's an error fetching data
  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Error loading dashboard data</p>
        <p className="text-gray-500 mt-2">Please try refreshing the page</p>
        <pre className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto">
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name || 'Buyer'}!</h1>
        <p className="text-gray-500 mt-1">Here's an overview of your purchasing activity</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Spent */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <span className="flex items-center text-green-600 text-sm">
                <ChevronUp className="h-4 w-4 mr-1" />
                {percentageChanges.totalSpent}%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Total Spent</p>
              <h3 className="text-2xl font-bold mt-1">KES {orderStats.totalSpent.toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>

        {/* Active Orders */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
              <span className="flex items-center text-green-600 text-sm">
                <ChevronUp className="h-4 w-4 mr-1" />
                {percentageChanges.activeOrders}%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Active Orders</p>
              <h3 className="text-2xl font-bold mt-1">{orderStats.activeOrders}</h3>
            </div>
          </CardContent>
        </Card>

        {/* In Transit */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Truck className="h-6 w-6 text-yellow-600" />
              </div>
              <span className={`flex items-center ${percentageChanges.inTransitOrders >= 0 ? 'text-green-600' : 'text-red-600'} text-sm`}>
                {percentageChanges.inTransitOrders >= 0 ? (
                  <ChevronUp className="h-4 w-4 mr-1" />
                ) : (
                  <ChevronDown className="h-4 w-4 mr-1" />
                )}
                {Math.abs(percentageChanges.inTransitOrders)}%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">In Transit</p>
              <h3 className="text-2xl font-bold mt-1">{orderStats.inTransitOrders}</h3>
            </div>
          </CardContent>
        </Card>

        {/* Saved Farmers */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <span className="flex items-center text-green-600 text-sm">
                <ChevronUp className="h-4 w-4 mr-1" />
                {percentageChanges.savedFarmers}%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Saved Farmers</p>
              <h3 className="text-2xl font-bold mt-1">{orderStats.savedFarmers}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Spending Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Spending Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`KES ${value.toLocaleString()}`, 'Spending']} />
                  <Line type="monotone" dataKey="spending" stroke="#2563eb" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [value, 'Orders']} />
                  <Bar dataKey="orders" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              You have no orders yet. Start shopping in the marketplace!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Farmer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.listing.product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.listing.farmer.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {parseFloat(order.quantity)} {order.listing.product.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        KES {parseFloat(order.totalPrice).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={order.orderStatus} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Debug Data Display (remove in production) */}
      {/* {process.env.NODE_ENV !== 'production' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-medium mb-2">Debug Data</h3>
          <div className="text-xs overflow-auto max-h-60">
            <p>User ID: {userId}</p>
            <p>Orders Count: {orders.length}</p>
            <p>Raw Response:</p>
            <pre>{JSON.stringify(ordersData, null, 2)}</pre>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default BuyerDashboard;
