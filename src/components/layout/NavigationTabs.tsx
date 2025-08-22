import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  PhoneIcon, 
  CalendarIcon, 
  Cog6ToothIcon 
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';

export const NavigationTabs: React.FC = () => {
  const { t } = useLanguage();

  const tabs = [
    { name: t('nav.overview'), href: '/dashboard', icon: HomeIcon },
    { name: t('nav.calls'), href: '/dashboard/calls', icon: PhoneIcon },
    { name: t('nav.bookings'), href: '/dashboard/bookings', icon: CalendarIcon },
    { name: t('nav.settings'), href: '/dashboard/settings', icon: Cog6ToothIcon },
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-2 sm:px-4 flex-shrink-0">
      <nav className="flex space-x-4 sm:space-x-8">
        {tabs.map((tab) => (
          <NavLink
            key={tab.name}
            to={tab.href}
            end={tab.href === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center px-2 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`
            }
          >
            <tab.icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            {tab.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};