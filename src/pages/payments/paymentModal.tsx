import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { paymentApi } from '../../store/api/paymentApi';
import { RiShieldCheckLine, RiPhoneLine, RiAlertLine } from 'react-icons/ri';
import { toast } from 'react-hot-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  amount: number;
  onSuccess: (id: number) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  orderId,
  amount,
  onSuccess
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [id, setTransactionId] = useState<number | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'failed' | null>(null);
  const [pollingCount, setPollingCount] = useState(0);

  // RTK Query hooks
  const [initiatePayment, { isLoading: isInitiating }] = 
    paymentApi.useInitiatePaymentMutation();

    const { data: transactionStatus, refetch: _refetchStatus } = 
    paymentApi.useGetTransactionStatusQuery(id || 0, { 
      skip: !id,
      pollingInterval: paymentStatus === 'pending' ? 5000 : 0  // Poll every 5 seconds if pending
    });
    
  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setPaymentStatus(null);
      setTransactionId(null);
      setErrorMessage(null);
      setPollingCount(0);
    }
  }, [isOpen]);

  // Monitor transaction status changes
  useEffect(() => {
    if (transactionStatus?.data) {
      setPaymentStatus(transactionStatus.data.status);
      
      // If payment is successful, trigger success callback
      if (transactionStatus.data.status === 'paid') {
        toast.success('Payment completed successfully!');
        onSuccess(transactionStatus.data.id);
      }
      
      // If payment failed, show error
      if (transactionStatus.data.status === 'failed') {
        setErrorMessage('Payment failed. Please try again.');
        toast.error('Payment failed');
      }
      
      // Track polling to limit attempts
      if (transactionStatus.data.status === 'pending') {
        setPollingCount(prev => prev + 1);
      }
    }
  }, [transactionStatus, onSuccess]);
  
  // Stop polling after certain number of attempts
  useEffect(() => {
    if (pollingCount > 24 && paymentStatus === 'pending') {
      setErrorMessage('Payment confirmation is taking longer than expected. Please check your M-Pesa and refresh this page.');
    }
  }, [pollingCount, paymentStatus]);

  // Format and validate phone number
  const formatPhoneNumber = (input: string): string => {
    // Remove non-numeric characters
    const numericOnly = input.replace(/\D/g, '');
    
    // Format as 254XXXXXXXXX
    if (numericOnly.startsWith('254')) {
      return numericOnly;
    } else if (numericOnly.startsWith('0')) {
      return `254${numericOnly.substring(1)}`;
    } else if (numericOnly.startsWith('7') || numericOnly.startsWith('1')) {
      return `254${numericOnly}`;
    }
    
    return numericOnly;
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const validatePhoneNumber = (): boolean => {
    const regex = /^254[0-9]{9}$/;
    return regex.test(phoneNumber);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (!validatePhoneNumber()) {
      setErrorMessage('Please enter a valid phone number (format: 254XXXXXXXXX)');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await initiatePayment({
        orderId,
        phoneNumber,
        amount
      }).unwrap();
      
      if (response.success) {
        setTransactionId(response.data.transactionId);
        setPaymentStatus('pending');
        toast.success('Payment initiated! Check your phone.');
      } else if (response.error) {
        setErrorMessage(response.error.details || 'Failed to initiate payment');
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setErrorMessage(err?.data?.message || err?.error || 'An error occurred while initiating payment');
    } finally {
      setIsLoading(false);
    }
  };

  // Show appropriate UI based on payment status
  const renderPaymentStatus = () => {
    switch (paymentStatus) {
      case 'pending':
        return (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h3 className="text-lg font-medium text-yellow-800 flex items-center">
              <RiAlertLine className="w-5 h-5 mr-2" />
              Payment Pending
            </h3>
            <p className="mt-2 text-sm text-yellow-700">
              Please check your phone and complete the payment through M-Pesa.
              This page will automatically update when the payment is confirmed.
            </p>
            <div className="mt-3 flex items-center justify-center">
              <LoadingSpinner size="md" />
              <span className="ml-2 text-sm text-yellow-700">Waiting for confirmation...</span>
            </div>
          </div>
        );
        
      case 'paid':
        return (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <h3 className="text-lg font-medium text-green-800 flex items-center">
              <RiShieldCheckLine className="w-5 h-5 mr-2" />
              Payment Successful!
            </h3>
            <p className="mt-2 text-sm text-green-700">
              Your payment has been confirmed. Thank you for your purchase.
            </p>
            <div className="mt-4">
              <Button 
                onClick={onClose} 
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Continue
              </Button>
            </div>
          </div>
        );
        
      case 'failed':
        return (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <h3 className="text-lg font-medium text-red-800 flex items-center">
              <RiAlertLine className="w-5 h-5 mr-2" />
              Payment Failed
            </h3>
            <p className="mt-2 text-sm text-red-700">
              The payment was not successful. Please try again or use a different phone number.
            </p>
            <div className="mt-4">
              <Button 
                onClick={() => {
                  setPaymentStatus(null);
                  setTransactionId(null);
                  setErrorMessage(null);
                }} 
                variant="primary"
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Try Again
              </Button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Your Payment</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {errorMessage && (
            <div className="mb-4">
              <Alert 
                variant="error" 
                title="Error" 
                message={errorMessage} 
              />
            </div>
          )}
          
          {!paymentStatus ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-md mb-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Amount:</span>
                  <span>KES {amount.toLocaleString()}</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Order ID: #{orderId}
                </div>
              </div>
              
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  M-Pesa Phone Number
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <RiPhoneLine className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="text"
                    required
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange}
                    placeholder="254XXXXXXXXX"
                    className="block w-full pl-10 pr-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Format: 254XXXXXXXXX (e.g., 254712345678)
                </p>
              </div>
              
              <div className="mt-2 text-sm text-gray-500">
                <p>An M-Pesa payment request will be sent to your phone.</p>
                <p>Enter your M-Pesa PIN when prompted to complete the payment.</p>
              </div>
              
              <DialogFooter className="mt-6">
                <Button
                  variant="outline"
                  onClick={onClose}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={isLoading || isInitiating}
                >
                  {isLoading || isInitiating ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Pay with M-Pesa'
                  )}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            renderPaymentStatus()
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;