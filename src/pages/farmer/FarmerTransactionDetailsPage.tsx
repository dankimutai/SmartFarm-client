import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { paymentApi } from '../../store/api/paymentApi';
import { format } from 'date-fns';
import { 
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Package,
  FileText,
  Printer,
  RefreshCw
} from 'lucide-react';

const FarmerTransactionDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id || 0;
  
  const [showReceiptOptions, setShowReceiptOptions] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [receiptFormat, setReceiptFormat] = useState<'text' | 'html'>('text');

  // Fetch transaction details
  const { 
    data: transactionDetails, 
    isLoading, 
    isError, 
    error,
    refetch
  } = paymentApi.useGetTransactionDetailsQuery(
    { id: Number(id), userId }, 
    { skip: !id || !userId }
  );

  // Format amount with currency
  const formatAmount = (amount: string, currency: string = 'KES') => {
    return `${currency} ${parseFloat(amount).toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
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

  // Generate HTML receipt
  const generateHtmlReceipt = () => {
    if (!transactionDetails?.data) return '';
    
    const transaction = transactionDetails.data;
    const receiptDate = format(new Date(), 'MMMM dd, yyyy HH:mm:ss');
    const transactionDate = formatDate(transaction.createdAt);
    const buyerName = transaction.order.buyer.user.name;
    const productName = transaction.order.listing.product.name;
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Transaction Receipt - #${transaction.id}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 1px solid #eee;
            padding-bottom: 20px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #047857;
            margin-bottom: 5px;
          }
          .receipt-title {
            font-size: 18px;
            margin-bottom: 5px;
          }
          .receipt-date {
            color: #666;
            font-size: 14px;
          }
          .status {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 14px;
            font-weight: bold;
            margin: 10px 0;
          }
          .status-paid {
            background-color: #d1fae5;
            color: #065f46;
          }
          .status-pending {
            background-color: #fef3c7;
            color: #92400e;
          }
          .status-failed {
            background-color: #fee2e2;
            color: #b91c1c;
          }
          .section {
            margin-bottom: 25px;
            border: 1px solid #eee;
            border-radius: 5px;
            padding: 15px;
          }
          .section-title {
            font-weight: bold;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 1px solid #eee;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          .item {
            margin-bottom: 10px;
          }
          .label {
            color: #666;
            font-size: 14px;
            margin-bottom: 3px;
          }
          .value {
            font-weight: bold;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 14px;
            color: #666;
            border-top: 1px solid #eee;
            padding-top: 20px;
          }
          .total {
            font-size: 18px;
            font-weight: bold;
            margin: 15px 0;
          }
          .note {
            font-style: italic;
            margin-top: 20px;
            font-size: 14px;
          }
          @media print {
            body {
              padding: 0;
              margin: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">SmartFarm</div>
          <div class="receipt-title">PAYMENT RECEIPT</div>
          <div class="receipt-date">Generated on: ${receiptDate}</div>
          <div class="status status-${transaction.status}">${transaction.status.toUpperCase()}</div>
        </div>
        
        <div class="section">
          <div class="section-title">Transaction Details</div>
          <div class="grid">
            <div class="item">
              <div class="label">Transaction ID</div>
              <div class="value">#${transaction.id}</div>
            </div>
            <div class="item">
              <div class="label">Date</div>
              <div class="value">${transactionDate}</div>
            </div>
            <div class="item">
              <div class="label">Amount</div>
              <div class="value">${formatAmount(transaction.amount, transaction.currency)}</div>
            </div>
            <div class="item">
              <div class="label">Status</div>
              <div class="value">${transaction.status.toUpperCase()}</div>
            </div>
            <div class="item">
              <div class="label">Order ID</div>
              <div class="value">#${transaction.orderId}</div>
            </div>
            <div class="item">
              <div class="label">Payment Method</div>
              <div class="value">${transaction.paymentMethod}</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Product Information</div>
          <div class="grid">
            <div class="item">
              <div class="label">Product</div>
              <div class="value">${productName}</div>
            </div>
            <div class="item">
              <div class="label">Quantity</div>
              <div class="value">${transaction.order.quantity} ${transaction.order.listing.product.unit}</div>
            </div>
            <div class="item">
              <div class="label">Buyer</div>
              <div class="value">${buyerName}</div>
            </div>
            <div class="item">
              <div class="label">Buyer Contact</div>
              <div class="value">${transaction.order.buyer.user.phoneNumber}</div>
            </div>
          </div>
        </div>
        
        <div class="note">
          This is an electronically generated receipt. No signature is required.
        </div>
        
        <div class="footer">
          <p>SmartFarm Transaction System</p>
          <p>&copy; ${new Date().getFullYear()} SmartFarm. All rights reserved.</p>
        </div>
        
        <div class="no-print" style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #047857; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Receipt</button>
        </div>
      </body>
      </html>
    `;
  };

  // Generate text receipt
  const generateTextReceipt = () => {
    if (!transactionDetails?.data) return '';
    
    const transaction = transactionDetails.data;
    const receiptDate = format(new Date(), 'MMMM dd, yyyy HH:mm:ss');
    const transactionDate = formatDate(transaction.createdAt);
    const buyerName = transaction.order.buyer.user.name;
    const productName = transaction.order.listing.product.name;
    
    return `
===========================================
              SMARTFARM
         TRANSACTION RECEIPT
===========================================
Generated: ${receiptDate}
Status: ${transaction.status.toUpperCase()}

TRANSACTION DETAILS
-------------------------------------------
Transaction ID: #${transaction.id}
Date: ${transactionDate}
Amount: ${formatAmount(transaction.amount, transaction.currency)}
Status: ${transaction.status.toUpperCase()}
Order ID: #${transaction.orderId}
Payment Method: ${transaction.paymentMethod}

PRODUCT INFORMATION
-------------------------------------------
Product: ${productName}
Quantity: ${transaction.order.quantity} ${transaction.order.listing.product.unit}
Buyer: ${buyerName}
Buyer Contact: ${transaction.order.buyer.user.phoneNumber}

-------------------------------------------
This is an electronically generated receipt.
No signature is required.

© ${new Date().getFullYear()} SmartFarm. All rights reserved.
===========================================
    `;
  };

  // Download receipt 
  const downloadReceipt = () => {
    if (!transactionDetails?.data) return;
    
    setIsDownloading(true);
    try {
      // Generate receipt based on selected format
      let content = '';
      let filename = '';
      let type = '';
      
      if (receiptFormat === 'html') {
        content = generateHtmlReceipt();
        filename = `smartfarm-receipt-${id}.html`;
        type = 'text/html';
      } else {
        content = generateTextReceipt();
        filename = `smartfarm-receipt-${id}.txt`;
        type = 'text/plain';
      }
      
      // Create and download the file
      const blob = new Blob([content], { type: `${type};charset=utf-8;` });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating receipt:', error);
      alert('Failed to generate receipt. Please try again.');
    } finally {
      setIsDownloading(false);
      setShowReceiptOptions(false);
    }
  };

  // Print receipt
  const printReceipt = () => {
    if (!transactionDetails?.data) return;
    
    try {
      // Generate HTML receipt and open in new window
      const content = generateHtmlReceipt();
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.focus();
        
        // Add a slight delay before printing to ensure the content is fully loaded
        setTimeout(() => {
          printWindow.print();
        }, 500);
      } else {
        alert('Please allow pop-ups to print the receipt.');
      }
    } catch (error) {
      console.error('Error printing receipt:', error);
      alert('Failed to print receipt. Please try again.');
    } finally {
      setShowReceiptOptions(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto"></div>
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
            {error instanceof Error ? error.message : 'Transaction not found.'}
          </p>
          <Link to="/farmer/transactions" className="mt-4 inline-flex items-center text-emerald-600 hover:text-emerald-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Transactions
          </Link>
        </div>
      </div>
    );
  }

  const transaction = transactionDetails.data;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/farmer/transactions" className="inline-flex items-center text-emerald-600 hover:text-emerald-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Transactions
        </Link>
      </div>

      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Transaction Details</h1>
          <p className="text-gray-600">Transaction #{transaction.id}</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          {/* Refresh Button */}
          <button
            onClick={() => refetch()}
            className="bg-gray-50 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 inline-flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          
          {/* Receipt Options */}
          <div className="relative">
            <button 
              className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-100 inline-flex items-center"
              onClick={() => setShowReceiptOptions(!showReceiptOptions)}
            >
              <Download className="w-4 h-4 mr-2" />
              Receipt Options
            </button>
            
            {showReceiptOptions && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-10 border">
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Receipt Options</p>
                  
                  <button
                    onClick={downloadReceipt}
                    disabled={isDownloading}
                    className="w-full mb-2 px-3 py-2 text-sm bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 flex items-center"
                  >
                    {isDownloading ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-emerald-600 border-opacity-20 rounded-full border-t-opacity-90 mr-2"></div>
                        <span>Downloading...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        <span>Download Receipt</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={printReceipt}
                    className="w-full px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded hover:bg-gray-100 flex items-center"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    <span>Print Receipt</span>
                  </button>
                  
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-500 mb-2">Download Format</p>
                    <div className="flex space-x-2">
                      <label className="flex items-center space-x-1 cursor-pointer">
                        <input
                          type="radio"
                          name="receiptFormat"
                          checked={receiptFormat === 'text'}
                          onChange={() => setReceiptFormat('text')}
                          className="form-radio text-emerald-600"
                        />
                        <span className="text-xs text-gray-700">Text</span>
                      </label>
                      <label className="flex items-center space-x-1 cursor-pointer">
                        <input
                          type="radio"
                          name="receiptFormat"
                          checked={receiptFormat === 'html'}
                          onChange={() => setReceiptFormat('html')}
                          className="form-radio text-emerald-600"
                        />
                        <span className="text-xs text-gray-700">HTML</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
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
              <h2 className="text-xl font-semibold text-gray-800">{formatAmount(transaction.amount, transaction.currency)}</h2>
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
          
          <div className="bg-gray-50 px-4 py-2 rounded-lg">
            <span className="text-sm text-gray-500">Order</span>
            <div className="text-lg font-medium text-gray-800">#{transaction.orderId}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Transaction Details */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Transaction Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Transaction ID</h3>
              <p className="text-gray-800">#{transaction.id}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Order ID</h3>
              <p className="text-gray-800">#{transaction.orderId}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Amount</h3>
              <p className="text-gray-800">{formatAmount(transaction.amount, transaction.currency)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                {getStatusIcon(transaction.status)}
                <span className="ml-1 capitalize">{transaction.status}</span>
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Created At</h3>
              <p className="text-gray-800">{formatDate(transaction.createdAt)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Payment Method</h3>
              <p className="text-gray-800">{transaction.paymentMethod}</p>
            </div>
            {transaction.providerTransactionId && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Provider Transaction ID</h3>
                <p className="text-gray-800">{transaction.providerTransactionId}</p>
              </div>
            )}
          </div>
        </div>

        {/* Order and Buyer Details */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Details</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Product</h3>
              <p className="text-gray-800">{transaction.order.listing.product.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Quantity</h3>
              <p className="text-gray-800">{transaction.order.quantity} {transaction.order.listing.product.unit}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Price</h3>
              <p className="text-gray-800">{formatAmount(transaction.order.totalPrice)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Order Status</h3>
              <p className="text-gray-800 capitalize">{transaction.order.orderStatus}</p>
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Buyer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs text-gray-500 mb-1">Name</h3>
                  <p className="text-gray-800">{transaction.order.buyer.user.name}</p>
                </div>
                <div>
                  <h3 className="text-xs text-gray-500 mb-1">Phone</h3>
                  <p className="text-gray-800">{transaction.order.buyer.user.phoneNumber}</p>
                </div>
                {transaction.order.buyer.companyName && (
                  <div>
                    <h3 className="text-xs text-gray-500 mb-1">Company</h3>
                    <p className="text-gray-800">{transaction.order.buyer.companyName}</p>
                  </div>
                )}
                {transaction.order.buyer.businessType && (
                  <div>
                    <h3 className="text-xs text-gray-500 mb-1">Business Type</h3>
                    <p className="text-gray-800">{transaction.order.buyer.businessType}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Link 
          to={`/farmer/orders/${transaction.orderId}`}
          className="bg-white text-emerald-600 border border-emerald-600 px-6 py-2 rounded-lg hover:bg-emerald-50 inline-flex items-center justify-center"
        >
          <Package className="w-4 h-4 mr-2" />
          View Order Details
        </Link>
        <button
          onClick={() => navigate("/farmer/transactions")}
          className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-200 inline-flex items-center justify-center"
        >
          Back to All Transactions
        </button>
      </div>
    </div>
  );
};

export default FarmerTransactionDetailsPage;
