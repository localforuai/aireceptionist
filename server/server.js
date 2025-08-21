const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Vapi API configuration
const VAPI_BASE_URL = process.env.VAPI_BASE_URL || 'https://api.vapi.ai';
const VAPI_PRIVATE_KEY = process.env.VAPI_PRIVATE_KEY;

if (!VAPI_PRIVATE_KEY) {
  console.error('VAPI_PRIVATE_KEY is required in environment variables');
  process.exit(1);
}

console.log('Server starting with configuration:');
console.log('- Port:', PORT);
console.log('- CORS Origin:', process.env.CORS_ORIGIN || 'http://localhost:5173');
console.log('- Vapi Base URL:', VAPI_BASE_URL);
console.log('- Vapi Private Key:', VAPI_PRIVATE_KEY ? 'Configured ✓' : 'Missing ✗');

// Helper function to make Vapi API requests
async function makeVapiRequest(endpoint, options = {}) {
  const url = `${VAPI_BASE_URL}${endpoint}`;
  
  try {
    console.log(`Making Vapi API request to: ${url}`);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log(`Vapi API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vapi API error response:', errorText);
      throw new Error(`Vapi API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`Vapi API response data count: ${Array.isArray(data) ? data.length : 'single object'}`);
    return data;
  } catch (error) {
    console.error('Error making Vapi request:', error);
    throw error;
  }
}

// Transform Vapi call data to match frontend format
function transformVapiCall(vapiCall) {
  // Calculate duration from timestamps if not provided
  let duration = vapiCall.duration || 0;
  if (!duration && vapiCall.createdAt && vapiCall.endedAt) {
    const start = new Date(vapiCall.createdAt).getTime();
    const end = new Date(vapiCall.endedAt).getTime();
    duration = Math.floor((end - start) / 1000);
  }
  
  // Determine status
  let status = 'completed';
  if (vapiCall.status === 'ended') {
    status = 'completed';
  } else if (vapiCall.status === 'failed' || vapiCall.status === 'error') {
    status = 'failed';
  } else if (vapiCall.status === 'ringing' || vapiCall.status === 'in-progress') {
    status = 'in-progress';
  }
  
  // Map end reason
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
  
  // Calculate success rating
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

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    vapiConfigured: !!VAPI_PRIVATE_KEY
  });
});

// Get calls with optional filtering
app.get('/api/calls', async (req, res) => {
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
    
    // Handle both array response and paginated response
    const calls = Array.isArray(response) ? response : (response.data || []);
    const transformedCalls = calls.map(call => transformVapiCall(call));
    
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

// Test Vapi connection
app.get('/api/test-connection', async (req, res) => {
  try {
    await makeVapiRequest('/assistant');
    res.json({
      success: true,
      message: 'Successfully connected to Vapi API'
    });
  } catch (error) {
    console.error('Connection test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
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
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`✓ Vapi backend server running on port ${PORT}`);
  console.log(`✓ CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
  console.log(`✓ Vapi API Base URL: ${VAPI_BASE_URL}`);
  console.log(`✓ Ready to serve live Vapi data`);
});