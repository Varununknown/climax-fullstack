import React, { useState, useEffect } from 'react';
import { X, QrCode, CheckCircle, Copy, CreditCard } from 'lucide-react';
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
  payuMerchantKey?: string;
  payuEnabled?: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  content,
  onSuccess,
  onClose
}) => {
  const { user } = useAuth();
  const [paymentStep, setPaymentStep] = useState<'qr' | 'waiting' | 'success' | 'payU'>('qr');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'payU'>('upi'); // Tab selector
  const [transactionId, setTransactionId] = useState('');
  const [txnError, setTxnError] = useState('');
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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

  // ✅ PayU Integration - Initiate payment gateway redirect
  const handlePayUPayment = async () => {
    if (!user?.id || !content._id) {
      alert('Missing user or content information');
      return;
    }

    setIsProcessing(true);
    console.log('🔄 Initiating PayU payment...');

    try {
      // Request PayU payment form from backend
      const response = await fetch(`${BACKEND_URL}/api/payu/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          contentId: content._id,
          amount: content.premiumPrice,
          userEmail: user.email || 'user@climax.app',
          userName: user.name || 'User'
        })
      });

      const data = await response.json();

      if (data.success && data.formHtml) {
        console.log('✅ PayU form received, redirecting...');
        // Create a temporary form and submit to PayU
        const form = document.createElement('form');
        form.innerHTML = data.formHtml;
        document.body.appendChild(form);
        
        // Auto-submit the form to PayU
        const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
        if (submitBtn) {
          setTimeout(() => submitBtn.click(), 100);
        } else {
          // Fallback: submit form directly
          (form as HTMLFormElement).submit();
        }
      } else {
        console.error('❌ PayU form generation failed:', data.message);
        alert('PayU gateway unavailable. Please try UPI payment instead.');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('❌ PayU initiation error:', err);
      alert('Payment gateway error. Please try UPI payment instead.');
      setIsProcessing(false);
    }
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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-3">
      {/* Compact Modal with Gradient */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-2xl w-full max-w-sm sm:max-w-md p-4 sm:p-6 relative
        max-h-[90vh] overflow-y-auto portrait:max-w-sm shadow-2xl border border-slate-700
        landscape:max-w-6xl landscape:max-h-[90vh] landscape:overflow-visible landscape:flex landscape:gap-4 landscape:items-center landscape:p-0">
        
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
            <div className="mb-3 sm:mb-4 text-center">
              <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-0.5 landscape:text-lg">
                Unlock Premium
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 landscape:text-xs">
                Watch "{content.title}"
              </p>
            </div>

            {/* ✅ Payment Method Tabs - Gateway & Manual */}
            {paymentSettings?.payuEnabled && (
              <div className="flex gap-2 mb-3 sm:mb-4 relative z-20 pointer-events-auto">
                <button
                  onClick={() => setPaymentMethod('upi')}
                  className={`flex-1 py-2.5 px-3 rounded-lg font-semibold text-sm transition-all landscape:py-1 landscape:text-sm relative z-20 pointer-events-auto cursor-pointer ${
                    paymentMethod === 'upi'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <QrCode className="w-4 h-4 inline mr-1.5" />
                  QR Code
                </button>
                <button
                  onClick={() => setPaymentMethod('payU')}
                  className={`flex-1 py-2.5 px-3 rounded-lg font-semibold text-sm transition-all landscape:py-1 landscape:text-sm relative z-20 pointer-events-auto cursor-pointer ${
                    paymentMethod === 'payU'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <CreditCard className="w-4 h-4 inline mr-1.5" />
                  Gateway
                </button>
              </div>
            )}

            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-2.5 mb-3 sm:mb-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-xs sm:text-sm font-medium">Full Access</span>
                <span className="text-xl sm:text-2xl font-bold text-blue-400">₹{content.premiumPrice}</span>
              </div>
            </div>

            {/* UPI Payment Method */}
            {paymentMethod === 'upi' && (
              <>
                {paymentSettings?.isActive && qrCodeData ? (
                  <div className="bg-white rounded-lg p-3 mb-3 text-center portrait:block landscape:hidden">
                    <div className="mb-2">
                      <QrCode className="w-5 h-5 text-gray-600 mx-auto mb-1.5" />
                      <h3 className="text-gray-800 font-semibold text-sm">Scan QR Code</h3>
                      <p className="text-gray-600 text-xs">{paymentSettings.merchantName}</p>
                    </div>

                    <div className="bg-gray-100 p-2 rounded-lg mb-3">
                      <img
                        src={qrCodeData.qrImage}
                        alt="Payment QR Code"
                        className="w-32 h-32 mx-auto"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1582769923195-c6e60dc1d8d6?w=200&h=200&fit=crop&auto=format';
                        }}
                      />
                    </div>

                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>UPI ID:</span>
                        <div className="flex items-center space-x-1">
                          <span className="font-mono text-xs">{qrCodeData.upiId}</span>
                          <button
                            onClick={() => copyToClipboard(qrCodeData.upiId)}
                            className="text-blue-600 hover:text-blue-800 cursor-pointer z-20 pointer-events-auto"
                          >
                            <Copy className="w-3.5 h-3.5" />
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
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-3 text-center">
                    <h3 className="text-red-400 font-semibold text-sm mb-1">Setup In Progress</h3>
                    <p className="text-gray-300 text-xs">
                      QR configuration coming soon. Use Gateway payment.
                    </p>
                  </div>
                )}

                <div className="mb-3">
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 landscape:text-xs landscape:mb-1">
                    Transaction ID *
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => {
                      setTransactionId(e.target.value);
                      setTxnError('');
                    }}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 landscape:py-1 landscape:text-sm"
                    placeholder="Paste transaction ID"
                    required
                  />
                  {txnError && (
                    <p className="text-red-500 text-xs mt-1 landscape:text-[10px]">{txnError}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1 landscape:text-[10px] landscape:mt-0.5">
                    Find in your banking app
                  </p>
                </div>

                <div className="space-y-2 sm:space-y-3 landscape:space-y-1.5">
                  <button
                    onClick={handlePaymentSubmit}
                    disabled={!transactionId.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg transition-colors landscape:py-2 landscape:text-sm text-sm sm:text-base cursor-pointer z-20 pointer-events-auto"
                  >
                    Verify & Unlock
                  </button>

                  <button
                    onClick={onClose}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-gray-200 font-semibold py-2.5 sm:py-3 px-4 rounded-lg transition-colors landscape:py-2 landscape:text-sm text-sm sm:text-base cursor-pointer z-20 pointer-events-auto"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {/* PayU Payment Method */}
            {paymentMethod === 'payU' && (
              <>
                <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/40 rounded-lg p-3 mb-3">
                  <div className="flex items-start gap-2">
                    <CreditCard className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-white text-sm">Fast Checkout</h3>
                      <p className="text-xs text-gray-300 mt-0.5">Secure PayU Gateway</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3 landscape:space-y-1.5">
                  <button
                    onClick={handlePayUPayment}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-2.5 sm:py-3 px-4 rounded-lg transition-all landscape:py-2 landscape:text-sm flex items-center justify-center gap-2 shadow-lg disabled:shadow-none cursor-pointer z-20 pointer-events-auto text-sm sm:text-base"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Continue to PayU
                      </>
                    )}
                  </button>

                  <button
                    onClick={onClose}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-gray-200 font-semibold py-2.5 sm:py-3 px-4 rounded-lg transition-colors landscape:py-2 landscape:text-sm text-sm sm:text-base cursor-pointer z-20 pointer-events-auto"
                  >
                    Cancel
                  </button>
                </div>

                <p className="text-xs text-gray-400 text-center mt-2 landscape:mt-1.5">
                  ✓ Instant & Secure Payment
                </p>
              </>
            )}
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
          <div className="text-center py-6 sm:py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-600/30 border-t-blue-600 mx-auto mb-3"></div>
            <h2 className="text-lg font-bold text-white mb-2">Verifying Payment</h2>
            <p className="text-sm text-gray-400 mb-3">
              Please wait while we confirm your transaction
            </p>
            <div className="bg-slate-700/50 rounded-lg p-2.5 text-left">
              <p className="text-xs text-gray-400">Transaction ID:</p>
              <p className="text-xs font-mono text-blue-400 break-all mt-0.5">{transactionId}</p>
            </div>
          </div>
        )}

        {paymentStep === 'success' && (
          <div className="text-center py-6 sm:py-8">
            <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Payment Successful!</h2>
            <p className="text-sm text-gray-400 mb-3">Enjoy your premium content</p>
            <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-lg p-2.5">
              <p className="text-xs sm:text-sm font-semibold text-green-400">
                ✓ Full access unlocked
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
