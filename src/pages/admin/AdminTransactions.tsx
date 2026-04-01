import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { paymentApi, Transaction } from '../../store/api/paymentApi';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Define filter interface with more specific types
interface TransactionFilters {
  status: '' | 'pending' | 'paid' | 'failed';
  paymentMethod: string;
  dateRange: [Date | null, Date | null];
  sortBy: 'createdAt' | 'amount' | 'status' | 'paymentMethod' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
}

// Create extended transaction type that includes order property
interface ExtendedTransaction extends Transaction {
  order?: {
    buyer?: {
      user?: {
        name: string;
      };
    };
  };
}

const AdminTransactionsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const pageSize = 10;

  // Initialize filters with more specific types
  const [filters, setFilters] = useState<TransactionFilters>({
    status: '',
    paymentMethod: '',
    dateRange: [null, null],
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Query for transactions with filters
  const { 
    data: transactionsData, 
    isLoading, 
    isError, 
    error,
    refetch
  } = paymentApi.useGetAllTransactionsQuery({
    page: currentPage,
    limit: pageSize,
    status: filters.status || undefined,
    startDate: filters.dateRange[0] ? filters.dateRange[0].toISOString() : undefined,
    endDate: filters.dateRange[1] ? filters.dateRange[1].toISOString() : undefined,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    paymentMethod: filters.paymentMethod || undefined
  });

  // Format amount with currency
  const formatAmount = (amount: string) => {
    return `KES ${parseFloat(amount).toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  // Get status color
  const getStatusColor = (status: string) => {
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

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Apply filters
  const applyFilters = () => {
    setCurrentPage(1);
    refetch();
    setShowFilters(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: '',
      paymentMethod: '',
      dateRange: [null, null],
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setCurrentPage(1);
    setTimeout(() => refetch(), 0);
  };

  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>, field: keyof TransactionFilters) => {
    if (field === 'status') {
      const value = e.target.value as '' | 'pending' | 'paid' | 'failed';
      setFilters({...filters, [field]: value});
    } else if (field === 'sortBy') {
      const value = e.target.value as 'createdAt' | 'amount' | 'status' | 'paymentMethod' | 'updatedAt';
      setFilters({...filters, [field]: value});
    } else {
      setFilters({...filters, [field]: e.target.value});
    }
  };

  // Export transactions as CSV
  const exportTransactionsCSV = () => {
    if (!transactionsData?.data) return;
    
    setIsExporting(true);
    
    try {
      // Create CSV content
      const headers = ['Transaction ID', 'Order ID', 'User', 'Amount', 'Method', 'Status', 'Date'];
      const csvContent = [
        headers.join(','),
        ...transactionsData.data.map(transaction => {
          // Cast transaction to ExtendedTransaction
          const extendedTransaction = transaction as unknown as ExtendedTransaction;
          const userName = extendedTransaction.order?.buyer?.user?.name || 'Unknown';
          return [
            transaction.id,
            transaction.orderId,
            userName,
            formatAmount(transaction.amount),
            transaction.paymentMethod,
            transaction.status,
            formatDate(transaction.createdAt)
          ].join(',');
        })
      ].join('\n');
      
      // Create Blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `smartfarm-transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting transactions:', error);
      alert('Failed to export transactions. Please try again.');
    } finally {
      setIsExporting(false);
      setShowExportOptions(false);
    }
  };

  // Export transactions as PDF
  const exportTransactionsPDF = () => {
    if (!transactionsData?.data) return;
    
    setIsExporting(true);
    
    try {
      // Create simple text content for PDF
      const content = `
SmartFarm Transaction Report
Generated on: ${format(new Date(), 'MMMM dd, yyyy')}

${transactionsData.data.map(transaction => {
  // Cast transaction to ExtendedTransaction
  const extendedTransaction = transaction as unknown as ExtendedTransaction;
  const userName = extendedTransaction.order?.buyer?.user?.name || 'Unknown';
  return `
Transaction ID: #${transaction.id}
Order ID: #${transaction.orderId}
User: ${userName}
Amount: ${formatAmount(transaction.amount)}
Method: ${transaction.paymentMethod}
Status: ${transaction.status}
Date: ${formatDate(transaction.createdAt)}
`;
}).join('\n-------------------\n')}
      `;
      
      // Create PDF and download
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `smartfarm-transactions-report-${format(new Date(), 'yyyy-MM-dd')}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting transactions:', error);
      alert('Failed to export transactions. Please try again.');
    } finally {
      setIsExporting(false);
      setShowExportOptions(false);
    }
  };

  // Handle export button click
  const handleExport = () => {
    if (exportFormat === 'csv') {
      exportTransactionsCSV();
    } else {
      exportTransactionsPDF();
    }
  };

  // Filter transactions by search term
  const filteredTransactions = transactionsData?.data?.filter(transaction => {
    const searchLower = searchTerm.toLowerCase();
    // Cast transaction to ExtendedTransaction
    const extendedTransaction = transaction as unknown as ExtendedTransaction;
    const userName = extendedTransaction.order?.buyer?.user?.name || '';
    return (
      transaction.id.toString().includes(searchLower) ||
      transaction.orderId.toString().includes(searchLower) ||
      transaction.amount.toLowerCase().includes(searchLower) ||
      transaction.status.toLowerCase().includes(searchLower) ||
      transaction.paymentMethod.toLowerCase().includes(searchLower) ||
      userName.toLowerCase().includes(searchLower)
    );
  }) || [];

  // Calculate total pages
  const totalPages = transactionsData?.pagination?.totalPages || 1;
  const totalItems = transactionsData?.pagination?.total || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Transaction Management</h1>
        <p className="text-gray-600">View and manage all system transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Transactions Card */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm font-medium">Total Transactions</h3>
              {isLoading ? (
                <div className="h-6 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-semibold text-gray-800">
                  {totalItems}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Paid Transactions */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm font-medium">Paid Transactions</h3>
              {isLoading ? (
                <div className="h-6 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-semibold text-gray-800">
                  {transactionsData?.data?.filter(t => t.status === 'paid').length || 0}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Pending Transactions */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm font-medium">Pending Transactions</h3>
              {isLoading ? (
                <div className="h-6 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-semibold text-gray-800">
                  {transactionsData?.data?.filter(t => t.status === 'pending').length || 0}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Failed Transactions */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm font-medium">Failed Transactions</h3>
              {isLoading ? (
                <div className="h-6 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-semibold text-gray-800">
                  {transactionsData?.data?.filter(t => t.status === 'failed').length || 0}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 md:mb-0">Transaction History</h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
              
              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border rounded-lg flex items-center gap-2 bg-gray-50 hover:bg-gray-100"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              
              {/* Refresh Button */}
              <button
                onClick={() => refetch()}
                className="px-4 py-2 border rounded-lg flex items-center gap-2 bg-gray-50 hover:bg-gray-100"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              
              {/* Export Button */}
              <div className="relative">
                <button 
                  className="px-4 py-2 border rounded-lg flex items-center gap-2 bg-gray-50 hover:bg-gray-100"
                  onClick={() => setShowExportOptions(!showExportOptions)}
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
                
                {showExportOptions && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-10 border">
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Export Format</p>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="exportFormat"
                            checked={exportFormat === 'csv'}
                            onChange={() => setExportFormat('csv')}
                            className="form-radio text-emerald-600"
                          />
                          <span className="text-sm text-gray-700">CSV (.csv)</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="exportFormat"
                            checked={exportFormat === 'pdf'}
                            onChange={() => setExportFormat('pdf')}
                            className="form-radio text-emerald-600"
                          />
                          <span className="text-sm text-gray-700">Text File (.txt)</span>
                        </label>
                      </div>
                      <div className="mt-3 flex justify-end space-x-2">
                        <button
                          onClick={() => setShowExportOptions(false)}
                          className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleExport}
                          disabled={isExporting}
                          className="px-3 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700 flex items-center"
                        >
                          {isExporting ? (
                            <>
                              <div className="animate-spin h-3 w-3 border-2 border-white border-opacity-20 rounded-full border-t-opacity-90 mr-1"></div>
                              <span>Exporting...</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3 h-3 mr-1" />
                              <span>Export</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <h3 className="font-medium text-gray-700 mb-3">Filter Transactions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange(e, 'status')}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                
                {/* Payment Method Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={filters.paymentMethod}
                    onChange={(e) => setFilters({...filters, paymentMethod: e.target.value})}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">All Methods</option>
                    <option value="mpesa">M-Pesa</option>
                    <option value="card">Card</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>
                
                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <div className="flex items-center space-x-2">
                    <DatePicker
                      selected={filters.dateRange[0]}
                      onChange={(date: Date | null) => setFilters({
                        ...filters,
                        dateRange: [date, filters.dateRange[1]]
                      })}
                      selectsStart
                      startDate={filters.dateRange[0]}
                      endDate={filters.dateRange[1]}
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholderText="Start Date"
                    />
                    <span>to</span>
                    <DatePicker
                      selected={filters.dateRange[1]}
                      onChange={(date: Date | null) => setFilters({
                        ...filters,
                        dateRange: [filters.dateRange[0], date]
                      })}
                      selectsEnd
                      startDate={filters.dateRange[0]}
                      endDate={filters.dateRange[1]}
                      minDate={filters.dateRange[0] || undefined}
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholderText="End Date"
                    />
                  </div>
                </div>
                
                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <div className="flex space-x-2">
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange(e, 'sortBy')}
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="createdAt">Date</option>
                      <option value="amount">Amount</option>
                      <option value="status">Status</option>
                      <option value="paymentMethod">Payment Method</option>
                      <option value="updatedAt">Updated Date</option>
                    </select>
                    <button
                      onClick={() => setFilters({
                        ...filters, 
                        sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'
                      })}
                      className="px-3 border rounded-lg"
                    >
                      {filters.sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Reset Filters
                </button>
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading transactions...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold">Error Loading Transactions</h3>
            <p className="text-gray-600 mt-2">
              {error instanceof Error ? error.message : 'An unknown error occurred'}
            </p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold">No Transactions Found</h3>
            <p className="text-gray-600 mt-2">
              {searchTerm ? 'No transactions match your search criteria.' : 'There are no transactions recorded yet.'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => {
                    // Cast to ExtendedTransaction
                    const extendedTransaction = transaction as unknown as ExtendedTransaction;
                    return (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{transaction.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          #{transaction.orderId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {extendedTransaction.order?.buyer?.user?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {formatAmount(transaction.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                          {transaction.paymentMethod}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                            {getStatusIcon(transaction.status)}
                            <span className="ml-1 capitalize">{transaction.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(transaction.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link 
                            to={`/admin/transactions/${transaction.id}`} 
                            className="text-emerald-600 hover:text-emerald-900"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === 1 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === totalPages 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * pageSize, totalItems)}
                      </span>{' '}
                      of <span className="font-medium">{totalItems}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                          currentPage === 1 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                      </button>
                      
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Determine which pages to show based on current page
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNum
                                ? 'z-10 bg-emerald-50 border-emerald-500 text-emerald-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                          currentPage === totalPages 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminTransactionsPage;
