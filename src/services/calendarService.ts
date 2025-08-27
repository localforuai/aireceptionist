const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

interface CalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
}

interface Calendar {
  id: string;
  name: string;
  primary?: boolean;
}

class CalendarService {
  private baseURL: string;

  constructor() {
    this.baseURL = BACKEND_BASE_URL;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Calendar API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (fetchError) {
      if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
        throw new Error('Unable to connect to calendar server');
      }
      throw fetchError;
    }
  }

  // Start Google OAuth flow
  async startGoogleAuth(shopId: string): Promise<{ authUrl: string }> {
    const response = await this.makeRequest<{ success: boolean; data?: { authUrl: string }; error?: string }>('/api/calendar/auth/google/start', {
      method: 'POST',
      body: JSON.stringify({ shopId })
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to start Google authentication');
    }

    return response.data;
  }

  // Complete Google OAuth flow
  async completeGoogleAuth(shopId: string, code: string): Promise<boolean> {
    const response = await this.makeRequest<{ success: boolean; error?: string }>('/api/calendar/auth/google/callback', {
      method: 'POST',
      body: JSON.stringify({ shopId, code })
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to complete Google authentication');
    }

    return true;
  }

  // Get available calendars
  async getCalendars(shopId: string): Promise<Calendar[]> {
    const response = await this.makeRequest<{ success: boolean; data?: Calendar[]; error?: string }>(`/api/calendar/calendars/${shopId}`);

    if (!response.success) {
      throw new Error(response.error || 'Failed to get calendars');
    }

    return response.data || [];
  }

  // Create calendar event
  async createEvent(shopId: string, calendarId: string, event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const response = await this.makeRequest<{ success: boolean; data?: CalendarEvent; error?: string }>('/api/calendar/events', {
      method: 'POST',
      body: JSON.stringify({
        shopId,
        calendarId,
        event
      })
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create calendar event');
    }

    return response.data;
  }

  // Update calendar event
  async updateEvent(shopId: string, calendarId: string, eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const response = await this.makeRequest<{ success: boolean; data?: CalendarEvent; error?: string }>(`/api/calendar/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify({
        shopId,
        calendarId,
        updates
      })
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update calendar event');
    }

    return response.data;
  }

  // Delete calendar event
  async deleteEvent(shopId: string, calendarId: string, eventId: string): Promise<boolean> {
    const response = await this.makeRequest<{ success: boolean; error?: string }>(`/api/calendar/events/${eventId}`, {
      method: 'DELETE',
      body: JSON.stringify({
        shopId,
        calendarId
      })
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to delete calendar event');
    }

    return true;
  }

  // Get events for date range
  async getEvents(shopId: string, calendarId: string, startDate: string, endDate: string): Promise<CalendarEvent[]> {
    const response = await this.makeRequest<{ success: boolean; data?: CalendarEvent[]; error?: string }>(`/api/calendar/events?shopId=${shopId}&calendarId=${calendarId}&startDate=${startDate}&endDate=${endDate}`);

    if (!response.success) {
      throw new Error(response.error || 'Failed to get calendar events');
    }

    return response.data || [];
  }

  // Check for conflicts
  async checkConflicts(shopId: string, calendarId: string, startTime: string, endTime: string): Promise<boolean> {
    const response = await this.makeRequest<{ success: boolean; data?: { hasConflict: boolean }; error?: string }>('/api/calendar/check-conflicts', {
      method: 'POST',
      body: JSON.stringify({
        shopId,
        calendarId,
        startTime,
        endTime
      })
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to check for conflicts');
    }

    return response.data.hasConflict;
  }

  // Sync bookings to calendar
  async syncBookings(shopId: string): Promise<{ synced: number; errors: string[] }> {
    const response = await this.makeRequest<{ success: boolean; data?: { synced: number; errors: string[] }; error?: string }>('/api/calendar/sync-bookings', {
      method: 'POST',
      body: JSON.stringify({ shopId })
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to sync bookings');
    }

    return response.data;
  }

  // Disconnect calendar
  async disconnect(shopId: string): Promise<boolean> {
    const response = await this.makeRequest<{ success: boolean; error?: string }>('/api/calendar/disconnect', {
      method: 'POST',
      body: JSON.stringify({ shopId })
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to disconnect calendar');
    }

    return true;
  }
}

export const calendarService = new CalendarService();