// Backend API service for communicating with our Node.js server
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  total?: number;
}

class BackendApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = BACKEND_BASE_URL;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    console.log('Making backend API request to:', url);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      console.log('Backend API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Backend API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Backend API response received');
      return data;
    } catch (fetchError) {
      if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
        throw new Error('Unable to connect to backend server. Make sure the backend is running on port 3001.');
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
  }) {
    const searchParams = new URLSearchParams();
    
    if (params?.assistantId) searchParams.append('assistantId', params.assistantId);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);

    const endpoint = `/api/calls${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await this.makeRequest<ApiResponse<any[]>>(endpoint);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch calls');
    }
    
    return response.data || [];
  }

  async getCall(callId: string) {
    const response = await this.makeRequest<ApiResponse<any>>(`/api/calls/${callId}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch call details');
    }
    
    return response.data;
  }

  async getAssistants() {
    const response = await this.makeRequest<ApiResponse<any[]>>('/api/assistants');
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch assistants');
    }
    
    return response.data || [];
  }

  async testConnection() {
    try {
      const response = await this.makeRequest<ApiResponse<any>>('/api/test-connection');
      return response.success;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  }

  async healthCheck() {
    try {
      const response = await this.makeRequest<{ status: string; timestamp: string }>('/health');
      return response.status === 'ok';
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }
}

export const backendApi = new BackendApiService();