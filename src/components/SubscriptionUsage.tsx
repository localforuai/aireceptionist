import React, { useState } from 'react';
import { 
  ClockIcon, 
  ExclamationTriangleIcon, 
  PlusIcon,
  Cog6ToothIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { SubscriptionData } from '../types';

interface SubscriptionUsageProps {
  subscriptionData: SubscriptionData;
  loading: boolean;
  onTopUp: () => void;
  onToggleAutoTopUp: (enabled: boolean) => void;
}

export const SubscriptionUsage: React.FC<SubscriptionUsageProps> = ({
  subscriptionData,
  loading,
  onTopUp,
  onToggleAutoTopUp
}) => {
  const [showTopUpConfirm, setShowTopUpConfirm] = useState(false);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-8">
        <div className="h-6 bg-gray-200 rounded mb-4 animate-pulse"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
          <div className="h-20 bg-gray-100 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  const usagePercentage = (subscriptionData.usedMinutes / subscriptionData.totalMinutes) * 100;
  const remainingPercentage = 100 - usagePercentage;
  
  // Determine color based on remaining minutes
  const getStatusColor = () => {
    if (subscriptionData.remainingMinutes > 100) return 'green';
    if (subscriptionData.remainingMinutes > 50) return 'yellow';
    return 'red';
  };

  const statusColor = getStatusColor();
  const colorClasses = {
    green: {
      bg: 'bg-green-500',
      text: 'text-green-700',
      bgLight: 'bg-green-50',
      border: 'border-green-200'
    },
    yellow: {
      bg: 'bg-yellow-500',
      text: 'text-yellow-700',
      bgLight: 'bg-yellow-50',
      border: 'border-yellow-200'
    },
    red: {
      bg: 'bg-red-500',
      text: 'text-red-700',
      bgLight: 'bg-red-50',
      border: 'border-red-200'
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-3">
            <ClockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Subscription & Usage</h3>
            <p className="text-sm text-gray-600">{subscriptionData.planName}</p>
          </div>
        </div>

        {/* Low minutes alert */}
        {subscriptionData.remainingMinutes < 50 && (
          <div className={`flex items-center px-3 py-2 rounded-lg ${colorClasses[statusColor].bgLight} ${colorClasses[statusColor].border} border`}>
            <ExclamationTriangleIcon className={`h-4 w-4 ${colorClasses[statusColor].text} mr-2`} />
            <span className={`text-sm font-medium ${colorClasses[statusColor].text}`}>
              Running low on minutes!
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usage Overview */}
        <div className="lg:col-span-2">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Minutes Usage</span>
              <span className="text-sm text-gray-600">
                {subscriptionData.usedMinutes} / {subscriptionData.totalMinutes} mins
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className={`h-4 rounded-full transition-all duration-300 ${colorClasses[statusColor].bg}`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{subscriptionData.remainingMinutes}</div>
              <div className="text-xs text-gray-600">Remaining</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{subscriptionData.usedMinutes}</div>
              <div className="text-xs text-gray-600">Used</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{subscriptionData.totalMinutes}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
          </div>

          {/* Renewal Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-900">Plan Renewal</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Your plan renews on {formatDate(subscriptionData.renewalDate)} with {subscriptionData.totalMinutes} fresh minutes.
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Note: Unused minutes expire and do not roll over to the next month.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top-Up & Settings */}
        <div className="space-y-4">
          {/* Top-Up Section */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-green-900 mb-3">Need More Minutes?</h4>
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-green-700">{subscriptionData.topUpMinutes} mins</div>
              <div className="text-lg font-semibold text-green-600">${subscriptionData.topUpPrice}</div>
              <div className="text-xs text-green-600">One-time purchase</div>
            </div>
            
            {!showTopUpConfirm ? (
              <button
                onClick={() => setShowTopUpConfirm(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Buy {subscriptionData.topUpMinutes} mins
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onTopUp();
                    setShowTopUpConfirm(false);
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Confirm Purchase
                </button>
                <button
                  onClick={() => setShowTopUpConfirm(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Auto Top-Up Settings */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Cog6ToothIcon className="h-4 w-4 text-gray-600 mr-2" />
                <h4 className="text-sm font-medium text-gray-900">Auto Top-Up</h4>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={subscriptionData.autoTopUpEnabled}
                  onChange={(e) => onToggleAutoTopUp(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <p className="text-xs text-gray-600">
              Automatically purchase {subscriptionData.topUpMinutes} minutes for ${subscriptionData.topUpPrice} when you run out.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};