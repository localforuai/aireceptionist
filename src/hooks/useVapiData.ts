import { useState, useEffect } from 'react';
import { CallData, DashboardMetrics, ChartData, SubscriptionData, CalendarSyncData } from '../types';
import { vapiService } from '../services/vapiService';
import { stripeService } from '../services/stripeService';
import { calendarService } from '../services/calendarService';
import { supabaseService } from '../services/supabaseService';
import { useAuth } from './useAuth';

export const useVapiData = (userId: string | undefined) => {
  const { user } = useAuth();
  const [callData, setCallData] = useState<CallData[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarSyncData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useRealData, setUseRealData] = useState(true);
  
  // Data cache for performance
  const [lastFetch, setLastFetch] = useState(0);

  // Mock data generation for demonstration
  const generateMockData = (): CallData[] => {
    const assistants = ['Sarah (Main)', 'Mike (Backup)', 'Emily (Evening)'];
    const endReasons: CallData['endReason'][] = ['customer_hangup', 'customer_complete', 'assistant_hangup', 'system_error', 'timeout'];
    const mockCalls: CallData[] = [];

    for (let i = 0; i < 147; i++) {
      const startTime = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      const duration = Math.floor(Math.random() * 600) + 30; // 30s to 10min
      const endTime = new Date(startTime.getTime() + duration * 1000);

      mockCalls.push({
        id: `call_${i + 1}`,
        assistantId: `assistant_${i % 3 + 1}`,
        assistantName: assistants[i % 3],
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration,
        status: Math.random() > 0.1 ? 'completed' : 'failed',
        endReason: endReasons[Math.floor(Math.random() * endReasons.length)],
        transcript: `Customer called regarding ${['appointment booking', 'product inquiry', 'order status', 'general information', 'complaint'][Math.floor(Math.random() * 5)]}. The conversation was handled professionally and the customer's needs were addressed.`,
        audioUrl: `https://example.com/audio/call_${i + 1}.mp3`,
        customerPhone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        successRating: Math.floor(Math.random() * 40) + 60, // 60-100
        cost: Math.random() * 2 + 0.1 // $0.10 - $2.10
      });
    }

    return mockCalls.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  };

  const generateMockSubscriptionData = (totalCallMinutes: number): SubscriptionData => {
    const totalMinutes = 300; // 300 minutes per month plan
    const usedMinutes = Math.min(Math.round(totalCallMinutes), totalMinutes);
    const remainingMinutes = Math.max(0, totalMinutes - usedMinutes);
    
    // Set renewal date to first day of next month
    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + 1);
    renewalDate.setDate(1);
    
    return {
      planName: 'Professional Plan - 300 mins/month',
      totalMinutes,
      usedMinutes,
      remainingMinutes,
      renewalDate: renewalDate.toISOString(),
      autoTopUpEnabled: false,
      selectedTopUpOption: 0,
      topUpOptions: [
        { minutes: 100, price: 25 },
        { minutes: 200, price: 50 },
        { minutes: 500, price: 100 }
      ]
    };
  };

  const generateMockCalendarData = (): CalendarSyncData => {
    return {
      isConnected: Math.random() > 0.5,
      selectedCalendar: Math.random() > 0.5 ? 'primary' : null,
      availableCalendars: [
        { id: 'primary', name: 'Primary Calendar' },
        { id: 'massage-bookings', name: 'Massage Bookings' },
        { id: 'staff-schedule', name: 'Staff Schedule' }
      ],
      syncMode: Math.random() > 0.5 ? '2-way' : 'create-only',
      conflictCheck: Math.random() > 0.5,
      dailyBookingCount: Math.floor(Math.random() * 15) + 3,
      lastSyncTime: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 3600000).toISOString() : null,
      error: Math.random() > 0.8 ? 'Sync failed: Calendar permission expired' : null
    };
  };

  const calculateMetrics = (calls: CallData[]): DashboardMetrics => {
    const totalCallMinutes = calls.reduce((sum, call) => sum + call.duration, 0) / 60;
    const completedCalls = calls.filter(call => call.status === 'completed');
    const successfulCalls = calls.filter(call => call.successRating >= 70);
    
    return {
      totalCallMinutes: Math.round(totalCallMinutes * 10) / 10,
      totalCalls: calls.length,
      averageCallDuration: Math.round((totalCallMinutes / calls.length) * 60),
      callSuccessRate: Math.round((successfulCalls.length / calls.length) * 100),
    };
  };

  const generateChartData = (calls: CallData[]): ChartData => {
    // End reasons distribution
    const endReasonCounts = calls.reduce((acc, call) => {
      acc[call.endReason] = (acc[call.endReason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const endReasons = Object.entries(endReasonCounts).map(([reason, count]) => ({
      reason,
      count,
      percentage: Math.round((count / calls.length) * 100)
    }));

    // Assistant durations
    const assistantStats = calls.reduce((acc, call) => {
      if (!acc[call.assistantName]) {
        acc[call.assistantName] = { totalDuration: 0, callCount: 0 };
      }
      acc[call.assistantName].totalDuration += call.duration;
      acc[call.assistantName].callCount += 1;
      return acc;
    }, {} as Record<string, { totalDuration: number; callCount: number }>);

    const assistantDurations = Object.entries(assistantStats).map(([assistant, stats]) => ({
      assistant,
      avgDuration: Math.round(stats.totalDuration / stats.callCount),
      callCount: stats.callCount
    }));

    // Success distribution
    const successRanges = ['60-70', '71-80', '81-90', '91-100'];
    const successDistribution = successRanges.map(range => {
      const [min, max] = range.split('-').map(Number);
      const count = calls.filter(call => call.successRating >= min && call.successRating <= max).length;
      return { range, count };
    });

    // Daily call volume (last 7 days)
    const dailyCallVolume = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const daysCalls = calls.filter(call => call.startTime.startsWith(dateStr));
      const totalMinutes = daysCalls.reduce((sum, call) => sum + call.duration, 0) / 60;
      
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        calls: daysCalls.length,
        minutes: Math.round(totalMinutes * 10) / 10
      };
    }).reverse();

    return { endReasons, assistantDurations, successDistribution, dailyCallVolume };
  };

  useEffect(() => {
    if (!userId) return;
    
    // Check if we have recent cached data (within 2 minutes)
    const now = Date.now();
    if (lastFetch && (now - lastFetch) < 2 * 60 * 1000 && !loading) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let calls: CallData[] = [];
        
        if (useRealData) {
          try {
            console.log('Fetching real data from VAPI API...');
            
            // Test VAPI connection first
            const isVapiHealthy = await vapiService.healthCheck();
            if (!isBackendHealthy) {
              throw new Error('VAPI backend server is not running. Please start the backend server.');
            }
            
            // Fetch real data from VAPI
            calls = await vapiService.getCalls({
              limit: 50,
              startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
            });
            console.log('Successfully fetched calls from VAPI:', calls.length);
            
            if (calls.length === 0) {
              console.log('No calls found in your VAPI account');
            }
            
            // Fetch subscription data from Supabase
            if (user?.shopId) {
              const subscription = await supabaseService.getSubscriptionData(user.shopId);
              if (subscription) {
                setSubscriptionData(subscription);
              }
              
              const calendar = await supabaseService.getCalendarData(user.shopId);
              if (calendar) {
                setCalendarData(calendar);
              }
            }
            
          } catch (apiError) {
            console.error('Failed to fetch from VAPI API:', apiError);
            const errorMessage = apiError instanceof Error ? apiError.message : 'Unknown error';
            
            // Automatically fall back to demo mode when VAPI is not available
            console.log('VAPI not available, falling back to demo mode');
            setUseRealData(false);
          }
        }
        
        if (!useRealData) {
          console.log('Using mock data for demonstration');
          await new Promise(resolve => setTimeout(resolve, 1500));
          calls = generateMockData();
          
          const calculatedMetrics = calculateMetrics(calls);
          const chartAnalytics = generateChartData(calls);
          const subscription = generateMockSubscriptionData(calculatedMetrics.totalCallMinutes);
          const calendar = generateMockCalendarData();
          
          setSubscriptionData(subscription);
          setCalendarData(calendar);
        }

        const calculatedMetrics = calculateMetrics(calls);
        const chartAnalytics = generateChartData(calls);

        setCallData(calls);
        setMetrics(calculatedMetrics);
        setChartData(chartAnalytics);
        
        setLastFetch(now);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch call data';
        setError(errorMessage);
        console.error('Error fetching Vapi data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, useRealData, user?.shopId]);

  const refreshData = () => {
    setLastFetch(0); // Force refresh
    setLoading(true);
  };

  const toggleDataSource = () => {
    setUseRealData(!useRealData);
  };

  const handleTopUp = async () => {
    if (subscriptionData) {
      const selectedOption = subscriptionData.topUpOptions[subscriptionData.selectedTopUpOption];
      
      if (useRealData && user?.shopId) {
        try {
          // Create Stripe payment intent
          const paymentIntent = await stripeService.createTopUpPayment(user.shopId, selectedOption);
          
          // In a real app, you'd show Stripe payment form here
          // For demo, we'll simulate successful payment
          await stripeService.confirmPayment(paymentIntent.id);
          
          // Refresh subscription data
          const updatedSubscription = await supabaseService.getSubscriptionData(user.shopId);
          if (updatedSubscription) {
            setSubscriptionData(updatedSubscription);
          }
        } catch (error) {
          console.error('Top-up failed:', error);
        }
      } else {
        // Demo mode
        const updatedSubscription = {
          ...subscriptionData,
          remainingMinutes: subscriptionData.remainingMinutes + selectedOption.minutes
        };
        setSubscriptionData(updatedSubscription);
      }
    }
  };

  const handleSelectTopUpOption = (optionIndex: number) => {
    if (subscriptionData) {
      setSubscriptionData({
        ...subscriptionData,
        selectedTopUpOption: optionIndex
      });
    }
  };

  const handleToggleAutoTopUp = (enabled: boolean) => {
    if (subscriptionData) {
      setSubscriptionData({
        ...subscriptionData,
        autoTopUpEnabled: enabled
      });
      console.log('Auto top-up', enabled ? 'enabled' : 'disabled');
    }
  };

  const handleCalendarConnect = () => {
    if (useRealData && user?.shopId) {
      // Start Google OAuth flow
      calendarService.startGoogleAuth(user.shopId)
        .then(({ authUrl }) => {
          window.open(authUrl, '_blank');
        })
        .catch(error => {
          console.error('Failed to start Google auth:', error);
        });
    } else {
      // Demo mode
      if (calendarData) {
        setCalendarData({
          ...calendarData,
          isConnected: true,
          lastSyncTime: new Date().toISOString(),
          error: null
        });
      }
    }
  };

  const handleCalendarDisconnect = () => {
    if (calendarData) {
      setCalendarData({
        ...calendarData,
        isConnected: false,
        selectedCalendar: null,
        lastSyncTime: null,
        error: null
      });
      console.log('Google Calendar disconnected');
    }
  };

  const handleSelectCalendar = (calendarId: string) => {
    if (calendarData) {
      setCalendarData({
        ...calendarData,
        selectedCalendar: calendarId,
        lastSyncTime: new Date().toISOString(),
        error: null
      });
      console.log('Calendar selected:', calendarId);
    }
  };

  const handleChangeSyncMode = (mode: '2-way' | 'create-only') => {
    if (calendarData) {
      setCalendarData({
        ...calendarData,
        syncMode: mode
      });
      console.log('Sync mode changed to:', mode);
    }
  };

  const handleToggleConflictCheck = (enabled: boolean) => {
    if (calendarData) {
      setCalendarData({
        ...calendarData,
        conflictCheck: enabled
      });
      console.log('Conflict check:', enabled ? 'enabled' : 'disabled');
    }
  };

  return { 
    callData, 
    metrics, 
    chartData, 
    subscriptionData,
    calendarData,
    loading, 
    error, 
    refreshData, 
    useRealData, 
    toggleDataSource,
    handleTopUp,
    handleToggleAutoTopUp,
    handleCalendarConnect,
    handleCalendarDisconnect,
    handleSelectCalendar,
    handleChangeSyncMode,
    handleToggleConflictCheck,
    handleSelectTopUpOption
  };
};