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
  const [loadedDays, setLoadedDays] = useState<Record<string, number>>({});

  // Generate bookings for a specific date
  const generateBookings = (date: Date, count?: number): Booking[] => {
    const bookings: Booking[] = [];
    const baseDate = startOfDay(date);
    
    // Generate 15-25 bookings per day for demonstration
    const bookingCount = count || Math.floor(Math.random() * 11) + 15;
    
    for (let i = 0; i < bookingCount; i++) {
      const hour = 9 + Math.floor(Math.random() * 9); // 9 AM to 6 PM
      const minute = Math.random() > 0.5 ? 0 : 30;
      
      bookings.push({
        id: `booking_${date.getTime()}_${i}`,
        time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        customer: ['Sarah Johnson', 'Mike Chen', 'Emma Davis', 'John Smith', 'Lisa Wang', 'Anna Brown', 'David Lee', 'Maria Garcia'][Math.floor(Math.random() * 8)],
        phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        service: ['Consultation', 'Follow-up', 'New Patient', 'Check-up', 'Treatment', 'Therapy', 'Assessment'][Math.floor(Math.random() * 7)],
        status: ['confirmed', 'pending', 'cancelled'][Math.floor(Math.random() * 3)] as 'confirmed' | 'pending' | 'cancelled',
        duration: [30, 45, 60, 90][Math.floor(Math.random() * 4)]
      });
    }
    
    return bookings.sort((a, b) => a.time.localeCompare(b.time));
  };

  // Get next 7 days
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleLoadMore = (dateKey: string) => {
    setLoadedDays(prev => ({
      ...prev,
      [dateKey]: (prev[dateKey] || 10) + 10
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-20 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Week Overview - Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 pb-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('nav.bookings')}</h2>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              {format(new Date(), 'MMMM yyyy')}
            </span>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date) => {
            const dayBookings = generateBookings(date);
            const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            
            return (
              <div
                key={date.toISOString()}
                className={`text-center p-3 rounded-lg border ${
                  isToday 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className={`text-sm font-medium ${isToday ? 'text-blue-700' : 'text-gray-900'}`}>
                  {format(date, 'EEE')}
                </div>
                <div className={`text-lg font-bold ${isToday ? 'text-blue-700' : 'text-gray-900'}`}>
                  {format(date, 'd')}
                </div>
                <div className="text-xs text-gray-500">
                  {dayBookings.length} {t('bookings.appointments')}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Bookings */}
      {weekDates.map((date) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const allBookings = generateBookings(date);
        const loadedCount = loadedDays[dateKey] || 10;
        const visibleBookings = allBookings.slice(0, loadedCount);
        const hasMore = allBookings.length > loadedCount;
        const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

        return (
          <div key={dateKey} className="mb-8">
            {/* Day Header - Sticky */}
            <div className="sticky top-24 z-10 bg-white border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center justify-between">
                <h3 className={`text-base font-semibold ${isToday ? 'text-blue-700' : 'text-gray-900'}`}>
                  {format(date, 'EEEE, MMMM d')}
                  {isToday && ` (${t('bookings.today')})`}
                </h3>
                <span className="text-sm text-gray-600">
                  {allBookings.length} {t('bookings.total')}
                </span>
              </div>
            </div>

            {/* Bookings List */}
            <div className="space-y-3">
              {visibleBookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-lg border border-gray-100 p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <ClockIcon className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {booking.time}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({booking.duration} {t('bookings.minutes')})
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-1">
                          <div className="flex items-center gap-1">
                            <UserIcon className="w-3 h-3" />
                            <span>{booking.customer}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <PhoneIcon className="w-3 h-3" />
                            <span>{booking.phone}</span>
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          {booking.service}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status === 'confirmed' ? t('bookings.confirmed') :
                         booking.status === 'pending' ? t('bookings.pending') :
                         t('bookings.cancelled')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => handleLoadMore(dateKey)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    {t('bookings.loadMore')} ({allBookings.length - loadedCount} {t('bookings.more')})
                  </button>
                </div>
              )}

              {/* Empty State */}
              {allBookings.length === 0 && (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-sm text-gray-500">{t('bookings.noBookings')}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};