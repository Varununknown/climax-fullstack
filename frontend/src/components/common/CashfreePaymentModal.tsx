import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CashfreeService from '../services/cashfreeService';

interface CashfreePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
  contentTitle: string;
  amount: number;
  onPaymentSuccess: () => void;
}

export const CashfreePaymentModal: React.FC<CashfreePaymentModalProps> = ({
  isOpen,
  onClose,
  contentId,
  contentTitle,
  amount,
  onPaymentSuccess
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentInitiated, setPaymentInitiated] = useState(false);

  if (!isOpen) return null;

  const handlePayment = async () => {
    if (!user) {
      setError('Please login to make payment');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Initiate payment
      const paymentResponse = await CashfreeService.initiatePayment(
        user._id,
        contentId,
        amount,
        user.email,
        user.phone || '9999999999',
        user.name
      );

      if (paymentResponse.success) {
        console.log('✅ Payment response:', JSON.stringify(paymentResponse, null, 2));
        
        // Store order ID in session storage
        sessionStorage.setItem('cashfreeOrderId', paymentResponse.orderId);
        sessionStorage.setItem('cashfreeSessionId', paymentResponse.sessionId);
        sessionStorage.setItem('cashfreeContentId', contentId);

        if (!paymentResponse.sessionId) {
          setError('❌ Failed to get payment session. Please try again.');
          return;
        }

        // 🔗 Direct redirect to Cashfree hosted checkout
        const checkoutUrl = `https://sandbox.cashfree.com/pg/checkout/?sessionId=${encodeURIComponent(paymentResponse.sessionId)}`;
        
        console.log('🌐 Redirecting to Cashfree checkout:', checkoutUrl);
        
        setError('⏳ Opening payment gateway...');
        setTimeout(() => {
          window.location.href = checkoutUrl;
        }, 500);
        
        setPaymentInitiated(true);
      } else {
        setError(paymentResponse.message || 'Failed to initiate payment');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Unlock Content</h2>

        {/* Content Details */}
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <p className="text-gray-700 mb-2">
            <span className="font-semibold">Content:</span> {contentTitle}
          </p>
          <p className="text-2xl font-bold text-green-600">
            ₹{amount}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Payment Methods Info */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-700">
            💳 <span className="font-semibold">Payment Methods:</span>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            • Credit/Debit Cards
            <br />
            • UPI
            <br />
            • Net Banking
            <br />
            • Wallets
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={loading || paymentInitiated}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold"
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </div>

        {/* Secure Badge */}
        <div className="text-center mt-4 text-sm text-gray-500">
          🔒 Payments powered by Cashfree - 100% secure
        </div>
      </div>
    </div>
  );
};

export default CashfreePaymentModal;
