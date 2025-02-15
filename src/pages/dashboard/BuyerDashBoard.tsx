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

// Mock data for purchase analytics
const purchaseData = [
  { month: 'Jan', spending: 3200, orders: 12 },
  { month: 'Feb', spending: 4100, orders: 15 },
  { month: 'Mar', spending: 3800, orders: 14 },
  { month: 'Apr', spending: 4600, orders: 18 },
  { month: 'May', spending: 4200, orders: 16 },
  { month: 'Jun', spending: 5100, orders: 20 },
];

// Mock data for recent orders
const recentOrders = [
  {
    id: 'ORD-001',
    product: 'Fresh Tomatoes',
    seller: 'Green Farms Ltd',
    quantity: 50,
    total: 250.0,
    status: 'in_transit',
    date: '2024-02-14',
  },
  {
    id: 'ORD-002',
    product: 'Organic Potatoes',
    seller: 'Organic Valley',
    quantity: 100,
    total: 300.0,
    status: 'pending',
    date: '2024-02-13',
  },
  {
    id: 'ORD-003',
    product: 'Carrots',
    seller: 'Fresh Foods Inc',
    quantity: 75,
    total: 187.5,
    status: 'delivered',
    date: '2024-02-12',
  },
];

const BuyerDashboard = () => {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, John!</h1>
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
                8.5%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Total Spent</p>
              <h3 className="text-2xl font-bold mt-1">$25,842.00</h3>
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
                12.2%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Active Orders</p>
              <h3 className="text-2xl font-bold mt-1">8</h3>
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
              <span className="flex items-center text-red-600 text-sm">
                <ChevronDown className="h-4 w-4 mr-1" />
                2.1%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">In Transit</p>
              <h3 className="text-2xl font-bold mt-1">3</h3>
            </div>
          </CardContent>
        </Card>

        {/* Saved Sellers */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <span className="flex items-center text-green-600 text-sm">
                <ChevronUp className="h-4 w-4 mr-1" />
                4.4%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Saved Sellers</p>
              <h3 className="text-2xl font-bold mt-1">12</h3>
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
                <LineChart data={purchaseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
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
                <BarChart data={purchaseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
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
                    Seller
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
                      {order.seller}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full
                        ${
                          order.status === 'delivered'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'in_transit'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {order.status
                          .split('_')
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')}
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

export default BuyerDashboard;
