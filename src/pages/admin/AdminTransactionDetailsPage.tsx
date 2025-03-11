import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Download,
  Package,
  FileText,
  Printer,
  MoreVertical,
  RefreshCw
} from 'lucide-react';
import { paymentApi } from '../../store/api/paymentApi';
import { format } from 'date-fns';

// Define a proper interface for the transaction data
interface Transaction {
  id: number;
  status: "pending" | "paid" | "failed";
  amount: string;
  createdAt: string;
  updatedAt?: string;
  orderId?: number;
  providerTransactionId?: string;
  providerTransactionDate?: string;
  metadata?: Record<string, any>;
}



const AdminTransactionDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [receiptFormat, setReceiptFormat] = useState<'text' | 'html'>('text');
  const [showReceiptOptions, setShowReceiptOptions] = useState(false);

  // Fetch transaction details
  const { 
    data: transactionDetails, 
    isLoading, 
    isError, 
    error,
    refetch
  } = paymentApi.useGetTransactionStatusQuery(Number(id), {
    skip: !id
  });

  // Format amount with currency
  const formatAmount = (amount: string) => {
    return `KES ${parseFloat(amount).toFixed(2)}`;
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
    
    const transaction = transactionDetails.data as Transaction;
    const metadata = transaction.metadata || {};
    const receiptDate = format(new Date(), 'MMMM dd, yyyy HH:mm:ss');
    const transactionDate = formatDate(transaction.createdAt);
    
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
              <div class="value">${formatAmount(transaction.amount)}</div>
            </div>
            <div class="item">
              <div class="label">Status</div>
              <div class="value">${transaction.status.toUpperCase()}</div>
            </div>
            ${metadata.phoneNumber ? `
            <div class="item">
              <div class="label">Phone Number</div>
              <div class="value">${metadata.phoneNumber}</div>
            </div>` : ''}
            ${metadata.mpesaReceipt ? `
            <div class="item">
              <div class="label">M-Pesa Receipt</div>
              <div class="value">${metadata.mpesaReceipt}</div>
            </div>` : ''}
            ${transaction.orderId ? `
            <div class="item">
              <div class="label">Order ID</div>
              <div class="value">#${transaction.orderId}</div>
            </div>` : ''}
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
    
    const transaction = transactionDetails.data as Transaction;
    const metadata = transaction.metadata || {};
    const receiptDate = format(new Date(), 'MMMM dd, yyyy HH:mm:ss');
    const transactionDate = formatDate(transaction.createdAt);
    
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
Amount: ${formatAmount(transaction.amount)}
Status: ${transaction.status.toUpperCase()}
${transaction.orderId ? `Order ID: #${transaction.orderId}` : ''}
${metadata.phoneNumber ? `Phone Number: ${metadata.phoneNumber}` : ''}
${metadata.mpesaReceipt ? `M-Pesa Receipt: ${metadata.mpesaReceipt}` : ''}

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
          <Link to="/admin/transactions" className="mt-4 inline-flex items-center text-emerald-600 hover:text-emerald-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Transactions
          </Link>
        </div>
      </div>
    );
  }

  const transaction = transactionDetails.data as Transaction;
  const metadata = transaction.metadata || {};

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/admin/transactions" className="inline-flex items-center text-emerald-600 hover:text-emerald-800">
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
          
          {/* More Actions */}
          <div className="relative">
            <button
              onClick={() => setShowActionMenu(!showActionMenu)}
              className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
            
            {showActionMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border">
                <div className="py-1">
                  {transaction.orderId && (
                    <button
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
                      onClick={() => {
                        setShowActionMenu(false);
                        // Additional action: navigate to order details
                        navigate(`/admin/orders/${transaction.orderId}`);
                      }}
                    >
                      <Package className="w-4 h-4 mr-2" />
                      View Related Order
                    </button>
                  )}
                  <button
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
                    onClick={() => {
                      setShowActionMenu(false);
                      // Implementation for manual verification would go here
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Verified
                  </button>
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
            {transaction.orderId && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Order ID</h3>
                <p className="text-gray-800">#{transaction.orderId}</p>
              </div>
            )}
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
              <h3 className="text-sm font-medium text-gray-500 mb-1">Created At</h3>
              <p className="text-gray-800">{formatDate(transaction.createdAt)}</p>
            </div>
            {transaction.providerTransactionId && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Provider Transaction ID</h3>
                <p className="text-gray-800">{transaction.providerTransactionId}</p>
              </div>
            )}
          </div>
        </div>

        {/* Metadata & Payment Details */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Details</h2>
          
          {/* If metadata exists */}
          {metadata && Object.keys(metadata).length > 0 ? (
            <div className="space-y-4">
              {metadata.phoneNumber && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Phone Number</h3>
                  <p className="text-gray-800">{metadata.phoneNumber}</p>
                </div>
              )}
              {metadata.mpesaReceipt && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">M-Pesa Receipt Number</h3>
                  <p className="text-gray-800">{metadata.mpesaReceipt}</p>
                </div>
              )}
              {metadata.resultDesc && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Transaction Description</h3>
                  <p className="text-gray-800">{metadata.resultDesc}</p>
                </div>
              )}
              {metadata.completedAt && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Completed At</h3>
                  <p className="text-gray-800">{formatDate(metadata.completedAt)}</p>
                </div>
              )}
              {metadata.checkoutRequestId && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Checkout Request ID</h3>
                  <p className="text-gray-800">{metadata.checkoutRequestId}</p>
                </div>
              )}
              {metadata.merchantRequestId && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Merchant Request ID</h3>
                  <p className="text-gray-800">{metadata.merchantRequestId}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic">No additional payment details available</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        {transaction.orderId && (
          <Link 
            to={`/admin/orders/${transaction.orderId}`}
            className="bg-white text-emerald-600 border border-emerald-600 px-6 py-2 rounded-lg hover:bg-emerald-50 inline-flex items-center justify-center"
          >
            <Package className="w-4 h-4 mr-2" />
            View Related Order
          </Link>
        )}
        <button
          onClick={() => navigate("/admin/transactions")}
          className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-200 inline-flex items-center justify-center"
        >
          Back to All Transactions
        </button>
      </div>

      {/* Activity Log/Timeline (simplified version) */}
      <div className="mt-8 bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Activity Timeline</h2>
        <div className="border-l-2 border-gray-200 ml-3">
          {/* Transaction Created */}
          <div className="relative pb-8">
            <div className="absolute -left-[9px] mt-1.5 h-4 w-4 rounded-full bg-emerald-500"></div>
            <div className="ml-6">
              <h3 className="text-sm font-medium text-gray-900">Transaction Created</h3>
              <p className="mt-1 text-sm text-gray-500">{formatDate(transaction.createdAt)}</p>
              <p className="mt-1 text-sm text-gray-600">Transaction was initiated with amount {formatAmount(transaction.amount)}</p>
            </div>
          </div>
          
          {/* Provider Transaction Response */}
          {transaction.providerTransactionId && (
            <div className="relative pb-8">
              <div className="absolute -left-[9px] mt-1.5 h-4 w-4 rounded-full bg-blue-500"></div>
              <div className="ml-6">
                <h3 className="text-sm font-medium text-gray-900">Provider Response Received</h3>
                <p className="mt-1 text-sm text-gray-500">{transaction.providerTransactionDate ? formatDate(transaction.providerTransactionDate) : 'Unknown time'}</p>
                <p className="mt-1 text-sm text-gray-600">Payment provider assigned transaction ID: {transaction.providerTransactionId}</p>
              </div>
            </div>
          )}
          
          {/* Status Update */}
          <div className="relative">
            <div className={`absolute -left-[9px] mt-1.5 h-4 w-4 rounded-full ${
              transaction.status === 'paid' ? 'bg-green-500' : 
              transaction.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <div className="ml-6">
              <h3 className="text-sm font-medium text-gray-900">Status Updated to {transaction.status.toUpperCase()}</h3>
              <p className="mt-1 text-sm text-gray-500">{metadata.completedAt ? formatDate(metadata.completedAt) : transaction.updatedAt ? formatDate(transaction.updatedAt) : 'Unknown time'}</p>
              <p className="mt-1 text-sm text-gray-600">
                {transaction.status === 'paid' ? 'Payment was successfully processed and confirmed.' : 
                 transaction.status === 'pending' ? 'Payment is still being processed by the provider.' : 
                 'Payment failed or was declined.'}
                {metadata.resultDesc && ` Reason: ${metadata.resultDesc}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTransactionDetailsPage;