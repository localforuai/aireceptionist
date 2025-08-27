/*
  # Insert sample data for development

  1. Sample Data
    - Demo shop
    - Sample assistants
    - Sample calls
    - Sample bookings
    - Subscription data

  Note: This is for development/demo purposes only
*/

-- Insert sample shop
INSERT INTO shops (id, name, email, phone, address, timezone) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440000',
  'Demo Massage Therapy',
  'demo@shop.com',
  '+1 (555) 123-4567',
  '123 Wellness Street, Health City, HC 12345',
  'America/New_York'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample assistants
INSERT INTO assistants (shop_id, vapi_assistant_id, name, description, voice_settings, prompt, is_active) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440000',
  'asst_demo_sarah',
  'Sarah (Main)',
  'Primary receptionist for booking appointments',
  '{"voice": "nova", "speed": 1.0, "pitch": 0.0}',
  'You are Sarah, a friendly and professional receptionist for Demo Massage Therapy. Help customers book appointments, answer questions about services, and provide information about availability.',
  true
),
(
  '550e8400-e29b-41d4-a716-446655440000',
  'asst_demo_mike',
  'Mike (Backup)',
  'Backup receptionist for after-hours',
  '{"voice": "onyx", "speed": 1.0, "pitch": 0.0}',
  'You are Mike, a helpful backup receptionist for Demo Massage Therapy. Assist customers with booking appointments and answering basic questions about our services.',
  true
),
(
  '550e8400-e29b-41d4-a716-446655440000',
  'asst_demo_emily',
  'Emily (Evening)',
  'Evening shift receptionist',
  '{"voice": "shimmer", "speed": 1.0, "pitch": 0.0}',
  'You are Emily, the evening receptionist for Demo Massage Therapy. Help customers with late-day bookings and provide information about our services.',
  true
);

-- Insert sample subscription
INSERT INTO subscriptions (shop_id, plan_name, total_minutes, used_minutes, auto_topup_enabled, auto_topup_amount, auto_topup_price) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440000',
  'Professional Plan - 300 mins/month',
  300,
  127.5,
  false,
  100,
  25.00
) ON CONFLICT (shop_id) DO NOTHING;

-- Insert sample calendar integration
INSERT INTO calendar_integrations (shop_id, provider, is_connected, selected_calendar_id, selected_calendar_name, sync_mode, conflict_check, last_sync_time) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440000',
  'google',
  true,
  'primary',
  'Primary Calendar',
  '2-way',
  true,
  now() - interval '15 minutes'
) ON CONFLICT (shop_id) DO NOTHING;

-- Insert sample calls (last 30 days)
DO $$
DECLARE
  shop_uuid uuid := '550e8400-e29b-41d4-a716-446655440000';
  assistant_ids uuid[];
  call_date timestamptz;
  call_duration integer;
  call_status text;
  call_end_reason text;
  call_success integer;
  customer_phones text[] := ARRAY['+15551234567', '+15559876543', '+15555555555', '+15551111111', '+15552222222'];
  customer_names text[] := ARRAY['Sarah Johnson', 'Mike Chen', 'Emma Davis', 'John Smith', 'Lisa Wang'];
  service_types text[] := ARRAY['Deep Tissue Massage', 'Swedish Massage', 'Hot Stone Massage', 'Prenatal Massage', 'Sports Massage'];
  end_reasons text[] := ARRAY['customer_complete', 'customer_hangup', 'assistant_hangup', 'system_error', 'timeout'];
  statuses text[] := ARRAY['completed', 'completed', 'completed', 'completed', 'failed'];
  i integer;
