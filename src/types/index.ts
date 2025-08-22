export interface User {
  id: string;
  email: string;
  shopName: string;
  isAuthenticated: boolean;
}

export interface CallData {
  id: string;
  assistantId: string;
  assistantName: string;
  startTime: string;
  endTime: string;
  duration: number; // in seconds
  status: 'completed' | 'failed' | 'in-progress';
  endReason: 'customer_hangup' | 'assistant_hangup' | 'customer_complete' | 'system_error' | 'timeout';
  transcript: string;
  audioUrl: string;
  customerPhone: string;
  successRating: number; // 0-100
  cost: number;
}

export interface DashboardMetrics {
  totalCallMinutes: number;
  totalCalls: number;
  averageCallDuration: number;
  callSuccessRate: number;
}

export interface ChartData {
  endReasons: Array<{ reason: string; count: number; percentage: number }>;
  assistantDurations: Array<{ assistant: string; avgDuration: number; callCount: number }>;
  successDistribution: Array<{ range: string; count: number }>;
  dailyCallVolume: Array<{ date: string; calls: number; minutes: number }>;
}

export interface SubscriptionData {
  planName: string;
  totalMinutes: number;
  usedMinutes: number;
  remainingMinutes: number;
  renewalDate: string;
  autoTopUpEnabled: boolean;
  topUpMinutes: number;
  topUpPrice: number;
}

export interface CalendarSyncData {
  isConnected: boolean;
  selectedCalendar: string | null;
  availableCalendars: Array<{ id: string; name: string }>;
  syncMode: '2-way' | 'create-only';
  conflictCheck: boolean;
  dailyBookingCount: number;
  lastSyncTime: string | null;
  error: string | null;
}