# 🏗️ NormalDance Infrastructure Setup Guide

## 📋 Overview
Полная настройка инфраструктуры NormalDance: Frontend, Backend, Database, Redis

---

## 1. 🖥️ Frontend (Vercel) - 完成

### ✅ Статус
- **Deployment**: Активен
- **URL**: https://normaldance-qn4mtm2qr-neuroflacs-projects.vercel.app
- **Status**: Building...

### 🚀 Команды
```bash
# Production deployment
vercel --prod

# Check status
vercel ls

# Add custom domains
vercel domains add normaldance.online
vercel domains add normaldance.ru
```

---

## 2. ☁️ Backend (Cloudflare Worker) - Готов к настройке

### 📁 Worker File Created
- **Location**: `src/workers/index.ts`
- **Features**: API endpoints, CORS, Error handling

### 🛠️ Установка Wrangler
```bash
# Установка
npm install -g wrangler

# Проверка версии
wrangler --version

# Login в Cloudflare
wrangler login
```

### 🚀 Команды для деплоя
```bash
# Деплой Worker API
wrangler publish src/workers/index.ts --name grave-api

# Для ежедневных обновлений
wrangler publish src/workers/index.ts --name grave-api --compatibility-date=2023-10-01
```

### ⚙️ Конфигурация
Создать `wrangler.toml`:
```toml
name = "grave-api"
main = "src/workers/index.ts"
compatibility_date = "2023-10-01"

[env.production]
name = "grave-api-prod"

[env.production.vars]
ENVIRONMENT = "production"
```

---

## 3. 🗄️ Database (Prisma) - Требует настройки

### 🔧 Текущий статус
- **Provider**: PostgreSQL (требует connection string)
- **Schema**: Готова в `prisma/schema.prisma`
- **Ошибка**: `DATABASE_URL` должен начинаться с `postgresql://`

### 🛠️ Настройка

#### Вариант A: PostgreSQL через Vercel
```bash
# В Vercel Dashboard → Storage → Create Database
# Database → PostgreSQL → Connect

# Получить connection string и обновить .env
DATABASE_URL="postgresql://username:password@host:port/database"
```

#### Вариант B: Railway/Supabase
```bash
# Railway
railway login
railway new
railwayvariables set DATABASE_URL="your_postgres_url"

# Supabase
supabase login  
supabase projects create
# Получить connection string из проекта
```

#### Вариант C: Локальный PostgreSQL
```bash
# Установка PostgreSQL
# Windows: https://www.postgresql.org/download/windows/

# Создание базы данных
createdb normaldance

# Connection string
DATABASE_URL="postgresql://postgres:password@localhost:5432/normaldance"
```

### 🚀 Команды
```bash
# Применить schema к базе данных
npx prisma db push

# (Только при больших изменениях)
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

---

## 4. 🔄 Redis (Upstash) - Требует настройки

### 🔑 Получение FREE_TOKEN

1. **Sign Up**: https://console.upstash.com/
2. **Login** в консоль
3. **Account Settings** → **API Keys**
4. **Copy** REST API Token

### 🛠️ Создание Redis Database
```bash
# Установить токен в environment
export FREE_TOKEN="your_upstash_api_token"

# Создать базу данных
curl -X POST https://api.upstash.io/v1/create-db \
  -H "Authorization: Bearer $FREE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "normaldance-redis",
    "region": "us-east-1"
  }'

# Ответ будет содержать REST_URL и REST_TOKEN
```

### 📝 Конфигурация в .env
```bash
# Добавить в .env
UPSTASH_REDIS_REST_URL="https://your-redis-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# Или используя переменные из ответа API
REDIS_URL="https://your-redis-url.upstash.io"
REDIS_TOKEN="your-redis-token"
```

### 🧪 Тестирование Redis
```bash
# Test connection
curl -X POST https://your-redis-url.upstash.io/hash/set/test \
  -H "Authorization: Bearer $REDIS_TOKEN" \
  -d '{"key": "test", "field": "value", "value": "Hello Redis"}'
```

---

## 📱 Environment Variables Configuration

### 🔧 Финальный .env
```bash
# Database
DATABASE_URL="postgresql://username:password@host:5432/normaldance"

