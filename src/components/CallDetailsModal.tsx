import React from 'react';
import { XMarkIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline';
import { CallData } from '../types';
import { format } from 'date-fns';

interface CallDetailsModalProps {
  call: CallData;
  onClose: () => void;
}

export const CallDetailsModal: React.FC<CallDetailsModalProps> = ({ call, onClose }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'failed': return 'bg-red-100 text-red-700';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getEndReasonDisplay = (reason: string) => {
    return reason.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Call Details - {call.customerPhone}
            </h3>
            <button
              onClick={onClose}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Call Information */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Call Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Start Time:</span>
                    <p className="font-medium">{format(new Date(call.startTime), 'MMM d, yyyy h:mm a')}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">End Time:</span>
                    <p className="font-medium">{format(new Date(call.endTime), 'MMM d, yyyy h:mm a')}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <p className="font-medium">{formatDuration(call.duration)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Assistant:</span>
                    <p className="font-medium">{call.assistantName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(call.status)}`}>
                      {call.status.replace('-', ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">End Reason:</span>
                    <p className="font-medium">{getEndReasonDisplay(call.endReason)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Success Rating:</span>
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${call.successRating >= 80 ? 'bg-green-500' : call.successRating >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${call.successRating}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{call.successRating}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Audio Player */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Audio Recording</h4>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
                  >
                    {isPlaying ? (
                      <PauseIcon className="h-5 w-5" />
                    ) : (
                      <PlayIcon className="h-5 w-5 ml-0.5" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0:45</span>
                      <span>{formatDuration(call.duration)}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Audio URL: <span className="font-mono">{call.audioUrl}</span>
                </p>
              </div>
            </div>

            {/* Transcript */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Call Transcript</h4>
              <div className="bg-white rounded border p-4 max-h-96 overflow-y-auto">
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {call.transcript}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};