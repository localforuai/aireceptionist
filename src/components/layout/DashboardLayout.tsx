import React from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardHeader } from './DashboardHeader';
import { NavigationTabs } from './NavigationTabs';
import { NotificationContainer } from '../NotificationContainer';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="h-screen bg-gray-50 overflow-hidden flex flex-col">
      <DashboardHeader />
      <NavigationTabs />
      
      <main className="flex-1 overflow-hidden px-2 sm:px-4 py-2 sm:py-4">
        <div className="h-full max-w-7xl mx-auto">
          <NotificationContainer />
          <Outlet />
        </div>
      </main>
    </div>
  );
};