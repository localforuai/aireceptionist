import { CallData } from '../types';

const VAPI_BASE_URL = import.meta.env.VITE_VAPI_BASE_URL || 'https://api.vapi.ai';
const VAPI_API_KEY = import.meta.env.VITE_VAPI_API_KEY;

class VapiApiService {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = VAPI_BASE_URL;
    this.apiKey = VAPI_API_KEY;
    
    if (!this.apiKey) {
      console.warn('VAPI_API_KEY not found in environment variables');
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    if (!this.apiKey) {
      throw new Error('Vapi API key is not configured');
    }

    const url = `${this.baseURL}${endpoint}`;
    console.log('Making Vapi API request to:', url);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log('Vapi API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vapi API error response:', errorText);
      throw new Error(`Vapi API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Vapi API response data:', data);
    return data;
  }

  async getCalls(params?: {
    assistantId?: string;
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<CallData[]> {
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
  }

  async getCall(callId: string): Promise<CallData> {
    const response = await this.makeRequest(`/call/${callId}`);
    return this.transformVapiCall(response);
  }

  async getAssistants(): Promise<any[]> {
    const response = await this.makeRequest('/assistant');
    return Array.isArray(response) ? response : (response.data || []);
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