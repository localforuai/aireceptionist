import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { ChartData } from '../types';

interface CallAnalysisChartsProps {
  chartData: ChartData;
  loading: boolean;
}

export const CallAnalysisCharts: React.FC<CallAnalysisChartsProps> = ({ chartData, loading }) => {
  const COLORS = ['#2563eb', '#0d9488', '#ea580c', '#dc2626', '#7c3aed', '#059669'];

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="h-6 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
      {/* Call End Reasons */}
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 border border-gray-100">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3">End Reasons</h3>
        <ResponsiveContainer width="100%" height={150}>
          <PieChart>
            <Pie
              data={chartData.endReasons}
              cx="50%"
              cy="50%"
              outerRadius={45}
              dataKey="count"
              label={({ reason, percentage }) => `${reason}: ${percentage}%`}
              labelLine={false}
            >
              {chartData.endReasons.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name, props) => [`${value} calls (${props.payload.percentage}%)`, props.payload.reason]} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Daily Call Volume */}
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 border border-gray-100">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3">Daily Volume</h3>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={chartData.dailyCallVolume}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 9 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 9 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} />
            <Tooltip />
            <Bar yAxisId="left" dataKey="calls" fill="#ea580c" radius={[2, 2, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="minutes" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};