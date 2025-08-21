import React, { useState } from 'react';
import { CreditCardIcon } from '@heroicons/react/24/outline';
import { StripeProduct } from '../stripe-config';
import { createCheckoutSession } from '../services/stripe';

interface ProductCardProps {
  product: StripeProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const { url } = await createCheckoutSession({
        priceId: product.priceId,
        mode: product.mode,
        successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: window.location.href,
      });

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start checkout process. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    const locale = currency === 'aud' ? 'en-AU' : 'en-GB';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(price);
  };

  const isFreeTrial = product.price === 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-4">{product.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-gray-900">
            {isFreeTrial ? 'Free' : formatPrice(product.price, product.currency)}
          </span>
          <span className="text-sm text-gray-500">
            {isFreeTrial ? 'trial' : product.mode === 'subscription' ? 'per month' : 'one-time'}
          </span>
        </div>

        <button
          onClick={handlePurchase}
          disabled={loading}
          className={`inline-flex items-center px-4 py-2 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isFreeTrial 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Processing...
            </div>
          ) : (
            <>
              <CreditCardIcon className="w-4 h-4 mr-2" />
              {isFreeTrial ? 'Start Free Trial' : product.mode === 'subscription' ? 'Subscribe' : 'Purchase'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};