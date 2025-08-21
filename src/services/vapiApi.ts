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
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Vapi API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
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
    if (params?.startDate) searchParams.append('createdAtGte', params.startDate);
    if (params?.endDate) searchParams.append('createdAtLte', params.endDate);

    const endpoint = `/call${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await this.makeRequest(endpoint);
    
    // Transform Vapi response to our CallData format
    return response.map((call: any) => this.transformVapiCall(call));
  }

  async getCall(callId: string): Promise<CallData> {
    const response = await this.makeRequest(`/call/${callId}`);
    return this.transformVapiCall(response);
  }

  async getAssistants(): Promise<any[]> {
    return this.makeRequest('/assistant');
  }

  private transformVapiCall(vapiCall: any): CallData {
    return {
      id: vapiCall.id,
      assistantId: vapiCall.assistantId,
      assistantName: vapiCall.assistant?.name || 'Unknown Assistant',
      startTime: vapiCall.createdAt,
      endTime: vapiCall.endedAt,
      duration: vapiCall.duration || 0,
      status: vapiCall.status === 'ended' ? 'completed' : vapiCall.status,
      endReason: vapiCall.endedReason || 'unknown',
      transcript: vapiCall.transcript || 'Transcript not available',
      audioUrl: vapiCall.recordingUrl || '',
      customerPhone: vapiCall.customer?.number || 'Unknown',
      successRating: this.calculateSuccessRating(vapiCall),
      cost: vapiCall.cost || 0
    };
  }

  private calculateSuccessRating(vapiCall: any): number {
    // Calculate success rating based on call completion and duration
    if (vapiCall.endedReason === 'customer-ended-call' && vapiCall.duration > 30) {
      return 85;
    } else if (vapiCall.endedReason === 'assistant-ended-call' && vapiCall.duration > 60) {
      return 90;
    } else if (vapiCall.endedReason === 'customer-hung-up' && vapiCall.duration < 30) {
      return 40;
    }
    return 70; // Default rating
  }
}

export const vapiApi = new VapiApiService();