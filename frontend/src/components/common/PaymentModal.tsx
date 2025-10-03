import React, { useState, useEffect } from 'react';
import { X, QrCode, CheckCircle, Clock, Copy } from 'lucide-react';
import { Content } from '../../types';
import { useAuth } from '../../context/AuthContext';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface PaymentModalProps {
  content: Content;
  onSuccess: () => void;
  onClose: () => void;
}

interface PaymentSettings {
  upiId: string;
  qrCodeUrl: string;
  merchantName: string;
  isActive: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  content,
  onSuccess,
  onClose
}) => {
  const { user } = useAuth();
  const [paymentStep, setPaymentStep] = useState<'qr' | 'waiting' | 'success'>('qr');
  const [transactionId, setTransactionId] = useState('');
  const [txnError, setTxnError] = useState('');
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);

  useEffect(() => {
    fetch(`${BACKEND_URL}/payment-settings`)
      .then(res => res.json())
      .then(data => setPaymentSettings(data))
      .catch(err => {
        console.error('❌ Failed to load payment settings:', err);
        setPaymentSettings(null);
      });
  }, []);

  const qrCodeData = paymentSettings && {
    upiId: paymentSettings.upiId,
    amount: content.premiumPrice,
    qrImage: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${paymentSettings.upiId}&pn=${paymentSettings.merchantName}&am=${content.premiumPrice}&cu=INR`
  };

  const validateTransactionId = (id: string) => {
    const trimmed = id.trim();
    const upiRegex1 = /^[0-9]{12}$/;
    const upiRegex2 = /^[A-Z]{4}\d{8,}$/i;
    const upiRegex3 = /^[\w.-]{5,30}@[\w]{3,}$/i;
    return upiRegex1.test(trimmed) || upiRegex2.test(trimmed) || upiRegex3.test(trimmed);
  };

  const handlePaymentSubmit = async () => {
    if (!transactionId.trim() || !user?.id || !content._id) {
      alert('Missing required fields');
      return;
    }

    if (!validateTransactionId(transactionId)) {
      setTxnError('Invalid Transaction ID format');
      return;
    }

    setTxnError('');
    setPaymentStep('waiting');

    try {
      const res = await fetch(`${BACKEND_URL}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          contentId: content._id,
          amount: content.premiumPrice,
          transactionId
        })
      });

      const result = await res.json();
      console.log('📦 Payment submission result:', result);

      if (res.ok) {
        setTimeout(() => {
          setPaymentStep('success');
          setTimeout(() => {
            onSuccess();
          }, 2000);
        }, 2000);
      } else {
        alert(result.message || 'Payment failed to save. Try again.');
        setPaymentStep('qr');
      }
    } catch (err) {
      console.error('❌ Payment submission error:', err);
      alert('Server error. Try again.');
      setPaymentStep('qr');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-md w-full p-4 relative max-h-[95vh] overflow-y-auto">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>

        {paymentStep === 'qr' && paymentSettings?.isActive && qrCodeData && (
          <>
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-white mb-2">Complete Payment</h2>
              <p className="text-gray-400">
                Scan QR code to pay ₹{content.premiumPrice} and continue watching "{content.title}"
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2">
                <img
                  src={content.thumbnail}
                  alt={content.title}
                  className="w-14 h-16 object-cover rounded"
                />
                <div>
                  <h3 className="text-white font-semibold text-xs">{content.title}</h3>
                  <p className="text-gray-400 text-xs capitalize">{content.type} • {content.category}</p>
                  <p className="text-blue-400 font-bold text-sm mt-2">₹{content.premiumPrice}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 mb-4 text-center">
              <div className="mb-4">
                <QrCode className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                <h3 className="text-gray-800 font-semibold">Scan to Pay</h3>
                <p className="text-gray-600 text-sm">{paymentSettings.merchantName}</p>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <img
                  src={qrCodeData.qrImage}
                  alt="Payment QR Code"
                  className="w-40 h-40 mx-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x200?text=QR+Code';
                  }}
                />
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>UPI ID:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono">{qrCodeData.upiId}</span>
                    <button
                      onClick={() => copyToClipboard(qrCodeData.upiId)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Amount:</span>
                  <span className="font-semibold">₹{content.premiumPrice}</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Enter Transaction ID *
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => {
                  setTransactionId(e.target.value);
                  setTxnError('');
                }}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter/Paste your transaction ID"
                required
              />
              {txnError && (
                <p className="text-red-500 text-xs mt-1">{txnError}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Copy the transaction ID from your payment app after completing the payment
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handlePaymentSubmit}
                disabled={!transactionId.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Submit Payment
              </button>

              <button
                onClick={onClose}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {paymentStep === 'qr' && paymentSettings && !paymentSettings.isActive && (
          <div className="text-center text-white py-10">
            <QrCode className="w-8 h-8 mx-auto mb-2 text-gray-500" />
            <p className="text-lg font-semibold mb-2">Payments are temporarily disabled.</p>
            <p className="text-gray-400 text-sm mb-6">Please try again later.</p>
            <button
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg"
            >
              Close
            </button>
          </div>
        )}

        {paymentStep === 'waiting' && (
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-white mb-2">Verifying Payment</h2>
            <p className="text-gray-400 mb-4">
              Please wait while we verify your payment with our admin team
            </p>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-yellow-400">
                <Clock className="w-5 h-5" />
                <span className="text-sm">Transaction ID: {transactionId}</span>
              </div>
            </div>
          </div>
        )}

        {paymentStep === 'success' && (
          <div className="text-center py-6">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Payment Successful!</h2>
            <p className="text-gray-400 mb-4">
              Your payment has been verified. You can now continue watching the full content.
            </p>
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-400 font-medium">
                Full access unlocked for "{content.title}"
              </p>
            </div>
          </div>
        )}

        <p className="text-gray-500 text-xs text-center mt-4">
          Secure payment verification by StreamFlix admin team. Your transaction is safe and encrypted.
        </p>
      </div>
    </div>
  );
};
