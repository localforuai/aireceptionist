import React from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useSubscription } from '../hooks/useSubscription';

interface SubscriptionStatusProps {
  userId: string;
}

export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ userId }) => {
  const { subscription, loading, error, isActive, isTrialing, isPastDue, isCanceled, plan } = useSubscription(userId);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <XCircleIcon className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-700 text-sm">Error loading subscription: {error}</span>
        </div>
      </div>
    );
  }

  if (!subscription || !plan) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-gray-600 mr-2" />
          <span className="text-gray-700 text-sm">No active subscription</span>
        </div>
      </div>
    );
  }

  const getStatusColor = () => {
    if (isActive || isTrialing) return 'text-green-700 bg-green-50 border-green-200';
    if (isPastDue) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    if (isCanceled) return 'text-red-700 bg-red-50 border-red-200';
    return 'text-gray-700 bg-gray-50 border-gray-200';
  };

  const getStatusIcon = () => {
    if (isActive || isTrialing) return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
    if (isPastDue) return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
    return <XCircleIcon className="h-5 w-5 text-red-600" />;
  };

  const getStatusText = () => {
    if (isActive) return 'Active';
    if (isTrialing) return 'Trial';
    if (isPastDue) return 'Past Due';
    if (isCanceled) return 'Canceled';
    return subscription.subscription_status;
  };

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {getStatusIcon()}
          <div className="ml-3">
            <h3 className="text-sm font-medium">{plan.name}</h3>
            <p className="text-xs opacity-75">Status: {getStatusText()}</p>
          </div>
        </div>
        {subscription.current_period_end && (
          <div className="text-right">
            <p className="text-xs opacity-75">
              {subscription.cancel_at_period_end ? 'Expires' : 'Renews'} on{' '}
              {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};