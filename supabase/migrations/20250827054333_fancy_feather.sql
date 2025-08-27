/*
  # Create subscriptions table

  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `shop_id` (uuid, foreign key)
      - `plan_name` (text)
      - `total_minutes` (integer)
      - `used_minutes` (decimal)
      - `renewal_date` (timestamp)
      - `auto_topup_enabled` (boolean)
      - `auto_topup_amount` (integer)
      - `auto_topup_price` (decimal)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for shop-specific access
*/

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE UNIQUE,
  plan_name text DEFAULT 'Professional Plan - 300 mins/month',
  total_minutes integer DEFAULT 300,
  used_minutes decimal(10,2) DEFAULT 0.00,
  renewal_date timestamptz DEFAULT (date_trunc('month', now()) + interval '1 month'),
  auto_topup_enabled boolean DEFAULT false,
  auto_topup_amount integer DEFAULT 100,
  auto_topup_price decimal(10,2) DEFAULT 25.00,
  status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Subscriptions policies
CREATE POLICY "Users can read their shop's subscription"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (
    shop_id IN (
      SELECT shop_id FROM shop_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Shop owners can manage subscription"
  ON subscriptions
  FOR ALL
  TO authenticated
  USING (
    shop_id IN (
      SELECT shop_id FROM shop_users 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );