/*
  # Create top-up transactions table

  1. New Tables
    - `topup_transactions`
      - `id` (uuid, primary key)
      - `shop_id` (uuid, foreign key)
      - `minutes_purchased` (integer)
      - `amount_paid` (decimal)
      - `transaction_type` (text)
      - `payment_method` (text)
      - `stripe_payment_intent_id` (text)
      - `status` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for shop-specific access
*/

CREATE TABLE IF NOT EXISTS topup_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE,
  minutes_purchased integer NOT NULL,
  amount_paid decimal(10,2) NOT NULL,
  transaction_type text DEFAULT 'manual' CHECK (transaction_type IN ('manual', 'auto')),
  payment_method text DEFAULT 'stripe',
  stripe_payment_intent_id text,
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_topup_transactions_shop_id ON topup_transactions(shop_id);
CREATE INDEX IF NOT EXISTS idx_topup_transactions_created_at ON topup_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_topup_transactions_status ON topup_transactions(status);

-- Enable RLS
ALTER TABLE topup_transactions ENABLE ROW LEVEL SECURITY;

-- Top-up transactions policies
CREATE POLICY "Users can read their shop's transactions"
  ON topup_transactions
  FOR SELECT
  TO authenticated
  USING (
    shop_id IN (
      SELECT shop_id FROM shop_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Shop owners can manage transactions"
  ON topup_transactions
  FOR ALL
  TO authenticated
  USING (
    shop_id IN (
      SELECT shop_id FROM shop_users 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );