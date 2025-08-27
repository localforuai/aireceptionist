/*
  # Create calendar integrations table

  1. New Tables
    - `calendar_integrations`
      - `id` (uuid, primary key)
      - `shop_id` (uuid, foreign key)
      - `provider` (text)
      - `is_connected` (boolean)
      - `selected_calendar_id` (text)
      - `selected_calendar_name` (text)
      - `sync_mode` (text)
      - `conflict_check` (boolean)
      - `access_token` (text, encrypted)
      - `refresh_token` (text, encrypted)
      - `last_sync_time` (timestamp)
      - `sync_error` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for shop-specific access
*/

CREATE TABLE IF NOT EXISTS calendar_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE UNIQUE,
  provider text DEFAULT 'google' CHECK (provider IN ('google', 'outlook', 'apple')),
  is_connected boolean DEFAULT false,
  selected_calendar_id text,
  selected_calendar_name text,
  sync_mode text DEFAULT '2-way' CHECK (sync_mode IN ('2-way', 'create-only')),
  conflict_check boolean DEFAULT true,
  access_token text, -- Should be encrypted in production
  refresh_token text, -- Should be encrypted in production
  last_sync_time timestamptz,
  sync_error text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE calendar_integrations ENABLE ROW LEVEL SECURITY;

-- Calendar integrations policies
CREATE POLICY "Users can read their shop's calendar integration"
  ON calendar_integrations
  FOR SELECT
  TO authenticated
  USING (
    shop_id IN (
      SELECT shop_id FROM shop_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Shop owners can manage calendar integration"
  ON calendar_integrations
  FOR ALL
  TO authenticated
  USING (
    shop_id IN (
      SELECT shop_id FROM shop_users 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );