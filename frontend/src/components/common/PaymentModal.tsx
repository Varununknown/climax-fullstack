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
  phonepeEnabled?: boolean;
}

// All-inline-styles Modal - NO Tailwind classes to eliminate conflicts
export const PaymentModal: React.FC<PaymentModalProps> = ({
  content,
  onSuccess,
  onClose
}) => {
  const { user } = useAuth();
  const [paymentStep, setPaymentStep] = useState<'qr' | 'waiting' | 'success' | 'upi-deeplink'>('qr');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'upi-deeplink'>('upi'); // Default to QR Code
  const [transactionId, setTransactionId] = useState('');
  const [txnError, setTxnError] = useState('');
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [upiDeepLinkTxnId, setUpiDeepLinkTxnId] = useState(''); // For UPI deep link transaction ID input

  console.log('💳 PaymentModal rendered:', content.title);

  useEffect(() => {
    console.log('🔄 Payment method:', paymentMethod);
    const modal = document.querySelector('[data-modal-content]') as HTMLElement;
    if (modal) {
      modal.scrollTop = 0;
    }
  }, [paymentMethod]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/payment-settings`);
        const data = await response.json();
        console.log('💳 Settings:', data);
        setPaymentSettings(data);
      } catch (err) {
        console.error('❌ Failed to load settings:', err);
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

  // 🔗 UPI DEEP LINK HANDLER
  const handleUpiDeepLink = async () => {
    if (!user?.id || !content._id) {
      alert('Missing user or content information');
      return;
    }

    // ⚠️ REQUIRE payment settings to be configured
    if (!paymentSettings?.upiId || !paymentSettings?.merchantName) {
      alert('❌ Payment settings not configured.\n\nPlease go to Admin Panel → Payment Settings and enter:\n- Your UPI ID\n- Merchant Name\n\nThen try again.');
      return;
    }

    try {
      console.log('🔗 Opening UPI Deep Link...');
      setIsProcessing(true);
      setPaymentStep('upi-deeplink');

      // Use REAL payment settings (no fallbacks)
      const upiId = paymentSettings.upiId;
      const merchantName = paymentSettings.merchantName;

      // Generate UPI deep link with pre-filled details
      const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${content.premiumPrice}&tn=${encodeURIComponent(`Payment for ${content.title}`)}`;

      console.log('🔗 UPI Link:', upiLink);
      
      // Open UPI app directly
      window.location.href = upiLink;
      setIsProcessing(false);
    } catch (err) {
      console.error('❌ UPI Deep Link error:', err);
      console.error('Error message:', err instanceof Error ? err.message : String(err));
      alert(`Failed to initiate UPI payment: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsProcessing(false);
      setPaymentStep('upi-deeplink');
    }
  };

  // ✅ VERIFY UPI TRANSACTION ID
  const handleVerifyUpiTransaction = async () => {
    if (!upiDeepLinkTxnId.trim()) {
      setTxnError('Please enter transaction ID');
      return;
    }

    // Validate transaction ID format (12 digits or alphanumeric)
    const txnIdPattern = /^[A-Z0-9]{12,}$/i;
    if (!txnIdPattern.test(upiDeepLinkTxnId.trim())) {
      setTxnError('Invalid transaction ID format. Should be 12 alphanumeric characters.');
      return;
    }

    setIsProcessing(true);
    setTxnError('');

    try {
      console.log('✅ Verifying UPI Transaction:', upiDeepLinkTxnId);
      console.log('📝 User ID:', user?.id);
      console.log('📝 Content ID:', content._id);

      const response = await fetch(`${BACKEND_URL}/api/payments/verify-upi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          contentId: content._id,
          transactionId: upiDeepLinkTxnId.trim()
        })
      });

      console.log('📊 Response status:', response.status);
      const data = await response.json();
      console.log('📊 Verification response:', data);

      if (data.success === true) {
        setPaymentStep('success');
        alert('✅ Payment verified! Content unlocked.');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else if (data.error === 'DUPLICATE') {
        setTxnError('⚠️ This payment already exists in our system');
      } else if (data.error === 'INVALID_FORMAT') {
        setTxnError('❌ Invalid transaction ID format. Please check and try again.');
      } else if (data.error === 'VERIFICATION_ERROR') {
        setTxnError('❌ ' + (data.message || 'Verification failed. Please try again.'));
      } else {
        setTxnError(data.message || data.error || 'Verification failed. Please try again.');
      }
    } catch (err) {
      console.error('❌ Verification error:', err);
      setTxnError('Error verifying payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

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
      const response = await fetch(`${BACKEND_URL}/api/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          contentId: content._id,
          amount: content.premiumPrice,
          transactionId
        })
      });

      if (response.status === 409) {
        setTimeout(() => {
          setPaymentStep('success');
          setTimeout(onSuccess, 3000);
        }, 1000);
        return;
      }

      if (!response.ok) throw new Error('Payment failed');

      const result = await response.json();
      if (result.paid || result.alreadyPaid) {
        setPaymentStep('success');
        setTimeout(onSuccess, 3000);
      } else {
        setPaymentStep('success');
      }
    } catch (err) {
      setTxnError('Payment error');
      setPaymentStep('qr');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied!');
  };

  // ==================== INLINE STYLES ====================
  const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '12px',
    touchAction: 'none',
    pointerEvents: 'none',
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
    WebkitOverflowScrolling: 'touch',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgb(51, 65, 85)',
    touchAction: 'auto',
    scrollBehavior: 'smooth',
    pointerEvents: 'auto',
  };

  const buttonStyle: React.CSSProperties = {
    flex: 1,
    padding: '10px 12px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.2s',
    border: 'none',
    cursor: 'pointer',
    WebkitUserSelect: 'none',
    WebkitTouchCallout: 'none',
  };

  const closeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    right: '16px',
    top: '16px',
    color: 'rgb(156, 163, 175)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0',
    zIndex: 100,
    WebkitTouchCallout: 'none',
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
    position: 'sticky',
    top: '0',
    backgroundColor: '#0f172a',
    zIndex: 100,
    paddingTop: '8px',
    paddingBottom: '4px',
  };

  const tabButtonActiveStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#2563eb',
    color: 'white',
    zIndex: 101,
    pointerEvents: 'auto',
    position: 'relative',
  };

  const tabButtonInactiveStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: 'rgba(71, 85, 105, 0.5)',
    color: 'rgb(209, 213, 219)',
    zIndex: 101,
    pointerEvents: 'auto',
    position: 'relative',
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
    pointerEvents: 'auto',
    touchAction: 'manipulation',
  };

  const submitButtonStyle: React.CSSProperties = {
    width: '100%',
    background: 'linear-gradient(to right, #2563eb, #7c3aed)',
    color: 'white',
    fontWeight: 'bold',
    padding: '10px 16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    WebkitTouchCallout: 'none',
    WebkitUserSelect: 'none',
    zIndex: 100,
    pointerEvents: 'auto',
    position: 'relative',
  };

  const disabledButtonStyle: React.CSSProperties = {
    ...submitButtonStyle,
    background: '#6b7280',
    cursor: 'not-allowed',
    opacity: 0.6,
  };

  const cancelButtonStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: '#475569',
    color: '#e2e8f0',
    fontWeight: '600',
    padding: '10px 16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
    marginTop: '8px',
    WebkitTouchCallout: 'none',
    WebkitUserSelect: 'none',
    zIndex: 100,
    pointerEvents: 'auto',
    position: 'relative',
  };

  // ==================== RENDER ====================
  return (
    <div style={backdropStyle} data-payment-modal-root="true">
      <div style={modalStyle} data-modal-content="true">
        {/* Close Button */}
        {paymentStep !== 'waiting' && (
          <button
            onClick={() => {
              const confirmed = window.confirm('Cancel payment?');
              if (confirmed) onClose();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              const confirmed = window.confirm('Cancel payment?');
              if (confirmed) onClose();
            }}
            onMouseDown={(e) => e.preventDefault()}
            style={closeButtonStyle}
          >
            <X size={24} />
          </button>
        )}

        {/* Title & Tabs */}
        <div style={{ marginBottom: '12px' }}>
          <h2 style={titleStyle}>Unlock Premium</h2>
          <p style={subtitleStyle}>Watch "{content.title}"</p>
        </div>

        {/* Tabs */}
        <div style={tabsContainerStyle}>
          <button
            onClick={() => {
              setPaymentMethod('upi');
              setPaymentStep('qr');
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              setPaymentMethod('upi');
              setPaymentStep('qr');
            }}
            onMouseDown={(e) => e.preventDefault()}
            style={paymentMethod === 'upi' ? tabButtonActiveStyle : tabButtonInactiveStyle}
          >
            <QrCode size={16} style={{ display: 'inline', marginRight: '6px' }} />
            QR Code
          </button>
          <button
            onClick={() => {
              setPaymentMethod('upi-deeplink');
              setPaymentStep('upi-deeplink');
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              setPaymentMethod('upi-deeplink');
              setPaymentStep('upi-deeplink');
            }}
            onMouseDown={(e) => e.preventDefault()}
            style={paymentMethod === 'upi-deeplink' ? tabButtonActiveStyle : tabButtonInactiveStyle}
          >
            <CreditCard size={16} style={{ display: 'inline', marginRight: '6px' }} />
            UPI
          </button>
        </div>

        {/* Price Card */}
        <div style={priceCardStyle}>
          <span style={priceTextStyle}>Full Access</span>
          <span style={priceAmountStyle}>₹{content.premiumPrice}</span>
        </div>

            {/* UPI Section */}
            {paymentMethod === 'upi' && (
              <>
                {paymentSettings?.isActive && qrCodeData ? (
                  <>
                    <div style={qrContainerStyle}>
                      <QrCode size={20} style={{ color: '#6b7280', marginBottom: '8px', textAlign: 'center' }} />
                      <h3 style={{ color: '#1f2937', fontWeight: '600', fontSize: '14px' }}>Scan QR Code</h3>
                      <p style={{ color: '#6b7280', fontSize: '12px' }}>{paymentSettings.merchantName}</p>
                      <div style={{ backgroundColor: '#f3f4f6', padding: '8px', borderRadius: '6px', marginTop: '8px' }}>
                        <img
                          src={qrCodeData.qrImage}
                          alt="QR"
                          style={{ width: '128px', height: '128px', margin: '0 auto', display: 'block' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1582769923195-c6e60dc1d8d6?w=200&h=200&fit=crop&auto=format';
                          }}
                        />
                      </div>
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#4b5563' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span>UPI ID:</span>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <span>{qrCodeData.upiId}</span>
                            <button
                              onClick={() => copyToClipboard(qrCodeData.upiId)}
                              onTouchStart={(e) => {
                                e.preventDefault();
                                copyToClipboard(qrCodeData.upiId);
                              }}
                              onMouseDown={(e) => e.preventDefault()}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', zIndex: 100, pointerEvents: 'auto', position: 'relative' }}
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
                      onTouchStart={(e) => {
                        if (!transactionId.trim()) return;
                        e.preventDefault();
                        handlePaymentSubmit();
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                      disabled={!transactionId.trim()}
                      style={transactionId.trim() ? submitButtonStyle : disabledButtonStyle}
                    >
                      Verify & Unlock
                    </button>
                  </>
                ) : (
                  <div style={{ background: 'rgba(127, 29, 29, 0.2)', border: '1px solid rgba(248, 113, 113, 0.3)', borderRadius: '8px', padding: '12px', textAlign: 'center', marginBottom: '12px' }}>
                    <h3 style={{ color: '#fca5a5', fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>Setup In Progress</h3>
                    <p style={{ color: 'rgb(209, 213, 219)', fontSize: '12px' }}>Use Gateway payment instead.</p>
                  </div>
                )}

                <button 
                  onClick={onClose}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    onClose();
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  style={cancelButtonStyle}
                >
                  Cancel
                </button>
              </>
            )}

            {/* 🔗 UPI DEEP LINK SECTION */}
            {paymentMethod === 'upi-deeplink' && (
              <>
                {/* Payment Step: Waiting for user to enter transaction ID */}
                {paymentStep === 'upi-deeplink' && (
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
                      
                      <p style={{ color: '#374151', fontSize: '14px', margin: '8px 0', fontWeight: '500' }}>
                        Amount: ₹{content.premiumPrice}
                      </p>
                      
                      <p style={{ color: '#6b7280', fontSize: '13px', margin: '12px 0' }}>
                        📱 <strong>Step 1:</strong> Click button below to open your UPI app (PhonePe, Google Pay, BHIM, etc.)
                      </p>
                      
                      <p style={{ color: '#6b7280', fontSize: '13px', margin: '8px 0' }}>
                        ✅ <strong>Step 2:</strong> Complete the payment
                      </p>
                      
                      <p style={{ color: '#6b7280', fontSize: '13px', margin: '8px 0' }}>
                        📋 <strong>Step 3:</strong> Copy the 12-digit transaction ID from your payment receipt
                      </p>
                      
                      <p style={{ color: '#6b7280', fontSize: '13px', margin: '12px 0' }}>
                        💬 <strong>Step 4:</strong> Return here and enter the transaction ID below
                      </p>
                    </div>

                    {/* Open UPI App Button */}
                    <button
                      onClick={handleUpiDeepLink}
                      onTouchStart={(e) => {
                        if (isProcessing) return;
                        e.preventDefault();
                        handleUpiDeepLink();
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                      disabled={isProcessing}
                      style={isProcessing ? disabledButtonStyle : submitButtonStyle}
                    >
                      {isProcessing ? (
                        <>
                          <div style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite', marginRight: '8px' }} />
                          Opening UPI App...
                        </>
                      ) : (
                        <>
                          <CreditCard size={16} style={{ display: 'inline', marginRight: '6px' }} />
                          Open UPI App
                        </>
                      )}
                    </button>

                    <p style={{ fontSize: '12px', color: '#059669', textAlign: 'center', marginTop: '12px', fontWeight: '500' }}>
                      💚 Works with PhonePe, Google Pay, BHIM & all UPI apps
                    </p>

                    {/* Transaction ID Input Field */}
                    <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <label style={{ display: 'block', color: '#1f2937', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                        Enter Transaction ID:
                      </label>
                      <input
                        type="text"
                        placeholder="Enter 12-digit transaction ID from receipt"
                        value={upiDeepLinkTxnId}
                        onChange={(e) => {
                          setUpiDeepLinkTxnId(e.target.value.toUpperCase());
                          setTxnError('');
                        }}
                        style={{
                          width: '100%',
                          padding: '12px',
                          fontSize: '14px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          boxSizing: 'border-box',
                          fontFamily: 'monospace',
                          letterSpacing: '1px'
                        }}
                      />
                      {txnError && (
                        <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '8px', fontWeight: '500' }}>
                          {txnError}
                        </p>
                      )}
                    </div>

                      {/* Verify Button */}
                      <button
                        onClick={handleVerifyUpiTransaction}
                        onTouchStart={(e) => {
                          if (isProcessing || !upiDeepLinkTxnId.trim()) return;
                          e.preventDefault();
                          handleVerifyUpiTransaction();
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                        disabled={isProcessing || !upiDeepLinkTxnId.trim()}
                        style={{
                          ...submitButtonStyle,
                          marginTop: '16px',
                          opacity: (isProcessing || !upiDeepLinkTxnId.trim()) ? 0.6 : 1,
                          cursor: (isProcessing || !upiDeepLinkTxnId.trim()) ? 'not-allowed' : 'pointer'
                        }}
                      >
                      {isProcessing ? (
                        <>
                          <div style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite', marginRight: '8px' }} />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} style={{ display: 'inline', marginRight: '6px' }} />
                          Verify & Unlock
                        </>
                      )}
                    </button>

                    {/* Cancel Button */}
                    <button 
                      onClick={onClose}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        onClose();
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                      style={cancelButtonStyle}
                    >
                      Cancel
                    </button>
                  </>
                )}

                {/* Success Step */}
                {paymentStep === 'success' && (
                  <>
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <CheckCircle size={48} style={{ color: '#10b981', margin: '0 auto 16px' }} />
                      <h3 style={{ color: '#1f2937', fontSize: '18px', fontWeight: '700', margin: '12px 0' }}>
                        ✅ Payment Successful!
                      </h3>
                      <p style={{ color: '#6b7280', fontSize: '14px', margin: '8px 0' }}>
                        Content unlocked. Redirecting...
                      </p>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Instamojo Section - DISABLED */}
            {false && (
              <>
                {/* Instamojo code removed - not needed */}
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
          <div style={{ textAlign: 'center', padding: '40px 20px', position: 'relative', overflow: 'hidden' }}>
            {/* Confetti Background */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    width: '8px',
                    height: '8px',
                    backgroundColor: ['#10b981', '#3b82f6', '#ffffff', '#000000'][i % 4],
                    borderRadius: '50%',
                    left: `${Math.random() * 100}%`,
                    top: '-10px',
                    opacity: 0.8,
                    animation: `confetti-fall 3s ease-out ${i * 0.08}s forwards`,
                  }}
                />
              ))}
            </div>

            {/* Success Icon */}
            <div style={{ position: 'relative', zIndex: 1, marginBottom: '24px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '90px',
                  height: '90px',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2))',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: '50%',
                  marginBottom: '12px',
                  border: '2px solid rgba(16, 185, 129, 0.4)',
                  boxShadow: '0 8px 32px 0 rgba(16, 185, 129, 0.15)',
                  animation: 'pop-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                <CheckCircle size={60} style={{ color: '#10b981' }} />
              </div>
            </div>

            {/* Main Message */}
            <h2
              style={{
                fontSize: '32px',
                fontWeight: '800',
                marginBottom: '8px',
                background: 'linear-gradient(to right, #10b981, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'fade-in 0.8s ease-out 0.2s both',
                color: '#10b981',
              }}
            >
              Payment Successful! ✓
            </h2>

            {/* Subtitle */}
            <p
              style={{
                color: 'rgba(255, 255, 255, 0.85)',
                fontSize: '16px',
                marginBottom: '24px',
                animation: 'fade-in 0.8s ease-out 0.4s both',
                fontWeight: '500',
              }}
            >
              Your premium access is ready
            </p>

            {/* Content Card - Glassmorphism */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(59, 130, 246, 0.12))',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '24px',
                animation: 'slide-up 0.8s ease-out 0.3s both',
                boxShadow: '0 8px 32px 0 rgba(16, 185, 129, 0.1)',
              }}
            >
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: '600' }}>
                ✓ UNLOCKED
              </p>
              <h3
                style={{
                  color: 'white',
                  fontSize: '20px',
                  fontWeight: '700',
                  marginBottom: '10px',
                }}
              >
                {content.title}
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '13px', letterSpacing: '0.3px' }}>
                📺 Full HD • ∞ Forever Access • 🎬 Premium Quality
              </p>
            </div>

            {/* Action Message */}
            <p
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(16, 185, 129, 0.15))',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '20px',
                padding: '10px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                animation: 'fade-in 0.8s ease-out 0.5s both',
                letterSpacing: '0.5px',
              }}
            >
              ⏱️ Redirecting in 3 seconds...
            </p>

            {/* Close Button - Glassmorphic */}
            <button
              onClick={onClose}
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(59, 130, 246, 0.25))',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                color: 'white',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                padding: '14px 40px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                animation: 'fade-in 0.8s ease-out 0.6s both',
                boxShadow: '0 8px 32px 0 rgba(16, 185, 129, 0.15)',
                letterSpacing: '0.5px',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.transform = 'scale(1.08) translateY(-2px)';
                (e.target as HTMLButtonElement).style.boxShadow = '0 12px 40px 0 rgba(16, 185, 129, 0.25)';
                (e.target as HTMLButtonElement).style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.35), rgba(59, 130, 246, 0.35))';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.transform = 'scale(1) translateY(0)';
                (e.target as HTMLButtonElement).style.boxShadow = '0 8px 32px 0 rgba(16, 185, 129, 0.15)';
                (e.target as HTMLButtonElement).style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(59, 130, 246, 0.25))';
              }}
            >
              Continue Watching 🎬
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes confetti-fall {
          to {
            transform: translateY(500px) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes pop-in {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
