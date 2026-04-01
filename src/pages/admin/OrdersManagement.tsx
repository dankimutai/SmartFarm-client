// src/pages/admin/OrdersManagement.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ordersApi } from '../../store/api/ordersApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { 
  Search, 
  Filter,
  Download,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  User,
  Building,
  Loader2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const OrdersManagement = () => {
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Fetch orders with RTK Query
  const { 
    data: orders, 
    isLoading, 
    isError,
    error 
  } = ordersApi.useGetOrdersQuery();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in_transit':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
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

  // Filter orders based on status and search term
  const filteredOrders = orders?.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.orderStatus === filterStatus;
    const matchesSearch = !searchTerm || 
      order.id.toString().includes(searchTerm) ||
      order.buyer.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.listing.product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Function to format date for Excel export
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Function to export all orders to Excel
  const exportAllOrdersToExcel = () => {
    setIsExporting(true);
    
    try {
      if (!filteredOrders || filteredOrders.length === 0) {
        alert('No orders to export');
        setIsExporting(false);
        return;
      }
      
      // Transform orders data for export
      const exportData = filteredOrders.map(order => ({
        'Order ID': order.id,
        'Date': formatDate(order.createdAt),
        'Customer': order.buyer.companyName || 'Individual Buyer',
        'Business Type': order.buyer.businessType || 'N/A',
        'Product': order.listing.product.name,
        'Category': order.listing.product.category,
        'Quantity': order.quantity,
        'Unit': order.listing.product.unit,
        'Price (KSh)': Number(order.totalPrice).toFixed(2),
        'Status': order.orderStatus.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        'Payment Status': order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1),
      }));

      // Create a worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Create column widths
      const columnWidths = [
        { wch: 10 },  // Order ID
        { wch: 12 },  // Date
        { wch: 20 },  // Customer
        { wch: 15 },  // Business Type
        { wch: 20 },  // Product
        { wch: 15 },  // Category
        { wch: 10 },  // Quantity
        { wch: 10 },  // Unit
        { wch: 15 },  // Price
        { wch: 15 },  // Status
        { wch: 15 },  // Payment Status
      ];
      
      worksheet['!cols'] = columnWidths;
      
      // Create a workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
      
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      
      // Save file
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const fileName = `SmartFarm_Orders_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(blob, fileName);
      
    } catch (error) {
      console.error('Error exporting orders:', error);
      alert('Failed to export orders. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };
  
  // Function to export selected orders to Excel
  const exportSelectedOrdersToExcel = () => {
    setIsExporting(true);
    
    try {
      if (selectedOrders.length === 0) {
        alert('Please select at least one order to export');
        setIsExporting(false);
        return;
      }
      
      // Filter only selected orders
      const selectedOrdersData = filteredOrders?.filter(order => selectedOrders.includes(order.id)) || [];
      
      // Transform orders data for export
      const exportData = selectedOrdersData.map(order => ({
        'Order ID': order.id,
        'Date': formatDate(order.createdAt),
        'Customer': order.buyer.companyName || 'Individual Buyer',
        'Business Type': order.buyer.businessType || 'N/A',
        'Product': order.listing.product.name,
        'Category': order.listing.product.category,
        'Quantity': order.quantity,
        'Unit': order.listing.product.unit,
        'Price (KSh)': Number(order.totalPrice).toFixed(2),
        'Status': order.orderStatus.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        'Payment Status': order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1),
      }));

      // Create a worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Create column widths
      const columnWidths = [
        { wch: 10 },  // Order ID
        { wch: 12 },  // Date
        { wch: 20 },  // Customer
        { wch: 15 },  // Business Type
        { wch: 20 },  // Product
        { wch: 15 },  // Category
        { wch: 10 },  // Quantity
        { wch: 10 },  // Unit
        { wch: 15 },  // Price
        { wch: 15 },  // Status
        { wch: 15 },  // Payment Status
      ];
      
      worksheet['!cols'] = columnWidths;
      
      // Create a workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Selected Orders');
      
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      
      // Save file
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const fileName = `SmartFarm_Selected_Orders_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(blob, fileName);
      
    } catch (error) {
      console.error('Error exporting selected orders:', error);
      alert('Failed to export selected orders. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Error loading orders: {(error as any)?.data?.message || 'Something went wrong'}
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-500 mt-1">View and manage customer orders</p>
        </div>
        <div className="flex gap-2">
          <button 
            className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50"
            onClick={exportAllOrdersToExcel}
            disabled={isExporting || !filteredOrders || filteredOrders.length === 0}
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export Orders
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Orders</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {selectedOrders.length} selected
              </span>
              {selectedOrders.length > 0 && (
                <button 
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  onClick={exportSelectedOrdersToExcel}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Download className="w-3 h-3 mr-1" />
                  )}
                  Export Selected
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
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
            <button className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={selectedOrders.length === filteredOrders?.length}
                      onChange={() => {
                        const allIds = filteredOrders?.map(order => order.id) || [];
                        setSelectedOrders(prev => 
                          prev.length === filteredOrders?.length ? [] : allIds
                        );
                      }}
                    />
                  </th>
                  <th className="px-4 py-3 text-left">Order ID</th>
                  <th className="px-4 py-3 text-left">Buyer</th>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Payment</th>
                  <th className="px-4 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders?.map((order) => (
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
                    <td className="px-4 py-4 font-medium">#{order.id}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          {order.buyer.businessType === 'individual' ? (
                            <User className="h-4 w-4 text-gray-600" />
                          ) : (
                            <Building className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{order.buyer.companyName || 'Individual Buyer'}</div>
                          <div className="text-sm text-gray-500">{order.buyer.businessType || 'No Business Type'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        {order.listing.product.name}
                        <div className="text-gray-500">
                          {order.quantity} {order.listing.product.unit}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium">
                      Ksh{Number(order.totalPrice).toFixed(2)}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                        {getStatusIcon(order.orderStatus)}
                        <span className="ml-1">
                          {order.orderStatus.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
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

export default OrdersManagement;
