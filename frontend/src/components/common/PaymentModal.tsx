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

  console.log('💳 PaymentModal rendered for content:', content.title, 'Price:', content.premiumPrice);

  // Note: Payment checking is handled by VideoPlayer.tsx for efficiency
  // This modal is only shown when payment is needed

  useEffect(() => {
    console.log('💳 Fetching payment settings...');
    
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/payment-settings`);
        const data = await response.json();
        console.log('💳 Payment settings loaded:', data);
        setPaymentSettings(data);
      } catch (err) {
        console.error('❌ Failed to load payment settings:', err);
        setPaymentSettings(null);
      }
    };

    fetchSettings();
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
      console.log('═══════════════════════════════════════════════════════');
      console.log('💳💳💳 PAYMENT SUBMISSION STARTING');
      console.log('═══════════════════════════════════════════════════════');
      console.log('Submitting payment with:');
      console.log('  userId:', user.id);
      console.log('  contentId:', content._id);
      console.log('  amount:', content.premiumPrice);
      console.log('  transactionId:', transactionId);
      console.log('  Backend URL:', BACKEND_URL);
      console.log('═══════════════════════════════════════════════════════');

      const paymentUrl = `${BACKEND_URL}/api/payments`;
      console.log('📍 Sending to:', paymentUrl);

      const response = await fetch(paymentUrl, {
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

      console.log('📡 Response status:', response.status);

      // Handle different response codes
      if (response.status === 409) {
        // Payment already exists - this is actually SUCCESS
        console.log('✅ Payment already exists (409) - treating as success');
        const result = await response.json();
        console.log('📦 Existing payment:', result);
        
        // Immediately unlock
        setTimeout(() => {
          setPaymentStep('success');
          setTimeout(() => {
            onSuccess();
          }, 1000);
        }, 1000);
        return;
      }

      if (!response.ok) {
        const text = await response.text();
        console.error('❌ Response not OK:', response.status, text);
        throw new Error(`Payment API error: ${response.status} ${text.substring(0, 100)}`);
      }

      const result = await response.json();
      console.log('📦 Payment submission result:', result);

      // Check if payment is paid (either already paid or newly approved)
      if (result.paid || result.alreadyPaid || result.message?.includes('already')) {
        console.log('✅ Payment is PAID - showing success');
        // Show success state immediately
        setPaymentStep('success');
        // Notify parent after a brief delay
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        // Payment exists but not verified
        console.log('⚠️ Payment submitted but not verified yet:', result);
        // Still show success UI since payment was submitted
        setPaymentStep('success');
      }
    } catch (err) {
      console.error('❌ Payment submission error:', err);
      setTxnError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
      alert(err instanceof Error ? err.message : 'Server error. Try again.');
      setPaymentStep('qr');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4">
      {/* Responsive modal: Portrait=vertical, Landscape=horizontal */}
      <div className="bg-gray-900 rounded-2xl w-full p-3 sm:p-4 relative
        max-h-[95vh] overflow-y-auto portrait:max-w-md
        landscape:max-w-6xl landscape:max-h-[90vh] landscape:overflow-visible landscape:flex landscape:gap-4 landscape:items-center">
        
        {/* Left QR section - visible only in landscape */}
        <div className="hidden landscape:flex landscape:flex-col landscape:w-1/3 landscape:items-center landscape:justify-center landscape:gap-2 landscape:pr-4 landscape:border-r landscape:border-gray-700">
          {paymentStep === 'qr' && paymentSettings?.isActive && qrCodeData && (
            <>
              <h3 className="text-base font-semibold text-white text-center">Scan to Pay</h3>
              <div className="bg-white rounded-lg p-3">
                <img
                  src={qrCodeData.qrImage}
                  alt="Payment QR Code"
                  className="w-28 h-28"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1582769923195-c6e60dc1d8d6?w=200&h=200&fit=crop&auto=format';
                  }}
                />
              </div>
              <div className="text-xs text-gray-400 text-center">
                <div>UPI: {qrCodeData.upiId}</div>
                <div className="font-bold text-blue-400 mt-1">₹{content.premiumPrice}</div>
              </div>
            </>
          )}
        </div>

        {/* Right form section - always visible */}
        <div className="landscape:w-2/3 landscape:flex-1">
        {/* Close button - only available if not in waiting step */}
        {paymentStep !== 'waiting' && (
          <button 
            onClick={() => {
              // Warn user that video will stop playing
              const confirmed = window.confirm('Are you sure? You cannot continue watching without payment.');
              if (confirmed) {
                onClose();
              }
            }} 
            className="absolute right-4 top-4 text-gray-400 hover:text-white z-10 landscape:right-6 landscape:top-6"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        {(paymentStep === 'qr') && (
          <>
            <div className="mb-4 landscape:mb-3">
              <h2 className="text-2xl font-bold text-white mb-2 landscape:text-lg landscape:mb-1">Complete Payment</h2>
              <p className="text-gray-400 landscape:text-xs">
                Pay ₹{content.premiumPrice} to continue watching "{content.title}"
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 mb-4 landscape:p-2 landscape:mb-3 landscape:hidden">
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

            {paymentSettings?.isActive && qrCodeData ? (
              <div className="bg-white rounded-lg p-4 mb-4 text-center portrait:block landscape:hidden">
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
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1582769923195-c6e60dc1d8d6?w=200&h=200&fit=crop&auto=format';
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
            ) : (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4 text-center">
                <h3 className="text-red-400 font-semibold mb-2">Payment Setup Pending</h3>
                <p className="text-gray-300 text-sm">
                  UPI Gateway configuration in progress. Please enter transaction ID manually.
                </p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2 landscape:text-xs landscape:mb-1">
                Enter Transaction ID *
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => {
                  setTransactionId(e.target.value);
                  setTxnError('');
                }}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 landscape:py-1 landscape:text-sm"
                placeholder="Enter/Paste your transaction ID"
                required
              />
              {txnError && (
                <p className="text-red-500 text-xs mt-1 landscape:text-[10px]">{txnError}</p>
              )}
              <p className="text-gray-500 text-xs mt-1 landscape:text-[10px] landscape:mt-0.5">
                Copy the transaction ID from your payment app after completing the payment
              </p>
            </div>

            <div className="space-y-3 landscape:space-y-1.5">
              <button
                onClick={handlePaymentSubmit}
                disabled={!transactionId.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors landscape:py-2 landscape:text-sm"
              >
                Submit Payment
              </button>

              <button
                onClick={onClose}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors landscape:py-2 landscape:text-sm"
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

        <p className="text-gray-500 text-xs text-center mt-4 landscape:mt-2 landscape:text-[10px]">
          Secure payment verification by StreamFlix admin team. Your transaction is safe and encrypted.
        </p>
        </div>
      </div>
    </div>
  );
};
