import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { ordersApi } from '../../store/api/ordersApi';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  DollarSign,
  TrendingUp,
  Package,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Loader2,
  AlertCircle
} from 'lucide-react';
import {
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

// Fixed category colors
const CATEGORY_COLORS = {
  'Vegetables': '#10B981',
  'Fruits': '#3B82F6',
  'Grains': '#F59E0B',
  'Dairy': '#6366F1',
  'Meat': '#EC4899',
  'Herbs': '#8B5CF6',
  'Others': '#9CA3AF'
};

const BuyerAnalytics = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [timeRange, setTimeRange] = useState('month');
  
  // Fetch orders data
  const { 
    data: ordersResponse, 
    isLoading, 
    error 
  } = ordersApi.useGetUserOrdersQuery(user?.id || 0, {
    skip: !user?.id
  });

  // Extract orders from response
  const orders = useMemo(() => {
    if (Array.isArray(ordersResponse)) {
      return ordersResponse;
    } else if (ordersResponse && 'data' in ordersResponse) {
      return ordersResponse.data;
    }
    return [];
  }, [ordersResponse]);

  // Filter orders based on timeRange
  const filteredOrders = useMemo(() => {
    if (!orders.length) return [];

    const now = new Date();
    let filterDate = new Date();

    switch (timeRange) {
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        filterDate.setMonth(now.getMonth() - 1); // Default to month
    }

    return orders.filter(order => new Date(order.createdAt) >= filterDate);
  }, [orders, timeRange]);

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!filteredOrders.length) {
      return {
        totalSpent: 0,
        totalOrders: 0,
        activeSuppliers: 0,
        avgOrderValue: 0,
        percentChanges: {
          totalSpent: 0,
          totalOrders: 0,
          activeSuppliers: 0,
          avgOrderValue: 0
        }
      };
    }

    // Calculate totals for current period
    const totalSpent = filteredOrders.reduce((sum, order) => sum + parseFloat(order.totalPrice), 0);
    const totalOrders = filteredOrders.length;
    
    // Get unique suppliers
    const uniqueSuppliers = new Set(filteredOrders.map(order => order.listing.farmer.location));
    const activeSuppliers = uniqueSuppliers.size;
    
    // Calculate average order value
    const avgOrderValue = totalSpent / totalOrders;

    // Calculate percentage changes (mock data for now, could be replaced with actual comparison)
    // In a real implementation, you would compare with previous time period
    const percentChanges = {
      totalSpent: 15.2,
      totalOrders: 8.4,
      activeSuppliers: 12.3,
      avgOrderValue: -3.1
    };

    return {
      totalSpent,
      totalOrders,
      activeSuppliers,
      avgOrderValue,
      percentChanges
    };
  }, [filteredOrders]);

  // Generate spending trends data
  const spendingData = useMemo(() => {
    if (!filteredOrders.length) return [];

    // Group orders by month
    const ordersByMonth: Record<string, { spending: number, orders: number }> = {};
    
    filteredOrders.forEach(order => {
      const date = new Date(order.createdAt);
      const month = date.toLocaleString('en-US', { month: 'short' });
      
      if (!ordersByMonth[month]) {
        ordersByMonth[month] = { spending: 0, orders: 0 };
      }
      
      ordersByMonth[month].spending += parseFloat(order.totalPrice);
      ordersByMonth[month].orders += 1;
    });
    
    // Convert to array and calculate averages
    return Object.entries(ordersByMonth).map(([month, data]) => ({
      month,
      spending: data.spending,
      orders: data.orders,
      average: data.orders > 0 ? Math.round(data.spending / data.orders) : 0
    }));
  }, [filteredOrders]);

  // Generate category spending data
  const categorySpending = useMemo(() => {
    if (!filteredOrders.length) return [];

    // Group by category
    const spendingByCategory: Record<string, number> = {};
    
    filteredOrders.forEach(order => {
      const category = order.listing.product.category;
      
      if (!spendingByCategory[category]) {
        spendingByCategory[category] = 0;
      }
      
      spendingByCategory[category] += parseFloat(order.totalPrice);
    });
    
    // Calculate total for percentages
    const total = Object.values(spendingByCategory).reduce((sum, value) => sum + value, 0);
    
    // Convert to array with percentages
    return Object.entries(spendingByCategory).map(([name, value]) => ({
      name,
      value: Math.round((value / total) * 100),
      color: CATEGORY_COLORS[name as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS['Others']
    }));
  }, [filteredOrders]);

  // Generate supplier performance data
  const supplierPerformance = useMemo(() => {
    if (!filteredOrders.length) return [];

    // Group by supplier
    const supplierData: Record<string, { orders: number, onTimeDeliveries: number, totalRating: number, ratingCount: number }> = {};
    
    filteredOrders.forEach(order => {
      const supplier = order.listing.farmer.location;
      
      if (!supplierData[supplier]) {
        supplierData[supplier] = { 
          orders: 0, 
          onTimeDeliveries: 0, 
          totalRating: 0, 
          ratingCount: 0 
        };
      }
      
      supplierData[supplier].orders += 1;
      
      // Assuming delivered orders are on-time
      if (order.orderStatus === 'delivered') {
        supplierData[supplier].onTimeDeliveries += 1;
        
        // Mock rating (in a real app, you'd have actual ratings)
        supplierData[supplier].totalRating += 4.5 + Math.random() * 0.5;
        supplierData[supplier].ratingCount += 1;
      }
    });
    
    // Convert to array with calculated metrics
    return Object.entries(supplierData)
      .map(([supplier, data]) => {
        const onTime = data.orders > 0 
          ? Math.round((data.onTimeDeliveries / data.orders) * 100) 
          : 0;
          
        const rating = data.ratingCount > 0 
          ? parseFloat((data.totalRating / data.ratingCount).toFixed(1)) 
          : 0;
          
        return {
          supplier,
          orders: data.orders,
          rating,
          onTime
        };
      })
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5); // Get top 5
  }, [filteredOrders]);

  // Generate insights
  const insights = useMemo(() => {
    // These would ideally be generated based on actual data analysis
    // For now, providing some sample insights with real data points
    
    const insights = [];
    
    if (metrics.percentChanges.totalSpent > 0) {
      insights.push({
        title: 'Spending Pattern',
        description: `Your ${timeRange}ly spending has increased by ${metrics.percentChanges.totalSpent.toFixed(1)}%. Consider bulk purchasing for frequently ordered items to optimize costs.`,
        icon: <TrendingUp className="h-5 w-5 text-blue-600" />,
        iconBg: 'bg-blue-100'
      });
    } else if (metrics.percentChanges.totalSpent < 0) {
      insights.push({
        title: 'Spending Pattern',
        description: `Your ${timeRange}ly spending has decreased by ${Math.abs(metrics.percentChanges.totalSpent).toFixed(1)}%. Great job managing your budget!`,
        icon: <TrendingUp className="h-5 w-5 text-blue-600" />,
        iconBg: 'bg-blue-100'
      });
    }
    
    if (supplierPerformance.length > 0) {
      const topSupplier = supplierPerformance[0];
      insights.push({
        title: 'Top Suppliers',
        description: `${topSupplier.supplier} has been your most reliable supplier with ${topSupplier.onTime}% on-time delivery rate and ${topSupplier.rating} average rating.`,
        icon: <Users className="h-5 w-5 text-green-600" />,
        iconBg: 'bg-green-100'
      });
    }
    
    if (categorySpending.length > 0) {
      const topCategory = categorySpending.sort((a, b) => b.value - a.value)[0];
      insights.push({
        title: 'Spending Habits',
        description: `${topCategory.value}% of your spending is on ${topCategory.name}. ${topCategory.value > 50 ? 'Consider diversifying your purchases.' : 'You have a well-balanced purchasing portfolio.'}`,
        icon: <Calendar className="h-5 w-5 text-yellow-600" />,
        iconBg: 'bg-yellow-100'
      });
    }
    
    return insights;
  }, [metrics, supplierPerformance, categorySpending, timeRange]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600">Loading analytics data...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Error loading analytics</h3>
        <p className="text-gray-500 mt-2">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Buyer Analytics</h1>
          <p className="text-gray-500 mt-1">Track your purchasing patterns and spending insights</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <select
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <button className="flex items-center px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <span className={`flex items-center ${metrics.percentChanges.totalSpent >= 0 ? 'text-green-600' : 'text-red-600'} text-sm`}>
                {metrics.percentChanges.totalSpent >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                {Math.abs(metrics.percentChanges.totalSpent).toFixed(1)}%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Total Spent</p>
              <h3 className="text-2xl font-bold mt-1">KES {metrics.totalSpent.toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <span className={`flex items-center ${metrics.percentChanges.totalOrders >= 0 ? 'text-green-600' : 'text-red-600'} text-sm`}>
                {metrics.percentChanges.totalOrders >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                {Math.abs(metrics.percentChanges.totalOrders).toFixed(1)}%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Total Orders</p>
              <h3 className="text-2xl font-bold mt-1">{metrics.totalOrders}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <span className={`flex items-center ${metrics.percentChanges.activeSuppliers >= 0 ? 'text-green-600' : 'text-red-600'} text-sm`}>
                {metrics.percentChanges.activeSuppliers >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                {Math.abs(metrics.percentChanges.activeSuppliers).toFixed(1)}%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Active Suppliers</p>
              <h3 className="text-2xl font-bold mt-1">{metrics.activeSuppliers}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <span className={`flex items-center ${metrics.percentChanges.avgOrderValue >= 0 ? 'text-green-600' : 'text-red-600'} text-sm`}>
                {metrics.percentChanges.avgOrderValue >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                {Math.abs(metrics.percentChanges.avgOrderValue).toFixed(1)}%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Avg Order Value</p>
              <h3 className="text-2xl font-bold mt-1">KES {metrics.avgOrderValue.toFixed(0)}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Spending Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Spending Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {spendingData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={spendingData}>
                    <defs>
                      <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`KES ${value.toLocaleString()}`, 'Spending']} />
                    <Area 
                      type="monotone" 
                      dataKey="spending" 
                      stroke="#3B82F6" 
                      fillOpacity={1} 
                      fill="url(#colorSpending)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <TrendingUp className="h-12 w-12 mb-2" />
                  <p>No spending data available for selected period</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {categorySpending.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categorySpending}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="name"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {categorySpending.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Package className="h-12 w-12 mb-2" />
                  <p>No category data available for selected period</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Supplier Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Supplier Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {supplierPerformance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Supplier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      On-Time Delivery
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Performance
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {supplierPerformance.map((supplier, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {supplier.supplier}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {supplier.orders}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <span className="text-yellow-400 mr-1">★</span>
                          {supplier.rating}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {supplier.onTime}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${supplier.onTime}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p>No supplier data available for selected period</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          {insights.length > 0 ? (
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className={`p-2 ${insight.iconBg} rounded-lg`}>
                    {insight.icon}
                  </div>
                  <div>
                    <h4 className="font-medium">{insight.title}</h4>
                    <p className="text-sm text-gray-500">{insight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p>Not enough data to generate insights for the selected period</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BuyerAnalytics;
