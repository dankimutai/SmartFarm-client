import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  DollarSign,
  TrendingUp,
  Package,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Filter
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

// Mock Data
const spendingData = [
  { month: 'Jan', spending: 3200, orders: 12, average: 266 },
  { month: 'Feb', spending: 4100, orders: 15, average: 273 },
  { month: 'Mar', spending: 3800, orders: 14, average: 271 },
  { month: 'Apr', spending: 4600, orders: 18, average: 255 },
  { month: 'May', spending: 4200, orders: 16, average: 262 },
  { month: 'Jun', spending: 5100, orders: 20, average: 255 }
];

const categorySpending = [
  { name: 'Vegetables', value: 35, color: '#10B981' },
  { name: 'Fruits', value: 25, color: '#3B82F6' },
  { name: 'Grains', value: 20, color: '#F59E0B' },
  { name: 'Dairy', value: 15, color: '#6366F1' },
  { name: 'Others', value: 5, color: '#9CA3AF' }
];

const supplierPerformance = [
  { supplier: 'Green Farms Ltd', orders: 45, rating: 4.8, onTime: 95 },
  { supplier: 'Organic Valley', orders: 38, rating: 4.6, onTime: 92 },
  { supplier: 'Fresh Foods Inc', orders: 32, rating: 4.7, onTime: 94 },
  { supplier: 'Nature\'s Best', orders: 28, rating: 4.5, onTime: 90 },
  { supplier: 'Local Harvest', orders: 25, rating: 4.4, onTime: 88 }
];

const BuyerAnalytics = () => {
  const [timeRange, setTimeRange] = useState('month');

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
              <span className="flex items-center text-green-600 text-sm">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                15.2%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Total Spent</p>
              <h3 className="text-2xl font-bold mt-1">$25,000</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <span className="flex items-center text-green-600 text-sm">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                8.4%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Total Orders</p>
              <h3 className="text-2xl font-bold mt-1">95</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <span className="flex items-center text-green-600 text-sm">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                12.3%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Active Suppliers</p>
              <h3 className="text-2xl font-bold mt-1">18</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="flex items-center text-red-600 text-sm">
                <ArrowDownRight className="h-4 w-4 mr-1" />
                3.1%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Avg Order Value</p>
              <h3 className="text-2xl font-bold mt-1">$263</h3>
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
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="spending" 
                    stroke="#3B82F6" 
                    fillOpacity={1} 
                    fill="url(#colorSpending)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
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
                  >
                    {categorySpending.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
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
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Spending Pattern</h4>
                <p className="text-sm text-gray-500">Your monthly spending has increased by 15.2%. Consider bulk purchasing for frequently ordered items to optimize costs.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Top Suppliers</h4>
                <p className="text-sm text-gray-500">Green Farms Ltd has been your most reliable supplier with 95% on-time delivery rate and 4.8 average rating.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-medium">Seasonal Trends</h4>
                <p className="text-sm text-gray-500">Your vegetable purchases peak during weekends. Consider scheduling deliveries accordingly for better inventory management.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BuyerAnalytics;