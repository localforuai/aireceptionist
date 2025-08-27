# AI Receptionist Dashboard

A comprehensive dashboard for shop owners to monitor and analyze their AI receptionist call data from Vapi.

## Features

- **Secure Authentication**: Multi-tenant login system with shop-specific data isolation
- **Real-time Analytics**: Live sync with Vapi API for up-to-date call metrics
- **Interactive Charts**: Visual analysis of call patterns, success rates, and assistant performance
- **Detailed Call Logs**: Searchable and filterable call history with transcript and audio access
- **Responsive Design**: Optimized for desktop and mobile viewing

## Setup Instructions

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install && cd ..
```

### 2. Configure Backend with Vapi Private Key

The backend server is already configured with your Vapi private key in `server/.env`:
```
VAPI_PRIVATE_KEY=31ed7a3f-24c1-42e4-9dfc-59fd89292706
VAPI_BASE_URL=https://api.vapi.ai
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

### 3. Start Both Frontend and Backend

**Option 1: Start both simultaneously**
```bash
npm run dev:full
```

**Option 2: Start separately**
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run dev:server
```

## Architecture

### Security Architecture
- **Frontend**: Uses public-facing backend API (no sensitive keys exposed)
- **Backend**: Securely stores and uses Vapi private key
- **API Flow**: Frontend → Backend → Vapi API → Backend → Frontend

### Backend API Endpoints

The Node.js backend provides these endpoints:

- `GET /api/calls` - Retrieve call logs with filtering options
- `GET /api/calls/:id` - Get detailed call information  
- `GET /api/assistants` - List available assistants
- `GET /api/test-connection` - Test Vapi API connection
- `GET /health` - Backend health check

### Frontend Integration

The frontend now uses `backendApi` service instead of direct Vapi calls:
- Connects to backend on `http://localhost:3001`
- Handles connection errors gracefully
- Provides clear error messages for setup issues

## Development Workflow

1. **Backend Server** (Port 3001): Handles Vapi API calls with private key
2. **Frontend Server** (Port 5173): Serves the React dashboard
3. **Data Flow**: Dashboard → Backend API → Vapi API → Response chain

## Vapi Integration Details

The backend integrates with these Vapi API endpoints:

- `GET /call` - Retrieve call logs with filtering options
- `GET /call/{id}` - Get detailed call information
- `GET /assistant` - List available assistants

### Data Security

- **Private Key**: Stored securely in backend environment variables
- **CORS**: Configured to only allow requests from your frontend
- **No Key Exposure**: Frontend never sees or handles the private key
- **Error Handling**: Detailed logging without exposing sensitive information

### Backend Configuration

The backend service (`server/server.js`) handles:

- Authentication with Bearer token
- Request/response transformation
- Error handling and fallbacks
- Data mapping from Vapi format to dashboard format
- CORS security
- Health monitoring

## Troubleshooting

### Backend Connection Issues
```bash
# Check if backend is running
curl http://localhost:3001/health

# Check Vapi connection through backend
curl http://localhost:3001/api/test-connection
```

### Common Issues
1. **"Backend server is not running"**: Start the backend with `npm run dev:server`
2. **CORS errors**: Ensure backend CORS_ORIGIN matches your frontend URL
3. **Vapi API errors**: Check that your private key is correct in `server/.env`

## Data Mapping

Vapi call data is transformed to match the dashboard's data structure:

```typescript
interface CallData {
  id: string;
  assistantId: string;
  assistantName: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'completed' | 'failed' | 'in-progress';
  endReason: string;
  transcript: string;
  audioUrl: string;
  customerPhone: string;
  successRating: number;
  cost: number;
}
```

## Usage Modes

### Demo Mode
- Uses realistic mock data for testing and demonstration
- No backend connection required
- Perfect for development and demos

### Live Data Mode  
- Connects to backend server
- Fetches real data from your Vapi account
- Requires both frontend and backend servers running

## Production Deployment

For production deployment:

1. **Frontend**: Deploy to any static hosting (Vercel, Netlify, etc.)
2. **Backend**: Deploy to a Node.js hosting service (Railway, Render, Heroku, etc.)
3. **Environment**: Update CORS_ORIGIN and backend URL for production
4. **Security**: Use environment variables for all sensitive configuration

### Build Commands

```bash
# Build frontend
npm run build

# Backend is ready to deploy as-is
```

## Environment Variables

### Frontend (.env)
```
VITE_BACKEND_URL=http://localhost:3001
```

### Backend (server/.env)
```
VAPI_PRIVATE_KEY=your_vapi_private_key
VAPI_BASE_URL=https://api.vapi.ai
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

## Support

For Vapi API documentation and support, visit [Vapi Documentation](https://docs.vapi.ai).