import React from 'react';
import { ClockIcon, PhoneIcon, ChartBarIcon, CheckCircleIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { DashboardMetrics } from '../types';

interface MetricsCardsProps {
  metrics: DashboardMetrics;
  loading: boolean;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics, loading }) => {
  const cards = [
    {
      title: 'Total Call Minutes',
      value: loading ? '---' : `${metrics.totalCallMinutes.toLocaleString()}`,
      unit: 'minutes',
      icon: ClockIcon,
      color: 'blue',
      change: '+12.5%'
    },
    {
      title: 'Total Calls',
      value: loading ? '---' : metrics.totalCalls.toLocaleString(),
      unit: 'calls',
      icon: PhoneIcon,
      color: 'teal',
      change: '+8.2%'
    },
    {
      title: 'Avg Call Duration',
      value: loading ? '---' : `${Math.floor(metrics.averageCallDuration / 60)}:${(metrics.averageCallDuration % 60).toString().padStart(2, '0')}`,
      unit: 'min:sec',
      icon: ChartBarIcon,
      color: 'orange',
      change: '-3.1%'
    },
    {
      title: 'Success Rate',
      value: loading ? '---' : `${metrics.callSuccessRate}%`,
      unit: 'success',
      icon: CheckCircleIcon,
      color: 'green',
      change: '+5.4%'
    },
    {
      title: 'Total Cost',
      value: loading ? '---' : `$${metrics.totalCost.toFixed(2)}`,
      unit: 'USD',
      icon: CurrencyDollarIcon,
      color: 'purple',
      change: '+15.8%'
    }
  ];

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    teal: 'from-teal-500 to-teal-600',
    orange: 'from-orange-500 to-orange-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600'
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
      {cards.map((card, index) => (
        <div key={card.title} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-r ${colorClasses[card.color as keyof typeof colorClasses]} flex items-center justify-center`}>
              <card.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
              card.change.startsWith('+') 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {card.change}
            </span>
          </div>
          
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">
              {loading ? (
                <div className="h-6 sm:h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                card.value
              )}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">{card.title}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wider">{card.unit}</p>
          </div>
        </div>
      ))}
    </div>
  );
};