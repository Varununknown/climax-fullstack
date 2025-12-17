import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import CashfreeService from '../services/cashfreeService';

export const PaymentStatusPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('Processing payment...');

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      const orderId = searchParams.get('orderId');
      const contentId = searchParams.get('contentId');

      if (!orderId) {
        setStatus('failed');
        setMessage('Order ID not found');
        return;
      }

      // Verify payment with backend
      const result = await CashfreeService.verifyPayment(orderId);

      if (result.status === 'approved') {
        setStatus('success');
        setMessage('✅ Payment successful! You can now watch the content.');

        // Redirect to content page after 2 seconds
        setTimeout(() => {
          navigate(`/watch/${contentId}`);
        }, 2000);
      } else if (result.status === 'pending') {
        setStatus('loading');
        setMessage('Payment is being processed. Please wait...');

        // Retry after 2 seconds
        setTimeout(() => verifyPayment(), 2000);
      } else {
        setStatus('failed');
        setMessage('❌ Payment failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      setStatus('failed');
      setMessage(error.response?.data?.message || 'Payment verification failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-white mb-2">Processing Payment</h2>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-400 mb-2">Payment Successful!</h2>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-400 mb-2">Payment Failed</h2>
          </>
        )}

        <p className="text-gray-300 mb-6">{message}</p>

        {status === 'failed' && (
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Go Back & Try Again
          </button>
        )}

        {status === 'success' && (
          <p className="text-sm text-gray-400">Redirecting to content...</p>
        )}
      </div>
    </div>
  );
};

export default PaymentStatusPage;