# Redis
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# Auth
NEXTAUTH_SECRET="your-super-secret-key"
NEXTAUTH_URL="https://normaldance.online"

# Blockchain
NEXT_PUBLIC_SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
PINATA_JWT="your-pinata-jwt"

# Telegram
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"

# Services
SENTRY_DSN="your-sentry-dsn"
```

---

## 🚀 Полный Deployment Pipeline

### Шаг 1: Настройка Environment
```bash
# 1. Настроить DATABASE_URL
# 2. Настроить Redis переменные
# 3. Настроить другие environment variables
```

### Шаг 2: Deploy Backend Services
```bash
# Prisma database
npx prisma db push

# Cloudflare Worker
wrangler publish src/workers/index.ts --name grave-api
```

### Шаг 3: Frontend Production
```bash
# Production deployment
vercel --prod

# Custom domains
vercel domains add normaldance.online
```

### Шаг 4: Интеграция
```bash
# Обновить frontend для работы с new backend API
# Настроить webhook для Telegram
# Тестировать end-to-end функциональность
```

---

## 🧪 Testing Checklist

### Frontend Tests
```bash
npm run test:unit
npm run test:integration
```

### Backend Tests  
```bash
# Test HTTP endpoints
curl https://grave-api.workers.dev/api/health
curl https://grave-api.workers.dev/api/tracks
```

### Database Tests
```bash
# Test database connection
npx prisma db pull
npx prisma studio
```

### Redis Tests
```bash
# Test Redis connection
curl -X POST $REDIS_URL/ping -H "Authorization: Bearer $REDIS_TOKEN"
```

---

## 📊 Monitoring & Logs

### Vercel Monitoring
- Dashboard: https://vercel.com/dashboard
- Logs: Available per deployment
- Analytics: Enable in project settings

### Cloudflare Monitoring  
- Workers Analytics: https://dash.cloudflare.com/workers
- Real-time logs: Built-in console

### Database Monitoring
- Prisma Studio: `npx prisma studio`
- Query logs: Enable in Prisma config

### Redis Monitoring
- Upstash Console: https://console.upstash.com/
- Real-time metrics: Available in dashboard

---

## 🔄 Next Steps Priority

1. **HIGH**: Настроить PostgreSQL DATABASE_URL
2. **HIGH**: Создать Upstash Redis базу данных  
3. **MEDIUM**: Deploy Cloudflare Worker
4. **LOW**: Настроить кастомные домены
5. **LOW**: Настроить monitoring

---

## 💡 Quick Scripts

### Одной командой (после настройки env)
```bash
# Full infrastructure setup
echo "🚀 Deploying NormalDance Infrastructure..."

# Database
npx prisma db push && echo "✅ Database deployed"

# Worker API  
wrangler publish src/workers/index.ts --name grave-api && echo "✅ Worker deployed"

# Frontend
vercel --prod && echo "✅ Frontend deployed"

echo "🎉 Deployment complete!"
```

### Environment setup script
```bash
# setup.env.sh
echo "🔧 Setting up environment..."

# Prompt for required variables
read -p "Enter DATABASE_URL: " db_url
read -p "Enter UPSTASH_REDIS_REST_URL: " redis_url  
read -p "Enter UPSTASH_REDIS_REST_TOKEN: " redis_token

# Update .env file
echo "DATABASE_URL=\"$db_url\"" >> .env
echo "UPSTASH_REDIS_REST_URL=\"$redis_url\"" >> .env
echo "UPSTASH_REDIS_REST_TOKEN=\"$redis_token\"" >> .env

echo "✅ Environment configured!"
```

---

## 📞 Support Resources

### Documentation
- **Vercel**: https://vercel.com/docs
- **Cloudflare Workers**: https://developers.cloudflare.com/workers/
- **Prisma**: https://www.prisma.io/docs
- **Upstash**: https://docs.upstash.com/

### Communities
- **Discord**: Community support links in docs
- **Stack Overflow**: Tagged questions
- **GitHub**: Issues in respective repositories

---

**Status**: 🔄 Ready for full infrastructure deployment  
**Next Action**: Configure DATABASE_URL and create Redis database
