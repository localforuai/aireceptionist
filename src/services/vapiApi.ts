import { CallData } from '../types';

// Note: Vapi's public API keys are designed for client-side SDK usage, not direct REST API calls
// For a production dashboard, you would typically:
// 1. Use Vapi's client SDK with the public key for real-time features
// 2. Have your backend fetch call data using the private key
// 3. Serve that data to your frontend through your own API

const VAPI_BASE_URL = import.meta.env.VITE_VAPI_BASE_URL || 'https://api.vapi.ai';
const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_API_KEY;

class VapiApiService {
  private baseURL: string;
  private publicKey: string;

  constructor() {
    this.baseURL = VAPI_BASE_URL;
    this.publicKey = VAPI_PUBLIC_KEY;
    
    if (!this.publicKey) {
      console.warn('VAPI_API_KEY not found in environment variables');
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    if (!this.publicKey) {
      throw new Error('Vapi API key is not configured');
    }

    const url = `${this.baseURL}${endpoint}`;
    console.log('Making Vapi API request to:', url);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.publicKey}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      console.log('Vapi API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Vapi API error response:', errorText);
        
        // Handle specific error cases
        if (response.status === 401) {
          throw new Error('Authentication failed. This might be because:\n1. Public keys have limited access to certain endpoints\n2. This endpoint requires a private key (backend usage)\n3. The key permissions need to be configured in your Vapi dashboard');
        }
        
        throw new Error(`Vapi API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Vapi API response data:', data);
      return data;
    } catch (fetchError) {
      if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to Vapi API. Please check your internet connection.');
      }
      throw fetchError;
    }
  }

  async getCalls(params?: {
    assistantId?: string;
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<CallData[]> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params?.assistantId) searchParams.append('assistantId', params.assistantId);
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.offset) searchParams.append('offset', params.offset.toString());
      if (params?.startDate) searchParams.append('createdAtGt', params.startDate);
      if (params?.endDate) searchParams.append('createdAtLt', params.endDate);

      const endpoint = `/call${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const response = await this.makeRequest(endpoint);
      
      // Handle both array response and paginated response
      const calls = Array.isArray(response) ? response : (response.data || []);
      console.log('Processing calls:', calls.length);
      
      return calls.map((call: any) => this.transformVapiCall(call));
    } catch (error) {
      console.error('Error fetching calls:', error);
      
      // For demo purposes, if the public key doesn't have access to call data,
      // we'll throw a descriptive error instead of falling back to mock data
      if (error instanceof Error && error.message.includes('Authentication failed')) {
        throw new Error('Public API keys have limited access to call data. For full dashboard functionality, you would typically:\n\n1. Use your private key in a secure backend\n2. Create your own API endpoint that fetches call data\n3. Have your frontend call your backend instead of Vapi directly\n\nThis is a security best practice to keep your private key safe.');
      }
      
      throw error;
    }
  }

  async getCall(callId: string): Promise<CallData> {
    const response = await this.makeRequest(`/call/${callId}`);
    return this.transformVapiCall(response);
  }

  async getAssistants(): Promise<any[]> {
    try {
      const response = await this.makeRequest('/assistant');
      return Array.isArray(response) ? response : (response.data || []);
    } catch (error) {
      console.error('Error fetching assistants:', error);
      throw error;
    }
  }

  // Test connection with a simple endpoint that public keys should have access to
  async testConnection(): Promise<boolean> {
    try {
      // Try to fetch assistants as a connection test
      await this.getAssistants();
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  private transformVapiCall(vapiCall: any): CallData {
    console.log('Transforming Vapi call:', vapiCall);
    
    // Calculate duration from timestamps if not provided
    let duration = vapiCall.duration || 0;
    if (!duration && vapiCall.createdAt && vapiCall.endedAt) {
      const start = new Date(vapiCall.createdAt).getTime();
      const end = new Date(vapiCall.endedAt).getTime();
      duration = Math.floor((end - start) / 1000);
    }
    
    // Determine status
    let status: 'completed' | 'failed' | 'in-progress' = 'completed';
    if (vapiCall.status === 'ended') {
      status = 'completed';
    } else if (vapiCall.status === 'failed' || vapiCall.status === 'error') {
      status = 'failed';
    } else if (vapiCall.status === 'ringing' || vapiCall.status === 'in-progress') {
      status = 'in-progress';
    }
    
    // Map end reason
    const endReasonMap: Record<string, CallData['endReason']> = {
      'customer-ended-call': 'customer_hangup',
      'customer-hung-up': 'customer_hangup',
      'assistant-ended-call': 'assistant_hangup',
      'assistant-hung-up': 'assistant_hangup',
      'pipeline-error': 'system_error',
      'exceeded-max-duration': 'timeout',
      'silence-timeout': 'timeout',
      'voicemail': 'customer_complete'
    };
    
    const endReason = endReasonMap[vapiCall.endedReason] || 'customer_complete';
    
    return {
      id: vapiCall.id,
      assistantId: vapiCall.assistantId || 'unknown',
      assistantName: vapiCall.assistant?.name || 'Unknown Assistant',
      startTime: vapiCall.createdAt || new Date().toISOString(),
      endTime: vapiCall.endedAt || new Date().toISOString(),
      duration,
      status,
      endReason,
      transcript: vapiCall.transcript || vapiCall.messages?.map((m: any) => `${m.role}: ${m.message}`).join('\n') || 'Transcript not available',
      audioUrl: vapiCall.recordingUrl || '',
      customerPhone: vapiCall.customer?.number || 'Unknown',
      successRating: this.calculateSuccessRating(vapiCall),
      cost: vapiCall.cost || vapiCall.costBreakdown?.total || 0
    };
  }

  private calculateSuccessRating(vapiCall: any): number {
    const duration = vapiCall.duration || 0;
    const endReason = vapiCall.endedReason;
    
    // Calculate success rating based on call completion, duration, and end reason
    if (endReason === 'customer-ended-call' && duration > 30) {
      return 85;
    } else if (endReason === 'assistant-ended-call' && duration > 60) {
      return 90;
    } else if (endReason === 'voicemail') {
      return 95;
    } else if ((endReason === 'customer-hung-up' || endReason === 'customer-ended-call') && duration < 30) {
      return 40;
    } else if (endReason === 'pipeline-error' || endReason === 'exceeded-max-duration') {
      return 30;
    } else if (duration > 120) {
      return 80;
    } else if (duration > 60) {
      return 75;
    }
    return 70; // Default rating
  }
}

export const vapiApi = new VapiApiService();