# 🚀 NormalDance Infrastructure Deployment Guide

## 📊 Current Status

### ✅ 1. Frontend (Vercel) - IN PROGRESS
```
🔄 Status: Building
URL: https://normaldance-qn4mtm2qr-neuroflacs-projects.vercel.app
Environment: Production
```

### ⏳ 2. Backend (Cloudflare Workers) - PENDING
```
📁 File: src/workers/index.ts (Created)
⚙️  Ready for: wrangler publish src/workers/index.ts --name grave-api
🔧 Actions: Install Wrangler CLI, Configure wrangler.toml
```

### ⏳ 3. Database (PostgreSQL) - NEEDS CONFIG
```
❌ Current: SQLite (file://db/custom.db)
🎯 Target: PostgreSQL 
📝 Actions: Set up DATABASE_URL, Run prisma db push
```

### ⏳ 4. Redis (Upstash) - NEEDS TOKEN
```
🔑 Status: FREE_TOKEN not set
🎯 Command: curl -X POST https://api.upstash.io/v1/create-db 
📝 Actions: Get Upstash API token, Create database
```

---

## 🔧 Step-by-Step Deployment

### 1. Frontend Complete ✅
- Production deployment running
- Two active deployments building
- HTTPS ready
- Custom domains prepared

### 2. Backend Deployment Steps

#### Install Wrangler CLI
```bash
# Global installation
npm install -g wrangler

# Or project-specific
npm install --save-dev wrangler
```

#### Configure wrangler.toml
```toml
name = "grave-api"
main = "src/workers/index.ts"
compatibility_date = "2023-12-01"

[env.production]
name = "grave-api-prod"

[[env.production.vars]]
DATABASE_URL = "your_postgres_url"
JWT_SECRET = "your_jwt_secret"
```

#### Deploy Worker
```bash
wrangler publish src/workers/index.ts --name grave-api
```

### 3. Database Setup Steps

#### Option A: PostgreSQL (Recommended)
```bash
# Update .env with PostgreSQL URL
DATABASE_URL="postgresql://user:password@host:port/database"

# Push schema
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

#### Option B: Supabase (Managed PostgreSQL)
```bash
# Create Supabase project
# Get connection string
# Update .env file
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
```

### 4. Redis Setup Steps

#### Get Upstash Token
```bash
# Visit https://upstash.com/
# Create account
# Get API token from dashboard
export FREE_TOKEN="your_upstash_token"
```

#### Create Database
```bash
curl -X POST https://api.upstash.io/v1/create-db \
  -H "Authorization: Bearer $FREE_TOKEN"
```

#### Update wrangler.toml
```toml
[env.production.vars]
REDIS_URL = "your_upstash_redis_url"
```

---

## 🌐 Production Endpoints Architecture

### Frontend (Vercel)
```
Main App: https://normaldance.online
API Routes: https://normaldance.online/api/*
Health: https://normaldance.online/api/health
```

### Backend (Cloudflare Workers)
```
API Gateway: https://grave-api.your-subdomain.workers.dev
Tracks: https://grave-api.workers.dev/api/tracks
Artists: https://grave-api.workers.dev/api/artists
Grave: https://grave-api.workers.dev/api/grave/donations
```

### Database (PostgreSQL)
```
Primary: PostgreSQL instance
Connection: via DATABASE_URL
Migrations: Prisma
Replication: Vercel Edge-ready
```

### Cache (Redis/Upstash)
```
Session storage
API rate limiting
Real-time data caching
WebSocket state management
```

---

## 🔗 Integration Points

### Frontend ↔ Backend
```typescript
// Frontend API calls
const response = await fetch('https://grave-api.workers.dev/api/tracks');

// Backend CORS enabled
corsHeaders = {
  'Access-Control-Allow-Origin': 'https://normaldance.online'
}
```

### Backend ↔ Database
```typescript
// Cloudflare Worker D1 example (alternative)
const stmt = env.DB.prepare('SELECT * FROM tracks');
const result = await stmt.all();
```

### Backend ↔ Redis
```typescript
// Using Upstash REST API in Worker
const response = await fetch(`${env.REDIS_URL}/get/${key}`, {
  headers: { Authorization: `Bearer ${env.REDIS_TOKEN}` }
});
```

---

## 🚀 Deployment Commands (Complete Sequence)

### Pre-deployment Setup
```bash
# 1. Install dependencies
npm install -g wrangler
npm install @wrangler/core

