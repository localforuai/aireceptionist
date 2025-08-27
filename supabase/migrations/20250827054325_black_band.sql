/*
  # Create calls table

  1. New Tables
    - `calls`
      - `id` (uuid, primary key)
      - `shop_id` (uuid, foreign key)
      - `assistant_id` (uuid, foreign key)
      - `vapi_call_id` (text, unique)
      - `customer_phone` (text)
      - `customer_name` (text)
      - `start_time` (timestamp)
      - `end_time` (timestamp)
      - `duration` (integer, seconds)
      - `status` (text)
      - `end_reason` (text)
      - `transcript` (text)
      - `audio_url` (text)
      - `success_rating` (integer)
      - `cost` (decimal)
      - `metadata` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for shop-specific access
*/

CREATE TABLE IF NOT EXISTS calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE,
  assistant_id uuid REFERENCES assistants(id) ON DELETE SET NULL,
  vapi_call_id text UNIQUE,
  customer_phone text,
  customer_name text,
  start_time timestamptz,
  end_time timestamptz,
  duration integer DEFAULT 0,
  status text DEFAULT 'completed' CHECK (status IN ('completed', 'failed', 'in-progress')),
  end_reason text DEFAULT 'customer_complete' CHECK (end_reason IN ('customer_hangup', 'assistant_hangup', 'customer_complete', 'system_error', 'timeout')),
  transcript text,
  audio_url text,
  success_rating integer DEFAULT 70 CHECK (success_rating >= 0 AND success_rating <= 100),
  cost decimal(10,4) DEFAULT 0.00,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_calls_shop_id ON calls(shop_id);
CREATE INDEX IF NOT EXISTS idx_calls_assistant_id ON calls(assistant_id);
CREATE INDEX IF NOT EXISTS idx_calls_start_time ON calls(start_time);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);
CREATE INDEX IF NOT EXISTS idx_calls_vapi_call_id ON calls(vapi_call_id);

-- Enable RLS
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

-- Calls policies
CREATE POLICY "Users can read their shop's calls"
  ON calls
  FOR SELECT
  TO authenticated
  USING (
    shop_id IN (
      SELECT shop_id FROM shop_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Shop admins can manage calls"
  ON calls
  FOR ALL
  TO authenticated
  USING (
    shop_id IN (
      SELECT shop_id FROM shop_users 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );