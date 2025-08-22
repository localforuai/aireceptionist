import React from 'react';
import { ArrowPathIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { LanguageSelector } from '../LanguageSelector';
import { useVapiData } from '../../hooks/useVapiData';

export const DashboardHeader: React.FC = () => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const { refreshData, loading, useRealData, toggleDataSource } = useVapiData(user?.id);

  return (
    <div className="bg-white border-b border-gray-200 px-2 sm:px-4 py-2 sm:py-3 flex-shrink-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center min-w-0">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
            <svg className="w-3 h-3 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">{t('header.title')}</h1>
            <p className="text-xs text-gray-600 truncate">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <LanguageSelector />
          
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={toggleDataSource}
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                useRealData 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {useRealData ? t('header.live') : t('header.demo')}
            </button>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={refreshData}
              disabled={loading}
              className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={signOut}
              className="inline-flex items-center px-2 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {t('header.exit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};