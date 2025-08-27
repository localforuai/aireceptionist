/*
  # Create assistants table

  1. New Tables
    - `assistants`
      - `id` (uuid, primary key)
      - `shop_id` (uuid, foreign key)
      - `vapi_assistant_id` (text, unique)
      - `name` (text)
      - `description` (text)
      - `voice_settings` (jsonb)
      - `prompt` (text)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for shop-specific access
*/

CREATE TABLE IF NOT EXISTS assistants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE,
  vapi_assistant_id text UNIQUE,
  name text NOT NULL,
  description text,
  voice_settings jsonb DEFAULT '{}',
  prompt text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE assistants ENABLE ROW LEVEL SECURITY;

-- Assistants policies
CREATE POLICY "Users can read their shop's assistants"
  ON assistants
  FOR SELECT
  TO authenticated
  USING (
    shop_id IN (
      SELECT shop_id FROM shop_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Shop admins can manage assistants"
  ON assistants
  FOR ALL
  TO authenticated
  USING (
    shop_id IN (
      SELECT shop_id FROM shop_users 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );