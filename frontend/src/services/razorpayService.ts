/**
 * Razorpay Payment Service
 * Handles all Razorpay payment transactions
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

interface RazorpayPaymentRequest {
  userId: string;
  contentId: string;
  amount: number;
  email: string;
  phone: string;
  userName: string;
}

interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

export interface RazorpayResponse {
  success: boolean;
  message?: string;
  orderId?: string;
  error?: string;
}

class RazorpayService {
  private keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_SJFNtWf14PitN5';

  /**
   * Create payment order via backend
   */
  async createOrder(request: RazorpayPaymentRequest): Promise<RazorpayOrder> {
    try {
      console.log('💳 Creating Razorpay order...', request);

      const response = await fetch(`${BACKEND_URL}/api/razorpay/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create order');
      }

      const data = await response.json();
      console.log('✅ Order created:', data);
      return data;
    } catch (err: any) {
      console.error('❌ Order creation error:', err);
      throw err;
    }
  }

  /**
   * Verify payment after successful transaction
   */
  async verifyPayment(
    orderId: string,
    paymentId: string,
    signature: string,
    userId: string,
    contentId: string,
    amount: number
  ): Promise<RazorpayResponse> {
    try {
      console.log('✅ Verifying Razorpay payment...');

      const response = await fetch(`${BACKEND_URL}/api/razorpay/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        body: JSON.stringify({
          orderId,
          paymentId,
          signature,
          userId,
          contentId,
          amount
        })
      });

      const data = await response.json();
      console.log('💳 Verification response:', data);
      return data;
    } catch (err: any) {
      console.error('❌ Verification error:', err);
      throw err;
    }
  }

  /**
   * Get Razorpay key ID for frontend
   */
  getKeyId(): string {
    return this.keyId;
  }

  /**
   * Open Razorpay checkout using modern hosted checkout
   */
  openCheckout(
    order: RazorpayOrder,
    userEmail: string,
    userName: string,
    userPhone: string,
    onSuccess: (response: any) => void,
    onError: (error: any) => void
  ): void {
    // Ensure Razorpay is loaded
    if (!(window as any).Razorpay) {
      console.error('❌ Razorpay SDK not loaded');
      onError(new Error('Razorpay SDK not loaded'));
      return;
    }

    // Create invisible overlay to block background touches
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'transparent';
    overlay.style.zIndex = '999999';
    overlay.style.pointerEvents = 'auto';
    overlay.id = 'razorpay-overlay';
    
    // Prevent default touch behaviors on overlay
    overlay.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    overlay.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
    
    document.body.appendChild(overlay);

    // Disable scroll on body
    const body = document.body;
    const originalOverflow = body.style.overflow;
    body.style.overflow = 'hidden';

    const cleanupOverlay = () => {
      const existingOverlay = document.getElementById('razorpay-overlay');
      if (existingOverlay) {
        existingOverlay.remove();
      }
      body.style.overflow = originalOverflow;
    };

    const options = {
      key: this.keyId,
      amount: order.amount,
      currency: order.currency || 'INR',
      order_id: order.id,
      name: 'Climax OTT',
      description: 'Premium Content Access',
      prefill: {
        name: userName,
        email: userEmail,
        contact: userPhone
      },
      theme: {
        color: '#3b82f6'
      },
      handler: function (response: any) {
        console.log('✅ Payment successful:', response);
        cleanupOverlay();
        onSuccess(response);
      },
      modal: {
        ondismiss: function () {
          console.log('❌ Payment cancelled');
          cleanupOverlay();
          onError(new Error('Payment cancelled by user'));
        }
      }
    };

    try {
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error('❌ Error opening Razorpay:', err);
      cleanupOverlay();
      onError(err);
    }
  }
}

export default new RazorpayService();
