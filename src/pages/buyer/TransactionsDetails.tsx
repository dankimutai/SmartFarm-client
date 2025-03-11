import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { paymentApi } from '../../store/api/paymentApi';
import { 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Download,
  ShoppingBag,
  User,
  Package,
} from 'lucide-react';
import { format } from 'date-fns';

const TransactionDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  const { 
    data: transactionDetails, 
    isLoading, 
    isError, 
    error 
  } = paymentApi.useGetTransactionDetailsQuery(
    { id: Number(id), userId: userId || 0 },
    { skip: !id || !userId }
  );

  // Format amount with currency
  const formatAmount = (amount: string) => {
    return `KES ${parseFloat(amount).toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMMM dd, yyyy HH:mm:ss');
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
        return <CheckCircle className="w-5 h-5" />;
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (isError || !transactionDetails) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-8 text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h3 className="text-xl font-semibold">Error Loading Transaction</h3>
          <p className="text-gray-600 mt-2">
            {error instanceof Error ? error.message : 'Transaction not found or you do not have permission to view it.'}
          </p>
          <Link to="/buyer/transactions" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Transactions
          </Link>
        </div>
      </div>
    );
  }

  const transaction = transactionDetails.data;
  const orderData = transaction.order;
  const productData = orderData.listing.product;
  const farmerData = orderData.listing.farmer;
  const metadata = transaction.metadata as Record<string, any>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/buyer/transactions" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Transactions
        </Link>
      </div>

      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Transaction Details</h1>
          <p className="text-gray-600">Transaction #{transaction.id}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 inline-flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Download Receipt
          </button>
        </div>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <div className={`p-3 rounded-full ${
              transaction.status === 'paid' ? 'bg-green-100' : 
              transaction.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              {getStatusIcon(transaction.status)}
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-800">{formatAmount(transaction.amount)}</h2>
              <div className="flex items-center mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                  {transaction.status.toUpperCase()}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  {format(new Date(transaction.createdAt), 'MMMM dd, yyyy')}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Payment Method</span>
            <span className="text-md font-medium text-gray-800 capitalize">
              {transaction.paymentMethod}
              {metadata?.mpesaReceipt && (
                <span className="ml-2 text-sm text-gray-500">
                  (Receipt: {metadata.mpesaReceipt})
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transaction Details */}
        <div className="bg-white rounded-xl shadow lg:col-span-2">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Transaction Information</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Transaction ID</h3>
                <p className="text-gray-800">#{transaction.id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Order ID</h3>
                <p className="text-gray-800">#{orderData.id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Payment Method</h3>
                <p className="text-gray-800 capitalize">{transaction.paymentMethod}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Amount</h3>
                <p className="text-gray-800">{formatAmount(transaction.amount)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                  {getStatusIcon(transaction.status)}
                  <span className="ml-1 capitalize">{transaction.status}</span>
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Date</h3>
                <p className="text-gray-800">{formatDate(transaction.createdAt)}</p>
              </div>
              {transaction.providerTransactionId && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Provider Transaction ID</h3>
                  <p className="text-gray-800">{transaction.providerTransactionId}</p>
                </div>
              )}
              {transaction.providerTransactionDate && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Provider Transaction Date</h3>
                  <p className="text-gray-800">{formatDate(transaction.providerTransactionDate)}</p>
                </div>
              )}
            </div>

            {/* M-Pesa specific details */}
            {transaction.paymentMethod === 'mpesa' && metadata && (
              <div className="mt-8">
                <h3 className="text-sm font-medium text-gray-500 mb-3">M-Pesa Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {metadata.phoneNumber && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 mb-1">Phone Number</h4>
                        <p className="text-gray-800">{metadata.phoneNumber}</p>
                      </div>
                    )}
                    {metadata.mpesaReceipt && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 mb-1">M-Pesa Receipt Number</h4>
                        <p className="text-gray-800">{metadata.mpesaReceipt}</p>
                      </div>
                    )}
                    {metadata.resultDesc && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 mb-1">Transaction Description</h4>
                        <p className="text-gray-800">{metadata.resultDesc}</p>
                      </div>
                    )}
                    {metadata.completedAt && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 mb-1">Completed At</h4>
                        <p className="text-gray-800">{formatDate(metadata.completedAt)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order and Product Details */}
        <div className="bg-white rounded-xl shadow lg:col-span-1">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Order Details</h2>
          </div>
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <ShoppingBag className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-md font-medium text-gray-800">Product Information</h3>
              </div>
              <div className="ml-7">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Product Name</h4>
                <p className="text-gray-800 mb-3">{productData.name}</p>
                
                <h4 className="text-sm font-medium text-gray-500 mb-1">Category</h4>
                <p className="text-gray-800 mb-3">{productData.category}</p>
                
                <h4 className="text-sm font-medium text-gray-500 mb-1">Quantity</h4>
                <p className="text-gray-800 mb-3">{orderData.quantity} {productData.unit}</p>

                <h4 className="text-sm font-medium text-gray-500 mb-1">Total Price</h4>
                <p className="text-gray-800 font-medium">{formatAmount(orderData.totalPrice)}</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center mb-4">
                <User className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-md font-medium text-gray-800">Seller Information</h3>
              </div>
              <div className="ml-7">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Seller Name</h4>
                <p className="text-gray-800 mb-3">{farmerData.user.name}</p>
                
                <h4 className="text-sm font-medium text-gray-500 mb-1">Contact</h4>
                <p className="text-gray-800 mb-3">{farmerData.user.phoneNumber}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center mb-4">
                <Package className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-md font-medium text-gray-800">Order Status</h3>
              </div>
              <div className="ml-7">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Order Status</h4>
                <p className="text-gray-800 mb-3 capitalize">{orderData.orderStatus}</p>
                
                <h4 className="text-sm font-medium text-gray-500 mb-1">Payment Status</h4>
                <p className="text-gray-800 mb-3 capitalize">{orderData.paymentStatus}</p>
                
                <h4 className="text-sm font-medium text-gray-500 mb-1">Order Date</h4>
                <p className="text-gray-800">{formatDate(orderData.createdAt)}</p>
              </div>
            </div>

            <div className="mt-8">
              <Link 
                to={`/buyer/orders/${orderData.id}`} 
                className="inline-block w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-center hover:bg-blue-700"
              >
                View Order Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsPage;