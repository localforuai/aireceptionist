import { supabase } from '../lib/supabase';
import { CallData, DashboardMetrics, ChartData, SubscriptionData, CalendarSyncData } from '../types';

export class SupabaseService {
  // Get user's shop ID
  async getUserShopId(userId: string): Promise<string | null> {
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('shop_users')
      .select('shop_id')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error getting user shop:', error);
      return null;
    }
    
    return data?.shop_id || null;
  }

  // Get calls for a shop
  async getCalls(shopId: string, params?: {
    assistantId?: string;
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<CallData[]> {
    if (!supabase) return [];
    
    let query = supabase
      .from('calls')
      .select(`
        *,
        assistants(name)
      `)
      .eq('shop_id', shopId)
      .order('start_time', { ascending: false });

    if (params?.assistantId) {
      query = query.eq('assistant_id', params.assistantId);
    }
    
    if (params?.startDate) {
      query = query.gte('start_time', params.startDate);
    }
    
    if (params?.endDate) {
      query = query.lte('start_time', params.endDate);
    }
    
    if (params?.limit) {
      query = query.limit(params.limit);
    }
    
    if (params?.offset) {
      query = query.range(params.offset, (params.offset || 0) + (params.limit || 50) - 1);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching calls:', error);
      return [];
    }

    return (data || []).map(call => ({
      id: call.id,
      assistantId: call.assistant_id,
      assistantName: call.assistants?.name || 'Unknown Assistant',
      startTime: call.start_time,
      endTime: call.end_time,
      duration: call.duration,
      status: call.status,
      endReason: call.end_reason,
      transcript: call.transcript || 'Transcript not available',
      audioUrl: call.audio_url || '',
      customerPhone: call.customer_phone || 'Unknown',
      successRating: call.success_rating,
      cost: call.cost
    }));
  }

  // Get dashboard metrics
  async getDashboardMetrics(shopId: string): Promise<DashboardMetrics | null> {
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .rpc('get_shop_stats', { shop_uuid: shopId });
    
    if (error) {
      console.error('Error fetching metrics:', error);
      return null;
    }

    const stats = data?.[0];
    if (!stats) return null;

    return {
      totalCallMinutes: parseFloat(stats.total_call_minutes) || 0,
      totalCalls: parseInt(stats.total_calls) || 0,
      averageCallDuration: parseFloat(stats.average_call_duration) || 0,
      callSuccessRate: parseFloat(stats.success_rate) || 0
    };
  }

  // Get chart data
  async getChartData(shopId: string): Promise<ChartData | null> {
    if (!supabase) return null;
    
    // Get end reasons distribution
    const { data: endReasonsData } = await supabase
      .from('calls')
      .select('end_reason')
      .eq('shop_id', shopId)
      .eq('status', 'completed');

    // Get daily call volume
    const { data: dailyVolumeData } = await supabase
      .rpc('get_daily_call_volume', { shop_uuid: shopId, days_back: 7 });

    // Get assistant durations
    const { data: assistantData } = await supabase
      .from('calls')
      .select(`
        duration,
        assistants(name)
      `)
      .eq('shop_id', shopId)
      .eq('status', 'completed');

    // Get success distribution
    const { data: successData } = await supabase
      .from('calls')
      .select('success_rating')
      .eq('shop_id', shopId)
      .eq('status', 'completed');

    // Process end reasons
    const endReasonCounts = (endReasonsData || []).reduce((acc, call) => {
      acc[call.end_reason] = (acc[call.end_reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalCalls = endReasonsData?.length || 0;
    const endReasons = Object.entries(endReasonCounts).map(([reason, count]) => ({
      reason,
      count,
      percentage: totalCalls > 0 ? Math.round((count / totalCalls) * 100) : 0
    }));

    // Process assistant durations
    const assistantStats = (assistantData || []).reduce((acc, call) => {
      const name = call.assistants?.name || 'Unknown';
      if (!acc[name]) {
        acc[name] = { totalDuration: 0, callCount: 0 };
      }
      acc[name].totalDuration += call.duration;
      acc[name].callCount += 1;
      return acc;
    }, {} as Record<string, { totalDuration: number; callCount: number }>);

    const assistantDurations = Object.entries(assistantStats).map(([assistant, stats]) => ({
      assistant,
      avgDuration: Math.round(stats.totalDuration / stats.callCount),
      callCount: stats.callCount
    }));

    // Process success distribution
    const successRanges = ['60-70', '71-80', '81-90', '91-100'];
    const successDistribution = successRanges.map(range => {
      const [min, max] = range.split('-').map(Number);
      const count = (successData || []).filter(call => 
        call.success_rating >= min && call.success_rating <= max
      ).length;
      return { range, count };
    });

    // Process daily volume
    const dailyCallVolume = (dailyVolumeData || []).map(day => ({
      date: new Date(day.call_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      calls: parseInt(day.call_count),
      minutes: parseFloat(day.total_minutes)
    }));

    return {
      endReasons,
      assistantDurations,
      successDistribution,
      dailyCallVolume
    };
  }

  // Get subscription data
  async getSubscriptionData(shopId: string): Promise<SubscriptionData | null> {
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('shop_id', shopId)
      .single();
    
    if (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }

    const remainingMinutes = Math.max(0, data.total_minutes - data.used_minutes);
    
    return {
      planName: data.plan_name,
      totalMinutes: data.total_minutes,
      usedMinutes: data.used_minutes,
      remainingMinutes,
      renewalDate: data.renewal_date,
      autoTopUpEnabled: data.auto_topup_enabled,
      selectedTopUpOption: 0, // Default to first option
      topUpOptions: [
        { minutes: 100, price: 25 },
        { minutes: 200, price: 50 },
        { minutes: 500, price: 100 }
      ]
    };
  }

  // Get calendar data
  async getCalendarData(shopId: string): Promise<CalendarSyncData | null> {
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('calendar_integrations')
      .select('*')
      .eq('shop_id', shopId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching calendar integration:', error);
      return null;
    }

    // Get today's booking count
    const { data: bookingsData } = await supabase
      .from('bookings')
      .select('id')
      .eq('shop_id', shopId)
      .gte('appointment_date', new Date().toISOString().split('T')[0])
      .lt('appointment_date', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    const dailyBookingCount = bookingsData?.length || 0;

    if (!data) {
      // Return default data if no integration exists
      return {
        isConnected: false,
        selectedCalendar: null,
        availableCalendars: [
          { id: 'primary', name: 'Primary Calendar' },
          { id: 'massage-bookings', name: 'Massage Bookings' },
          { id: 'staff-schedule', name: 'Staff Schedule' }
        ],
        syncMode: '2-way',
        conflictCheck: true,
        dailyBookingCount,
        lastSyncTime: null,
        error: null
      };
    }

    return {
      isConnected: data.is_connected,
      selectedCalendar: data.selected_calendar_id,
      availableCalendars: [
        { id: 'primary', name: 'Primary Calendar' },
        { id: 'massage-bookings', name: 'Massage Bookings' },
        { id: 'staff-schedule', name: 'Staff Schedule' }
      ],
      syncMode: data.sync_mode,
      conflictCheck: data.conflict_check,
      dailyBookingCount,
      lastSyncTime: data.last_sync_time,
      error: data.sync_error
    };
  }

  // Get assistants
  async getAssistants(shopId: string) {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('assistants')
      .select('*')
      .eq('shop_id', shopId)
      .eq('is_active', true);
    
    if (error) {
      console.error('Error fetching assistants:', error);
      return [];
    }

    return data || [];
  }

  // Get bookings
  async getBookings(shopId: string, date?: string) {
    if (!supabase) return [];
    
    let query = supabase
      .from('bookings')
      .select('*')
      .eq('shop_id', shopId)
      .order('appointment_date', { ascending: true });

    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setDate(endOfDay.getDate() + 1);
      
      query = query
        .gte('appointment_date', startOfDay.toISOString())
        .lt('appointment_date', endOfDay.toISOString());
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }

    return data || [];
  }

  // Update subscription
  async updateSubscription(shopId: string, updates: Partial<SubscriptionData>) {
    if (!supabase) return false;
    
    const { error } = await supabase
      .from('subscriptions')
      .update({
        auto_topup_enabled: updates.autoTopUpEnabled,
        auto_topup_amount: updates.selectedTopUpOption !== undefined ? 
          [100, 200, 500][updates.selectedTopUpOption] : undefined,
        auto_topup_price: updates.selectedTopUpOption !== undefined ? 
          [25, 50, 100][updates.selectedTopUpOption] : undefined,
        updated_at: new Date().toISOString()
      })
      .eq('shop_id', shopId);
    
    if (error) {
      console.error('Error updating subscription:', error);
      return false;
    }

    return true;
  }

  // Add top-up transaction and update subscription
  async addTopUpTransaction(shopId: string, minutes: number, amount: number, type: 'manual' | 'auto' = 'manual') {
    if (!supabase) return false;
    
    try {
      // Start transaction
      const { error: transactionError } = await supabase
        .from('topup_transactions')
        .insert({
          shop_id: shopId,
          minutes_purchased: minutes,
          amount_paid: amount,
          transaction_type: type,
          status: 'completed'
        });

      if (transactionError) {
        console.error('Error creating transaction:', transactionError);
        return false;
      }

      // Update subscription to add minutes
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .update({
          total_minutes: supabase.raw(`total_minutes + ${minutes}`),
          updated_at: new Date().toISOString()
        })
        .eq('shop_id', shopId);

      if (subscriptionError) {
        console.error('Error updating subscription:', subscriptionError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in top-up transaction:', error);
      return false;
    }
  }

  // Update calendar integration
  async updateCalendarIntegration(shopId: string, updates: Partial<CalendarSyncData>) {
    if (!supabase) return false;
    
    const { error } = await supabase
      .from('calendar_integrations')
      .upsert({
        shop_id: shopId,
        is_connected: updates.isConnected,
        selected_calendar_id: updates.selectedCalendar,
        selected_calendar_name: updates.selectedCalendar ? 
          updates.availableCalendars?.find(cal => cal.id === updates.selectedCalendar)?.name : null,
        sync_mode: updates.syncMode,
        conflict_check: updates.conflictCheck,
        last_sync_time: updates.isConnected ? new Date().toISOString() : null,
        sync_error: null,
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error updating calendar integration:', error);
      return false;
    }

    return true;
  }
}

export const supabaseService = new SupabaseService();