BEGIN
  -- Get assistant IDs
  SELECT ARRAY(SELECT id FROM assistants WHERE shop_id = shop_uuid) INTO assistant_ids;
  
  -- Generate 150 sample calls over the last 30 days
  FOR i IN 1..150 LOOP
    call_date := now() - (random() * interval '30 days');
    call_duration := (random() * 600 + 30)::integer; -- 30 seconds to 10 minutes
    call_status := statuses[1 + (random() * (array_length(statuses, 1) - 1))::integer];
    call_end_reason := end_reasons[1 + (random() * (array_length(end_reasons, 1) - 1))::integer];
    
    -- Calculate success rating based on duration and end reason
    call_success := CASE 
      WHEN call_end_reason = 'customer_complete' AND call_duration > 60 THEN 85 + (random() * 15)::integer
      WHEN call_end_reason = 'customer_hangup' AND call_duration > 30 THEN 70 + (random() * 15)::integer
      WHEN call_end_reason = 'system_error' THEN 20 + (random() * 30)::integer
      ELSE 60 + (random() * 20)::integer
    END;
    
    INSERT INTO calls (
      shop_id,
      assistant_id,
      vapi_call_id,
      customer_phone,
      customer_name,
      start_time,
      end_time,
      duration,
      status,
      end_reason,
      transcript,
      audio_url,
      success_rating,
      cost
    ) VALUES (
      shop_uuid,
      assistant_ids[1 + (random() * (array_length(assistant_ids, 1) - 1))::integer],
      'call_demo_' || i::text,
      customer_phones[1 + (random() * (array_length(customer_phones, 1) - 1))::integer],
      customer_names[1 + (random() * (array_length(customer_names, 1) - 1))::integer],
      call_date,
      call_date + (call_duration || ' seconds')::interval,
      call_duration,
      call_status,
      call_end_reason,
      'Customer called regarding ' || service_types[1 + (random() * (array_length(service_types, 1) - 1))::integer] || '. The conversation was handled professionally and the customer''s needs were addressed.',
      'https://example.com/audio/call_demo_' || i::text || '.mp3',
      call_success,
      (random() * 2 + 0.1)::decimal(10,4)
    );
  END LOOP;
END $$;

-- Insert sample bookings for the next 14 days
DO $$
DECLARE
  shop_uuid uuid := '550e8400-e29b-41d4-a716-446655440000';
  booking_date timestamptz;
  customer_names text[] := ARRAY['Sarah Johnson', 'Mike Chen', 'Emma Davis', 'John Smith', 'Lisa Wang', 'Alex Brown', 'Maria Garcia', 'David Lee'];
  customer_phones text[] := ARRAY['+15551234567', '+15559876543', '+15555555555', '+15551111111', '+15552222222', '+15553333333', '+15554444444', '+15556666666'];
  service_types text[] := ARRAY['Deep Tissue Massage', 'Swedish Massage', 'Hot Stone Massage', 'Prenatal Massage', 'Sports Massage', 'Reflexology', 'Aromatherapy'];
  statuses text[] := ARRAY['confirmed', 'confirmed', 'confirmed', 'pending', 'cancelled'];
  i integer;
  j integer;
  bookings_per_day integer;
BEGIN
  -- Generate bookings for next 14 days
  FOR i IN 0..13 LOOP
    bookings_per_day := 8 + (random() * 12)::integer; -- 8-20 bookings per day
    
    FOR j IN 1..bookings_per_day LOOP
      booking_date := (CURRENT_DATE + i::integer) + 
                     (interval '9 hours') + -- Start at 9 AM
                     (random() * interval '9 hours'); -- Random time between 9 AM - 6 PM
      
      INSERT INTO bookings (
        shop_id,
        customer_name,
        customer_phone,
        customer_email,
        service_type,
        appointment_date,
        duration_minutes,
        status,
        notes
      ) VALUES (
        shop_uuid,
        customer_names[1 + (random() * (array_length(customer_names, 1) - 1))::integer],
        customer_phones[1 + (random() * (array_length(customer_phones, 1) - 1))::integer],
        'customer' || j::text || '@email.com',
        service_types[1 + (random() * (array_length(service_types, 1) - 1))::integer],
        booking_date,
        (ARRAY[30, 60, 90, 120])[1 + (random() * 3)::integer],
        statuses[1 + (random() * (array_length(statuses, 1) - 1))::integer],
        'Booking made via AI receptionist'
      );
    END LOOP;
  END LOOP;
END $$;

-- Insert sample top-up transactions
INSERT INTO topup_transactions (shop_id, minutes_purchased, amount_paid, transaction_type, status) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440000',
  100,
  25.00,
  'manual',
  'completed'
),
(
  '550e8400-e29b-41d4-a716-446655440000',
  200,
  50.00,
  'auto',
  'completed'
);