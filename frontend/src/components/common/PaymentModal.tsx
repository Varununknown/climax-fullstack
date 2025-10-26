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

// All-inline-styles Modal - NO Tailwind classes to eliminate conflicts
export const PaymentModal: React.FC<PaymentModalProps> = ({
  content,
  onSuccess,
  onClose
}) => {
  const { user } = useAuth();
  const [paymentStep, setPaymentStep] = useState<'qr' | 'waiting' | 'success' | 'payU'>('qr');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'payU'>('payU'); // Default to Gateway
  const [transactionId, setTransactionId] = useState('');
  const [txnError, setTxnError] = useState('');
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handlePayUPayment = async () => {
    if (!user?.id || !content._id) {
      alert('Missing user or content information');
      return;
    }

    const paymentWindow = window.open('', '_blank');
    setIsProcessing(true);
    console.log('🔄 PayU initiated');

    try {
      const response = await fetch(`${BACKEND_URL}/api/payu/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        const form = document.createElement('form');
        form.innerHTML = data.formHtml;
        try {
          if (paymentWindow && paymentWindow.name) {
            form.target = paymentWindow.name;
          }
        } catch (e) {
          console.warn('Window target error:', e);
        }
        document.body.appendChild(form);
        try {
          (form as HTMLFormElement).submit();
        } catch (submitErr) {
          const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
          if (submitBtn) submitBtn.click();
        }
      } else {
        alert('PayU unavailable. Try UPI payment.');
        setIsProcessing(false);
        if (paymentWindow) paymentWindow.close();
      }
    } catch (err) {
      alert('Payment error. Try again.');
      setIsProcessing(false);
      if (paymentWindow) paymentWindow.close();
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

        {/* QR Step */}
        {paymentStep === 'qr' && (
          <>
            <div style={{ marginBottom: '12px' }}>
              <h2 style={titleStyle}>Unlock Premium</h2>
              <p style={subtitleStyle}>Watch "{content.title}"</p>
            </div>

            {/* Tabs */}
            {paymentSettings?.payuEnabled && (
              <div style={tabsContainerStyle}>
                <button
                  onClick={() => setPaymentMethod('upi')}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    setPaymentMethod('upi');
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  style={paymentMethod === 'upi' ? tabButtonActiveStyle : tabButtonInactiveStyle}
                >
                  <QrCode size={16} style={{ display: 'inline', marginRight: '6px' }} />
                  QR Code
                </button>
                <button
                  onClick={() => setPaymentMethod('payU')}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    setPaymentMethod('payU');
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  style={paymentMethod === 'payU' ? tabButtonActiveStyle : tabButtonInactiveStyle}
                >
                  <CreditCard size={16} style={{ display: 'inline', marginRight: '6px' }} />
                  Gateway
                </button>
              </div>
            )}

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

            {/* PayU Section */}
            {paymentMethod === 'payU' && (
              <>
                <div style={{ background: 'linear-gradient(to bottom right, rgba(30, 58, 138, 0.3), rgba(88, 28, 135, 0.3))', border: '1px solid rgba(59, 130, 246, 0.4)', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <CreditCard size={20} style={{ color: '#60a5fa', marginTop: '2px' }} />
                    <div>
                      <h3 style={{ fontWeight: '600', color: 'white', fontSize: '14px' }}>Fast Checkout</h3>
                      <p style={{ fontSize: '12px', color: 'rgb(209, 213, 219)', marginTop: '2px' }}>Secure PayU Gateway</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePayUPayment}
                  onTouchStart={(e) => {
                    if (isProcessing) return;
                    e.preventDefault();
                    handlePayUPayment();
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  disabled={isProcessing}
                  style={isProcessing ? disabledButtonStyle : submitButtonStyle}
                >
                  {isProcessing ? (
                    <>
                      <div style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite', marginRight: '8px' }} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard size={16} style={{ display: 'inline', marginRight: '6px' }} />
                      Continue to PayU
                    </>
                  )}
                </button>

                <p style={{ fontSize: '12px', color: 'rgb(107, 114, 128)', textAlign: 'center', marginTop: '8px' }}>
                  ✓ Instant & Secure Payment
                </p>

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
                    backgroundColor: ['#ff006e', '#8338ec', '#3a86ff', '#fb5607', '#ffbe0b'][i % 5],
                    borderRadius: '50%',
                    left: `${Math.random() * 100}%`,
                    top: '-10px',
                    boxShadow: '0 0 10px currentColor',
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
                  background: 'linear-gradient(135deg, rgba(255, 0, 110, 0.3), rgba(131, 56, 236, 0.3))',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  borderRadius: '50%',
                  marginBottom: '12px',
                  border: '2px solid rgba(255, 0, 110, 0.5)',
                  boxShadow: '0 8px 32px 0 rgba(255, 0, 110, 0.2)',
                  animation: 'pop-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                <CheckCircle size={60} style={{ color: '#ff006e', filter: 'drop-shadow(0 0 10px rgba(255, 0, 110, 0.6))' }} />
              </div>
            </div>

            {/* Main Message */}
            <h2
              style={{
                fontSize: '32px',
                fontWeight: '800',
                marginBottom: '8px',
                background: 'linear-gradient(135deg, #ff006e 0%, #8338ec 50%, #3a86ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'fade-in 0.8s ease-out 0.2s both',
                textShadow: '0 0 30px rgba(255, 0, 110, 0.3)',
              }}
            >
              Payment Successful! 🎉
            </h2>

            {/* Subtitle */}
            <p
              style={{
                color: 'rgba(229, 229, 229, 0.9)',
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
                background: 'linear-gradient(135deg, rgba(255, 0, 110, 0.15), rgba(131, 56, 236, 0.15))',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 0, 110, 0.3)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '24px',
                animation: 'slide-up 0.8s ease-out 0.3s both',
                boxShadow: '0 8px 32px 0 rgba(255, 0, 110, 0.15)',
              }}
            >
              <p style={{ color: 'rgba(200, 200, 255, 0.8)', fontSize: '12px', marginBottom: '6px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                ✨ Unlocked
              </p>
              <h3
                style={{
                  color: 'white',
                  fontSize: '20px',
                  fontWeight: '700',
                  marginBottom: '8px',
                  background: 'linear-gradient(135deg, #ff006e, #3a86ff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {content.title}
              </h3>
              <p style={{ color: 'rgba(200, 200, 255, 0.7)', fontSize: '13px', letterSpacing: '0.5px' }}>
                📺 Full HD • ∞ Forever Access • 🎬 Premium Quality
              </p>
            </div>

            {/* Action Message */}
            <p
              style={{
                background: 'linear-gradient(135deg, rgba(255, 0, 110, 0.2), rgba(131, 56, 236, 0.2))',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                color: 'rgba(255, 200, 255, 0.9)',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '20px',
                padding: '10px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 0, 110, 0.2)',
                animation: 'fade-in 0.8s ease-out 0.5s both',
                letterSpacing: '0.5px',
              }}
            >
              ✨ Redirecting to content in 3 seconds...
            </p>

            {/* Close Button - Modern Glassmorphic */}
            <button
              onClick={onClose}
              style={{
                background: 'linear-gradient(135deg, rgba(255, 0, 110, 0.4), rgba(131, 56, 236, 0.4))',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                color: 'white',
                border: '1px solid rgba(255, 0, 110, 0.5)',
                padding: '14px 40px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                animation: 'fade-in 0.8s ease-out 0.6s both',
                boxShadow: '0 8px 32px 0 rgba(255, 0, 110, 0.3)',
                letterSpacing: '0.5px',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.transform = 'scale(1.08) translateY(-2px)';
                (e.target as HTMLButtonElement).style.boxShadow = '0 12px 40px 0 rgba(255, 0, 110, 0.5)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.transform = 'scale(1) translateY(0)';
                (e.target as HTMLButtonElement).style.boxShadow = '0 8px 32px 0 rgba(255, 0, 110, 0.3)';
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
