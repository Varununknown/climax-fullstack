import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import CashfreeService from '../../services/cashfreeService';
import { Loader2, AlertCircle, CheckCircle2, X } from 'lucide-react';

interface PaymentTabsProps {
  contentId: string;
  contentTitle: string;
  amount: number;
  onPaymentSuccess: () => void;
  onClose: () => void;
}

type PaymentMethod = 'cashfree' | 'upi' | 'phonepe' | 'cards' | 'wallet' | 'banking';

export const PaymentTabs: React.FC<PaymentTabsProps> = ({
  contentId,
  contentTitle,
  amount,
  onPaymentSuccess,
  onClose
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<PaymentMethod>('cashfree');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const paymentMethods = [
    { id: 'cashfree', label: '💳 Cashfree', icon: '💳' },
    { id: 'upi', label: '📱 UPI', icon: '📱' },
    { id: 'cards', label: '🏧 Cards', icon: '🏧' },
    { id: 'wallet', label: '👛 Wallet', icon: '👛' },
    { id: 'banking', label: '🏦 Banking', icon: '🏦' },
    { id: 'phonepe', label: '📞 PhonePe', icon: '📞' }
  ];

  const handleCashfreePayment = async () => {
    if (!user) {
      setError('Please login to make payment');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const paymentResponse = await CashfreeService.initiatePayment(
        user._id,
        contentId,
        amount,
        user.email,
        user.phone || '9999999999',
        user.name
      );

      if (paymentResponse.success) {
        sessionStorage.setItem('cashfreeOrderId', paymentResponse.orderId);
        sessionStorage.setItem('cashfreeSessionId', paymentResponse.sessionId);
        sessionStorage.setItem('cashfreeContentId', contentId);

        // 🔗 Direct redirect to Cashfree hosted checkout
        const checkoutUrl = `https://sandbox.cashfree.com/pg/checkout/?sessionId=${encodeURIComponent(paymentResponse.sessionId)}`;
        console.log('🌐 Redirecting to Cashfree checkout');
        window.location.href = checkoutUrl;
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

  const getTabContent = () => {
    const baseStyle = {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px'
    };

    const infoBoxStyle = {
      padding: '16px',
      borderRadius: '8px',
      fontSize: '14px'
    };

    const buttonContainerStyle = {
      display: 'flex',
      gap: '12px',
      paddingTop: '16px'
    };

    const cancelBtnStyle: React.CSSProperties = {
      flex: 1,
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      color: '#1f2937',
      backgroundColor: 'white',
      cursor: loading ? 'not-allowed' : 'pointer',
      fontWeight: '600',
      opacity: loading ? 0.5 : 1,
      transition: 'all 0.3s'
    };

    const payBtnStyle: React.CSSProperties = {
      flex: 1,
      padding: '12px 16px',
      backgroundColor: '#16a34a',
      color: 'white',
      borderRadius: '8px',
      border: 'none',
      cursor: loading ? 'not-allowed' : 'pointer',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      opacity: loading ? 0.5 : 1,
      transition: 'all 0.3s'
    };

    switch (activeTab) {
      case 'cashfree':
        return (
          <div style={baseStyle}>
            <div style={{ ...infoBoxStyle, backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <p style={{ fontWeight: '600', color: '#1f2937', marginBottom: '8px', margin: 0 }}>
                💳 Cashfree All-in-One Payment
              </p>
              <ul style={{ fontSize: '14px', color: '#666', margin: '8px 0 0 0', paddingLeft: '20px' }}>
                <li>✓ Credit/Debit Cards</li>
                <li>✓ UPI & Wallets</li>
                <li>✓ Net Banking</li>
                <li>✓ Instant Verification</li>
              </ul>
            </div>
            <div style={{ textAlign: 'center', fontSize: '14px', color: '#999' }}>
              🔒 Secured by Cashfree - PCI DSS Compliant
            </div>
            <div style={buttonContainerStyle}>
              <button onClick={onClose} disabled={loading} style={cancelBtnStyle}>Cancel</button>
              <button onClick={handleCashfreePayment} disabled={loading} style={payBtnStyle}>
                {loading && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
                {loading ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
          </div>
        );
      
      case 'upi':
        return (
          <div style={baseStyle}>
            <div style={{ ...infoBoxStyle, backgroundColor: '#fef3c7', border: '1px solid #fcd34d' }}>
              <p style={{ fontWeight: '600', color: '#1f2937', marginBottom: '8px', margin: 0 }}>
                📱 UPI Payment
              </p>
              <ol style={{ fontSize: '14px', color: '#666', margin: '8px 0 0 0', paddingLeft: '20px' }}>
                <li>Generate QR Code</li>
                <li>Scan with any UPI app</li>
                <li>Enter amount & complete</li>
              </ol>
            </div>
            <div style={{ textAlign: 'center', fontSize: '14px', color: '#999' }}>
              ✓ Instant & Free transfers
            </div>
            <div style={buttonContainerStyle}>
              <button onClick={onClose} style={cancelBtnStyle}>Close</button>
              <button onClick={() => setActiveTab('cashfree')} style={{...payBtnStyle, backgroundColor: '#2563eb'}}>
                Switch to Cashfree
              </button>
            </div>
          </div>
        );
      
      case 'cards':
        return (
          <div style={baseStyle}>
            <div style={{ ...infoBoxStyle, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <p style={{ fontWeight: '600', color: '#1f2937', marginBottom: '8px', margin: 0 }}>
                🏧 Credit/Debit Cards
              </p>
              <ul style={{ fontSize: '14px', color: '#666', margin: '8px 0 0 0', paddingLeft: '20px' }}>
                <li>✓ Visa & Mastercard</li>
                <li>✓ RuPay Cards</li>
                <li>✓ Safe & Encrypted</li>
                <li>✓ Instant Transaction</li>
              </ul>
            </div>
            <div style={buttonContainerStyle}>
              <button onClick={onClose} style={cancelBtnStyle}>Close</button>
              <button onClick={handleCashfreePayment} disabled={loading} style={payBtnStyle}>
                {loading ? 'Processing...' : 'Pay with Card'}
              </button>
            </div>
          </div>
        );
      
      case 'wallet':
        return (
          <div style={baseStyle}>
            <div style={{ ...infoBoxStyle, backgroundColor: '#fdf2f8', border: '1px solid #fbcfe8' }}>
              <p style={{ fontWeight: '600', color: '#1f2937', marginBottom: '8px', margin: 0 }}>
                👛 Digital Wallets
              </p>
              <ul style={{ fontSize: '14px', color: '#666', margin: '8px 0 0 0', paddingLeft: '20px' }}>
                <li>✓ Google Pay</li>
                <li>✓ PhonePe Wallet</li>
                <li>✓ Paytm Wallet</li>
                <li>✓ Amazon Pay</li>
              </ul>
            </div>
            <div style={buttonContainerStyle}>
              <button onClick={onClose} style={cancelBtnStyle}>Close</button>
              <button onClick={handleCashfreePayment} disabled={loading} style={payBtnStyle}>
                {loading ? 'Processing...' : 'Pay with Wallet'}
              </button>
            </div>
          </div>
        );
      
      case 'banking':
        return (
          <div style={baseStyle}>
            <div style={{ ...infoBoxStyle, backgroundColor: '#f5f3ff', border: '1px solid #e9d5ff' }}>
              <p style={{ fontWeight: '600', color: '#1f2937', marginBottom: '8px', margin: 0 }}>
                🏦 Net Banking
              </p>
              <ul style={{ fontSize: '14px', color: '#666', margin: '8px 0 0 0', paddingLeft: '20px' }}>
                <li>✓ All Major Banks</li>
                <li>✓ Secure Transfer</li>
                <li>✓ Low Fees</li>
                <li>✓ Direct Debit</li>
              </ul>
            </div>
            <div style={buttonContainerStyle}>
              <button onClick={onClose} style={cancelBtnStyle}>Close</button>
              <button onClick={handleCashfreePayment} disabled={loading} style={payBtnStyle}>
                {loading ? 'Processing...' : 'Pay via Bank'}
              </button>
            </div>
          </div>
        );
      
      case 'phonepe':
        return (
          <div style={baseStyle}>
            <div style={{ ...infoBoxStyle, backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
              <p style={{ fontWeight: '600', color: '#1f2937', marginBottom: '8px', margin: 0 }}>
                📞 PhonePe Payment
              </p>
              <ul style={{ fontSize: '14px', color: '#666', margin: '8px 0 0 0', paddingLeft: '20px' }}>
                <li>✓ PhonePe App Payment</li>
                <li>✓ Instant Settlement</li>
                <li>✓ Cashback Available</li>
                <li>✓ Direct UPI Link</li>
              </ul>
            </div>
            <div style={buttonContainerStyle}>
              <button onClick={onClose} style={cancelBtnStyle}>Close</button>
              <button onClick={() => setActiveTab('upi')} style={{...payBtnStyle, backgroundColor: '#dc2626'}}>
                Open PhonePe
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: '0',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    }}>
      <div style={{
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
        padding: '24px',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '24px', marginTop: '0' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px', margin: 0 }}>
            Unlock Premium Content
          </h2>
          <p style={{ color: '#666', marginBottom: '8px', margin: 0 }}>{contentTitle}</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#16a34a', marginTop: '16px', margin: 0 }}>
            ₹{amount}
          </p>
        </div>

        {/* Payment Method Tabs - Horizontal Scroll for Mobile */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          overflowX: 'auto',
          paddingBottom: '8px',
          borderBottom: '2px solid #e5e7eb',
          scrollBehavior: 'smooth'
        }}>
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setActiveTab(method.id as PaymentMethod)}
              style={{
                padding: '10px 14px',
                fontWeight: '600',
                fontSize: '13px',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s',
                color: activeTab === method.id ? '#2563eb' : '#666',
                borderBottom: activeTab === method.id ? '3px solid #2563eb' : '0px',
                backgroundColor: activeTab === method.id ? '#dbeafe' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '6px'
              }}
            >
              {method.label}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '16px',
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-start'
          }}>
            <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div style={{
            backgroundColor: '#dcfce7',
            border: '1px solid #bbf7d0',
            color: '#166534',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '16px',
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-start'
          }}>
            <CheckCircle2 size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>Payment successful! Redirecting...</span>
          </div>
        )}

        {/* Tab Content */}
        {getTabContent()}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PaymentTabs;

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
        sessionStorage.setItem('cashfreeSessionId', paymentResponse.sessionId);
        sessionStorage.setItem('cashfreeContentId', contentId);

        // 🔗 Direct redirect to Cashfree hosted checkout
        const checkoutUrl = `https://sandbox.cashfree.com/pg/checkout/?sessionId=${encodeURIComponent(paymentResponse.sessionId)}`;
        console.log('🌐 Redirecting to Cashfree checkout');
        window.location.href = checkoutUrl;
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
    <div style={{
      position: 'fixed',
      inset: '0',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    }}>
      <div style={{
        width: '100%',
        maxWidth: '500px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
        padding: '24px',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '24px', marginTop: '0' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
            Unlock Content
          </h2>
          <p style={{ color: '#666', marginBottom: '8px' }}>{contentTitle}</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#16a34a', marginTop: '16px' }}>
            ₹{amount}
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <button
            onClick={() => setActiveTab('cashfree')}
            style={{
              flex: 1,
              padding: '12px 16px',
              fontWeight: '600',
              fontSize: '16px',
              transition: 'all 0.3s',
              color: activeTab === 'cashfree' ? '#2563eb' : '#666',
              borderBottom: activeTab === 'cashfree' ? '2px solid #2563eb' : 'none',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            💳 Cashfree Pay
          </button>
          <button
            onClick={() => setActiveTab('upi')}
            style={{
              flex: 1,
              padding: '12px 16px',
              fontWeight: '600',
              fontSize: '16px',
              transition: 'all 0.3s',
              color: activeTab === 'upi' ? '#2563eb' : '#666',
              borderBottom: activeTab === 'upi' ? '2px solid #2563eb' : 'none',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            📱 UPI
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '16px',
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-start'
          }}>
            <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div style={{
            backgroundColor: '#dcfce7',
            border: '1px solid #bbf7d0',
            color: '#166534',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '16px',
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-start'
          }}>
            <CheckCircle2 size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>Payment successful! Redirecting...</span>
          </div>
        )}

        {/* Cashfree Tab Content */}
        {activeTab === 'cashfree' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Payment Methods Info */}
            <div style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              padding: '16px',
              borderRadius: '8px'
            }}>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                💳 Payment Methods:
              </p>
              <ul style={{ fontSize: '14px', color: '#666', margin: 0, paddingLeft: '20px' }}>
                <li>✓ Credit/Debit Cards</li>
                <li>✓ UPI</li>
                <li>✓ Net Banking</li>
                <li>✓ Digital Wallets</li>
              </ul>
            </div>

            {/* Secure Badge */}
            <div style={{ textAlign: 'center', fontSize: '14px', color: '#999' }}>
              🔒 Secured by Cashfree - 100% Safe
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', paddingTop: '16px' }}>
              <button
                onClick={onClose}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  color: '#1f2937',
                  backgroundColor: 'white',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  opacity: loading ? 0.5 : 1,
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  if (!loading) (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = 'white';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCashfreePayment}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  backgroundColor: '#16a34a',
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: loading ? 0.5 : 1,
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  if (!loading) (e.target as HTMLButtonElement).style.backgroundColor = '#15803d';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#16a34a';
                }}
              >
                {loading && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
                {loading ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
          </div>
        )}

        {/* UPI Tab Content */}
        {activeTab === 'upi' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fcd34d',
              padding: '16px',
              borderRadius: '8px'
            }}>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                📱 UPI Payment Instructions:
              </p>
              <ol style={{ fontSize: '14px', color: '#666', margin: 0, paddingLeft: '20px' }}>
                <li>Click "Generate QR" or "UPI Deep Link"</li>
                <li>Complete payment from your UPI app</li>
                <li>Paste the transaction ID</li>
                <li>Verify and get instant access</li>
              </ol>
            </div>

            <div style={{ textAlign: 'center', color: '#999', fontSize: '14px' }}>
              ℹ️ Switch to Cashfree for instant verification
            </div>

            <div style={{ display: 'flex', gap: '12px', paddingTop: '16px' }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  color: '#1f2937',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = 'white';
                }}
              >
                Close
              </button>
              <button
                onClick={() => setActiveTab('cashfree')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
                }}
              >
                Try Cashfree
              </button>
            </div>
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

export default PaymentTabs;
