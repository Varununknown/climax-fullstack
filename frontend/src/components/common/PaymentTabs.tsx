import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import RazorpayService from '../../services/razorpayService';
import { AlertCircle, X } from 'lucide-react';

interface PaymentTabsProps {
  contentId: string;
  contentTitle: string;
  amount: number;
  onClose: () => void;
}

type PaymentMethod = 'razorpay' | 'upi' | 'upi-deeplink' | 'cards' | 'wallet' | 'banking';

export const PaymentTabs: React.FC<PaymentTabsProps> = ({
  contentId,
  contentTitle,
  amount,
  onClose
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<PaymentMethod>('razorpay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const paymentMethods = [
    { id: 'razorpay', label: '💳 Razorpay', icon: '💳' },
    { id: 'upi', label: '📲 UPI QR', icon: '📲' },
    { id: 'upi-deeplink', label: '📱 UPI App', icon: '📱' },
    { id: 'cards', label: '🏦 Cards', icon: '🏦' },
    { id: 'wallet', label: '💰 Wallet', icon: '💰' },
    { id: 'banking', label: '🏧 Banking', icon: '🏧' }
  ];

  const handleRazorpayPayment = async () => {
    if (!user) {
      setError('Please login to make payment');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Create Razorpay order
      const order = await RazorpayService.createOrder({
        userId: user.id,
        contentId,
        amount,
        email: user.email,
        phone: user.phone || '9999999999',
        userName: user.name
      });

      // Open Razorpay checkout
      RazorpayService.openCheckout(
        order,
        user.email,
        user.name,
        user.phone || '9999999999',
        async (response: any) => {
          // Payment successful - verify on backend
          try {
            const verifyResponse = await RazorpayService.verifyPayment(
              order.id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              user.id,
              contentId,
              amount
            );

            if (verifyResponse.success) {
              setError('✅ Payment successful! Access granted.');
              setTimeout(() => {
                onClose();
              }, 2000);
            } else {
              setError(verifyResponse.message || 'Payment verification failed');
            }
          } catch (err: any) {
            console.error('Verification error:', err);
            setError('Payment verified but access update failed. Please refresh.');
          } finally {
            setLoading(false);
          }
        },
        (error: any) => {
          console.error('Payment error:', error);
          setError(error.message || 'Payment failed. Please try again.');
          setLoading(false);
        }
      );
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Failed to initiate payment');
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
      case 'razorpay':
        return (
          <div style={baseStyle}>
            <div style={{ ...infoBoxStyle, backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <p style={{ fontWeight: '600', color: '#1f2937', marginBottom: '8px', margin: 0 }}>
                💳 Razorpay Secure Payment
              </p>
              <ul style={{ fontSize: '14px', color: '#666', margin: '8px 0 0 0', paddingLeft: '20px' }}>
                <li>✓ Credit/Debit Cards</li>
                <li>✓ UPI & Net Banking</li>
                <li>✓ Digital Wallets</li>
                <li>✓ Instant Settlement</li>
              </ul>
            </div>
            <div style={{ textAlign: 'center', fontSize: '14px', color: '#999' }}>
              🔒 PCI DSS Compliant - 100% Secure
            </div>
            <div style={buttonContainerStyle}>
              <button onClick={onClose} disabled={loading} style={cancelBtnStyle}>Cancel</button>
              <button onClick={handleRazorpayPayment} disabled={loading} style={payBtnStyle}>
                {loading ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
          </div>
        );
      
      case 'upi':
        return (
          <div style={baseStyle}>
            <div style={{ ...infoBoxStyle, backgroundColor: '#f0fdf4', border: '1px solid #86efac' }}>
              <p style={{ fontWeight: '600', color: '#1f2937', marginBottom: '8px', margin: 0 }}>
                📲 UPI QR Code Payment
              </p>
              <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                Scan with any UPI app and complete payment
              </p>
            </div>
            <div style={buttonContainerStyle}>
              <button onClick={onClose} disabled={loading} style={cancelBtnStyle}>Cancel</button>
              <button onClick={() => {}} disabled={true} style={{...payBtnStyle, opacity: 0.7}}>
                Coming Soon
              </button>
            </div>
          </div>
        );

      case 'upi-deeplink':
        return (
          <div style={baseStyle}>
            <div style={{ ...infoBoxStyle, backgroundColor: '#f0fdf4', border: '1px solid #86efac' }}>
              <p style={{ fontWeight: '600', color: '#1f2937', marginBottom: '8px', margin: 0 }}>
                📱 UPI App Payment
              </p>
              <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                Opens directly in your UPI app
              </p>
            </div>
            <div style={buttonContainerStyle}>
              <button onClick={onClose} disabled={loading} style={cancelBtnStyle}>Cancel</button>
              <button onClick={() => {}} disabled={true} style={{...payBtnStyle, opacity: 0.7}}>
                Coming Soon
              </button>
            </div>
          </div>
        );

      case 'cards':
        return (
          <div style={baseStyle}>
            <div style={{ ...infoBoxStyle, backgroundColor: '#fef3c7', border: '1px solid #fcd34d' }}>
              <p style={{ fontWeight: '600', color: '#1f2937', marginBottom: '8px', margin: 0 }}>
                🏦 Card Payment
              </p>
              <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                Debit & Credit Cards
              </p>
            </div>
            <div style={buttonContainerStyle}>
              <button onClick={onClose} disabled={loading} style={cancelBtnStyle}>Cancel</button>
              <button onClick={() => {}} disabled={true} style={{...payBtnStyle, opacity: 0.7}}>
                Coming Soon
              </button>
            </div>
          </div>
        );

      case 'wallet':
        return (
          <div style={baseStyle}>
            <div style={{ ...infoBoxStyle, backgroundColor: '#f5e6ff', border: '1px solid #e9d5ff' }}>
              <p style={{ fontWeight: '600', color: '#1f2937', marginBottom: '8px', margin: 0 }}>
                💰 Digital Wallet
              </p>
              <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                PayPal, Google Pay, Apple Pay
              </p>
            </div>
            <div style={buttonContainerStyle}>
              <button onClick={onClose} disabled={loading} style={cancelBtnStyle}>Cancel</button>
              <button onClick={() => {}} disabled={true} style={{...payBtnStyle, opacity: 0.7}}>
                Coming Soon
              </button>
            </div>
          </div>
        );

      case 'banking':
        return (
          <div style={baseStyle}>
            <div style={{ ...infoBoxStyle, backgroundColor: '#f3e8ff', border: '1px solid #e9d5ff' }}>
              <p style={{ fontWeight: '600', color: '#1f2937', marginBottom: '8px', margin: 0 }}>
                🏧 Net Banking
              </p>
              <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                All major banks supported
              </p>
            </div>
            <div style={buttonContainerStyle}>
              <button onClick={onClose} disabled={loading} style={cancelBtnStyle}>Cancel</button>
              <button onClick={() => {}} disabled={true} style={{...payBtnStyle, opacity: 0.7}}>
                Coming Soon
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

        {/* Payment Method Tabs */}
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

        {/* Tab Content */}
        {getTabContent()}
      </div>
    </div>
  );
};

export default PaymentTabs;
