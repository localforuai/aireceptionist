import React from 'react';
import { ClockIcon, PhoneIcon, CheckCircleIcon, CurrencyDollarIcon, CalendarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useVapiData } from '../../hooks/useVapiData';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { format } from 'date-fns';

export const OverviewPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { 
    metrics, 
    subscriptionData, 
    calendarData, 
    callData, 
    loading, 
    handleTopUp, 
    handleToggleAutoTopUp,
    handleSelectTopUpOption,
    checkLowMinutesNotification
  } = useVapiData(user?.id);

  // Check for low minutes notification when subscription data changes
  React.useEffect(() => {
    if (subscriptionData && !loading) {
      checkLowMinutesNotification(subscriptionData, t);
    }
  }, [subscriptionData, loading, checkLowMinutesNotification, t]);

  if (loading) {
    return (
      <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-lg p-3 sm:p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const kpiCards = [
    {
      title: t('metrics.totalCalls'),
      value: metrics?.totalCalls.toLocaleString() || '0',
      icon: PhoneIcon,
      color: 'blue',
      change: '+8.2%'
    },
    {
      title: t('metrics.totalCallMinutes'),
      value: `${metrics?.totalCallMinutes.toLocaleString() || '0'}`,
      unit: t('metrics.minutes'),
      icon: ClockIcon,
      color: 'teal',
      change: '+12.5%'
    },
    {
      title: t('metrics.successRate'),
      value: `${metrics?.callSuccessRate || 0}%`,
      icon: CheckCircleIcon,
      color: 'green',
      change: '+5.4%'
    },
    {
      title: t('metrics.avgCallDuration'),
      value: metrics ? `${Math.floor(metrics.averageCallDuration / 60)}:${(metrics.averageCallDuration % 60).toString().padStart(2, '0')}` : '0:00',
      icon: CurrencyDollarIcon,
      color: 'orange',
      change: '-3.1%'
    }
  ];

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    teal: 'from-teal-500 to-teal-600',
    orange: 'from-orange-500 to-orange-600',
    green: 'from-green-500 to-green-600'
  };

  const nextBookings = [
    { time: '2:30 PM', customer: 'Sarah Johnson', service: 'Consultation' },
    { time: '4:00 PM', customer: 'Mike Chen', service: 'Follow-up' }
  ];

  const isLiveCall = callData.some(call => call.status === 'in-progress');

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 overflow-hidden">
      {/* KPI Cards */}
      <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {kpiCards.map((card, index) => (
          <div key={card.title} className="bg-white rounded-lg shadow-sm p-2 sm:p-3 border border-gray-100">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-r ${colorClasses[card.color as keyof typeof colorClasses]} flex items-center justify-center`}>
                <card.icon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <span className={`text-xs font-medium px-1 py-0.5 rounded-full ${
                card.change.startsWith('+') 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {card.change}
              </span>
            </div>
            <div className="space-y-0.5">
              <p className="text-sm sm:text-lg font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-600 truncate">{card.title}</p>
              {card.unit && <p className="text-xs text-gray-400">{card.unit}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Live Call Status */}
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900">{t('overview.liveStatus')}</h3>
          <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            isLiveCall 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-700'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-1 ${
              isLiveCall ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`}></div>
            {isLiveCall ? t('overview.liveCall') : t('overview.noActiveCalls')}
          </div>
        </div>
        {isLiveCall && (
          <div className="text-xs text-gray-600">
            <p>{t('overview.currentCall')}: +1 (555) 123-4567</p>
            <p>{t('overview.duration')}: 2:34</p>
          </div>
        )}
      </div>

      {/* Next Bookings */}
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900">{t('overview.nextBookings')}</h3>
          <CalendarIcon className="w-4 h-4 text-gray-400" />
        </div>
        <div className="space-y-2">
          {nextBookings.map((booking, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <div>
                <p className="font-medium text-gray-900">{booking.time}</p>
                <p className="text-gray-600">{booking.customer}</p>
              </div>
              <span className="text-gray-500">{booking.service}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription Mini */}
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900">{t('subscription.title')}</h3>
          {subscriptionData && subscriptionData.remainingMinutes < 50 && (
            <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
          )}
        </div>
        {subscriptionData && (
          <div className="space-y-2">
            <div className="text-xs">
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">{subscriptionData.usedMinutes}/{subscriptionData.totalMinutes} {t('metrics.minutes')}</span>
                <span className="font-medium">{subscriptionData.remainingMinutes} {t('subscription.remaining')}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((subscriptionData.usedMinutes / subscriptionData.totalMinutes) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => handleTopUp(t)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-1 px-2 rounded transition-colors"
              >
                {t('subscription.buyMinutes').replace('mins', `${subscriptionData.topUpOptions[subscriptionData.selectedTopUpOption].minutes}`)}
              </button>
              <button
                onClick={() => handleToggleAutoTopUp(!subscriptionData.autoTopUpEnabled)}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                  subscriptionData.autoTopUpEnabled
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {t('subscription.autoTopUp')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Google Calendar Status */}
      <div className="lg:col-span-3 bg-white rounded-lg shadow-sm p-3 sm:p-4 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center mr-3">
              <CalendarIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{t('calendar.title')}</h3>
              <p className="text-xs text-gray-600">{t('calendar.appointmentSync')}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {calendarData && (
              <>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-700">{calendarData.dailyBookingCount}</div>
                  <div className="text-xs text-gray-600">{t('calendar.todaysBookings')}</div>
                </div>
                
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  calendarData.isConnected 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {calendarData.isConnected ? t('calendar.connected') : t('calendar.notConnected')}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};