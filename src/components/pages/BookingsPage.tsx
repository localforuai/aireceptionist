import React, { useState } from 'react';
import { CalendarIcon, ClockIcon, UserIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { useVapiData } from '../../hooks/useVapiData';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { format, addDays, startOfDay } from 'date-fns';

interface Booking {
  id: string;
  time: string;
  customer: string;
  phone: string;
  service: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  duration: number;
}

export const BookingsPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { calendarData, loading } = useVapiData(user?.id);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAllWeekDays, setShowAllWeekDays] = useState(false);
  const [showAllAppointments, setShowAllAppointments] = useState(false);

  // Mock bookings data
  const generateBookings = (date: Date, count?: number): Booking[] => {
    const bookings: Booking[] = [];
    const baseDate = startOfDay(date);
    
    // Generate more bookings for demonstration (15-25 per day)
    const bookingCount = count || Math.floor(Math.random() * 11) + 15;
    
    for (let i = 0; i < bookingCount; i++) {
      const hour = 9 + Math.floor(Math.random() * 9); // 9 AM to 6 PM
      const minute = Math.random() > 0.5 ? 0 : 30;
      
      bookings.push({
        id: `booking_${date.getTime()}_${i}`,
        time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        customer: ['Sarah Johnson', 'Mike Chen', 'Emma Davis', 'John Smith', 'Lisa Wang', 'Alex Brown', 'Maria Garcia', 'David Lee'][Math.floor(Math.random() * 8)],
        phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        service: ['Consultation', 'Follow-up', 'New Patient', 'Check-up', 'Treatment', 'Therapy', 'Assessment'][Math.floor(Math.random() * 7)],
        status: ['confirmed', 'pending', 'cancelled'][Math.floor(Math.random() * 3)] as 'confirmed' | 'pending' | 'cancelled',
        duration: [30, 45, 60, 90][Math.floor(Math.random() * 4)]
      });
    }
    
    return bookings.sort((a, b) => a.time.localeCompare(b.time));
  };

  const todayBookings = generateBookings(selectedDate);
  const weekDates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i)); // 2 weeks for demo
  const displayedWeekDays = showAllWeekDays ? weekDates : weekDates.slice(0, 7);
  const displayedAppointments = showAllAppointments ? todayBookings : todayBookings.slice(0, 8);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-16 bg-gray-100 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
          <div className="lg:col-span-2 h-64 bg-gray-100 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{t('nav.bookings')}</h2>
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">
            {format(selectedDate, 'MMMM d, yyyy')}
          </span>
        </div>
      </div>

      {/* Today's Bookings Summary - Compact */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-2 shadow-sm">
        <div className="flex items-center justify-center gap-2">
          <CalendarIcon className="h-3 w-3 text-green-600" />
          <span className="text-xs font-medium text-green-800">{t('calendar.todaysBookings')}</span>
          <div className="text-base font-bold text-green-700">{todayBookings.length}</div>
          <div className="text-xs text-green-600">{t('calendar.appointments')}</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Week Calendar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-4">{t('bookings.thisWeek')}</h3>
            
            {/* Days Grid - Wrapping */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {displayedWeekDays.map((date) => {
                const dayBookings = generateBookings(date);
                const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                
                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      isSelected 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                          {format(date, 'EEE, MMM d')}
                          {isToday && ` (${t('bookings.today')})`}
                        </div>
                        <div className="text-sm text-gray-500">
                          {dayBookings.length} {t('bookings.appointments')}
                        </div>
                      </div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full opacity-60"></div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Load More Days */}
            {!showAllWeekDays && weekDates.length > 7 && (
              <button
                onClick={() => setShowAllWeekDays(true)}
                className="w-full mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Load More Days ({weekDates.length - 7} more)
              </button>
            )}
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">
                {format(selectedDate, 'EEEE, MMMM d')} {t('bookings.appointments')}
              </h3>
              <span className="text-base text-gray-600">
                {todayBookings.length} {t('bookings.total')}
              </span>
            </div>
            
            {/* Appointments List */}
            <div className="space-y-3">
              {displayedAppointments.map((booking) => (
                <div key={booking.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <ClockIcon className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base font-medium text-gray-900">
                            {booking.time}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({booking.duration} {t('bookings.minutes')})
                          </span>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-base text-gray-600">
                          <div className="flex items-center gap-1">
                            <UserIcon className="w-4 h-4" />
                            <span className="truncate">{booking.customer}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <PhoneIcon className="w-4 h-4" />
                            <span className="truncate">{booking.phone}</span>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-500 mt-1 truncate">
                          {booking.service}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status === 'confirmed' ? t('bookings.confirmed') :
                         booking.status === 'pending' ? t('bookings.pending') :
                         t('bookings.cancelled')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Appointments */}
            {!showAllAppointments && todayBookings.length > 8 && (
              <button
                onClick={() => setShowAllAppointments(true)}
                className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium py-3 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Load More Appointments ({todayBookings.length - 8} more)
              </button>
            )}
            
            {/* Empty State */}
            {todayBookings.length === 0 && (
              <div className="text-center py-12">
                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-base text-gray-500">{t('bookings.noBookings')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};