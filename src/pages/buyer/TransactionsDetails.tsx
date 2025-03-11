import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState } from 'react';
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
  FileText,
  Printer,
} from 'lucide-react';
import { format } from 'date-fns';

const TransactionDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showReceiptOptions, setShowReceiptOptions] = useState(false);
  const [receiptFormat, setReceiptFormat] = useState<'pdf' | 'html'>('pdf');

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

  // Generate HTML receipt
  const generateHtmlReceipt = (transaction: any, orderData: any, productData: any, farmerData: any, metadata: any) => {
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
            color: #2563eb;
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
              <div class="label">Payment Method</div>
              <div class="value">${transaction.paymentMethod.toUpperCase()}</div>
            </div>
            <div class="item">
              <div class="label">Amount</div>
              <div class="value">${formatAmount(transaction.amount)}</div>
            </div>
            <div class="item">
              <div class="label">Status</div>
              <div class="value">${transaction.status.toUpperCase()}</div>
            </div>
            <div class="item">
              <div class="label">Order ID</div>
              <div class="value">#${orderData.id}</div>
            </div>
            ${transaction.providerTransactionId ? `
            <div class="item">
              <div class="label">Provider Transaction ID</div>
              <div class="value">${transaction.providerTransactionId}</div>
            </div>` : ''}
            ${metadata?.mpesaReceipt ? `
            <div class="item">
              <div class="label">M-Pesa Receipt</div>
              <div class="value">${metadata.mpesaReceipt}</div>
            </div>` : ''}
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Product Information</div>
          <div class="grid">
            <div class="item">
              <div class="label">Product</div>
              <div class="value">${productData.name}</div>
            </div>
            <div class="item">
              <div class="label">Category</div>
              <div class="value">${productData.category}</div>
            </div>
            <div class="item">
              <div class="label">Quantity</div>
              <div class="value">${orderData.quantity} ${productData.unit}</div>
            </div>
            <div class="item">
              <div class="label">Price per Unit</div>
              <div class="value">KES ${(parseFloat(orderData.totalPrice) / parseFloat(orderData.quantity)).toFixed(2)}</div>
            </div>
          </div>
          <div class="total">Total: ${formatAmount(orderData.totalPrice)}</div>
        </div>
        
        <div class="section">
          <div class="section-title">Seller Information</div>
          <div class="grid">
            <div class="item">
              <div class="label">Seller Name</div>
              <div class="value">${farmerData.user.name}</div>
            </div>
            <div class="item">
              <div class="label">Contact</div>
              <div class="value">${farmerData.user.phoneNumber}</div>
            </div>
          </div>
        </div>
        
        <div class="note">
          This is an electronically generated receipt. No signature is required.
        </div>
        
        <div class="footer">
          <p>Thank you for shopping with SmartFarm!</p>
          <p>&copy; ${new Date().getFullYear()} SmartFarm. All rights reserved.</p>
        </div>
        
        <div class="no-print" style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Receipt</button>
        </div>
      </body>
      </html>
    `;
  };

  // Generate text receipt
  const generateTextReceipt = (transaction: any, orderData: any, productData: any, farmerData: any, metadata: any) => {
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
Payment Method: ${transaction.paymentMethod.toUpperCase()}
Amount: ${formatAmount(transaction.amount)}
Status: ${transaction.status.toUpperCase()}
Order ID: #${orderData.id}
${transaction.providerTransactionId ? `Provider Transaction ID: ${transaction.providerTransactionId}` : ''}
${metadata?.mpesaReceipt ? `M-Pesa Receipt: ${metadata.mpesaReceipt}` : ''}

PRODUCT INFORMATION
-------------------------------------------
Product: ${productData.name}
Category: ${productData.category}
Quantity: ${orderData.quantity} ${productData.unit}
Price per Unit: KES ${(parseFloat(orderData.totalPrice) / parseFloat(orderData.quantity)).toFixed(2)}
TOTAL: ${formatAmount(orderData.totalPrice)}

SELLER INFORMATION
-------------------------------------------
Seller Name: ${farmerData.user.name}
Contact: ${farmerData.user.phoneNumber}

-------------------------------------------
This is an electronically generated receipt.
No signature is required.

Thank you for shopping with SmartFarm!
© ${new Date().getFullYear()} SmartFarm. All rights reserved.
===========================================
    `;
  };

  // Download receipt 
  const downloadReceipt = () => {
    if (!transactionDetails) return;
    
    setIsDownloading(true);
    try {
      const transaction = transactionDetails.data;
      const orderData = transaction.order;
      const productData = orderData.listing.product;
      const farmerData = orderData.listing.farmer;
      const metadata = transaction.metadata;
      
      // Generate receipt based on selected format
      let content = '';
      let filename = '';
      let type = '';
      
      if (receiptFormat === 'html') {
        content = generateHtmlReceipt(transaction, orderData, productData, farmerData, metadata);
        filename = `smartfarm-receipt-${transaction.id}.html`;
        type = 'text/html';
      } else {
        content = generateTextReceipt(transaction, orderData, productData, farmerData, metadata);
        filename = `smartfarm-receipt-${transaction.id}.txt`;
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
    if (!transactionDetails) return;
    
    try {
      const transaction = transactionDetails.data;
      const orderData = transaction.order;
      const productData = orderData.listing.product;
      const farmerData = orderData.listing.farmer;
      const metadata = transaction.metadata;
      
      // Generate HTML receipt and open in new window
      const content = generateHtmlReceipt(transaction, orderData, productData, farmerData, metadata);
      
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
        <div className="mt-4 md:mt-0 relative">
          <button 
            className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 inline-flex items-center"
            onClick={() => setShowReceiptOptions(!showReceiptOptions)}
            disabled={transaction.status !== 'paid'}
          >
            <Download className="w-4 h-4 mr-2" />
            {transaction.status === 'paid' ? 'Receipt Options' : 'No Receipt Available'}
          </button>
          
          {showReceiptOptions && transaction.status === 'paid' && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-10 border">
              <div className="p-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Receipt Options</p>
                
                <button
                  onClick={downloadReceipt}
                  disabled={isDownloading}
                  className="w-full mb-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 flex items-center"
                >
                  {isDownloading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-opacity-20 rounded-full border-t-opacity-90 mr-2"></div>
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
                        checked={receiptFormat === 'pdf'}
                        onChange={() => setReceiptFormat('pdf')}
                        className="form-radio text-blue-600"
                      />
                      <span className="text-xs text-gray-700">Text</span>
                    </label>
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="radio"
                        name="receiptFormat"
                        checked={receiptFormat === 'html'}
                        onChange={() => setReceiptFormat('html')}
                        className="form-radio text-blue-600"
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