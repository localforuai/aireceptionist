import React from 'react';
import { DashboardHeader } from './DashboardHeader';
import { MetricsCards } from './MetricsCards';
import { CallAnalysisCharts } from './CallAnalysisCharts';
import { CallLogsTable } from './CallLogsTable';
import { SubscriptionUsage } from './SubscriptionUsage';
import { ApiSetupBanner } from './ApiSetupBanner';
import { useAuth } from '../hooks/useAuth';
import { useVapiData } from '../hooks/useVapiData';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    callData, 
    metrics, 
    chartData, 
    subscriptionData,
    loading, 
    error, 
    refreshData, 
    useRealData, 
    toggleDataSource,
    handleTopUp,
    handleToggleAutoTopUp
  } = useVapiData(user?.id);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <DashboardHeader 
        onRefresh={refreshData} 
        isRefreshing={loading} 
        useRealData={useRealData}
        onToggleDataSource={toggleDataSource}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* API Setup Banner */}
        <ApiSetupBanner 
          useRealData={useRealData} 
          onToggleDataSource={toggleDataSource} 
        />

        {/* Metrics Overview */}
        {metrics && (
          <MetricsCards metrics={metrics} loading={loading} />
        )}

        {/* Subscription & Usage */}
        {subscriptionData && (
          <SubscriptionUsage 
            subscriptionData={subscriptionData} 
            loading={loading}
            onTopUp={handleTopUp}
            onToggleAutoTopUp={handleToggleAutoTopUp}
          />
        )}

        {/* Call Analysis Charts */}
        {chartData && (
          <CallAnalysisCharts chartData={chartData} loading={loading} />
        )}

        {/* Call Logs Table */}
        <CallLogsTable callData={callData} loading={loading} />
      </main>
    </div>
  );
};