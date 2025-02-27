import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  ShoppingBag,
  Eye,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Download,
  X,
  Search,
  Calendar,
  CreditCard,
  User,
  Package,
  ArrowRight,
  Phone,
  MessageSquare,
  RefreshCw,
  Send,
  DollarSign,
  AlertCircle,
  Loader2,
  FileSpreadsheet,
} from 'lucide-react';
import { ordersApi } from '../../store/api/ordersApi';
import { RootState } from '../../store/store';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Updated interface to match the backend structure
interface Farmer {
  id: number;
  userId: number;
  location: string;
  farmSize: number;
  primaryCrops: string;
}

interface Buyer {
  id: number;
  userId: number;
  companyName: string | null;
  businessType: string | null;
}

interface Product {
  id: number;
  name: string;
  category: string;
  unit: string;
  imageUrl: string | null;
}

interface Listing {
  id: number;
  farmerId: number;
  productId: number;
  quantity: number;
  price: number;
  availableDate: string;
  status: 'active' | 'sold' | 'expired';
  createdAt: string;
  updatedAt: string;
  farmer: Farmer;
  product: Product;
}

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
  buyer: Buyer;
  listing: Listing;
}

const OrdersManagement = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id;

  // Updated to use the correct query and data structure
  const {
    data: ordersResponse,
    isLoading,
    error,
    refetch,
  } = ordersApi.useGetFarmerOrdersQuery(userId ?? 0, {
    skip: !userId,
    // Add polling interval to auto-refresh data (15 minutes)
    pollingInterval: 15 * 60 * 1000,
  });

  // Ensure we're accessing the data correctly
  const orders = ordersResponse?.data || [];
  console.log('Orders:', orders);
  const [updateOrder] = ordersApi.useUpdateOrderMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());

  // Add states for handling loading and feedback
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateFeedback, setUpdateFeedback] = useState<{
    message: string;
    type: 'success' | 'error' | null;
  }>({ message: '', type: null });
  const [isExporting, setIsExporting] = useState(false);

  // Update the last refresh time when orders data changes
  useEffect(() => {
    if (ordersResponse) {
      setLastRefreshTime(new Date());
    }
  }, [ordersResponse]);

  // Get order statistics
  const getOrderStats = () => {
    if (!orders || orders.length === 0)
      return {
        pending: 0,
        in_transit: 0,
        delivered: 0,
        cancelled: 0,
      };

    return {
      pending: orders.filter((o: Order) => o.orderStatus === 'pending').length,
      in_transit: orders.filter((o: Order) => o.orderStatus === 'in_transit').length,
      delivered: orders.filter((o: Order) => o.orderStatus === 'delivered').length,
      cancelled: orders.filter((o: Order) => o.orderStatus === 'cancelled').length,
    };
  };

  const stats = getOrderStats();

  // Add a refresh button function
  const handleRefresh = () => {
    refetch();
    setLastRefreshTime(new Date());
  };

  // Filter orders based on search term and status
  const filteredOrders =
    orders?.filter((order: Order) => {
      const buyerInfo = order.buyer?.companyName || '';
      const buyerType = order.buyer?.businessType || '';
      const productName = order.listing?.product?.name || '';

      const matchesSearch =
        order.id.toString().includes(searchTerm.toLowerCase()) ||
        buyerInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        buyerType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        productName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'all' || order.orderStatus === filterStatus;

      return matchesSearch && matchesStatus;
    }) || [];

  const getStatusColor = (status: Order['orderStatus']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in_transit':
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
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Order['orderStatus']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <ShoppingBag className="w-4 h-4" />;
      case 'in_transit':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Enhanced update function that handles both order status and payment status
  const handleStatusUpdate = async (
    orderId: number,
    updateData: {
      orderStatus?: Order['orderStatus'];
      paymentStatus?: Order['paymentStatus'];
    }
  ) => {
    setIsUpdating(true);
    setUpdateFeedback({ message: '', type: null });

    try {
      await updateOrder({
        id: orderId,
        updateData,
      }).unwrap();

      // Determine success message based on what was updated
      let successMessage = '';
      if (updateData.orderStatus && updateData.paymentStatus) {
        successMessage = `Order and payment status successfully updated`;
      } else if (updateData.orderStatus) {
        successMessage = `Order status successfully updated to ${updateData.orderStatus.replace('_', ' ')}`;
      } else if (updateData.paymentStatus) {
        successMessage = `Payment status successfully updated to ${updateData.paymentStatus}`;
      }

      setUpdateFeedback({
        message: successMessage,
        type: 'success',
      });

      // Refresh orders data from backend
      refetch();

      // Auto-close modal after successful update after 1.5 seconds
      setTimeout(() => {
        handleCloseModal();
      }, 1500);
    } catch (error) {
      console.error('Failed to update order:', error);
      setUpdateFeedback({
        message: 'Failed to update. Please try again.',
        type: 'error',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrderDetails(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrderDetails(null);
    setUpdateFeedback({ message: '', type: null });
  };

  // Function to format date for Excel export
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Function to export all orders to Excel
  const exportAllOrdersToExcel = () => {
    setIsExporting(true);

    try {
      // Transform orders data for export
      const exportData = orders.map((order: Order) => ({
        'Order ID': order.id,
        Date: formatDate(order.createdAt),
        Customer: order.buyer?.companyName || 'Individual',
        'Customer Type': order.buyer?.businessType || 'N/A',
        Product: order.listing?.product?.name || 'N/A',
        Category: order.listing?.product?.category || 'N/A',
        Quantity: order.quantity,
        Unit: order.listing?.product?.unit || 'N/A',
        'Price (KES)': parseFloat(order.totalPrice).toLocaleString(),
        Status: order.orderStatus.replace('_', ' '),
        'Payment Status': order.paymentStatus,
      }));

      // Create a worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Create column widths
      const columnWidths = [
        { wch: 10 }, // Order ID
        { wch: 12 }, // Date
        { wch: 20 }, // Customer
        { wch: 15 }, // Customer Type
        { wch: 20 }, // Product
        { wch: 15 }, // Category
        { wch: 10 }, // Quantity
        { wch: 10 }, // Unit
        { wch: 15 }, // Price
        { wch: 15 }, // Status
        { wch: 15 }, // Payment Status
      ];

      worksheet['!cols'] = columnWidths;

      // Create a workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

      // Save file
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const fileName = `SmartFarm_Orders_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(blob, fileName);

      // Show success message
      setUpdateFeedback({
        message: 'Orders exported successfully!',
        type: 'success',
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setUpdateFeedback({ message: '', type: null });
      }, 3000);
    } catch (error) {
      console.error('Error exporting orders:', error);
      setUpdateFeedback({
        message: 'Failed to export orders. Please try again.',
        type: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Function to export filtered orders to Excel
  const exportFilteredOrdersToExcel = () => {
    setIsExporting(true);

    try {
      // Transform filtered orders data for export
      const exportData = filteredOrders.map((order: Order) => ({
        'Order ID': order.id,
        Date: formatDate(order.createdAt),
        Customer: order.buyer?.companyName || 'Individual',
        'Customer Type': order.buyer?.businessType || 'N/A',
        Product: order.listing?.product?.name || 'N/A',
        Category: order.listing?.product?.category || 'N/A',
        Quantity: order.quantity,
        Unit: order.listing?.product?.unit || 'N/A',
        'Price (KES)': parseFloat(order.totalPrice).toLocaleString(),
        Status: order.orderStatus.replace('_', ' '),
        'Payment Status': order.paymentStatus,
      }));

      // Create a worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Create column widths
      const columnWidths = [
        { wch: 10 }, // Order ID
        { wch: 12 }, // Date
        { wch: 20 }, // Customer
        { wch: 15 }, // Customer Type
        { wch: 20 }, // Product
        { wch: 15 }, // Category
        { wch: 10 }, // Quantity
        { wch: 10 }, // Unit
        { wch: 15 }, // Price
        { wch: 15 }, // Status
        { wch: 15 }, // Payment Status
      ];

      worksheet['!cols'] = columnWidths;

      // Create a workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Filtered Orders');

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

      // Save file
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const fileName = `SmartFarm_Filtered_Orders_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(blob, fileName);

      // Show success message
      setUpdateFeedback({
        message: 'Filtered orders exported successfully!',
        type: 'success',
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setUpdateFeedback({ message: '', type: null });
      }, 3000);
    } catch (error) {
      console.error('Error exporting filtered orders:', error);
      setUpdateFeedback({
        message: 'Failed to export orders. Please try again.',
        type: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Function to export a single order to Excel
  const exportSingleOrderToExcel = (order: Order) => {
    setIsExporting(true);

    try {
      // Create detailed order data for export
      const exportData = [
        {
          'Order ID': order.id,
          'Order Date': formatDate(order.createdAt),
          Customer: order.buyer?.companyName || 'Individual',
          'Customer Type': order.buyer?.businessType || 'N/A',
          Product: order.listing?.product?.name || 'N/A',
          Category: order.listing?.product?.category || 'N/A',
          Quantity: order.quantity,
          Unit: order.listing?.product?.unit || 'N/A',
          'Unit Price (KES)': parseFloat(order.listing?.price?.toString() || '0').toLocaleString(),
          'Total Price (KES)': parseFloat(order.totalPrice).toLocaleString(),
          'Order Status': order.orderStatus.replace('_', ' '),
          'Payment Status': order.paymentStatus,
        },
      ];

      // Create a worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Create column widths
      const columnWidths = [
        { wch: 10 }, // Order ID
        { wch: 12 }, // Date
        { wch: 20 }, // Customer
        { wch: 15 }, // Customer Type
        { wch: 20 }, // Product
        { wch: 15 }, // Category
        { wch: 10 }, // Quantity
        { wch: 10 }, // Unit
        { wch: 15 }, // Unit Price
        { wch: 15 }, // Total Price
        { wch: 15 }, // Status
        { wch: 15 }, // Payment Status
      ];

      worksheet['!cols'] = columnWidths;

      // Create a workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, `Order_${order.id}`);

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

      // Save file
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const fileName = `SmartFarm_Order_${order.id}.xlsx`;
      saveAs(blob, fileName);

      // Show success message
      setUpdateFeedback({
        message: 'Order exported successfully!',
        type: 'success',
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setUpdateFeedback({ message: '', type: null });
      }, 3000);
    } catch (error) {
      console.error('Error exporting order:', error);
      setUpdateFeedback({
        message: 'Failed to export order. Please try again.',
        type: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error && (error as any)?.data?.message !== 'No orders found for this farmer') {
    return (
      <div>Error loading orders: {(error as any)?.data?.message || 'Something went wrong'}</div>
    );
  }

  // Add this keyframe animation to your global CSS or component styles
  const keyframeStyles = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out forwards;
    }
  `;

  return (
    <div className="p-6">
      <style>{keyframeStyles}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-500 mt-1">
            View and manage your customer orders
            <span className="ml-2 text-xs text-gray-400">
              Last updated: {lastRefreshTime.toLocaleTimeString()}
              {lastRefreshTime.toLocaleDateString() === new Date().toLocaleDateString()
                ? ''
                : ` (${lastRefreshTime.toLocaleDateString()})`}
            </span>
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          {/* Refresh button */}
          <button
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </>
            )}
          </button>

          {/* Export button with dropdown */}
          <div className="relative group">
            <button
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={exportAllOrdersToExcel}
              disabled={isExporting || orders.length === 0}
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export All Orders
                </>
              )}
            </button>

            {/* Success/Error message for export */}
            {updateFeedback.type && updateFeedback.message && (
              <div
                className={`absolute top-full right-0 mt-2 px-4 py-2 rounded-md shadow-lg z-10 animate-fadeIn ${
                  updateFeedback.type === 'success'
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                }`}
              >
                {updateFeedback.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                ) : (
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                )}
                {updateFeedback.message}
              </div>
            )}
          </div>
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
                  <h3 className="text-2xl font-bold">{stats.pending}</h3>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Truck className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">In Transit</p>
                  <h3 className="text-2xl font-bold">{stats.in_transit}</h3>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Delivered</p>
                  <h3 className="text-2xl font-bold">{stats.delivered}</h3>
                </div>
              </div>
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
                  <h3 className="text-2xl font-bold">{stats.cancelled}</h3>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Section */}
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
                <option value="confirmed">Confirmed</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Export filtered results button */}
              {filteredOrders.length > 0 && (searchTerm || filterStatus !== 'all') && (
                <button
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
                  onClick={exportFilteredOrdersToExcel}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Export Results
                </button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left">Order ID</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Payment</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order: Order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-4 font-medium">#{order.id}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="font-medium">{order.buyer?.companyName || 'N/A'}</div>
                          <div className="text-sm text-gray-500">
                            {order.buyer?.businessType || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        {order.quantity}x {order.listing?.product?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium">
                      KES {parseFloat(order.totalPrice || '0').toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}
                      >
                        {getStatusIcon(order.orderStatus)}
                        <span className="ml-1 capitalize">
                          {order.orderStatus.replace('_', ' ')}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}
                      >
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View order details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => exportSingleOrderToExcel(order)}
                          className="text-green-600 hover:text-green-800"
                          disabled={isExporting}
                          title="Export to Excel"
                        >
                          {isExporting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Order Details Modal */}
      {isModalOpen && selectedOrderDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden animate-fadeIn">
            {/* Modal Header with attractive styling */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Order #<span className="font-mono">{selectedOrderDetails.id}</span>
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {/* Status Banner */}
              <div
                className={`px-6 py-4 ${
                  selectedOrderDetails.orderStatus === 'delivered'
                    ? 'bg-green-50'
                    : selectedOrderDetails.orderStatus === 'cancelled'
                      ? 'bg-red-50'
                      : selectedOrderDetails.orderStatus === 'in_transit'
                        ? 'bg-purple-50'
                        : selectedOrderDetails.orderStatus === 'confirmed'
                          ? 'bg-blue-50'
                          : 'bg-yellow-50'
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`p-2 rounded-full mr-4 ${
                      selectedOrderDetails.orderStatus === 'delivered'
                        ? 'bg-green-100 text-green-700'
                        : selectedOrderDetails.orderStatus === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : selectedOrderDetails.orderStatus === 'in_transit'
                            ? 'bg-purple-100 text-purple-700'
                            : selectedOrderDetails.orderStatus === 'confirmed'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {getStatusIcon(selectedOrderDetails.orderStatus)}
                  </div>
                  <div>
                    <p className="font-medium capitalize text-gray-900">
                      {selectedOrderDetails.orderStatus.replace('_', ' ')} Order
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedOrderDetails.orderStatus === 'delivered'
                        ? 'This order has been successfully delivered.'
                        : selectedOrderDetails.orderStatus === 'cancelled'
                          ? 'This order has been cancelled.'
                          : selectedOrderDetails.orderStatus === 'in_transit'
                            ? 'This order is on its way to the customer.'
                            : selectedOrderDetails.orderStatus === 'confirmed'
                              ? 'This order has been confirmed and is being prepared.'
                              : 'This order is awaiting your confirmation.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Success/Error Feedback */}
              {updateFeedback.type && (
                <div
                  className={`px-6 py-3 ${
                    updateFeedback.type === 'success'
                      ? 'bg-green-50 border-green-100'
                      : 'bg-red-50 border-red-100'
                  }`}
                >
                  <div className="flex items-center">
                    {updateFeedback.type === 'success' ? (
                      <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
                    )}
                    <p
                      className={`${
                        updateFeedback.type === 'success' ? 'text-green-800' : 'text-red-800'
                      }`}
                    >
                      {updateFeedback.message}
                    </p>
                  </div>
                </div>
              )}

              {/* Main Content Area */}
              <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Order Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm uppercase tracking-wider font-semibold text-gray-500 mb-3 flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        Order Details
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Date Placed</span>
                          <span className="font-medium">
                            {new Date(selectedOrderDetails.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Order ID</span>
                          <span className="font-mono font-medium">#{selectedOrderDetails.id}</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm uppercase tracking-wider font-semibold text-gray-500 mb-3 flex items-center">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Payment Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Payment Status</span>
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(selectedOrderDetails.paymentStatus)}`}
                          >
                            {selectedOrderDetails.paymentStatus.charAt(0).toUpperCase() +
                              selectedOrderDetails.paymentStatus.slice(1)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Total Amount</span>
                          <span className="font-bold text-lg">
                            KES {parseFloat(selectedOrderDetails.totalPrice).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Payment Status Update Section */}
                      {selectedOrderDetails.paymentStatus !== 'paid' && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <h4 className="text-xs font-medium text-gray-500 mb-2">
                            Update Payment Status
                          </h4>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleStatusUpdate(selectedOrderDetails.id, {
                                  paymentStatus: 'paid',
                                })
                              }
                              disabled={isUpdating}
                              className="flex items-center justify-center px-3 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isUpdating ? (
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              ) : (
                                <DollarSign className="w-3 h-3 mr-1" />
                              )}
                              Mark as Paid
                            </button>
                            {selectedOrderDetails.paymentStatus !== 'failed' && (
                              <button
                                onClick={() =>
                                  handleStatusUpdate(selectedOrderDetails.id, {
                                    paymentStatus: 'failed',
                                  })
                                }
                                disabled={isUpdating}
                                className="flex items-center justify-center px-3 py-1 border border-red-600 text-red-600 text-xs rounded hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isUpdating ? (
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                ) : (
                                  <XCircle className="w-3 h-3 mr-1" />
                                )}
                                Mark as Failed
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Customer Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm uppercase tracking-wider font-semibold text-gray-500 mb-3 flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Customer Information
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="font-medium">
                            {selectedOrderDetails.buyer?.companyName || 'Individual Buyer'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {selectedOrderDetails.buyer?.businessType || 'N/A'}
                          </p>
                        </div>
                        <div className="pt-2 flex gap-2">
                          <button className="text-xs flex items-center text-emerald-600 hover:text-emerald-800 transition-colors">
                            <Phone className="h-3 w-3 mr-1" />
                            Call
                          </button>
                          <button className="text-xs flex items-center text-emerald-600 hover:text-emerald-800 transition-colors">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Message
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Product Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm uppercase tracking-wider font-semibold text-gray-500 mb-3 flex items-center">
                        <Package className="mr-2 h-4 w-4" />
                        Product Information
                      </h3>
                      <div className="flex items-center space-x-4 py-2">
                        {selectedOrderDetails.listing?.product?.imageUrl ? (
                          <img
                            src={selectedOrderDetails.listing.product.imageUrl}
                            alt={selectedOrderDetails.listing.product.name}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium">
                            {selectedOrderDetails.listing?.product?.name || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {selectedOrderDetails.quantity}{' '}
                            {selectedOrderDetails.listing?.product?.unit || 'units'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Category: {selectedOrderDetails.listing?.product?.category || 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Unit Price</p>
                          <p className="font-medium">
                            KES{' '}
                            {parseFloat(
                              selectedOrderDetails.listing?.price?.toString() || '0'
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <p className="font-medium">Total</p>
                          <p className="font-bold">
                            KES {parseFloat(selectedOrderDetails.totalPrice).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status Timeline */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm uppercase tracking-wider font-semibold text-gray-500 mb-3 flex items-center">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Order Timeline
                      </h3>
                      <div className="space-y-4">
                        <div className="flex">
                          <div className="flex flex-col items-center mr-4">
                            <div
                              className={`h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center`}
                            >
                              <CheckCircle className="h-3 w-3 text-white" />
                            </div>
                            <div className="h-full w-0.5 bg-gray-200 mt-1"></div>
                          </div>
                          <div>
                            <p className="font-medium">Order Placed</p>
                            <p className="text-xs text-gray-500">
                              {new Date(selectedOrderDetails.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex">
                          <div className="flex flex-col items-center mr-4">
                            <div
                              className={`h-5 w-5 rounded-full ${
                                selectedOrderDetails.orderStatus === 'confirmed' ||
                                selectedOrderDetails.orderStatus === 'in_transit' ||
                                selectedOrderDetails.orderStatus === 'delivered'
                                  ? 'bg-emerald-500'
                                  : 'bg-gray-300'
                              } flex items-center justify-center`}
                            >
                              {(selectedOrderDetails.orderStatus === 'confirmed' ||
                                selectedOrderDetails.orderStatus === 'in_transit' ||
                                selectedOrderDetails.orderStatus === 'delivered') && (
                                <CheckCircle className="h-3 w-3 text-white" />
                              )}
                            </div>
                            <div className="h-full w-0.5 bg-gray-200 mt-1"></div>
                          </div>
                          <div>
                            <p className="font-medium">Order Confirmed</p>
                            <p className="text-xs text-gray-500">
                              {selectedOrderDetails.orderStatus === 'confirmed' ||
                              selectedOrderDetails.orderStatus === 'in_transit' ||
                              selectedOrderDetails.orderStatus === 'delivered'
                                ? 'Order has been confirmed'
                                : 'Awaiting confirmation'}
                            </p>
                          </div>
                        </div>

                        <div className="flex">
                          <div className="flex flex-col items-center mr-4">
                            <div
                              className={`h-5 w-5 rounded-full ${
                                selectedOrderDetails.orderStatus === 'in_transit' ||
                                selectedOrderDetails.orderStatus === 'delivered'
                                  ? 'bg-emerald-500'
                                  : 'bg-gray-300'
                              } flex items-center justify-center`}
                            >
                              {(selectedOrderDetails.orderStatus === 'in_transit' ||
                                selectedOrderDetails.orderStatus === 'delivered') && (
                                <CheckCircle className="h-3 w-3 text-white" />
                              )}
                            </div>
                            <div className="h-full w-0.5 bg-gray-200 mt-1"></div>
                          </div>
                          <div>
                            <p className="font-medium">In Transit</p>
                            <p className="text-xs text-gray-500">
                              {selectedOrderDetails.orderStatus === 'in_transit' ||
                              selectedOrderDetails.orderStatus === 'delivered'
                                ? 'Order is on its way'
                                : 'Not yet shipped'}
                            </p>
                          </div>
                        </div>

                        <div className="flex">
                          <div className="flex flex-col items-center mr-4">
                            <div
                              className={`h-5 w-5 rounded-full ${
                                selectedOrderDetails.orderStatus === 'delivered'
                                  ? 'bg-emerald-500'
                                  : 'bg-gray-300'
                              } flex items-center justify-center`}
                            >
                              {selectedOrderDetails.orderStatus === 'delivered' && (
                                <CheckCircle className="h-3 w-3 text-white" />
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="font-medium">Delivered</p>
                            <p className="text-xs text-gray-500">
                              {selectedOrderDetails.orderStatus === 'delivered'
                                ? 'Order has been delivered'
                                : 'Not yet delivered'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Update Order Status Section - Enhanced with better UI feedback */}
                {selectedOrderDetails.orderStatus !== 'delivered' &&
                  selectedOrderDetails.orderStatus !== 'cancelled' && (
                    <div className="mt-6 border-t border-gray-200 pt-6">
                      <h3 className="text-sm uppercase tracking-wider font-semibold text-gray-500 mb-4 flex items-center">
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Update Order Status
                      </h3>

                      {selectedOrderDetails.orderStatus === 'pending' && (
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={() =>
                              handleStatusUpdate(selectedOrderDetails.id, {
                                orderStatus: 'confirmed',
                              })
                            }
                            disabled={isUpdating}
                            className="inline-flex items-center justify-center px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUpdating ? (
                              <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Confirm Order
                              </>
                            )}
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(selectedOrderDetails.id, {
                                orderStatus: 'cancelled',
                              })
                            }
                            disabled={isUpdating}
                            className="inline-flex items-center justify-center px-4 py-3 bg-white border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUpdating ? (
                              <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              <>
                                <XCircle className="w-5 h-5 mr-2" />
                                Cancel Order
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {selectedOrderDetails.orderStatus === 'confirmed' && (
                        <div>
                          <button
                            onClick={() =>
                              handleStatusUpdate(selectedOrderDetails.id, {
                                orderStatus: 'in_transit',
                              })
                            }
                            disabled={isUpdating}
                            className="inline-flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUpdating ? (
                              <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              <>
                                <Truck className="w-5 h-5 mr-2" />
                                Mark as In Transit
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {selectedOrderDetails.orderStatus === 'in_transit' && (
                        <div>
                          <button
                            onClick={() =>
                              handleStatusUpdate(selectedOrderDetails.id, {
                                orderStatus: 'delivered',
                              })
                            }
                            disabled={isUpdating}
                            className="inline-flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-green-500 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUpdating ? (
                              <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Mark as Delivered
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Close
                </button>

                {selectedOrderDetails.orderStatus !== 'delivered' &&
                  selectedOrderDetails.orderStatus !== 'cancelled' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => exportSingleOrderToExcel(selectedOrderDetails)}
                        disabled={isExporting}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center"
                      >
                        {isExporting ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <FileSpreadsheet className="w-4 h-4 mr-2" />
                        )}
                        Export to Excel
                      </button>
                      <button className="px-4 py-2 border border-emerald-600 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 flex items-center">
                        <Send className="w-4 h-4 mr-2" />
                        Contact Buyer
                      </button>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus !== 'all'
              ? "Try adjusting your search or filter to find what you're looking for."
              : "You haven't received any orders yet."}
          </p>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;
