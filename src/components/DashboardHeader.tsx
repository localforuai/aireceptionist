import React from 'react';
import { ArrowPathIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface DashboardHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  useRealData: boolean;
  onToggleDataSource: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  onRefresh, 
  isRefreshing, 
  useRealData, 
  onToggleDataSource 
}) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">AI Receptionist Dashboard</h1>
            <p className="text-xs sm:text-sm text-gray-600">{user?.email}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-gray-600">Data Source:</span>
            <button
              onClick={onToggleDataSource}
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                useRealData 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {useRealData ? 'Live Vapi Data' : 'Demo Data'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-xs sm:text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <ArrowPathIcon className={`-ml-0.5 mr-1 sm:mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
              <span className="sm:hidden">Refresh</span>
            </button>

            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-xs sm:text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Cog6ToothIcon className="-ml-0.5 mr-1 sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>

            <button
              onClick={signOut}
              className="inline-flex items-center px-3 py-2 border border-transparent text-xs sm:text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <span className="hidden sm:inline">Sign Out</span>
              <span className="sm:hidden">Exit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};