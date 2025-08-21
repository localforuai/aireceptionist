import { supabase } from '../lib/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface CreateCheckoutSessionParams {
  priceId: string;
  mode: 'payment' | 'subscription';
  successUrl: string;
  cancelUrl: string;
}

export const createCheckoutSession = async ({
  priceId,
  mode,
  successUrl,
  cancelUrl,
}: CreateCheckoutSessionParams) => {
  if (!supabase) {
    // For demo purposes, simulate a successful checkout
    console.log('Supabase not configured, simulating checkout for demo');
    
    // Generate a mock session ID and redirect to success page
    const mockSessionId = `cs_demo_${Date.now()}`;
    const demoSuccessUrl = successUrl.replace('{CHECKOUT_SESSION_ID}', mockSessionId);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      sessionId: mockSessionId,
      url: demoSuccessUrl
    };
  }
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('No authentication token available');
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/stripe-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      price_id: priceId,
      mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create checkout session');
  }

  const data = await response.json();
  return data;
};