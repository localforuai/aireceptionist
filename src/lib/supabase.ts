import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found. Running in demo mode.');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null;

// Database types
export interface Database {
  public: {
    Tables: {
      shops: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          address: string | null;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
      };
      calls: {
        Row: {
          id: string;
          shop_id: string;
          assistant_id: string | null;
          vapi_call_id: string;
          customer_phone: string | null;
          customer_name: string | null;
          start_time: string | null;
          end_time: string | null;
          duration: number;
          status: 'completed' | 'failed' | 'in-progress';
          end_reason: 'customer_hangup' | 'assistant_hangup' | 'customer_complete' | 'system_error' | 'timeout';
          transcript: string | null;
          audio_url: string | null;
          success_rating: number;
          cost: number;
          metadata: any;
          created_at: string;
        };
      };
      assistants: {
        Row: {
          id: string;
          shop_id: string;
          vapi_assistant_id: string;
          name: string;
          description: string | null;
          voice_settings: any;
          prompt: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          shop_id: string;
          plan_name: string;
          total_minutes: number;
          used_minutes: number;
          renewal_date: string;
          auto_topup_enabled: boolean;
          auto_topup_amount: number;
          auto_topup_price: number;
          status: 'active' | 'cancelled' | 'expired';
          created_at: string;
          updated_at: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          shop_id: string;
          call_id: string | null;
          customer_name: string;
          customer_phone: string | null;
          customer_email: string | null;
          service_type: string | null;
          appointment_date: string;
          duration_minutes: number;
          status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
          notes: string | null;
          calendar_event_id: string | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
}