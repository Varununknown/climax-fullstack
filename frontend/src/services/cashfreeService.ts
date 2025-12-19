import API from './api';

/**
 * Cashfree Payment Integration Service
 * Handles payment initiation, verification, and status checking
 */

export const CashfreeService = {
  /**
   * Initiate payment
   * @param {string} userId - User ID
   * @param {string} contentId - Content ID
   * @param {number} amount - Payment amount in INR
   * @param {string} email - User email
   * @param {string} phone - User phone number
   * @param {string} userName - User name
   * @returns {Promise} - Payment session details
   */
  initiatePayment: async (userId, contentId, amount, email, phone, userName) => {
    try {
      const payload = {
        userId,
        contentId,
        amount,
        email,
        phone,
        userName
      };
      
      console.log('📤 Sending Cashfree request:', payload);
      
      const response = await API.post('/cashfree/initiate', payload);
      
      console.log('✅ Cashfree response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Cashfree Error Details:');
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      console.error('Message:', error.message);
      throw error;
    }
  },

  /**
   * Verify payment after user completes transaction
   * @param {string} orderId - Order ID from initiation
   * @returns {Promise} - Payment verification status
   */
  verifyPayment: async (orderId) => {
    try {
      const response = await API.post('/cashfree/verify', { orderId });
      return response.data;
    } catch (error) {
      console.error('❌ Error verifying payment:', error);
      throw error;
    }
  },

  /**
   * Check if user has paid for content
   * @param {string} userId - User ID
   * @param {string} contentId - Content ID
   * @returns {Promise} - Payment status
   */
  checkPaymentStatus: async (userId, contentId) => {
    try {
      const response = await API.get(`/cashfree/status/${userId}/${contentId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error checking payment status:', error);
      throw error;
    }
  }
};

export default CashfreeService;
