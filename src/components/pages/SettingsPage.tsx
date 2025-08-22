import React, { useState } from 'react';
import { 
  CalendarIcon, 
  LinkIcon, 
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PlusIcon
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
    loading,
    handleCalendarConnect,
    handleCalendarDisconnect,
    handleSelectCalendar,
    handleChangeSyncMode,
    handleToggleConflictCheck,
    handleTopUp,
    handleToggleAutoTopUp
  } = useVapiData(user?.id);

  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [showTopUpConfirm, setShowTopUpConfirm] = useState(false);

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

            {calendarData?.isConnected && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700 mb-1">{calendarData.dailyBookingCount}</div>
                  <div className="text-sm text-blue-600">{t('calendar.todaysBookings')}</div>
                </div>
              </div>
            )}
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
                <p className="text-xs text-gray-600">
                  {t('subscription.autoTopUpDesc').replace('mins', `${subscriptionData.topUpMinutes} ${t('metrics.minutes')}`).replace('$', `$${subscriptionData.topUpPrice}`)}
                </p>
              </div>
            </div>

            {/* Top-Up */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-900 mb-3">{t('subscription.needMore')}</h4>
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-green-700">{subscriptionData.topUpMinutes} {t('metrics.minutes')}</div>
                  <div className="text-xl font-semibold text-green-600">${subscriptionData.topUpPrice}</div>
                  <div className="text-sm text-green-600">{t('subscription.oneTime')}</div>
                </div>
                
                {!showTopUpConfirm ? (
                  <button
                    onClick={() => setShowTopUpConfirm(true)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    {t('subscription.buyMinutes').replace('mins', `${subscriptionData.topUpMinutes} ${t('metrics.minutes')}`)}
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
    </div>
  );
};