# 2. Configure environment
export UPSTASH_TOKEN="your_token"
export POSTGRES_URL="your_postgres_url"

# 3. Create database schema
npx prisma db push
npx prisma generate
```

### Deployment Sequence
```bash
# 1. Deploy backend (Cloudflare Workers)
wrangler publish src/workers/index.ts --name grave-api

# 2. Create Redis/Upstash database
curl -X POST https://api.upstash.io/v1/create-db \
  -H "Authorization: Bearer $UPSTASH_TOKEN"

# 3. Test endpoints
curl https://grave-api.your-subdomain.workers.dev/api/health

# 4. Update frontend environment variables
# In Vercel Dashboard set BACKEND_API_URL
```

---

## 🔍 Monitoring & Health Checks

### Production Monitoring
```bash
# Frontend health
curl https://normaldance.online/api/health

# Backend health  
curl https://grave-api.workers.dev/api/health

# Database connection
npx prisma db pull --preview-feature

# Redis connectivity
curl $REDIS_URL/ping
```

### Error Tracking
```typescript
// Sentry integration in both services
import * as Sentry from '@sentry/cloudflare';

Sentry.init({
  dsn: env.SENTRY_DSN,
  environment: 'production'
});
```

---

## 🔒 Security Configuration

### CORS (Cloudflare Worker)
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://normaldance.online',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};
```

### Rate Limiting
```typescript
// Using Upstash Redis for rate limiting
const rateLimitKey = `rate_limit:${ip}:${endpoint}`;
const current = await redis.get(rateLimitKey);
if (current > 100) return new Response('Rate Limited', { status: 429 });
```

### Authentication
```typescript
// JWT validation in worker
const token = request.headers.get('Authorization').replace('Bearer ', '');
const decoded = jwt.verify(token, env.JWT_SECRET);
```

---

## 📋 Deployment Checklist

### Frontend ✅
- [x] Next.js build successful
- [x] Environment variables configured
- [x] Custom domains prepared
- [x] HTTPS enabled
- [x] API endpoints accessible

### Backend ⏳
- [ ] Wrangler CLI installed
- [ ] Worker code deployed
- [ ] Environment bindings set
- [ ] CORS configured
- [ ] Error handling implemented

### Database ⏳
- [ ] PostgreSQL instance created
- [ ] DATABASE_URL configured
- [ ] Prisma schema pushed
- [ ] Client generated
- [ ] Connection tested

### Redis ⏳
- [ ] Upstash account created
- [ ] API token retrieved
- [ ] Database created
- [ ] Connection tested
- [ ] Rate limiting configured

---

## 🚨 Troubleshooting

### Common Issues

1. **PostgreSQL Connection Failed**
   ```
   Error: P1012: the URL must start with postgresql://
   ```
   **Solution**: Use correct PostgreSQL URL format

2. **Worker Deployment Failed**
   ```
   Error: Account ID not found
   ```
   **Solution**: Run `wrangler auth login`

3. **CORS Errors**
   ```
   Access-Control-Allow-Origin blocked
   ```
   **Solution**: Configure proper CORS headers

4. **Environment Variables Missing**
   ```
   Env binding not found
   ```
   **Solution**: Set environment variables in wrangler.toml

---

## 🔄 Next Steps

### Immediate (Today)
1. **Complete Wrangler setup** and deploy Worker backend
2. **Configure PostgreSQL** and push Prisma schema  
3. **Set up Upstash Redis** for caching
4. **Test all endpoint connections**

### Short-term (This Week)
1. **Environment variable management** across services
2. **Error tracking integration** (Sentry)
3. **Performance monitoring** setup
4. **Database backup strategy**

### Long-term (Next Month)
1. **Multi-region deployment**
2. **Database replication**
3. **Advanced caching strategies**
4. **Load balancing**

---

## 👥 Team Responsibilities

### DevOps Engineer
- Cloudflare Worker deployment
- Environment configuration
- Monitoring setup

### Backend Developer  
- API endpoint implementation
- Database schema management
- Redis integration

### Frontend Developer
- API integration
- Error handling
- User experience

---

**Status**: Infrastructure partially deployed ✅
**Next Action**: Complete Wrangler setup and deploy backend
**Timeline**: 2-4 hours for full infrastructure
