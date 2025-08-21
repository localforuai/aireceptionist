import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getProductByPriceId } from '../stripe-config';

interface Subscription {
  subscription_status: string;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export const useSubscription = (userId: string | undefined) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        // Check if Supabase is properly configured
        if (!supabase) {
          console.log('Supabase not configured, skipping subscription fetch');
          setSubscription(null);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('stripe_user_subscriptions')
          .select('*')
          .maybeSingle();

        if (error) {
          console.error('Error fetching subscription:', error);
          // Don't show error if it's just a missing table (Supabase not fully set up)
          if (error.message.includes('relation') || error.message.includes('does not exist')) {
            console.log('Subscription table not found, Supabase may not be fully configured');
            setSubscription(null);
          } else {
            setError(error.message);
          }
        } else {
          setSubscription(data);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        // Don't show error for network issues when Supabase isn't configured
        console.log('Subscription fetch failed, likely due to Supabase configuration');
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [userId]);

  const getSubscriptionPlan = () => {
    if (!subscription?.price_id) return null;
    return getProductByPriceId(subscription.price_id);
  };

  const isActive = subscription?.subscription_status === 'active';
  const isTrialing = subscription?.subscription_status === 'trialing';
  const isPastDue = subscription?.subscription_status === 'past_due';
  const isCanceled = subscription?.subscription_status === 'canceled';

  return {
    subscription,
    loading,
    error,
    isActive,
    isTrialing,
    isPastDue,
    isCanceled,
    plan: getSubscriptionPlan(),
  };
};