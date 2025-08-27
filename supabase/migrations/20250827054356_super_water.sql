/*
  # Create database functions and triggers

  1. Functions
    - Update timestamps automatically
    - Calculate subscription usage
    - Handle auto top-up logic

  2. Triggers
    - Auto-update timestamps
    - Update subscription usage when calls are added
*/

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_shops_updated_at 
  BEFORE UPDATE ON shops 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assistants_updated_at 
  BEFORE UPDATE ON assistants 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_integrations_updated_at 
  BEFORE UPDATE ON calendar_integrations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at 
  BEFORE UPDATE ON bookings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update subscription usage when calls are added
CREATE OR REPLACE FUNCTION update_subscription_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Update used minutes when a call is completed
  IF NEW.status = 'completed' AND NEW.duration > 0 THEN
    UPDATE subscriptions 
    SET used_minutes = used_minutes + (NEW.duration / 60.0),
        updated_at = now()
    WHERE shop_id = NEW.shop_id;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for subscription usage updates
CREATE TRIGGER update_subscription_on_call_completion
  AFTER INSERT OR UPDATE ON calls
  FOR EACH ROW EXECUTE FUNCTION update_subscription_usage();

-- Function to get shop statistics
CREATE OR REPLACE FUNCTION get_shop_stats(shop_uuid uuid)
RETURNS TABLE (
  total_calls bigint,
  total_call_minutes numeric,
  average_call_duration numeric,
  success_rate numeric,
  calls_today bigint,
  calls_this_week bigint,
  calls_this_month bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as total_calls,
    COALESCE(SUM(duration) / 60.0, 0)::numeric as total_call_minutes,
    COALESCE(AVG(duration), 0)::numeric as average_call_duration,
    COALESCE(AVG(success_rating), 0)::numeric as success_rate,
    COUNT(CASE WHEN DATE(start_time) = CURRENT_DATE THEN 1 END)::bigint as calls_today,
    COUNT(CASE WHEN start_time >= DATE_TRUNC('week', CURRENT_DATE) THEN 1 END)::bigint as calls_this_week,
    COUNT(CASE WHEN start_time >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END)::bigint as calls_this_month
  FROM calls 
  WHERE shop_id = shop_uuid AND status = 'completed';
END;
$$ language 'plpgsql';

-- Function to get daily call volume for charts
CREATE OR REPLACE FUNCTION get_daily_call_volume(shop_uuid uuid, days_back integer DEFAULT 7)
RETURNS TABLE (
  call_date date,
  call_count bigint,
  total_minutes numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(start_time) as call_date,
    COUNT(*)::bigint as call_count,
    COALESCE(SUM(duration) / 60.0, 0)::numeric as total_minutes
  FROM calls 
  WHERE shop_id = shop_uuid 
    AND status = 'completed'
    AND start_time >= CURRENT_DATE - INTERVAL '1 day' * days_back
  GROUP BY DATE(start_time)
  ORDER BY call_date;
END;
$$ language 'plpgsql';