# Complete AI Receptionist Dashboard

A comprehensive, production-ready dashboard for shop owners to monitor and manage their AI receptionist powered by VAPI, with full integrations for payments, calendar sync, and real-time analytics.

## 🚀 Features

### Core Dashboard
- **Real-time Analytics**: Live call metrics, success rates, and performance tracking
- **Multi-language Support**: English and Thai language options
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Secure Authentication**: Multi-tenant system with role-based access

### VAPI Integration
- **Live Call Data**: Real-time sync with VAPI API
- **Assistant Management**: Create, update, and manage AI assistants
- **Call Control**: Start/end calls programmatically
- **Webhook Support**: Real-time call status updates

### Payment System (Stripe)
- **Subscription Management**: Track usage and remaining minutes
- **One-time Top-ups**: Purchase additional minutes as needed
- **Auto Top-up**: Automatic minute purchases when running low
- **Payment History**: Complete transaction tracking

### Calendar Integration (Google Calendar)
- **OAuth Authentication**: Secure Google Calendar connection
- **Two-way Sync**: Sync appointments both ways
- **Conflict Detection**: Prevent double-bookings
- **Multiple Calendars**: Support for multiple calendar selection

### Database (Supabase)
- **Multi-tenant Architecture**: Complete data isolation per shop
- **Row Level Security**: Database-level security policies
- **Real-time Updates**: Live data synchronization
- **Analytics Functions**: Pre-built database functions for metrics

## 🛠 Setup Instructions

### 1. Environment Configuration

**Frontend (.env)**
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BACKEND_URL=http://localhost:3001
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

**Backend (server/.env)**
```bash
# VAPI Configuration
VAPI_PRIVATE_KEY=your_vapi_private_key_here
VAPI_BASE_URL=https://api.vapi.ai

# Server Configuration
PORT=3001
CORS_ORIGIN=http://localhost:5173

# Database
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Google Calendar
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

# Security
JWT_SECRET=your_jwt_secret_key_here
```

### 2. Database Setup (Supabase)

The database migrations are already included. Run them in your Supabase dashboard:

1. Go to your Supabase project
2. Navigate to SQL Editor
3. Run the migration files in order (they're already in the project)
4. The sample data will be automatically inserted

### 3. Install Dependencies

```bash
# Frontend dependencies
npm install

# Backend dependencies
cd server && npm install && cd ..
```

### 4. Start the Application

**Option 1: Start both simultaneously**
```bash
npm run dev:full
```

**Option 2: Start separately**
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd server && npm run dev
```

### 5. Configure External Services

#### VAPI Setup
1. Get your VAPI private key from [VAPI Dashboard](https://dashboard.vapi.ai)
2. Add it to `server/.env` as `VAPI_PRIVATE_KEY`
3. Create your AI assistants through the dashboard

#### Stripe Setup
1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your test keys from the Stripe dashboard
3. Set up webhooks pointing to `your-domain/webhook/stripe`
4. Add the webhook secret to your environment

#### Google Calendar Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs

## 🏗 Architecture

### Frontend (React + TypeScript)
- **Framework**: Vite + React 18
- **Styling**: Tailwind CSS
- **State Management**: React hooks + Context
- **Routing**: React Router v6
- **Charts**: Recharts
- **Icons**: Heroicons + Lucide React

### Backend (Node.js + Express)
- **Runtime**: Node.js with Express
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT tokens
- **Payments**: Stripe API
- **Calendar**: Google Calendar API
- **AI Calls**: VAPI API

### Database Schema
- **shops**: Business information
- **shop_users**: User-shop relationships with roles
- **assistants**: AI assistant configurations
- **calls**: Call records and analytics
- **subscriptions**: Usage and billing data
- **bookings**: Appointment scheduling
- **calendar_integrations**: Calendar sync settings
- **topup_transactions**: Payment history

## 🔧 API Endpoints

### VAPI Integration
- `GET /api/calls` - Retrieve call logs
- `GET /api/calls/:id` - Get call details
- `GET /api/assistants` - List assistants
- `POST /api/assistants` - Create assistant
- `POST /api/calls/start` - Start outbound call
- `POST /api/calls/:id/end` - End active call

### Payment System
- `POST /api/payments/create-intent` - Create payment
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/history/:shopId` - Payment history
- `POST /api/payments/setup-auto-topup` - Setup auto top-up

### Calendar Integration
- `POST /api/calendar/auth/google/start` - Start OAuth
- `POST /api/calendar/auth/google/callback` - Complete OAuth
- `GET /api/calendar/calendars/:shopId` - Get calendars
- `POST /api/calendar/events` - Create event
- `POST /api/calendar/sync-bookings` - Sync bookings

### Webhooks
- `POST /webhook/vapi` - VAPI call events
- `POST /webhook/stripe` - Stripe payment events

## 🔒 Security Features

- **Row Level Security**: Database-level access control
- **JWT Authentication**: Secure API access
- **CORS Protection**: Cross-origin request filtering
- **Input Validation**: Request data sanitization
- **Environment Variables**: Secure credential storage
- **Webhook Verification**: Signed webhook validation

## 📱 Mobile App Ready

The backend API is designed to support both web and mobile applications:

- **RESTful API**: Standard HTTP endpoints
- **JWT Authentication**: Mobile-friendly auth
- **Real-time Updates**: WebSocket support ready
- **Offline Support**: Cacheable responses
- **Push Notifications**: Infrastructure ready

## 🚀 Deployment

### Frontend Deployment
- **Vercel**: `vercel --prod`
- **Netlify**: `npm run build` then deploy `dist/`
- **AWS S3**: Static hosting with CloudFront

### Backend Deployment
- **Railway**: Connect GitHub repo
- **Render**: Deploy from GitHub
- **Heroku**: `git push heroku main`
- **AWS EC2**: PM2 + Nginx setup

### Environment Variables
Update all environment variables for production:
- Use production Stripe keys
- Set production CORS origins
- Use production database URLs
- Generate secure JWT secrets

## 📊 Analytics & Monitoring

### Built-in Analytics
- **Call Metrics**: Duration, success rate, cost tracking
- **Usage Analytics**: Subscription consumption patterns
- **Performance Monitoring**: Response times and error rates
- **Business Intelligence**: Revenue and growth metrics

### Database Functions
- `get_shop_stats()`: Comprehensive shop analytics
- `get_daily_call_volume()`: Time-series call data
- Auto-triggers for real-time updates

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] VAPI webhooks configured
- [ ] Stripe webhooks set up
- [ ] Google OAuth configured
- [ ] SSL certificates installed
- [ ] Monitoring and logging enabled
- [ ] Backup strategy implemented
- [ ] Performance testing completed
- [ ] Security audit passed

## 🤝 Support

This is a complete, production-ready implementation that includes:

✅ **Full VAPI Integration** - Real-time call management
✅ **Stripe Payments** - Complete billing system  
✅ **Google Calendar** - Two-way appointment sync
✅ **Multi-tenant Database** - Secure data isolation
✅ **Responsive UI** - Works on all devices
✅ **Real-time Analytics** - Live dashboard updates
✅ **Webhook Support** - Event-driven architecture
✅ **Security Features** - Production-grade security
✅ **Mobile API Ready** - Backend supports mobile apps
✅ **Deployment Ready** - Environment configurations included

The system is designed to handle real production workloads with proper error handling, security measures, and scalability considerations.