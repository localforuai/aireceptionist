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
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Cog6ToothIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-900 mb-1">Demo Mode Active</h4>
            <p className="text-sm text-blue-700 mb-3">
              You're currently viewing demo data. Click "Switch to Live Data" to connect to your real Vapi account via the backend server.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={onToggleDataSource}
                className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors bg-blue-600 text-white hover:bg-blue-700"
              >
                Switch to Live Data
              </button>
              <span className="text-xs text-blue-600 self-center">
                (Requires backend server running on port 3001)
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-green-900 mb-1">Live Data Connected</h4>
          <p className="text-sm text-green-700 mb-3">
            Connected to your Vapi account via secure backend server using your private key.
          </p>
          <button
            onClick={onToggleDataSource}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors"
          >
            Switch to Demo Mode
          </button>
          <div className="mt-2 text-xs text-green-600">
            Backend Server: http://localhost:3001 | Private Key: Secure ✓
          </div>
        </div>
      </div>
    </div>
  );
};