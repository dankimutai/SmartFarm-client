import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Leaf,
  ShoppingCart,
  DollarSign,
  ChevronUp,
  ChevronDown,
  Package,
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
  ResponsiveContainer 
} from 'recharts';

// Mock data for sales analytics
const salesData = [
  { month: 'Jan', revenue: 4500, orders: 45 },
  { month: 'Feb', revenue: 5200, orders: 52 },
  { month: 'Mar', revenue: 4800, orders: 48 },
  { month: 'Apr', revenue: 6000, orders: 60 },
  { month: 'May', revenue: 5700, orders: 57 },
  { month: 'Jun', revenue: 6300, orders: 63 }
];

// Mock data for recent orders
const recentOrders = [
  {
    id: 'ORD-001',
    product: 'Fresh Tomatoes',
    quantity: 50,
    total: 250.00,
    status: 'pending',
    date: '2024-02-14'
  },
  {
    id: 'ORD-002',
    product: 'Organic Potatoes',
    quantity: 100,
    total: 300.00,
    status: 'processing',
    date: '2024-02-13'
  },
  {
    id: 'ORD-003',
    product: 'Carrots',
    quantity: 75,
    total: 187.50,
    status: 'delivered',
    date: '2024-02-12'
  }
];

const FarmerDashboard = () => {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, John!</h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your farm today</p>
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
              <span className="flex items-center text-green-600 text-sm">
                <ChevronUp className="h-4 w-4 mr-1" />
                12.5%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <h3 className="text-2xl font-bold mt-1">$32,621.00</h3>
            </div>
          </CardContent>
        </Card>

        {/* Active Orders */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <span className="flex items-center text-green-600 text-sm">
                <ChevronUp className="h-4 w-4 mr-1" />
                8.2%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Active Orders</p>
              <h3 className="text-2xl font-bold mt-1">45</h3>
            </div>
          </CardContent>
        </Card>

        {/* Products Listed */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <span className="flex items-center text-red-600 text-sm">
                <ChevronDown className="h-4 w-4 mr-1" />
                3.1%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Products Listed</p>
              <h3 className="text-2xl font-bold mt-1">12</h3>
            </div>
          </CardContent>
        </Card>

        {/* Active Crops */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Leaf className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="flex items-center text-green-600 text-sm">
                <ChevronUp className="h-4 w-4 mr-1" />
                5.4%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Active Crops</p>
              <h3 className="text-2xl font-bold mt-1">8</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={2}
                  />
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
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#6366f1" />
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
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.product}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full
                        ${order.status === 'delivered' 
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'processing'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.date}
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

export default FarmerDashboard;