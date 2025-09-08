import React, { useState } from 'react';
import { 
  CalendarIcon, 
  LinkIcon, 
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PlusIcon,
  CreditCardIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useVapiData } from '../../hooks/useVapiData';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { 
    calendarData, 
    subscriptionData, 
    stripeData,
    loading,
    handleCalendarConnect,
    handleCalendarDisconnect,
    handleSelectCalendar,
    handleChangeSyncMode,
    handleToggleConflictCheck,
    handleTopUp,
    handleToggleAutoTopUp,
    handleSelectTopUpOption,
    handleStripeConnect,
    handleStripeDisconnect
  } = useVapiData(user?.id);

  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [showTopUpConfirm, setShowTopUpConfirm] = useState(false);
  const [showStripeDisconnectConfirm, setShowStripeDisconnectConfirm] = useState(false);

  const formatLastSync = (timestamp: string | null) => {
    if (!timestamp) return t('calendar.never');
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return t('calendar.justNow');
    if (diffMinutes < 60) return `${diffMinutes}${t('calendar.minutesAgo')}`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}${t('calendar.hoursAgo')}`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="h-full space-y-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-100 rounded"></div>
              <div className="h-10 bg-gray-100 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto space-y-6">
      {/* Google Calendar Sync */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center mr-3">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{t('calendar.title')}</h3>
              <p className="text-sm text-gray-600">{t('calendar.appointmentSync')}</p>
            </div>
          </div>

          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            calendarData?.isConnected 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-700'
          }`}>
            {calendarData?.isConnected ? (
              <>
                <CheckCircleIcon className="w-4 h-4 mr-1" />
                {t('calendar.connected')}
              </>
            ) : (
              t('calendar.notConnected')
            )}
          </span>
        </div>

        {/* Error Display */}
        {calendarData?.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-red-700">{calendarData.error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Connection & Settings */}
          <div className="space-y-4">
            {!calendarData?.isConnected ? (
              <button
                onClick={handleCalendarConnect}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                {t('calendar.connect')}
              </button>
            ) : (
              <div className="space-y-4">
                {/* Calendar Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('calendar.selectCalendar')}</label>
                  <select
                    value={calendarData.selectedCalendar || ''}
                    onChange={(e) => handleSelectCalendar(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">{t('calendar.chooseCalendar')}</option>
                    {calendarData.availableCalendars.map(cal => (
                      <option key={cal.id} value={cal.id}>{cal.name}</option>
                    ))}
                  </select>
                </div>

                {/* Sync Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('calendar.syncMode')}</label>
                  <select
                    value={calendarData.syncMode}
                    onChange={(e) => handleChangeSyncMode(e.target.value as '2-way' | 'create-only')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="2-way">{t('calendar.twoWaySync')}</option>
                    <option value="create-only">{t('calendar.createOnly')}</option>
                  </select>
                </div>

                {/* Conflict Check */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="conflictCheck"
                    checked={calendarData.conflictCheck}
                    onChange={(e) => handleToggleConflictCheck(e.target.checked)}
                    className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                  />
                  <label htmlFor="conflictCheck" className="ml-2 text-sm text-gray-700">
                    {t('calendar.freeBusyCheck')}
                  </label>
                </div>

                {/* Disconnect Button */}
                {!showDisconnectConfirm ? (
                  <button
                    onClick={() => setShowDisconnectConfirm(true)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {t('calendar.disconnect')}
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        handleCalendarDisconnect();
                        setShowDisconnectConfirm(false);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      {t('calendar.confirm')}
                    </button>
                    <button
                      onClick={() => setShowDisconnectConfirm(false)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      {t('subscription.cancel')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Status Info */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">{t('calendar.lastSync')}</span>
                <ClockIcon className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600">{formatLastSync(calendarData?.lastSyncTime || null)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription & Billing */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-3">
            <CurrencyDollarIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('subscription.title')}</h3>
            <p className="text-sm text-gray-600">{t('subscription.plan')}</p>
          </div>
        </div>

        {subscriptionData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Usage Overview */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{t('subscription.usage')}</span>
                  <span className="text-sm text-gray-600">
                    {subscriptionData.usedMinutes} / {subscriptionData.totalMinutes} {t('metrics.minutes')}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div 
                    className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((subscriptionData.usedMinutes / subscriptionData.totalMinutes) * 100, 100)}%` }}
                  ></div>
                </div>
                
                <div className="text-sm text-gray-600">
                  {subscriptionData.remainingMinutes} {t('subscription.remaining')}
                </div>
              </div>

              {/* Auto Top-Up */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{t('subscription.autoTopUp')}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={subscriptionData.autoTopUpEnabled}
                      onChange={(e) => handleToggleAutoTopUp(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                
                {/* Auto Top-Up Options */}
                <div className="space-y-2 mb-3">
                  {subscriptionData.topUpOptions.map((option, index) => (
                    <label key={index} className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="autoTopUpOption"
                          checked={subscriptionData.selectedTopUpOption === index}
                          onChange={() => handleSelectTopUpOption(index)}
                          className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 focus:ring-purple-500 focus:ring-2"
                          disabled={!subscriptionData.autoTopUpEnabled}
                        />
                        <span className={`ml-2 text-sm font-medium ${subscriptionData.autoTopUpEnabled ? 'text-gray-600' : 'text-gray-400'}`}>
                        ${option.price}
                      </span>
                      </div>
                      <span className={`text-sm ${subscriptionData.autoTopUpEnabled ? 'text-gray-700' : 'text-gray-400'}`}>
                        {option.minutes} {t('metrics.minutes')}
                      </span>
                    </label>
                  ))}
                </div>
                
                <p className="text-xs text-gray-600">
                  {subscriptionData.autoTopUpEnabled 
                    ? `Auto-buy ${subscriptionData.topUpOptions[subscriptionData.selectedTopUpOption].minutes} ${t('metrics.minutes')} for $${subscriptionData.topUpOptions[subscriptionData.selectedTopUpOption].price} when running low on minutes.`
                    : `Enable to automatically purchase minutes when running low.`
                  }
                </p>
              </div>
            </div>

            {/* Top-Up */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-900 mb-3">{t('subscription.needMore')}</h4>
                
                {/* Top-Up Options */}
                <div className="space-y-3 mb-4">
                  {subscriptionData.topUpOptions.map((option, index) => (
                    <label key={index} className="flex items-center justify-between p-3 border border-green-200 rounded-lg cursor-pointer hover:bg-green-50 transition-colors">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="topUpOption"
                          checked={subscriptionData.selectedTopUpOption === index}
                          onChange={() => handleSelectTopUpOption(index)}
                          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500 focus:ring-2"
                        />
                        <div className="ml-3">
                          <div className="text-xl font-semibold text-green-600">
                            ${option.price}
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-green-700">
                        {option.minutes} {t('metrics.minutes')}
                      </div>
                    </label>
                  ))}
                </div>
                
                <div className="text-center mb-4">
                  <div className="text-sm text-green-600">{t('subscription.oneTime')}</div>
                </div>
                
                {!showTopUpConfirm ? (
                  <button
                    onClick={() => setShowTopUpConfirm(true)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    {t('subscription.buyMinutes').replace('mins', `${subscriptionData.topUpOptions[subscriptionData.selectedTopUpOption].minutes} ${t('metrics.minutes')}`)}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        handleTopUp();
                        setShowTopUpConfirm(false);
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                      {t('subscription.confirmPurchase')}
                    </button>
                    <button
                      onClick={() => setShowTopUpConfirm(false)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      {t('subscription.cancel')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stripe Integration */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center mr-3">
              <CreditCardIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Stripe Integration</h3>
              <p className="text-sm text-gray-600">Connect Stripe to process subscription payments</p>
            </div>
          </div>

          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            stripeData?.isConnected 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-700'
          }`}>
            {stripeData?.isConnected ? (
              <>
                <CheckCircleIcon className="w-4 h-4 mr-1" />
                Connected
              </>
            ) : (
              'Not Connected'
            )}
          </span>
        </div>

        {/* Error Display */}
        {stripeData?.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-red-700">{stripeData.error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Connection & Account Info */}
          <div className="space-y-4">
            {!stripeData?.isConnected ? (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <ShieldCheckIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-blue-900">Secure Payment Processing</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Connect your Stripe account to securely process subscription payments and top-ups. 
                        Your financial data is handled directly by Stripe - we never store payment information.
                      </p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleStripeConnect}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Connect with Stripe
                </button>
                
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• Secure OAuth connection</p>
                  <p>• No sensitive data stored on our servers</p>
                  <p>• Full control over your Stripe account</p>
                  <p>• Disconnect anytime</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Account Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Account Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account ID:</span>
                      <span className="font-mono text-gray-900">{stripeData.accountId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Business Email:</span>
                      <span className="text-gray-900">{stripeData.accountEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Business Name:</span>
                      <span className="text-gray-900">{stripeData.accountName}</span>
                    </div>
                  </div>
                </div>

                {/* Account Status */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Account Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Charges Enabled:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        stripeData.chargesEnabled 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {stripeData.chargesEnabled ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Payouts Enabled:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        stripeData.payoutsEnabled 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
    </div>
  );
};