import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { paymentApi, TransactionsQueryParams } from '../../store/api/paymentApi';
import { format } from 'date-fns';
import { 
  Download, 
  Filter, 
  Search, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const FarmerTransactionsPage = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id || 0;
  
  const [filters, setFilters] = useState<TransactionsQueryParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { 
    data: transactionsData, 
    isLoading, 
    isError 
  } = paymentApi.useGetUserTransactionsQuery(userId);

  const { 
    data: statsData, 
    isLoading: statsLoading 
  } = paymentApi.useGetUserTransactionStatsQuery(userId);

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3.5 h-3.5 mr-1" />
            Paid
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3.5 h-3.5 mr-1" />
            Pending
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="w-3.5 h-3.5 mr-1" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy • HH:mm');
  };

  // Format currency
  const formatCurrency = (amount: string, currency: string = 'KES') => {
    return `${currency} ${parseFloat(amount).toFixed(2)}`;
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setFilters({
      ...filters,
      page: newPage
    });
  };

  // Handle filter changes
  const applyFilters = () => {
    setFilters({
      ...filters,
      page: 1 // Reset to first page when applying new filters
    });
    setShowFilters(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Transactions</h1>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500 mb-1">Total Received</p>
          <p className="text-2xl font-bold text-emerald-600">
            {statsLoading 
              ? '---' 
              : formatCurrency(statsData?.data.totalPaid || '0')
            }
          </p>
          <p className="text-xs text-gray-500 mt-1">
            From {statsLoading ? '0' : statsData?.data.totalTransactions || 0} transactions
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-500">
            {statsLoading 
              ? '---' 
              : formatCurrency(statsData?.data.totalPending || '0')
            }
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500 mb-1">Failed</p>
          <p className="text-2xl font-bold text-red-500">
            {statsLoading 
              ? '---' 
              : formatCurrency(statsData?.data.totalFailed || '0')
            }
          </p>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 flex flex-col sm:flex-row justify-between items-center border-b">
          <h2 className="text-lg font-semibold mb-2 sm:mb-0">Transaction History</h2>
          
          <div className="flex space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-emerald-500 focus:border-emerald-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
            >
              <Filter className="w-4 h-4 mr-1" />
              Filter
            </button>
            
            <button className="flex items-center px-3 py-2 border rounded-lg text-sm hover:bg-gray-50">
              <Download className="w-4 h-4 mr-1" />
              Export
            </button>
          </div>
        </div>
        
        {/* Filter Panel */}
        {showFilters && (
          <div className="p-4 border-b bg-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full rounded-lg border-gray-300 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                  value={filters.status || ''}
                  onChange={(e) => setFilters({...filters, status: e.target.value as any || undefined})}
                >
                  <option value="">All</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  className="w-full rounded-lg border-gray-300 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                  value={filters.paymentMethod || ''}
                  onChange={(e) => setFilters({...filters, paymentMethod: e.target.value || undefined})}
                >
                  <option value="">All</option>
                  <option value="mpesa">M-Pesa</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  className="w-full rounded-lg border-gray-300 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    setFilters({...filters, sortBy: sortBy as any, sortOrder: sortOrder as any});
                  }}
                >
                  <option value="createdAt-desc">Date (Newest)</option>
                  <option value="createdAt-asc">Date (Oldest)</option>
                  <option value="amount-desc">Amount (High to Low)</option>
                  <option value="amount-asc">Amount (Low to High)</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={applyFilters}
                  className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-emerald-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Transactions Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto"></div>
              <p className="mt-3 text-gray-600">Loading transactions...</p>
            </div>
          ) : isError ? (
            <div className="py-12 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <p className="mt-3 text-gray-600">Error loading transactions. Please try again.</p>
              <button
                className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                onClick={() => window.location.reload()}
              >
                Refresh
              </button>
            </div>
          ) : transactionsData?.data.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-600">No transactions found.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactionsData?.data.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{transaction.orderId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.providerTransactionId || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination */}
        {transactionsData?.pagination && (
          <div className="px-6 py-4 flex items-center justify-between border-t">
            <div className="text-sm text-gray-500">
              Showing {((transactionsData.pagination.page - 1) * transactionsData.pagination.limit) + 1} to {
                Math.min(
                  transactionsData.pagination.page * transactionsData.pagination.limit,
                  transactionsData.pagination.total
                )
              } of {transactionsData.pagination.total} results
            </div>
            <div className="flex space-x-2">
              <button
                disabled={transactionsData.pagination.page === 1}
                onClick={() => handlePageChange(transactionsData.pagination!.page - 1)}
                className={`p-2 rounded-md ${
                  transactionsData.pagination.page === 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button
                disabled={transactionsData.pagination.page === transactionsData.pagination.totalPages}
                onClick={() => handlePageChange(transactionsData.pagination!.page + 1)}
                className={`p-2 rounded-md ${
                  transactionsData.pagination.page === transactionsData.pagination.totalPages
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerTransactionsPage;