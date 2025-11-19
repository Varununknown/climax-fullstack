// Instamojo Payment Service Configuration
const INSTAMOJO_CONFIG = {
  API_URL: process.env.REACT_APP_INSTAMOJO_API || 'http://localhost:5000/api/instamojo',
  SANDBOX_MODE: process.env.REACT_APP_INSTAMOJO_SANDBOX !== 'false', // true by default
};

export const initiateInstamojoPayment = async (userId, contentId, amount) => {
  try {
    console.log('💳 Initiating Instamojo payment...');

    const response = await fetch(`${INSTAMOJO_CONFIG.API_URL}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        contentId,
        amount, // in paise
        purpose: `Payment for content purchase`,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment request');
    }

    const data = await response.json();
    
    if (data.success && data.paymentUrl) {
      console.log('✅ Payment URL generated:', data.paymentUrl);
      // Redirect to Instamojo payment page
      window.location.href = data.paymentUrl;
      return {
        success: true,
        transactionId: data.transactionId,
        paymentUrl: data.paymentUrl,
      };
    } else {
      throw new Error(data.error || 'Failed to create payment');
    }
  } catch (error) {
    console.error('❌ Instamojo payment error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const verifyInstamojoPayment = async (transactionId, userId, contentId) => {
  try {
    console.log('🔍 Verifying Instamojo payment...');

    const response = await fetch(`${INSTAMOJO_CONFIG.API_URL}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactionId,
        userId,
        contentId,
      }),
    });

    const data = await response.json();

    if (data.verified) {
      console.log('✅ Payment verified successfully');
      return { verified: true };
    } else {
      console.log('⚠️ Payment verification pending or failed');
      return { verified: false, message: data.message };
    }
  } catch (error) {
    console.error('❌ Verification error:', error);
    return { verified: false, error: error.message };
  }
};

export const checkInstamojoStatus = async (transactionId) => {
  try {
    const response = await fetch(
      `${INSTAMOJO_CONFIG.API_URL}/status/${transactionId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Status check error:', error);
    return null;
  }
};

export default INSTAMOJO_CONFIG;
