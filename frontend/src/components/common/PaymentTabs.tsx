import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import CashfreeService from '../../services/cashfreeService';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PaymentTabsProps {
  contentId: string;
  contentTitle: string;
  amount: number;
  onPaymentSuccess: () => void;
  onClose: () => void;
}

export const PaymentTabs: React.FC<PaymentTabsProps> = ({
  contentId,
  contentTitle,
  amount,
  onPaymentSuccess,
  onClose
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'cashfree' | 'upi'>('cashfree');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleCashfreePayment = async () => {
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
        // Store order ID in session storage
        sessionStorage.setItem('cashfreeOrderId', paymentResponse.orderId);
        sessionStorage.setItem('cashfreeContentId', contentId);

        // Open Cashfree checkout
        if (window.Cashfree) {
          const checkoutOptions = {
            paymentSessionId: paymentResponse.paymentSessionId,
            redirectTarget: '_self'
          };

          window.Cashfree.checkout(checkoutOptions);
        } else {
          setError('Cashfree checkout not available. Please refresh the page.');
        }
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
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Unlock Content</h2>
        <p className="text-gray-600">{contentTitle}</p>
        <p className="text-3xl font-bold text-green-600 mt-2">₹{amount}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('cashfree')}
          className={`flex-1 py-3 px-4 font-semibold transition-all ${
            activeTab === 'cashfree'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          💳 Cashfree Pay
        </button>
        <button
          onClick={() => setActiveTab('upi')}
          className={`flex-1 py-3 px-4 font-semibold transition-all ${
            activeTab === 'upi'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📱 UPI
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-start gap-2">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-start gap-2">
          <CheckCircle2 size={20} className="flex-shrink-0 mt-0.5" />
          <span>Payment successful! Redirecting...</span>
        </div>
      )}

      {/* Cashfree Tab Content */}
      {activeTab === 'cashfree' && (
        <div className="space-y-4">
          {/* Payment Methods Info */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 mb-2">💳 Payment Methods:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Credit/Debit Cards</li>
              <li>✓ UPI</li>
              <li>✓ Net Banking</li>
              <li>✓ Digital Wallets</li>
            </ul>
          </div>

          {/* Secure Badge */}
          <div className="text-center text-sm text-gray-500">
            🔒 Secured by Cashfree - 100% Safe
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleCashfreePayment}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                'Pay Now'
              )}
            </button>
          </div>
        </div>
      )}

      {/* UPI Tab Content */}
      {activeTab === 'upi' && (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 mb-2">📱 UPI Payment Instructions:</p>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Click "Generate QR" or "UPI Deep Link"</li>
              <li>Complete payment from your UPI app</li>
              <li>Paste the transaction ID</li>
              <li>Verify and get instant access</li>
            </ol>
          </div>

          <div className="text-center text-gray-500 text-sm">
            ℹ️ Switch to Cashfree for instant verification
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold"
            >
              Close
            </button>
            <button
              onClick={() => setActiveTab('cashfree')}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Try Cashfree
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentTabs;
