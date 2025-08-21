import React, { useEffect, useState } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { getProductByPriceId } from '../stripe-config';

export const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [productInfo, setProductInfo] = useState<any>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionIdParam = urlParams.get('session_id');
    setSessionId(sessionIdParam);
    
    // In a real implementation, you would fetch the session details from Stripe
    // For now, we'll show the test product info
    const testProduct = getProductByPriceId('AUTEST003M00O-10');
    setProductInfo(testProduct);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {productInfo?.price === 0 ? 'Trial Started!' : 'Payment Successful!'}
          </h2>
          <p className="text-gray-600 mb-8">
            {productInfo?.price === 0 
              ? 'Your free trial has been activated successfully.'
              : 'Thank you for your purchase. Your payment has been processed successfully.'
            }
          </p>
          
          {productInfo && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-blue-900 mb-1">Product Details</h3>
              <p className="text-sm text-blue-700">{productInfo.name}</p>
              <p className="text-xs text-blue-600 mt-1">{productInfo.description}</p>
            </div>
          )}

          {sessionId && (
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">Session ID:</p>
              <p className="text-xs font-mono text-gray-800 break-all">{sessionId}</p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate('/products')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              View More Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};