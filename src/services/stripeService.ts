const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

interface PaymentIntent {
  id: string;
  client_secret: string;
  status: string;
}

interface TopUpOption {
  minutes: number;
  price: number;
}

class StripeService {
  private baseURL: string;

  constructor() {
    this.baseURL = BACKEND_BASE_URL;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Stripe API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (fetchError) {
      if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
        throw new Error('Unable to connect to payment server');
      }
      throw fetchError;
    }
  }

  // Create payment intent for top-up
  async createTopUpPayment(shopId: string, topUpOption: TopUpOption): Promise<PaymentIntent> {
    const response = await this.makeRequest<{ success: boolean; data?: PaymentIntent; error?: string }>('/api/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({
        shopId,
        minutes: topUpOption.minutes,
        amount: topUpOption.price * 100, // Convert to cents
        currency: 'usd'
      })
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create payment intent');
    }

    return response.data;
  }

  // Confirm payment and add minutes
  async confirmPayment(paymentIntentId: string): Promise<boolean> {
    const response = await this.makeRequest<{ success: boolean; error?: string }>('/api/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({
        paymentIntentId
      })
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to confirm payment');
    }

    return true;
  }

  // Get payment history
  async getPaymentHistory(shopId: string): Promise<any[]> {
    const response = await this.makeRequest<{ success: boolean; data?: any[]; error?: string }>(`/api/payments/history/${shopId}`);

    if (!response.success) {
      throw new Error(response.error || 'Failed to get payment history');
    }

    return response.data || [];
  }

  // Setup auto top-up
  async setupAutoTopUp(shopId: string, topUpOption: TopUpOption): Promise<boolean> {
    const response = await this.makeRequest<{ success: boolean; error?: string }>('/api/payments/setup-auto-topup', {
      method: 'POST',
      body: JSON.stringify({
        shopId,
        minutes: topUpOption.minutes,
        amount: topUpOption.price * 100
      })
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to setup auto top-up');
    }

    return true;
  }

  // Cancel auto top-up
  async cancelAutoTopUp(shopId: string): Promise<boolean> {
    const response = await this.makeRequest<{ success: boolean; error?: string }>('/api/payments/cancel-auto-topup', {
      method: 'POST',
      body: JSON.stringify({
        shopId
      })
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to cancel auto top-up');
    }

    return true;
  }
}

export const stripeService = new StripeService();