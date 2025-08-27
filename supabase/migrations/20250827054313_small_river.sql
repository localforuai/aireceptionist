/*
  # Create users and shops tables

  1. New Tables
    - `shops`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `phone` (text)
      - `address` (text)
      - `timezone` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `shop_users`
      - `id` (uuid, primary key)
      - `shop_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key to auth.users)
      - `role` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for shop-specific data access
*/

-- Create shops table
CREATE TABLE IF NOT EXISTS shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  address text,
  timezone text DEFAULT 'UTC',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create shop_users junction table
CREATE TABLE IF NOT EXISTS shop_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'user')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(shop_id, user_id)
);

-- Enable RLS
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_users ENABLE ROW LEVEL SECURITY;

-- Shops policies
CREATE POLICY "Users can read their own shop data"
  ON shops
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT shop_id FROM shop_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Shop owners can update their shop"
  ON shops
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT shop_id FROM shop_users 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Shop users policies
CREATE POLICY "Users can read their shop memberships"
  ON shop_users
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Shop owners can manage shop users"
  ON shop_users
  FOR ALL
  TO authenticated
  USING (
    shop_id IN (
      SELECT shop_id FROM shop_users 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );