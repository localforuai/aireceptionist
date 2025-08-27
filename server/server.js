const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');
const stripe = require('stripe');
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize services
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.CORS_ORIGIN || 'http://localhost:5173'}/auth/google/callback`
);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.raw({ type: 'application/webhook' }));

// VAPI Configuration
const VAPI_BASE_URL = process.env.VAPI_BASE_URL || 'https://api.vapi.ai';
const VAPI_PRIVATE_KEY = process.env.VAPI_PRIVATE_KEY;

if (!VAPI_PRIVATE_KEY) {
  console.error('VAPI_PRIVATE_KEY is required in environment variables');
  process.exit(1);
}

console.log('Server starting with configuration:');
console.log('- Port:', PORT);
console.log('- CORS Origin:', process.env.CORS_ORIGIN || 'http://localhost:5173');
console.log('- VAPI Base URL:', VAPI_BASE_URL);
console.log('- VAPI Private Key:', VAPI_PRIVATE_KEY ? 'Configured ✓' : 'Missing ✗');
console.log('- Supabase:', process.env.SUPABASE_URL ? 'Configured ✓' : 'Missing ✗');
console.log('- Stripe:', process.env.STRIPE_SECRET_KEY ? 'Configured ✓' : 'Missing ✗');

// Helper function to make VAPI API requests
async function makeVapiRequest(endpoint, options = {}) {
  const url = `${VAPI_BASE_URL}${endpoint}`;
  
  try {
    console.log(`Making VAPI API request to: ${url}`);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log(`VAPI API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('VAPI API error response:', errorText);
      throw new Error(`VAPI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`VAPI API response data count: ${Array.isArray(data) ? data.length : 'single object'}`);
    return data;
  } catch (error) {
    console.error('Error making VAPI request:', error);
    throw error;
  }
}

// Transform VAPI call data to match frontend format
function transformVapiCall(vapiCall) {
  let duration = vapiCall.duration || 0;
  if (!duration && vapiCall.createdAt && vapiCall.endedAt) {
    const start = new Date(vapiCall.createdAt).getTime();
    const end = new Date(vapiCall.endedAt).getTime();
    duration = Math.floor((end - start) / 1000);
  }
  
  let status = 'completed';
  if (vapiCall.status === 'ended') {
    status = 'completed';
  } else if (vapiCall.status === 'failed' || vapiCall.status === 'error') {
    status = 'failed';
  } else if (vapiCall.status === 'ringing' || vapiCall.status === 'in-progress') {
    status = 'in-progress';
  }
  
  const endReasonMap = {
    'customer-ended-call': 'customer_hangup',
    'customer-hung-up': 'customer_hangup',
    'assistant-ended-call': 'assistant_hangup',
    'assistant-hung-up': 'assistant_hangup',
    'pipeline-error': 'system_error',
    'exceeded-max-duration': 'timeout',
    'silence-timeout': 'timeout',
    'voicemail': 'customer_complete'
  };
  
  const endReason = endReasonMap[vapiCall.endedReason] || 'customer_complete';
  
  function calculateSuccessRating(call) {
    const callDuration = call.duration || 0;
    const reason = call.endedReason;
    
    if (reason === 'customer-ended-call' && callDuration > 30) return 85;
    if (reason === 'assistant-ended-call' && callDuration > 60) return 90;
    if (reason === 'voicemail') return 95;
    if ((reason === 'customer-hung-up' || reason === 'customer-ended-call') && callDuration < 30) return 40;
    if (reason === 'pipeline-error' || reason === 'exceeded-max-duration') return 30;
    if (callDuration > 120) return 80;
    if (callDuration > 60) return 75;
    return 70;
  }
  
  return {
    id: vapiCall.id,
    assistantId: vapiCall.assistantId || 'unknown',
    assistantName: vapiCall.assistant?.name || 'Unknown Assistant',
    startTime: vapiCall.createdAt || new Date().toISOString(),
    endTime: vapiCall.endedAt || new Date().toISOString(),
    duration,
    status,
    endReason,
    transcript: vapiCall.transcript || vapiCall.messages?.map(m => `${m.role}: ${m.message}`).join('\n') || 'Transcript not available',
    audioUrl: vapiCall.recordingUrl || '',
    customerPhone: vapiCall.customer?.number || 'Unknown',
    successRating: calculateSuccessRating(vapiCall),
    cost: vapiCall.cost || vapiCall.costBreakdown?.total || 0
  };
}

// Middleware to authenticate requests
const authenticateRequest = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No authorization token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user's shop information
    const { data: shopUser, error } = await supabase
      .from('shop_users')
      .select('shop_id, role')
      .eq('user_id', decoded.sub)
      .single();

    if (error || !shopUser) {
      return res.status(401).json({ success: false, error: 'Invalid token or user not found' });
    }

    req.user = {
      id: decoded.sub,
      shopId: shopUser.shop_id,
      role: shopUser.role
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

// Health check
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    vapiConfigured: !!VAPI_PRIVATE_KEY,
    supabaseConfigured: !!process.env.SUPABASE_URL,
    stripeConfigured: !!process.env.STRIPE_SECRET_KEY
  });
});

// VAPI API Routes

// Get calls with optional filtering
app.get('/api/calls', async (req, res) => {
  console.log('GET /api/calls requested with query:', req.query);
  try {
    const { assistantId, limit = 50, offset = 0, startDate, endDate } = req.query;
    
    const searchParams = new URLSearchParams();
    if (assistantId) searchParams.append('assistantId', assistantId);
    if (limit) searchParams.append('limit', limit.toString());
    if (offset) searchParams.append('offset', offset.toString());
    if (startDate) searchParams.append('createdAtGt', startDate);
    if (endDate) searchParams.append('createdAtLt', endDate);

    const endpoint = `/call${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await makeVapiRequest(endpoint);
    
    const calls = Array.isArray(response) ? response : (response.data || []);
    const transformedCalls = calls.map(call => transformVapiCall(call));
    
    // Store calls in database for analytics
    for (const call of transformedCalls) {
      await supabase
        .from('calls')
        .upsert({
          vapi_call_id: call.id,
          shop_id: req.user?.shopId || 'demo-shop',
          assistant_id: call.assistantId,
          customer_phone: call.customerPhone,
          start_time: call.startTime,
          end_time: call.endTime,
          duration: call.duration,
          status: call.status,
          end_reason: call.endReason,
          transcript: call.transcript,
          audio_url: call.audioUrl,
          success_rating: call.successRating,
          cost: call.cost
        }, {
          onConflict: 'vapi_call_id'
        });
    }
    
    res.json({
      success: true,
      data: transformedCalls,
      total: transformedCalls.length
    });
  } catch (error) {
    console.error('Error fetching calls:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get specific call details
app.get('/api/calls/:callId', async (req, res) => {
  console.log('GET /api/calls/:callId requested for:', req.params.callId);
  try {
    const { callId } = req.params;
    const response = await makeVapiRequest(`/call/${callId}`);
    const transformedCall = transformVapiCall(response);
    
    res.json({
      success: true,
      data: transformedCall
    });
  } catch (error) {
    console.error('Error fetching call details:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get assistants
app.get('/api/assistants', async (req, res) => {
  console.log('GET /api/assistants requested');
  try {
    const response = await makeVapiRequest('/assistant');
    const assistants = Array.isArray(response) ? response : (response.data || []);
    
    res.json({
      success: true,
      data: assistants
    });
  } catch (error) {
    console.error('Error fetching assistants:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create assistant
app.post('/api/assistants', async (req, res) => {
  console.log('POST /api/assistants requested');
  try {
    const { name, voice, prompt, firstMessage } = req.body;
    
    const assistantData = {
      name,
      voice: {
        provider: 'openai',
        voiceId: voice
      },
      model: {
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: prompt
          }
        ]
      },
      firstMessage: firstMessage || `Hello! I'm ${name}, how can I help you today?`
    };
    
    const response = await makeVapiRequest('/assistant', {
      method: 'POST',
      body: JSON.stringify(assistantData)
    });
    
    // Store in database
    if (req.user?.shopId) {
      await supabase
        .from('assistants')
        .insert({
          shop_id: req.user.shopId,
          vapi_assistant_id: response.id,
          name,
          description: `AI assistant created via dashboard`,
          voice_settings: { voice },
          prompt,
          is_active: true
        });
    }
    
    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error creating assistant:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start outbound call
app.post('/api/calls/start', async (req, res) => {
  console.log('POST /api/calls/start requested');
  try {
    const { phoneNumber, assistantId } = req.body;
    
    const callData = {
      phoneNumber,
      assistantId
    };
    
    const response = await makeVapiRequest('/call', {
      method: 'POST',
      body: JSON.stringify(callData)
    });
    
    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error starting call:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// End call
app.post('/api/calls/:callId/end', async (req, res) => {
  console.log('POST /api/calls/:callId/end requested');
  try {
    const { callId } = req.params;
    
    const response = await makeVapiRequest(`/call/${callId}`, {
      method: 'DELETE'
    });
    
    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error ending call:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test VAPI connection
app.get('/api/test-connection', async (req, res) => {
  console.log('GET /api/test-connection requested');
  try {
    await makeVapiRequest('/assistant');
    res.json({
      success: true,
      message: 'Successfully connected to VAPI API'
    });
  } catch (error) {
    console.error('Connection test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Stripe Payment Routes

// Create payment intent for top-up
app.post('/api/payments/create-intent', async (req, res) => {
  try {
    const { shopId, minutes, amount, currency = 'usd' } = req.body;
    
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount,
      currency,
      metadata: {
        shopId,
        minutes: minutes.toString(),
        type: 'topup'
      }
    });
    
    res.json({
      success: true,
      data: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        status: paymentIntent.status
      }
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Confirm payment and add minutes
app.post('/api/payments/confirm', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    
    const paymentIntent = await stripeClient.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      const { shopId, minutes } = paymentIntent.metadata;
      
      // Add minutes to subscription
      const { error } = await supabase
        .from('subscriptions')
        .update({
          total_minutes: supabase.raw(`total_minutes + ${parseInt(minutes)}`),
          updated_at: new Date().toISOString()
        })
        .eq('shop_id', shopId);
      
      if (error) {
        throw new Error('Failed to update subscription');
      }
      
      // Record transaction
      await supabase
        .from('topup_transactions')
        .insert({
          shop_id: shopId,
          minutes_purchased: parseInt(minutes),
          amount_paid: paymentIntent.amount / 100,
          stripe_payment_intent_id: paymentIntentId,
          status: 'completed'
        });
    }
    
    res.json({
      success: true
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Google Calendar Routes

// Start Google OAuth
app.post('/api/calendar/auth/google/start', async (req, res) => {
  try {
    const { shopId } = req.body;
    
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];
    
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: shopId
    });
    
    res.json({
      success: true,
      data: { authUrl }
    });
  } catch (error) {
    console.error('Error starting Google auth:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Complete Google OAuth
app.post('/api/calendar/auth/google/callback', async (req, res) => {
  try {
    const { shopId, code } = req.body;
    
    const { tokens } = await oauth2Client.getToken(code);
    
    // Store tokens in database
    await supabase
      .from('calendar_integrations')
      .upsert({
        shop_id: shopId,
        provider: 'google',
        is_connected: true,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        last_sync_time: new Date().toISOString()
      });
    
    res.json({
      success: true
    });
  } catch (error) {
    console.error('Error completing Google auth:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get calendars
app.get('/api/calendar/calendars/:shopId', async (req, res) => {
  try {
    const { shopId } = req.params;
    
    // Get tokens from database
    const { data: integration } = await supabase
      .from('calendar_integrations')
      .select('access_token, refresh_token')
      .eq('shop_id', shopId)
      .single();
    
    if (!integration) {
      return res.status(404).json({
        success: false,
        error: 'Calendar integration not found'
      });
    }
    
    oauth2Client.setCredentials({
      access_token: integration.access_token,
      refresh_token: integration.refresh_token
    });
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const response = await calendar.calendarList.list();
    
    const calendars = response.data.items?.map(cal => ({
      id: cal.id,
      name: cal.summary,
      primary: cal.primary
    })) || [];
    
    res.json({
      success: true,
      data: calendars
    });
  } catch (error) {
    console.error('Error getting calendars:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Webhook handler for VAPI
app.post('/webhook/vapi', async (req, res) => {
  console.log('VAPI webhook received:', req.body);
  
  try {
    const event = req.body;
    
    if (event.type === 'call-ended') {
      const callData = transformVapiCall(event.data);
      
      // Update call in database
      await supabase
        .from('calls')
        .upsert({
          vapi_call_id: callData.id,
          shop_id: 'demo-shop', // You'll need to determine the shop from the call data
          assistant_id: callData.assistantId,
          customer_phone: callData.customerPhone,
          start_time: callData.startTime,
          end_time: callData.endTime,
          duration: callData.duration,
          status: callData.status,
          end_reason: callData.endReason,
          transcript: callData.transcript,
          audio_url: callData.audioUrl,
          success_rating: callData.successRating,
          cost: callData.cost
        }, {
          onConflict: 'vapi_call_id'
        });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error processing VAPI webhook:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Stripe webhook handler
app.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripeClient.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const { shopId, minutes } = paymentIntent.metadata;
      
      // This is handled in the confirm endpoint, but webhook provides backup
      console.log(`Payment succeeded for shop ${shopId}: ${minutes} minutes`);
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  console.log('404 - Endpoint not found:', req.method, req.path);
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.path}`
  });
});

app.listen(PORT, () => {
  console.log(`✓ Complete AI Receptionist backend server running on port ${PORT}`);
  console.log(`✓ CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
  console.log(`✓ VAPI API Base URL: ${VAPI_BASE_URL}`);
  console.log(`✓ Ready to serve live VAPI data with full integrations`);
  console.log('Available endpoints:');
  console.log('  - GET /health');
  console.log('  - GET /api/calls');
  console.log('  - GET /api/calls/:id');
  console.log('  - GET /api/assistants');
  console.log('  - POST /api/assistants');
  console.log('  - POST /api/calls/start');
  console.log('  - POST /api/calls/:id/end');
  console.log('  - GET /api/test-connection');
  console.log('  - POST /api/payments/create-intent');
  console.log('  - POST /api/payments/confirm');
  console.log('  - POST /api/calendar/auth/google/start');
  console.log('  - POST /api/calendar/auth/google/callback');
  console.log('  - GET /api/calendar/calendars/:shopId');
  console.log('  - POST /webhook/vapi');
  console.log('  - POST /webhook/stripe');
});