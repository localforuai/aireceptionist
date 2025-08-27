/*
  # Create bookings table

  1. New Tables
    - `bookings`
      - `id` (uuid, primary key)
      - `shop_id` (uuid, foreign key)
      - `call_id` (uuid, foreign key, nullable)
      - `customer_name` (text)
      - `customer_phone` (text)
      - `customer_email` (text)
      - `service_type` (text)
      - `appointment_date` (timestamp)
      - `duration_minutes` (integer)
      - `status` (text)
      - `notes` (text)
      - `calendar_event_id` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for shop-specific access
*/

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE,
  call_id uuid REFERENCES calls(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_phone text,
  customer_email text,
  service_type text,
  appointment_date timestamptz NOT NULL,
  duration_minutes integer DEFAULT 60,
  status text DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled', 'completed')),
  notes text,
  calendar_event_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_shop_id ON bookings(shop_id);
CREATE INDEX IF NOT EXISTS idx_bookings_appointment_date ON bookings(appointment_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_call_id ON bookings(call_id);

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Bookings policies
CREATE POLICY "Users can read their shop's bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    shop_id IN (
      SELECT shop_id FROM shop_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Shop users can manage bookings"
  ON bookings
  FOR ALL
  TO authenticated
  USING (
    shop_id IN (
      SELECT shop_id FROM shop_users 
      WHERE user_id = auth.uid()
    )
  );