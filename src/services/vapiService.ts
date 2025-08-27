import { CallData } from '../types';

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  total?: number;
}

class VapiService {
  private baseURL: string;

  constructor() {
    this.baseURL = BACKEND_BASE_URL;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    console.log('Making VAPI request to:', url);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      console.log('VAPI response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `VAPI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('VAPI response received');
      return data;
    } catch (fetchError) {
      if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
        throw new Error('Unable to connect to VAPI backend server. Make sure the backend is running on port 3001.');
      }
      throw fetchError;
    }
  }

  // Get calls with filtering
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
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);

    const endpoint = `/api/calls${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await this.makeRequest<ApiResponse<CallData[]>>(endpoint);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch calls');
    }
    
    return response.data || [];
  }

  // Get specific call details
  async getCall(callId: string): Promise<CallData> {
    const response = await this.makeRequest<ApiResponse<CallData>>(`/api/calls/${callId}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch call details');
    }
    
    if (!response.data) {
      throw new Error('Call not found');
    }
    
    return response.data;
  }

  // Get assistants
  async getAssistants(): Promise<any[]> {
    const response = await this.makeRequest<ApiResponse<any[]>>('/api/assistants');
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch assistants');
    }
    
    return response.data || [];
  }

  // Create new assistant
  async createAssistant(assistantData: {
    name: string;
    voice: string;
    prompt: string;
    firstMessage?: string;
  }): Promise<any> {
    const response = await this.makeRequest<ApiResponse<any>>('/api/assistants', {
      method: 'POST',
      body: JSON.stringify(assistantData)
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to create assistant');
    }
    
    return response.data;
  }

  // Update assistant
  async updateAssistant(assistantId: string, updates: any): Promise<any> {
    const response = await this.makeRequest<ApiResponse<any>>(`/api/assistants/${assistantId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to update assistant');
    }
    
    return response.data;
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest<ApiResponse<any>>('/api/test-connection');
      return response.success;
    } catch (error) {
      console.error('VAPI connection test failed:', error);
      return false;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.makeRequest<{ status: string; timestamp: string }>('/health');
      return response.status === 'ok';
    } catch (error) {
      console.error('VAPI health check failed:', error);
      return false;
    }
  }

  // Get real-time call status
  async getCallStatus(callId: string): Promise<any> {
    const response = await this.makeRequest<ApiResponse<any>>(`/api/calls/${callId}/status`);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to get call status');
    }
    
    return response.data;
  }

  // Start outbound call
  async startCall(phoneNumber: string, assistantId: string): Promise<any> {
    const response = await this.makeRequest<ApiResponse<any>>('/api/calls/start', {
      method: 'POST',
      body: JSON.stringify({
        phoneNumber,
        assistantId
      })
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to start call');
    }
    
    return response.data;
  }

  // End call
  async endCall(callId: string): Promise<any> {
    const response = await this.makeRequest<ApiResponse<any>>(`/api/calls/${callId}/end`, {
      method: 'POST'
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to end call');
    }
    
    return response.data;
  }
}

export const vapiService = new VapiService();