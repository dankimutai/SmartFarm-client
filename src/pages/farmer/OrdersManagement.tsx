// src/pages/farmer/OrdersManagement.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  ShoppingBag,
  Eye,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Download,
  MoreVertical,
  X,
  Search,
  Filter
} from 'lucide-react';

interface Order {
  id: string;
  customer: {
    name: string;
    email: string;
    avatar: string;
  };
  products: {
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'paid' | 'unpaid' | 'refunded';
  date: string;
  deliveryDate?: string;
}

const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    customer: {
      name: 'John Doe',
      email: 'john@example.com',
      avatar: '/api/placeholder/32/32'
    },
    products: [
      { name: 'Fresh Tomatoes', quantity: 5, price: 4.99 },
      { name: 'Organic Potatoes', quantity: 2, price: 3.99 }
    ],
    total: 32.93,
    status: 'pending',
    paymentStatus: 'paid',
    date: '2024-02-14',
  },
  {
    id: 'ORD-002',
    customer: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      avatar: '/api/placeholder/32/32'
    },
    products: [
      { name: 'Carrots', quantity: 3, price: 2.99 }
    ],
    total: 8.97,
    status: 'shipped',
    paymentStatus: 'paid',
    date: '2024-02-13',
    deliveryDate: '2024-02-16'
  }
];

const OrdersManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Filter orders based on search term and status
  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewOrder = (order: Order) => {
    setSelectedOrderDetails(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrderDetails(null);
  };

  const handleBulkAction = () => {
    console.log('Selected orders:', selectedOrders);
    // Implement bulk action logic here
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <ShoppingBag className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleStatusUpdate = (newStatus: Order['status']) => {
    if (selectedOrderDetails) {
      // Here you would typically make an API call to update the order status
      console.log(`Updating order ${selectedOrderDetails.id} to status: ${newStatus}`);
      handleCloseModal();
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-500 mt-1">View and manage your customer orders</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export Orders
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Pending Orders</p>
                  <h3 className="text-2xl font-bold">12</h3>
                </div>
              </div>
              <span className="text-green-600 text-sm">+4.5%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Truck className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Shipped Orders</p>
                  <h3 className="text-2xl font-bold">8</h3>
                </div>
              </div>
              <span className="text-green-600 text-sm">+2.7%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Delivered</p>
                  <h3 className="text-2xl font-bold">45</h3>
                </div>
              </div>
              <span className="text-green-600 text-sm">+12.5%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Cancelled</p>
                  <h3 className="text-2xl font-bold">2</h3>
                </div>
              </div>
              <span className="text-red-600 text-sm">-1.2%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Recent Orders</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Bulk Actions */}
          {selectedOrders.length > 0 && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedOrders.length} orders selected
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={handleBulkAction}
                  className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  Update Status
                </button>
                <button 
                  onClick={() => setSelectedOrders([])}
                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={selectedOrders.length === filteredOrders.length}
                      onChange={() => {
                        const allIds = filteredOrders.map(order => order.id);
                        setSelectedOrders(prev => 
                          prev.length === filteredOrders.length ? [] : allIds
                        );
                      }}
                    />
                  </th>
                  <th className="px-4 py-3 text-left">Order ID</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Products</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Payment</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => {
                          setSelectedOrders(prev => 
                            prev.includes(order.id)
                              ? prev.filter(id => id !== order.id)
                              : [...prev, order.id]
                          );
                        }}
                      />
                    </td>
                    <td className="px-4 py-4 font-medium">{order.id}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <img 
                          src={order.customer.avatar}
                          alt={order.customer.name}
                          className="h-8 w-8 rounded-full mr-3"
                        />
                        <div>
                          <div className="font-medium">{order.customer.name}</div>
                          <div className="text-sm text-gray-500">{order.customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        {order.products.map((product, index) => (
                          <div key={index}>
                            {product.quantity}x {product.name}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {order.date}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => handleViewOrder(order)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Showing 1 to {filteredOrders.length} of {filteredOrders.length} orders
            </div>
            <div className="flex space-x-2">
              <button 
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                disabled={true}
              >
                Previous
              </button>
              <button className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded">
                1
              </button>
              <button 
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                disabled={true}
              >
                Next
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrderDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Order Details</CardTitle>
              <button 
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Order Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Order ID</h3>
                    <p className="mt-1">{selectedOrderDetails.id}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date</h3>
                    <p className="mt-1">{selectedOrderDetails.date}</p>
                  </div>
                </div>

                {/* Customer Information */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Customer</h3>
                  <div className="mt-1 flex items-center">
                    <img 
                      src={selectedOrderDetails.customer.avatar}
                      alt={selectedOrderDetails.customer.name}
                      className="h-8 w-8 rounded-full"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium">{selectedOrderDetails.customer.name}</p>
                      <p className="text-sm text-gray-500">{selectedOrderDetails.customer.email}</p>
                    </div>
                  </div>
                </div>

                {/* Products List */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Products</h3>
                  <div className="mt-2 space-y-2">
                    {selectedOrderDetails.products.map((product, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-500">Quantity: {product.quantity}</p>
                          </div>
                          <p className="font-medium">
                            ${(product.price * product.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t flex justify-between">
                    <p className="font-medium">Total</p>
                    <p className="font-medium">${selectedOrderDetails.total.toFixed(2)}</p>
                  </div>
                </div>

                {/* Order Status */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Current Status</h3>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrderDetails.status)}`}>
                      {getStatusIcon(selectedOrderDetails.status)}
                      <span className="ml-1 capitalize">{selectedOrderDetails.status}</span>
                    </span>
                  </div>
                </div>

                {/* Order Actions */}
                <div className="flex justify-end space-x-3 mt-6">
                  <button 
                    onClick={handleCloseModal}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate('processing')}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    Update Status
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;