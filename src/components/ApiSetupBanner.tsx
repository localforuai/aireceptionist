import React from 'react';
import { ExclamationTriangleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

interface ApiSetupBannerProps {
  useRealData: boolean;
  onToggleDataSource: () => void;
}

export const ApiSetupBanner: React.FC<ApiSetupBannerProps> = ({ useRealData, onToggleDataSource }) => {
  const hasApiKey = !!import.meta.env.VITE_VAPI_API_KEY;

  if (!useRealData) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start">
          <Cog6ToothIcon className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-xs sm:text-sm font-medium text-blue-900 mb-1">Demo Mode</h4>
            <p className="text-xs text-blue-700 mb-2">
              Viewing demo data. Switch to live data to connect to Vapi.
            </p>
            <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
              <button
                onClick={onToggleDataSource}
                className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md transition-colors bg-blue-600 text-white hover:bg-blue-700"
              >
                Switch to Live Data
              </button>
              <span className="text-xs text-blue-600 self-center hidden sm:inline">
                (Requires backend server running on port 3001)
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
      <div className="flex items-start">
        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center mt-0.5 mr-2 flex-shrink-0">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
        <div className="flex-1">
          <h4 className="text-xs sm:text-sm font-medium text-green-900 mb-1">Live Data</h4>
          <p className="text-xs text-green-700 mb-2">
            Connected to your Vapi account via secure backend server using your private key.
          </p>
          <button
            onClick={onToggleDataSource}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors"
          >
            Switch to Demo Mode
          </button>
          <div className="mt-1 text-xs text-green-600 hidden sm:block">
            Backend Server: http://localhost:3001 | Private Key: Secure ✓
          </div>
        </div>
      </div>
    </div>
  );
};