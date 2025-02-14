// src/pages/farmer/Analytics.tsx
import { useState } from 'react';
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

// Mock data for charts
const salesData = [
  { month: 'Jan', revenue: 4500, orders: 45 },
  { month: 'Feb', revenue: 5200, orders: 52 },
  { month: 'Mar', revenue: 4800, orders: 48 },
  { month: 'Apr', revenue: 6000, orders: 60 },
  { month: 'May', revenue: 5700, orders: 57 },
  { month: 'Jun', revenue: 6300, orders: 63 },
];

const productPerformance = [
  { name: 'Tomatoes', value: 35 },
  { name: 'Potatoes', value: 25 },
  { name: 'Carrots', value: 20 },
  { name: 'Onions', value: 15 },
  { name: 'Others', value: 5 },
];

const currentPeriodMetrics = {
  revenue: 32621.0,
  orders: 1245,
  products: 45,
  customers: 892,
};

const previousPeriodMetrics = {
  revenue: 29000.0,
  orders: 1150,
  products: 46,
  customers: 770,
};

const COLORS = ['#10B981', '#6366F1', '#F59E0B', '#EF4444', '#8B5CF6'];

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('6months');

  const getPercentageChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return change.toFixed(1);
  };

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
                {value}
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
          value={currentPeriodMetrics.revenue.toFixed(2)}
          change={Number(
            getPercentageChange(currentPeriodMetrics.revenue, previousPeriodMetrics.revenue)
          )}
          icon={DollarSign}
          color="bg-emerald-100 text-emerald-600"
          prefix="$"
        />
        <MetricCard
          title="Total Orders"
          value={currentPeriodMetrics.orders}
          change={Number(
            getPercentageChange(currentPeriodMetrics.orders, previousPeriodMetrics.orders)
          )}
          icon={ShoppingBag}
          color="bg-blue-100 text-blue-600"
        />
        <MetricCard
          title="Active Products"
          value={currentPeriodMetrics.products}
          change={Number(
            getPercentageChange(currentPeriodMetrics.products, previousPeriodMetrics.products)
          )}
          icon={Package}
          color="bg-purple-100 text-purple-600"
        />
        <MetricCard
          title="Total Customers"
          value={currentPeriodMetrics.customers}
          change={Number(
            getPercentageChange(currentPeriodMetrics.customers, previousPeriodMetrics.customers)
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
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
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

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Product Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
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
              </div>

              {/* Customer Growth */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Customer Growth</h3>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
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
