// src/pages/buyer/PurchaseHistory.tsx

import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { ordersApi } from '../../store/api/ordersApi';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../../components/ui/card';
import {
  Search,
  Calendar,
  Filter,
  Download,
  ShoppingBag,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
  DollarSign,
  ArrowDown,
  ArrowUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';



const PurchaseHistory = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState<{ field: string; direction: 'asc' | 'desc' }>({
    field: 'date',
    direction: 'desc'
  });

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

  // Get completed orders (delivered or cancelled)
  const purchaseHistory = useMemo(() => {
    return orders.filter(order => 
      order.orderStatus === 'delivered' || order.orderStatus === 'cancelled'
    );
  }, [orders]);

  // Filter and sort purchases
  const filteredPurchases = useMemo(() => {
    // First apply filters
    let result = purchaseHistory.filter(order => {
      // Search filter
      const searchMatch = 
        searchTerm === '' || 
        order.listing.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toString().includes(searchTerm) ||
        order.listing.farmer.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filter
      const categoryMatch = 
        categoryFilter === 'all' || 
        order.listing.product.category.toLowerCase() === categoryFilter.toLowerCase();
      
      // Date range filter
      let dateMatch = true;
      if (dateRange !== 'all') {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        
        switch(dateRange) {
          case 'last-30-days':
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(now.getDate() - 30);
            dateMatch = orderDate >= thirtyDaysAgo;
            break;
          case 'last-3-months':
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(now.getMonth() - 3);
            dateMatch = orderDate >= threeMonthsAgo;
            break;
          case 'last-6-months':
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(now.getMonth() - 6);
            dateMatch = orderDate >= sixMonthsAgo;
            break;
          case 'this-year':
            dateMatch = orderDate.getFullYear() === now.getFullYear();
            break;
        }
      }
      
      return searchMatch && categoryMatch && dateMatch;
    });
    
    // Then apply sorting
    return result.sort((a, b) => {
      if (sortBy.field === 'date') {
        return sortBy.direction === 'asc' 
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy.field === 'price') {
        return sortBy.direction === 'asc' 
          ? parseFloat(a.totalPrice) - parseFloat(b.totalPrice)
          : parseFloat(b.totalPrice) - parseFloat(a.totalPrice);
      } else if (sortBy.field === 'name') {
        return sortBy.direction === 'asc' 
          ? a.listing.product.name.localeCompare(b.listing.product.name)
          : b.listing.product.name.localeCompare(a.listing.product.name);
      }
      return 0;
    });
  }, [purchaseHistory, searchTerm, categoryFilter, dateRange, sortBy]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = new Set(purchaseHistory.map(order => order.listing.product.category));
    return ['all', ...Array.from(uniqueCategories)];
  }, [purchaseHistory]);

  // Calculate stats
  const stats = useMemo(() => {
    // Total spent
    const totalSpent = purchaseHistory
      .filter(order => order.orderStatus === 'delivered')
      .reduce((sum, order) => sum + parseFloat(order.totalPrice), 0);
    
    // Number of orders
    const purchaseCount = purchaseHistory.length;
    
    // Most purchased category
    const categoryCounts: Record<string, number> = {};
    purchaseHistory.forEach(order => {
      const category = order.listing.product.category;
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    let mostPurchasedCategory = { name: 'None', count: 0 };
    Object.entries(categoryCounts).forEach(([category, count]) => {
      if (count > mostPurchasedCategory.count) {
        mostPurchasedCategory = { name: category, count };
      }
    });
    
    // Most frequent seller
    const sellerCounts: Record<string, number> = {};
    purchaseHistory.forEach(order => {
      const seller = order.listing.farmer.location;
      sellerCounts[seller] = (sellerCounts[seller] || 0) + 1;
    });
    
    let mostFrequentSeller = { name: 'None', count: 0 };
    Object.entries(sellerCounts).forEach(([seller, count]) => {
      if (count > mostFrequentSeller.count) {
        mostFrequentSeller = { name: seller, count };
      }
    });
    
    return {
      totalSpent,
      purchaseCount,
      mostPurchasedCategory,
      mostFrequentSeller
    };
  }, [purchaseHistory]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle download of purchase history as CSV
  const handleDownloadHistory = () => {
    if (filteredPurchases.length === 0) return;
    
    // Create CSV header
    let csv = 'Order ID,Date,Product,Category,Seller,Quantity,Total,Status\n';
    
    // Add order data
    filteredPurchases.forEach(order => {
      csv += `${order.id},`;
      csv += `${formatDate(order.createdAt)},`;
      csv += `"${order.listing.product.name}",`;
      csv += `"${order.listing.product.category}",`;
      csv += `"${order.listing.farmer.location}",`;
      csv += `${parseFloat(order.quantity)} ${order.listing.product.unit},`;
      csv += `KES ${parseFloat(order.totalPrice).toLocaleString()},`;
      csv += `${order.orderStatus}\n`;
    });
    
    // Create and download the file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'purchase_history.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Get status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600">Loading purchase history...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Error loading purchases</h3>
        <p className="text-gray-500 mt-2">Please try again later</p>
      </div>
    );
  }

  // Render empty state
  if (purchaseHistory.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Purchase History</h1>
          <p className="text-gray-500 mt-1">View your past orders and transactions</p>
        </div>
        
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-sm">
          <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No purchase history yet</h3>
          <p className="text-gray-500 mt-2 text-center max-w-md">
            You haven't completed any purchases yet. When your orders are delivered, they'll appear here.
          </p>
          <button 
            onClick={() => navigate('/buyer/orders')}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            View Active Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Purchase History</h1>
        <p className="text-gray-500 mt-1">View your past orders and transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Total Spent</span>
                <span className="text-2xl font-bold mt-1">KES {stats.totalSpent.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Total Purchases</span>
                <span className="text-2xl font-bold mt-1">{stats.purchaseCount}</span>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Most Purchased</span>
                <span className="text-lg font-bold mt-1 truncate max-w-[140px]">{stats.mostPurchasedCategory.name}</span>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <ArrowUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Favorite Seller</span>
                <span className="text-lg font-bold mt-1 truncate max-w-[140px]">{stats.mostFrequentSeller.name}</span>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by product, seller..."
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="flex-shrink-0 flex">
              <div className="w-full relative">
                <select
                  className="appearance-none pl-10 pr-8 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.filter(cat => cat !== 'all').map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Date Range */}
            <div className="flex-shrink-0 flex">
              <div className="w-full relative">
                <select
                  className="appearance-none pl-10 pr-8 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option value="all">All Time</option>
                  <option value="last-30-days">Last 30 Days</option>
                  <option value="last-3-months">Last 3 Months</option>
                  <option value="last-6-months">Last 6 Months</option>
                  <option value="this-year">This Year</option>
                </select>
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Download */}
            <button
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={handleDownloadHistory}
            >
              <Download className="h-4 w-4 mr-2" />
              <span>Export</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Purchases Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Purchase Records</CardTitle>
            <p className="text-sm text-gray-500">
              Showing {filteredPurchases.length} of {purchaseHistory.length} purchases
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => setSortBy({
                      field: 'date',
                      direction: sortBy.field === 'date' && sortBy.direction === 'desc' ? 'asc' : 'desc'
                    })}
                  >
                    <div className="flex items-center">
                      <span>Date</span>
                      {sortBy.field === 'date' && (
                        sortBy.direction === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => setSortBy({
                      field: 'name',
                      direction: sortBy.field === 'name' && sortBy.direction === 'desc' ? 'asc' : 'desc'
                    })}
                  >
                    <div className="flex items-center">
                      <span>Product</span>
                      {sortBy.field === 'name' && (
                        sortBy.direction === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seller
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => setSortBy({
                      field: 'price',
                      direction: sortBy.field === 'price' && sortBy.direction === 'desc' ? 'asc' : 'desc'
                    })}
                  >
                    <div className="flex items-center">
                      <span>Total</span>
                      {sortBy.field === 'price' && (
                        sortBy.direction === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPurchases.map((order) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/buyer/orders/${order.id}`)}
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                          {order.listing.product.imageUrl ? (
                            <img
                              src={order.listing.product.imageUrl}
                              alt={order.listing.product.name}
                              className="h-10 w-10 object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 flex items-center justify-center">
                              <ShoppingBag className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {order.listing.product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Order #{order.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.listing.product.category}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.listing.farmer.location}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parseFloat(order.quantity)} {order.listing.product.unit}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      KES {parseFloat(order.totalPrice).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus === 'delivered' ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <Clock className="h-3 w-3 mr-1" />
                        )}
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty Search Results */}
          {filteredPurchases.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No purchases found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseHistory;