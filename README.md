# AI Receptionist Dashboard

A comprehensive dashboard for shop owners to monitor and analyze their AI receptionist call data from Vapi.

## Features

- **Secure Authentication**: Multi-tenant login system with shop-specific data isolation
- **Real-time Analytics**: Live sync with Vapi API for up-to-date call metrics
- **Interactive Charts**: Visual analysis of call patterns, success rates, and assistant performance
- **Detailed Call Logs**: Searchable and filterable call history with transcript and audio access
- **Responsive Design**: Optimized for desktop and mobile viewing

## Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Configure Vapi API

1. Get your Vapi API key from your [Vapi Dashboard](https://dashboard.vapi.ai)
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Add your Vapi credentials to `.env`:
   ```
   VITE_VAPI_API_KEY=your_actual_vapi_api_key
   VITE_VAPI_BASE_URL=https://api.vapi.ai
   ```

### 3. Start Development Server

```bash
npm run dev
```

## Vapi API Integration

The dashboard integrates with the following Vapi API endpoints:

- `GET /call` - Retrieve call logs with filtering options
- `GET /call/{id}` - Get detailed call information
- `GET /assistant` - List available assistants

### API Configuration

The Vapi service is configured in `src/services/vapiApi.ts` and handles:

- Authentication with Bearer token
- Request/response transformation
- Error handling and fallbacks
- Data mapping from Vapi format to dashboard format

### Data Mapping

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

## Demo Mode

The dashboard includes a demo mode with realistic mock data for testing and demonstration purposes. You can toggle between demo data and live Vapi data using the toggle in the dashboard header.

## Authentication

For demo purposes, the dashboard accepts any email/password combination. In production, you would integrate with your preferred authentication provider (Auth0, Firebase Auth, Supabase Auth, etc.).

## Deployment

The dashboard is ready for deployment to any static hosting provider:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Environment Variables

- `VITE_VAPI_API_KEY` - Your Vapi API key (required for live data)
- `VITE_VAPI_BASE_URL` - Vapi API base URL (defaults to https://api.vapi.ai)

## Support

For Vapi API documentation and support, visit [Vapi Documentation](https://docs.vapi.ai).