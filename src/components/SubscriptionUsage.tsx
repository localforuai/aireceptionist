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
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
        <div className="flex items-center mb-2 sm:mb-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-2 sm:mr-3">
            <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm sm:text-lg font-semibold text-gray-900">Subscription</h3>
            <p className="text-xs text-gray-600 truncate">Professional Plan</p>
          </div>
        </div>

        {/* Low minutes alert */}
        {subscriptionData.remainingMinutes < 50 && (
          <div className={`flex items-center px-2 py-1 rounded-lg ${colorClasses[statusColor].bgLight} ${colorClasses[statusColor].border} border`}>
            <ExclamationTriangleIcon className={`h-3 w-3 ${colorClasses[statusColor].text} mr-1`} />
            <span className={`text-xs font-medium ${colorClasses[statusColor].text}`}>
              Running low on minutes!
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Usage Overview */}
        <div className="lg:col-span-2">
          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs sm:text-sm font-medium text-gray-700">Usage</span>
              <span className="text-xs text-gray-600">
                {subscriptionData.usedMinutes} / {subscriptionData.totalMinutes} mins
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${colorClasses[statusColor].bg}`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-gray-900">{subscriptionData.remainingMinutes}</div>
              <div className="text-xs text-gray-600">Remaining</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-gray-900">{subscriptionData.usedMinutes}</div>
              <div className="text-xs text-gray-600">Used</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-gray-900">{subscriptionData.totalMinutes}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
          </div>

          {/* Renewal Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-4 w-4 text-blue-600 mt-0.5" />
              </div>
              <div className="ml-2">
                <h4 className="text-xs sm:text-sm font-medium text-blue-900">Plan Renewal</h4>
                <p className="text-xs text-blue-700 mt-1">
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
        <div className="space-y-3">
          {/* Top-Up Section */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
            <h4 className="text-xs sm:text-sm font-medium text-green-900 mb-2">Need More?</h4>
            <div className="text-center mb-3">
              <div className="text-lg sm:text-xl font-bold text-green-700">{subscriptionData.topUpMinutes} mins</div>
              <div className="text-sm sm:text-lg font-semibold text-green-600">${subscriptionData.topUpPrice}</div>
              <div className="text-xs text-green-600">One-time purchase</div>
            </div>
            
            {!showTopUpConfirm ? (
              <button
                onClick={() => setShowTopUpConfirm(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center text-sm"
              >
                <PlusIcon className="h-3 w-3 mr-1" />
                Buy {subscriptionData.topUpMinutes} mins
              </button>
            ) : (
              <div className="space-y-1">
                <button
                  onClick={() => {
                    onTopUp();
                    setShowTopUpConfirm(false);
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
                >
                  Confirm Purchase
                </button>
                <button
                  onClick={() => setShowTopUpConfirm(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Auto Top-Up Settings */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Cog6ToothIcon className="h-3 w-3 text-gray-600 mr-1" />
                <h4 className="text-xs sm:text-sm font-medium text-gray-900">Auto Top-Up</h4>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={subscriptionData.autoTopUpEnabled}
                  onChange={(e) => onToggleAutoTopUp(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <p className="text-xs text-gray-600">
              Auto-buy {subscriptionData.topUpMinutes} mins for ${subscriptionData.topUpPrice} when low.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};