import React, { useState } from 'react';
import { 
  CalendarIcon, 
  LinkIcon, 
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { CalendarSyncData } from '../types';

interface GoogleCalendarSyncProps {
  calendarData: CalendarSyncData;
  loading: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onSelectCalendar: (calendarId: string) => void;
  onChangeSyncMode: (mode: '2-way' | 'create-only') => void;
  onToggleConflictCheck: (enabled: boolean) => void;
}

export const GoogleCalendarSync: React.FC<GoogleCalendarSyncProps> = ({
  calendarData,
  loading,
  onConnect,
  onDisconnect,
  onSelectCalendar,
  onChangeSyncMode,
  onToggleConflictCheck
}) => {
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 sm:p-4">
        <div className="h-4 bg-gray-200 rounded mb-3 animate-pulse"></div>
        <div className="space-y-2">
          <div className="h-8 bg-gray-100 rounded animate-pulse"></div>
          <div className="h-6 bg-gray-100 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  const formatLastSync = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center mr-2 sm:mr-3">
            <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm sm:text-lg font-semibold text-gray-900">Google Calendar</h3>
            <p className="text-xs text-gray-600">Appointment sync</p>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            calendarData.isConnected 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-700'
          }`}>
            {calendarData.isConnected ? (
              <>
                <CheckCircleIcon className="w-3 h-3 mr-1" />
                Connected
              </>
            ) : (
              'Not connected'
            )}
          </span>
        </div>
      </div>

      {/* Error Display */}
      {calendarData.error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-3 w-3 text-red-600 mt-0.5 mr-1 flex-shrink-0" />
            <p className="text-xs text-red-700 truncate">{calendarData.error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Connection & Calendar Selection */}
        <div className="lg:col-span-2 space-y-3">
          {!calendarData.isConnected ? (
            <button
              onClick={onConnect}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center text-sm"
            >
              <LinkIcon className="h-3 w-3 mr-1" />
              Connect Google Calendar
            </button>
          ) : (
            <div className="space-y-2">
              {/* Calendar Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Select Calendar</label>
                <select
                  value={calendarData.selectedCalendar || ''}
                  onChange={(e) => onSelectCalendar(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-xs"
                >
                  <option value="">Choose calendar...</option>
                  {calendarData.availableCalendars.map(cal => (
                    <option key={cal.id} value={cal.id}>
                      {cal.name.length > 25 ? cal.name.substring(0, 25) + '...' : cal.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sync Options */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Sync Mode</label>
                  <select
                    value={calendarData.syncMode}
                    onChange={(e) => onChangeSyncMode(e.target.value as '2-way' | 'create-only')}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-xs"
                  >
                    <option value="2-way">2-Way Sync</option>
                    <option value="create-only">Create Only</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={calendarData.conflictCheck}
                      onChange={(e) => onToggleConflictCheck(e.target.checked)}
                      className="w-3 h-3 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                    />
                    <span className="ml-1 text-xs text-gray-700">Free/Busy Check</span>
                  </label>
                </div>
              </div>

              {/* Disconnect Button */}
              {!showDisconnectConfirm ? (
                <button
                  onClick={() => setShowDisconnectConfirm(true)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-1.5 px-3 rounded-lg transition-colors text-xs"
                >
                  Disconnect
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => {
                      onDisconnect();
                      setShowDisconnectConfirm(false);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-1.5 px-3 rounded-lg transition-colors text-xs"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setShowDisconnectConfirm(false)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-1.5 px-3 rounded-lg transition-colors text-xs"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stats & Status */}
        <div className="space-y-3">
          {/* Daily Bookings */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-blue-700">{calendarData.dailyBookingCount}</div>
              <div className="text-xs text-blue-600">Today's Bookings</div>
            </div>
          </div>

          {/* Last Sync */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <ClockIcon className="h-3 w-3 text-gray-600 mr-1" />
                <span className="text-xs font-medium text-gray-900">Last Sync</span>
              </div>
            </div>
            <p className="text-xs text-gray-600">{formatLastSync(calendarData.lastSyncTime)}</p>
          </div>

          {/* Settings Hint */}
          {calendarData.isConnected && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
              <div className="flex items-start">
                <Cog6ToothIcon className="h-3 w-3 text-orange-600 mt-0.5 mr-1 flex-shrink-0" />
                <p className="text-xs text-orange-700">
                  Sync runs every 15 minutes automatically
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};