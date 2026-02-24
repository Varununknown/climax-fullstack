import React, { useState, useEffect } from 'react';
import { X, QrCode, CheckCircle, Copy, ExternalLink, Loader2 } from 'lucide-react';
import { Content } from '../../types';
import { useAuth } from '../../context/AuthContext';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface PaymentModalProps {
  content: Content;
  onSuccess: () => void;
  onClose: () => void;
  paymentType?: 'premium-content' | 'fest-participation';
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
  onClose,
  paymentType = 'premium-content'
}) => {
  const { user } = useAuth();
  const [paymentStep, setPaymentStep] = useState<'razorpay' | 'qr' | 'upi-deeplink' | 'waiting' | 'success'>('razorpay');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'upi' | 'upi-deeplink'>('razorpay');
  const [transactionId, setTransactionId] = useState('');
  const [txnError, setTxnError] = useState('');
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [upiDeepLinkTxnId, setUpiDeepLinkTxnId] = useState('');
  const [razorpayCheckingPayment, setRazorpayCheckingPayment] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/payment-settings`);
        const data = await response.json();
        setPaymentSettings(data);
      } catch (err) {
        console.error('❌ Failed to load settings:', err);
      }
    };
    fetchSettings();
  }, []);

  // Auto-check Razorpay payment every 5 seconds when user returns
  useEffect(() => {
    if (paymentMethod !== 'razorpay' || paymentStep === 'success') return;

    const checkInterval = setInterval(() => {
      handleRazorpayVerify();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(checkInterval);
  }, [paymentMethod, paymentStep]);

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied!');
  };

  // 💳 RAZORPAY VERIFICATION - Check if payment was received (AUTO)
  const handleRazorpayVerify = async () => {
    if (!user?.id || !content._id || razorpayCheckingPayment) return;

    setRazorpayCheckingPayment(true);

    try {
      const userId = user.id || (user as any)._id;
      const contentId = content._id;
      const amount = content.premiumPrice;

      // Backend will check Razorpay API to see if payment was received
      const response = await fetch(`${BACKEND_URL}/api/payments/verify-razorpay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          contentId,
          amount
        })
      });

      const result = await response.json();

      if (result.success || result.paid) {
        // Payment found! Auto-unlock
        console.log('✅ Razorpay payment detected! Unlocking...');
        setPaymentStep('success');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        // Payment not found yet, keep checking silently
        setRazorpayCheckingPayment(false);
      }
    } catch (err: any) {
      console.error('Razorpay verification error:', err);
      setRazorpayCheckingPayment(false);
    }
  };

  //  UPI DEEP LINK HANDLER
  const handleUpiDeepLink = async () => {
    if (!user?.id || !content._id) {
      alert('Missing user or content information');
      return;
    }

    if (!paymentSettings?.upiId || !paymentSettings?.merchantName) {
      alert('❌ Payment settings not configured.');
      return;
    }

    try {
      setIsProcessing(true);
      const upiString = `upi://pay?pa=${paymentSettings.upiId}&pn=${encodeURIComponent(paymentSettings.merchantName)}&am=${content.premiumPrice}&tn=Climax%20Premium`;
      window.location.href = upiString;
      
      setTimeout(() => {
        setIsProcessing(false);
        setPaymentStep('upi-deeplink');
      }, 1500);
    } catch (err) {
      console.error('UPI Deep Link Error:', err);
      setTxnError('Failed to open UPI app');
      setIsProcessing(false);
    }
  };

  // ✅ VERIFY UPI TRANSACTION ID
  const handleVerifyUpiTransaction = async () => {
    if (!upiDeepLinkTxnId.trim()) {
      setTxnError('Please enter transaction ID');
      return;
    }

    if (!validateTransactionId(upiDeepLinkTxnId)) {
      setTxnError('Invalid transaction ID format');
      return;
    }

    setIsProcessing(true);
    setTxnError('');

    try {
      if (paymentType === 'fest-participation') {
        setPaymentStep('success');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
        return;
      }

      const endpoint = `${BACKEND_URL}/api/payments`;
      const payload = {
        userId: user?.id,
        contentId: content._id,
        amount: content.premiumPrice,
        transactionId: upiDeepLinkTxnId.trim()
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.status === 409) {
        setPaymentStep('success');
        setTimeout(() => { onSuccess(); onClose(); }, 2000);
        return;
      }

      if (!response.ok) throw new Error('Payment failed');

      const result = await response.json();
      if (result.paid || result.alreadyPaid || result.success) {
        setPaymentStep('success');
        setTimeout(onSuccess, 2000);
      } else {
        setPaymentStep('success');
      }
    } catch (err) {
      setTxnError('Payment error. Please try again.');
      setPaymentStep('upi-deeplink');
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ QR CODE PAYMENT HANDLER
  const handlePaymentSubmit = async () => {
    if (!transactionId.trim() || !user?.id || !content._id) {
      alert('Missing fields');
      return;
    }

    if (!validateTransactionId(transactionId)) {
      setTxnError('Invalid Transaction ID');
      return;
    }

    setTxnError('');
    setPaymentStep('waiting');

    try {
      if (paymentType === 'fest-participation') {
        setPaymentStep('success');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
        return;
      }

      const endpoint = `${BACKEND_URL}/api/payments`;
      const payload = {
        userId: user.id,
        contentId: content._id,
        amount: content.premiumPrice,
        transactionId
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.status === 409) {
        setPaymentStep('success');
        setTimeout(() => { onSuccess(); onClose(); }, 2000);
        return;
      }

      if (!response.ok) throw new Error('Payment failed');

      const result = await response.json();
      if (result.paid || result.alreadyPaid || result.success) {
        setPaymentStep('success');
        setTimeout(onSuccess, 2000);
      } else {
        setPaymentStep('success');
      }
    } catch (err) {
      setTxnError('Payment error');
      setPaymentStep('qr');
    }
  };

  // ==================== INLINE STYLES ====================
  const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999999,
    padding: '12px',
    pointerEvents: 'auto',
    WebkitTouchCallout: 'none',
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: '#0f172a',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '448px',
    padding: '16px',
    position: 'relative',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgb(51, 65, 85)',
    pointerEvents: 'auto',
    WebkitTouchCallout: 'none',
  };

  const buttonStyle: React.CSSProperties = {
    flex: 1,
    padding: '12px 14px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.2s',
    border: 'none',
    cursor: 'pointer',
    touchAction: 'manipulation',
    WebkitTouchCallout: 'none',
    WebkitUserSelect: 'none',
    userSelect: 'none',
    pointerEvents: 'auto',
    WebkitTapHighlightColor: 'transparent',
    minHeight: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties;

  const closeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    right: '16px',
    top: '16px',
    color: 'rgb(156, 163, 175)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    zIndex: 100,
    pointerEvents: 'auto',
    WebkitTapHighlightColor: 'transparent',
    minHeight: '44px',
    minWidth: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '4px',
    textAlign: 'center',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '12px',
    color: 'rgb(156, 163, 175)',
    textAlign: 'center',
    marginBottom: '12px',
  };

  const tabsContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
    paddingBottom: '4px',
  };

  const tabButtonActiveStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#2563eb',
    color: 'white',
  };

  const tabButtonInactiveStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: 'rgba(71, 85, 105, 0.5)',
    color: 'rgb(209, 213, 219)',
  };

  const priceCardStyle: React.CSSProperties = {
    background: 'linear-gradient(to right, rgba(37, 99, 235, 0.2), rgba(168, 85, 247, 0.2))',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    borderRadius: '8px',
    padding: '10px',
    marginBottom: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const priceTextStyle: React.CSSProperties = {
    fontSize: '12px',
    color: 'rgb(209, 213, 219)',
    fontWeight: '500',
  };

  const priceAmountStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#60a5fa',
  };

  const qrContainerStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '12px',
    textAlign: 'center',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: '#1e293b',
    border: '1px solid #475569',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '14px',
    color: 'white',
    boxSizing: 'border-box',
    marginBottom: '12px',
  };

  const submitButtonStyle: React.CSSProperties = {
    width: '100%',
    background: 'linear-gradient(to right, #2563eb, #7c3aed)',
    color: 'white',
    fontWeight: 'bold',
    padding: '12px 16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
    pointerEvents: 'auto',
    WebkitTapHighlightColor: 'transparent',
    minHeight: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  };

  const disabledButtonStyle: React.CSSProperties = {
    width: '100%',
    background: '#6b7280',
    cursor: 'not-allowed',
    opacity: 0.6,
    color: 'white',
    fontWeight: 'bold',
    padding: '12px 16px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    transition: 'all 0.2s',
    pointerEvents: 'auto',
    WebkitTapHighlightColor: 'transparent',
    minHeight: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const cancelButtonStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: '#475569',
    color: '#e2e8f0',
    fontWeight: '600',
    padding: '12px 16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
    marginTop: '8px',
    pointerEvents: 'auto',
    WebkitTapHighlightColor: 'transparent',
    minHeight: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  // ==================== EVENT HANDLERS ====================
  const handleBackdropClick = (e: React.MouseEvent) => {
    // Prevent clicks on backdrop from reaching video
    e.stopPropagation();
  };

  const handleBackdropTouch = (e: React.TouchEvent) => {
    // Prevent touches on backdrop from reaching video
    e.stopPropagation();
  };

  // ==================== RENDER ====================
  return (
    <div 
      style={backdropStyle}
      onClick={handleBackdropClick}
      onTouchStart={handleBackdropTouch}
      onTouchMove={handleBackdropTouch}
      onTouchEnd={handleBackdropTouch}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div 
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        {paymentStep !== 'waiting' && (
          <button
            onClick={() => {
              const confirmed = window.confirm('Cancel payment?');
              if (confirmed) onClose();
            }}
            style={closeButtonStyle}
          >
            <X size={24} />
          </button>
        )}

        {/* Title */}
        <div style={{ marginBottom: '12px' }}>
          <h2 style={titleStyle}>Unlock Premium</h2>
          <p style={subtitleStyle}>Watch "{content.title}"</p>
        </div>

        {/* Tabs */}
        <div style={tabsContainerStyle}>
          <button
            onClick={() => {
              setPaymentMethod('razorpay');
              setPaymentStep('razorpay');
              setTxnError('');
            }}
            style={paymentMethod === 'razorpay' ? tabButtonActiveStyle : tabButtonInactiveStyle}
          >
            <ExternalLink size={16} style={{ display: 'inline', marginRight: '6px' }} />
            Razorpay
          </button>

          <button
            onClick={() => {
              setPaymentMethod('upi');
              setPaymentStep('qr');
              setTxnError('');
            }}
            style={paymentMethod === 'upi' ? tabButtonActiveStyle : tabButtonInactiveStyle}
          >
            <QrCode size={16} style={{ display: 'inline', marginRight: '6px' }} />
            UPI QR
          </button>

          <button
            onClick={() => {
              setPaymentMethod('upi-deeplink');
              setPaymentStep('upi-deeplink');
              setTxnError('');
            }}
            style={paymentMethod === 'upi-deeplink' ? tabButtonActiveStyle : tabButtonInactiveStyle}
          >
            📱 UPI App
          </button>
        </div>

        {/* Price Card */}
        <div style={priceCardStyle}>
          <span style={priceTextStyle}>Amount</span>
          <span style={priceAmountStyle}>₹{content.premiumPrice}</span>
        </div>

        {/* RAZORPAY TAB */}
        {paymentMethod === 'razorpay' && (
          <>
            <div style={{
              backgroundColor: 'rgb(243, 244, 246)',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid rgb(229, 231, 235)',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <ExternalLink size={18} style={{ color: '#1f2937', marginRight: '8px' }} />
                <span style={{ color: '#1f2937', fontWeight: '700', fontSize: '15px' }}>Razorpay Payment Link</span>
              </div>
              <div style={{ background: 'rgba(59, 130, 246, 0.08)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.15)' }}>
                <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0' }}>✓ Click to pay securely</p>
                <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0' }}>✓ We'll auto-detect payment</p>
                {razorpayCheckingPayment && <p style={{ color: '#3b82f6', fontSize: '12px', margin: '4px 0', fontWeight: 'bold' }}>⏳ Checking payment...</p>}
              </div>
            </div>

            <button
              onClick={() => window.open('https://razorpay.me/@new10solutions', '_blank')}
              style={submitButtonStyle}
            >
              <ExternalLink size={16} style={{ display: 'inline', marginRight: '8px' }} />
              Click to Pay on Razorpay
            </button>

            <button 
              onClick={onClose} 
              style={cancelButtonStyle}
            >Cancel</button>
          </>
        )}

        {/* UPI QR TAB */}
        {paymentMethod === 'upi' && (
          <>
            {paymentSettings?.isActive && qrCodeData ? (
              <>
                <div style={qrContainerStyle}>
                  <QrCode size={20} style={{ color: '#6b7280', marginBottom: '8px' }} />
                  <h3 style={{ color: '#1f2937', fontWeight: '600', fontSize: '14px' }}>Scan QR Code</h3>
                  <p style={{ color: '#6b7280', fontSize: '12px' }}>{paymentSettings.merchantName}</p>
                  <div style={{ backgroundColor: '#f3f4f6', padding: '8px', borderRadius: '6px', marginTop: '8px' }}>
                    <img
                      src={qrCodeData.qrImage}
                      alt="QR"
                      style={{ width: '128px', height: '128px', margin: '0 auto', display: 'block' }}
                    />
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#4b5563' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>UPI ID:</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <span>{qrCodeData.upiId}</span>
                        <button
                          onClick={() => copyToClipboard(qrCodeData.upiId)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb' }}
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Amount:</span>
                      <span style={{ fontWeight: '600' }}>₹{content.premiumPrice}</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', color: 'rgb(209, 213, 219)', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
                    Transaction ID *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={transactionId}
                    onChange={(e) => {
                      setTransactionId(e.target.value);
                      setTxnError('');
                    }}
                    placeholder="Enter transaction ID"
                    style={inputStyle}
                  />
                  {txnError && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '-8px', marginBottom: '8px' }}>{txnError}</p>}
                </div>

                <button
                  onClick={handlePaymentSubmit}
                  disabled={!transactionId.trim() || isProcessing}
                  style={transactionId.trim() && !isProcessing ? submitButtonStyle : disabledButtonStyle}
                >
                  Verify & Unlock
                </button>
              </>
            ) : (
              <div style={{ background: 'rgba(127, 29, 29, 0.2)', border: '1px solid rgba(248, 113, 113, 0.3)', borderRadius: '8px', padding: '12px', textAlign: 'center', marginBottom: '12px' }}>
                <h3 style={{ color: '#fca5a5', fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>Setup In Progress</h3>
                <p style={{ color: 'rgb(209, 213, 219)', fontSize: '12px' }}>Use other payment methods.</p>
              </div>
            )}

            <button 
              onClick={onClose} 
              style={cancelButtonStyle}
            >Cancel</button>
          </>
        )}

        {/* UPI DEEPLINK TAB */}
        {paymentMethod === 'upi-deeplink' && paymentStep === 'upi-deeplink' && (
          <>
            <div style={{
              backgroundColor: 'rgb(243, 244, 246)',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid rgb(229, 231, 235)',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <CreditCard size={18} style={{ color: '#1f2937', marginRight: '8px' }} />
                <span style={{ color: '#1f2937', fontWeight: '700', fontSize: '15px' }}>UPI Payment</span>
              </div>
              <div style={{ background: 'rgba(59, 130, 246, 0.08)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.15)' }}>
                <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0' }}>• Open UPI App → Complete Payment</p>
                <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0' }}>• Return here & paste Transaction ID</p>
              </div>
            </div>

            <button
              onClick={handleUpiDeepLink}
              disabled={isProcessing}
              style={isProcessing ? disabledButtonStyle : submitButtonStyle}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} style={{ display: 'inline', marginRight: '8px', animation: 'spin 0.6s linear infinite' }} />
                  Opening UPI App...
                </>
              ) : (
                <>
                  📱 Open UPI App
                </>
              )}
            </button>

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(229, 231, 235, 0.6)' }}>
              <label style={{ display: 'block', color: '#111827', fontWeight: '700', marginBottom: '10px', fontSize: '14px' }}>
                Verify Payment
              </label>
              
              <input
                type="text"
                inputMode="numeric"
                placeholder="Paste your UPI Transaction ID"
                value={upiDeepLinkTxnId}
                onChange={(e) => {
                  setUpiDeepLinkTxnId(e.target.value.toUpperCase());
                  setTxnError('');
                }}
                style={inputStyle}
              />
              
              {txnError && (
                <div style={{ marginBottom: '12px', padding: '10px 12px', background: 'rgba(220, 38, 38, 0.08)', borderLeft: '3px solid #dc2626', borderRadius: '4px' }}>
                  <p style={{ color: '#991b1b', fontSize: '13px', margin: '0', fontWeight: '600' }}>{txnError}</p>
                </div>
              )}

              <button
                onClick={handleVerifyUpiTransaction}
                disabled={!upiDeepLinkTxnId.trim() || isProcessing}
                style={upiDeepLinkTxnId.trim() && !isProcessing ? submitButtonStyle : disabledButtonStyle}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} style={{ display: 'inline', marginRight: '8px', animation: 'spin 0.6s linear infinite' }} />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} style={{ display: 'inline', marginRight: '6px' }} />
                    Verify & Unlock
                  </>
                )}
              </button>
            </div>

            <button 
              onClick={onClose} 
              style={cancelButtonStyle}
            >Cancel</button>
          </>
        )}

        {/* Waiting Step */}
        {paymentStep === 'waiting' && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ display: 'inline-block', width: '48px', height: '48px', border: '4px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite', marginBottom: '16px' }} />
            <h2 style={{ color: 'white', fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Verifying Payment</h2>
            <p style={{ color: 'rgb(209, 213, 219)', fontSize: '14px' }}>Please wait...</p>
          </div>
        )}

        {/* Success Step */}
        {paymentStep === 'success' && (
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center', 
            padding: '40px 20px', 
          }}>
            <div style={{ position: 'relative', zIndex: 2, marginBottom: '28px' }}>
              <CheckCircle size={68} style={{ color: '#10b981' }} />
            </div>

            <h2 style={{
              fontSize: '28px',
              fontWeight: '900',
              marginBottom: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Payment Successful!
            </h2>

            <p style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '16px',
              marginBottom: '20px',
              fontWeight: '500',
            }}>
              {paymentType === 'fest-participation' 
                ? 'Your fest participation is unlocked' 
                : 'Your premium access is unlocked'}
            </p>

            <p style={{
              color: 'rgba(255, 255, 255, 0.75)',
              fontSize: '14px',
            }}>
              ⏱️ Redirecting in 3 seconds...
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PaymentModal;
