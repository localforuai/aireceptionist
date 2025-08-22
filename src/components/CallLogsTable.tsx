import React, { useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, PlayIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { CallData } from '../types';
import { format } from 'date-fns';
import { CallDetailsModal } from './CallDetailsModal';

interface CallLogsTableProps {
  callData: CallData[];
  loading: boolean;
}

export const CallLogsTable: React.FC<CallLogsTableProps> = ({ callData, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assistantFilter, setAssistantFilter] = useState<string>('all');
  const [selectedCall, setSelectedCall] = useState<CallData | null>(null);

  const filteredCalls = callData.filter(call => {
    const matchesSearch = call.customerPhone.includes(searchTerm) || 
                         call.transcript.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         call.assistantName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || call.status === statusFilter;
    const matchesAssistant = assistantFilter === 'all' || call.assistantName === assistantFilter;
    
    return matchesSearch && matchesStatus && matchesAssistant;
  });

  const uniqueAssistants = Array.from(new Set(callData.map(call => call.assistantName)));

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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6">
          <div className="h-6 bg-gray-200 rounded mb-4 animate-pulse"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Call Logs</h3>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search calls..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="in-progress">In Progress</option>
              </select>

              {/* Assistant Filter */}
              <select
                value={assistantFilter}
                onChange={(e) => setAssistantFilter(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="all">All Assistants</option>
                {uniqueAssistants.map(assistant => (
                  <option key={assistant} value={assistant}>{assistant}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto min-w-0">
          <table className="w-full min-w-[640px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assistant</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCalls.slice(0, 20).map((call) => (
                <tr key={call.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {format(new Date(call.startTime), 'MMM d, yyyy')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(call.startTime), 'h:mm a')}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {call.customerPhone}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {call.assistantName}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDuration(call.duration)}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(call.status)}`}>
                      {call.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${call.successRating >= 80 ? 'bg-green-500' : call.successRating >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${call.successRating}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{call.successRating}%</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedCall(call)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="View Details"
                      >
                        <DocumentTextIcon className="h-4 w-4" />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-900 transition-colors"
                        title="Play Audio"
                      >
                        <PlayIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredCalls.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No calls found matching your criteria.</p>
            </div>
          )}

          {filteredCalls.length > 20 && (
            <div className="p-4 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-600">Showing 20 of {filteredCalls.length} calls</p>
            </div>
          )}
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