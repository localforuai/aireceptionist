import React, { useState } from 'react';
import { MagnifyingGlassIcon, PlayIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { useVapiData } from '../../hooks/useVapiData';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { CallData } from '../../types';
import { format } from 'date-fns';
import { CallDetailsModal } from '../CallDetailsModal';

export const CallsPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { callData, loading } = useVapiData(user?.id);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCall, setSelectedCall] = useState<CallData | null>(null);
  const [showAll, setShowAll] = useState(false);

  const filteredCalls = callData.filter(call => {
    return statusFilter === 'all' || call.status === statusFilter;
  });

  const displayCalls = showAll ? filteredCalls : filteredCalls.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'failed': return 'bg-red-100 text-red-700';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="h-12 bg-gray-200 rounded mb-4 animate-pulse"></div>
        <div className="flex-1 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col overflow-hidden">
        {/* Header with Filters */}
        <div className="flex-shrink-0 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('callLogs.title')}</h2>
            
            <div className="flex gap-2">
              {/* Status Filter Chips */}
              {['all', 'completed', 'failed', 'in-progress'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    statusFilter === status
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? t('callLogs.allStatus') : 
                   status === 'completed' ? t('callLogs.completed') :
                   status === 'failed' ? t('callLogs.failed') :
                   t('callLogs.inProgress')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calls List */}
        <div className="flex-1 overflow-hidden">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-gray-100">
                {displayCalls.map((call) => (
                  <div key={call.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <div className="text-sm font-medium text-gray-900">
                              {call.customerPhone}
                            </div>
                            <div className="text-xs text-gray-500">
                              {format(new Date(call.startTime), 'MMM d, h:mm a')}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-gray-900 truncate">
                              {call.assistantName}
                            </div>
                            <div className="text-xs text-gray-600">
                              {formatDuration(call.duration)} • {call.successRating}% {t('callLogs.success')}
                            </div>
                          </div>
                          
                          <div className="flex-shrink-0 flex items-center gap-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(call.status)}`}>
                              {call.status === 'completed' ? t('callLogs.done') : 
                               call.status === 'failed' ? t('callLogs.failed') : 
                               t('callLogs.active')}
                            </span>
                            
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setSelectedCall(call)}
                                className="text-blue-600 hover:text-blue-900 transition-colors p-1"
                                title={t('callLogs.viewDetails')}
                              >
                                <DocumentTextIcon className="h-4 w-4" />
                              </button>
                              <button
                                className="text-green-600 hover:text-green-900 transition-colors p-1"
                                title={t('callLogs.playAudio')}
                              >
                                <PlayIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* View All Button */}
            {!showAll && filteredCalls.length > 5 && (
              <div className="flex-shrink-0 p-3 border-t border-gray-100 text-center">
                <button
                  onClick={() => setShowAll(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {t('callLogs.viewAll')} ({filteredCalls.length - 5} {t('callLogs.more')})
                </button>
              </div>
            )}
            
            {filteredCalls.length === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-gray-500">{t('callLogs.noCalls')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedCall && (
        <CallDetailsModal 
          call={selectedCall} 
          onClose={() => setSelectedCall(null)} 
        />
      )}
    </>
  );
};