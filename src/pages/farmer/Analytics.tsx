// src/pages/farmer/Analytics.tsx
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { DollarSign, ShoppingBag, Package, Users, ArrowUp, ArrowDown } from 'lucide-react';
import { RootState } from '../../store/store';
import { ordersApi } from '../../store/api/ordersApi';
import { productsApi } from '../../store/api/productsApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

// Define interface for chart data
interface SalesDataPoint {
  month: string;
  revenue: number;
  orders: number;
}

interface ProductPerformance {
  name: string;
  value: number;
}

interface Metrics {
  revenue: number;
  orders: number;
  products: number;
  customers: number;
}

// Color palette for charts
const COLORS = ['#10B981', '#6366F1', '#F59E0B', '#EF4444', '#8B5CF6'];

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('6months');
  
  // State for chart data
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
  const [productPerformance, setProductPerformance] = useState<ProductPerformance[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<Metrics>({
    revenue: 0,
    orders: 0,
    products: 0,
    customers: 0,
  });
  const [previousMetrics, setPreviousMetrics] = useState<Metrics>({
    revenue: 0,
    orders: 0,
    products: 0,
    customers: 0,
  });

  // Get user info from auth state
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id ?? 0;
  const farmerId = user?.farmerId ?? 0;

  // Get date ranges based on selected time range
  const getDateRanges = () => {
    const now = new Date();
    const currentEnd = now;
    let currentStart: Date;
    let previousStart: Date;
    let previousEnd: Date;

    switch (timeRange) {
      case '7days':
        currentStart = new Date(now);
        currentStart.setDate(now.getDate() - 7);
        previousEnd = new Date(currentStart);
        previousEnd.setDate(previousEnd.getDate() - 1);
        previousStart = new Date(previousEnd);
        previousStart.setDate(previousStart.getDate() - 7);
        break;
      case '30days':
        currentStart = new Date(now);
        currentStart.setDate(now.getDate() - 30);
        previousEnd = new Date(currentStart);
        previousEnd.setDate(previousEnd.getDate() - 1);
        previousStart = new Date(previousEnd);
        previousStart.setDate(previousStart.getDate() - 30);
        break;
      case '6months':
        currentStart = new Date(now);
        currentStart.setMonth(now.getMonth() - 6);
        previousEnd = new Date(currentStart);
        previousEnd.setDate(previousEnd.getDate() - 1);
        previousStart = new Date(previousEnd);
        previousStart.setMonth(previousStart.getMonth() - 6);
        break;
      case '1year':
        currentStart = new Date(now);
        currentStart.setFullYear(now.getFullYear() - 1);
        previousEnd = new Date(currentStart);
        previousEnd.setDate(previousEnd.getDate() - 1);
        previousStart = new Date(previousEnd);
        previousStart.setFullYear(previousStart.getFullYear() - 1);
        break;
      default:
        currentStart = new Date(now);
        currentStart.setMonth(now.getMonth() - 6);
        previousEnd = new Date(currentStart);
        previousEnd.setDate(previousEnd.getDate() - 1);
        previousStart = new Date(previousEnd);
        previousStart.setMonth(previousStart.getMonth() - 6);
    }

    return {
      currentStart,
      currentEnd,
      previousStart,
      previousEnd,
    };
  };

  // Fetch farmer orders
  const {
    data: ordersResponse,
    isLoading: ordersLoading,
    error: ordersError,
  } = ordersApi.useGetFarmerOrdersQuery(userId, {
    skip: !userId,
  });

  // Fetch farmer listings
  const {
    data: listingsResponse,
    isLoading: listingsLoading,
    error: listingsError,
  } = productsApi.useGetFarmerListingsQuery(farmerId, {
    skip: !farmerId,
  });

  // Process data when responses change or time range changes
  useEffect(() => {
    if (ordersResponse?.data && listingsResponse?.data) {
      try {
        // Get date ranges for current and previous periods
        const { currentStart, currentEnd, previousStart, previousEnd } = getDateRanges();
        
        // Get orders data
        const orders = ordersResponse.data;
        
        // Get listings data
        const listings = listingsResponse.data;
        
        // Filter orders by date range
        const currentPeriodOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= currentStart && orderDate <= currentEnd;
        });
        
        const previousPeriodOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= previousStart && orderDate <= previousEnd;
        });
        
        // Calculate metrics for current period
        const currentRevenueTotal = currentPeriodOrders.reduce((total, order) => {
          return total + parseFloat(order.totalPrice || '0');
        }, 0);
        
        const currentOrdersTotal = currentPeriodOrders.length;
        
        // Get unique customers from current period
        const currentCustomersSet = new Set(currentPeriodOrders.map(order => order.buyerId));
        const currentCustomersTotal = currentCustomersSet.size;
        
        // Get active listings in current period
        const currentActiveProducts = listings.filter(listing => listing.status === 'active').length;
        
        // Calculate metrics for previous period
        const previousRevenueTotal = previousPeriodOrders.reduce((total, order) => {
          return total + parseFloat(order.totalPrice || '0');
        }, 0);
        
        const previousOrdersTotal = previousPeriodOrders.length;
        
        // Get unique customers from previous period
        const previousCustomersSet = new Set(previousPeriodOrders.map(order => order.buyerId));
        const previousCustomersTotal = previousCustomersSet.size;
        
        // Get active listings in previous period (using the same value for now)
        // In a real application, you would track product listing history over time
        const previousActiveProducts = listings.filter(listing => listing.status === 'active').length;
        
        // Set metrics state
        setCurrentMetrics({
          revenue: currentRevenueTotal,
          orders: currentOrdersTotal,
          products: currentActiveProducts,
          customers: currentCustomersTotal,
        });
        
        setPreviousMetrics({
          revenue: previousRevenueTotal || 1, // Prevent division by zero
          orders: previousOrdersTotal || 1,
          products: previousActiveProducts || 1,
          customers: previousCustomersTotal || 1,
        });
        
        // Process sales data for charts (monthly data)
        const salesByMonth = processOrdersByMonth(orders);
        setSalesData(salesByMonth);
        
        // Process product performance data
        const productData = processProductPerformance(orders);
        setProductPerformance(productData);
      } catch (error) {
        console.error('Error processing analytics data:', error);
      }
    }
  }, [ordersResponse, listingsResponse, timeRange]);

  // Function to process orders by month for charts
  const processOrdersByMonth = (orders: any[]) => {
    const monthData: { [key: string]: { month: string; revenue: number; orders: number } } = {};
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    // Initialize all months with zero
    months.forEach(month => {
      monthData[month] = { month, revenue: 0, orders: 0 };
    });
    
    // Get the number of months to display based on timeRange
    let monthsToShow = 6;
    if (timeRange === '7days' || timeRange === '30days') {
      monthsToShow = 6; // Still show 6 months for smaller ranges
    } else if (timeRange === '1year') {
      monthsToShow = 12;
    }
    
    // Filter orders based on timeRange
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      
      switch (timeRange) {
        case '7days':
          const sevenDaysAgo = new Date(now);
          sevenDaysAgo.setDate(now.getDate() - 7);
          return orderDate >= sevenDaysAgo && orderDate <= now;
        case '30days':
          const thirtyDaysAgo = new Date(now);
          thirtyDaysAgo.setDate(now.getDate() - 30);
          return orderDate >= thirtyDaysAgo && orderDate <= now;
        case '6months':
          const sixMonthsAgo = new Date(now);
          sixMonthsAgo.setMonth(now.getMonth() - 6);
          return orderDate >= sixMonthsAgo && orderDate <= now;
        case '1year':
          const oneYearAgo = new Date(now);
          oneYearAgo.setFullYear(now.getFullYear() - 1);
          return orderDate >= oneYearAgo && orderDate <= now;
        default:
          return true;
      }
    });
    
    // Process filtered orders
    filteredOrders.forEach(order => {
      try {
        const date = new Date(order.createdAt);
        const month = months[date.getMonth()];
        
        // Increment revenue and order count
        monthData[month].revenue += parseFloat(order.totalPrice || '0');
        monthData[month].orders += 1;
      } catch (error) {
        console.error('Error processing order for chart:', error);
      }
    });
    
    // Convert to array and return only the most recent months
    const currentMonth = new Date().getMonth();
    return months
      .slice(currentMonth - (monthsToShow - 1) >= 0 
        ? currentMonth - (monthsToShow - 1) 
        : (currentMonth + 13 - monthsToShow))
      .slice(0, monthsToShow)
      .map(month => monthData[month]);
  };

  // Function to process product performance data for pie chart
  const processProductPerformance = (orders: any[]) => {
    // Group by product name
    const productSales: { [key: string]: number } = {};
    
    // Get total number of products sold across all orders
    let totalProducts = 0;
    
    // Filter orders based on timeRange (same logic as in processOrdersByMonth)
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      
      switch (timeRange) {
        case '7days':
          const sevenDaysAgo = new Date(now);
          sevenDaysAgo.setDate(now.getDate() - 7);
          return orderDate >= sevenDaysAgo && orderDate <= now;
        case '30days':
          const thirtyDaysAgo = new Date(now);
          thirtyDaysAgo.setDate(now.getDate() - 30);
          return orderDate >= thirtyDaysAgo && orderDate <= now;
        case '6months':
          const sixMonthsAgo = new Date(now);
          sixMonthsAgo.setMonth(now.getMonth() - 6);
          return orderDate >= sixMonthsAgo && orderDate <= now;
        case '1year':
          const oneYearAgo = new Date(now);
          oneYearAgo.setFullYear(now.getFullYear() - 1);
          return orderDate >= oneYearAgo && orderDate <= now;
        default:
          return true;
      }
    });
    
    // Count products sold by name
    filteredOrders.forEach(order => {
      try {
        if (order.listing?.product?.name) {
          const productName = order.listing.product.name;
          const quantity = parseInt(order.quantity || '1', 10);
          
          if (!productSales[productName]) {
            productSales[productName] = 0;
          }
          
          productSales[productName] += quantity;
          totalProducts += quantity;
        }
      } catch (error) {
        console.error('Error processing product sales:', error);
      }
    });
    
    // Convert to array of { name, value } objects with percentages
    const productData: ProductPerformance[] = Object.entries(productSales)
      .map(([name, count]) => ({
        name,
        value: Math.round((count / totalProducts) * 100),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4); // Get top 4 products
    
    // Add "Others" category for remaining products
    const topProductsValue = productData.reduce((sum, product) => sum + product.value, 0);
    if (topProductsValue < 100 && productData.length > 0) {
      productData.push({
        name: 'Others',
        value: 100 - topProductsValue,
      });
    }
    
    // If no data, provide empty state
    if (productData.length === 0) {
      return [
        { name: 'No Data', value: 100 }
      ];
    }
    
    return productData;
  };

  // Helper function to calculate percentage change
  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    const change = ((current - previous) / previous) * 100;
    return change.toFixed(1);
  };

  // Component for metric cards
  const MetricCard = ({
    title,
    value,
    change,
    icon: Icon,
    color,
    prefix = '',
  }: {
    title: string;
    value: string | number;
    change: number;
    icon: any;
    color: string;
    prefix?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`p-2 ${color} rounded-lg`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">{title}</p>
              <h3 className="text-2xl font-bold mt-1">
                {prefix}
                {typeof value === 'number' ? value.toLocaleString() : value}
              </h3>
            </div>
          </div>
          <div className={`flex items-center ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? (
              <ArrowUp className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDown className="h-4 w-4 mr-1" />
            )}
            <span>{Math.abs(change)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Show loading state while data is being fetched
  if (ordersLoading || listingsLoading) {
    return <LoadingSpinner />;
  }

  // Show error message if there's an error fetching data
  if (ordersError || listingsError) {
    const errorMessage = ((ordersError || listingsError) as any)?.data?.message;
    
    // Don't treat "No listings found" as an error - just show empty analytics
    if (errorMessage === 'No listings found for this farmer' || errorMessage === 'No orders found for this farmer') {
      // Continue to render empty analytics
    } else {
      return (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          Error loading analytics data: {errorMessage || 'Something went wrong'}
        </div>
      );
    }
  }

  // Empty state fallback data if no real data is available
  if (salesData.length === 0) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    setSalesData(months.map(month => ({ month, revenue: 0, orders: 0 })));
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1">Track your sales and performance metrics</p>
        </div>
        <div className="mt-4 md:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard
          title="Total Revenue"
          value={currentMetrics.revenue.toFixed(2)}
          change={Number(
            getPercentageChange(currentMetrics.revenue, previousMetrics.revenue)
          )}
          icon={DollarSign}
          color="bg-emerald-100 text-emerald-600"
          prefix="KES "
        />
        <MetricCard
          title="Total Orders"
          value={currentMetrics.orders}
          change={Number(
            getPercentageChange(currentMetrics.orders, previousMetrics.orders)
          )}
          icon={ShoppingBag}
          color="bg-blue-100 text-blue-600"
        />
        <MetricCard
          title="Active Products"
          value={currentMetrics.products}
          change={Number(
            getPercentageChange(currentMetrics.products, previousMetrics.products)
          )}
          icon={Package}
          color="bg-purple-100 text-purple-600"
        />
        <MetricCard
          title="Total Customers"
          value={currentMetrics.customers}
          change={Number(
            getPercentageChange(currentMetrics.customers, previousMetrics.customers)
          )}
          icon={Users}
          color="bg-yellow-100 text-yellow-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {salesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`KES ${value.toLocaleString()}`, 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No revenue data available for the selected period</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Orders Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Orders Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {salesData.length > 0 && salesData.some(item => item.orders > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No order data available for the selected period</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Product Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {productPerformance.length > 0 && productPerformance.some(item => item.name !== 'No Data') ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productPerformance}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
                        const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);
                        return (
                          <text
                            x={x}
                            y={y}
                            fill="white"
                            textAnchor={x > cx ? 'start' : 'end'}
                            dominantBaseline="central"
                          >
                            {`${name} ${(percent * 100).toFixed(0)}%`}
                          </text>
                        );
                      }}
                      outerRadius={120}
                      dataKey="value"
                    >
                      {productPerformance.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No product performance data available</p>
                </div>
              )}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {productPerformance.map((item, index) => (
                <div key={item.name} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sales Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Best Selling Products */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Best Selling Products</h3>
                {productPerformance.length > 0 && productPerformance[0].name !== 'No Data' ? (
                  <div className="space-y-3">
                    {productPerformance.slice(0, 3).map((product, index) => (
                      <div key={product.name} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-2">{index + 1}.</span>
                          <span className="text-sm">{product.name}</span>
                        </div>
                        <span className="text-sm text-gray-500">{product.value}% of sales</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No sales data available</p>
                )}
              </div>

              {/* Customer Growth */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Orders Trend</h3>
                <div className="h-40">
                  {salesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No orders trend data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;