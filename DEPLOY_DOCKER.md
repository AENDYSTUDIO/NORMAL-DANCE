# Развертывание NORMALDANCE в Docker контейнерах

## 📋 Требования

1. **Docker Desktop** (для Windows/Mac) или **Docker Engine** (для Linux)
2. **Docker Compose** v2.0+
3. Минимум **8GB RAM** и **4 CPU cores**

## 🚀 Быстрый старт

### 1. Запуск Docker Desktop
```bash
# Для Windows
# Запустите Docker Desktop из меню Пуск

# Для Linux
sudo systemctl start docker
sudo systemctl enable docker
```

### 2. Клонирование и настройка
```bash
git clone <repository-url>
cd normal-dance

# Скопируйте production переменные
cp .env.production .env.local

# Отредактируйте реальные значения
nano .env.local
```

### 3. Развертывание

#### Вариант A: Development (рекомендуется для первый запуск)
```bash
# Запуск базовых сервисов
docker compose up -d

# Проверка статуса
docker compose ps

# Логи
docker compose logs -f app
```

#### Вариант B: Production (полная инфраструктура)
```bash
# Запуск полной production инфраструктуры
docker compose -f docker-compose.prod.yml up -d --build

# Проверка статуса всех сервисов
docker compose -f docker-compose.prod.yml ps
```

## 🔧 Настройка переменных окружения

### Критичные переменные для .env.local
```bash
# Database
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/normaldance"

# NextAuth
NEXTAUTH_SECRET="your-32-byte-secret-key-here"
NEXTAUTH_URL="https://yourdomain.com"

# Solana
NEXT_PUBLIC_SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
SOLANA_PRIVATE_KEY="your-solana-private-key"

# IPFS
PINATA_API_KEY="your-pinata-api-key"
PINATA_SECRET_KEY="your-pinata-secret-key"

# Telegram
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
```

## 📊 Доступные сервисы (Production)

### Основное приложение
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8080
- **WebSocket**: ws://localhost:3001

### Инфраструктура
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **IPFS API**: http://localhost:5001
- **Filecoin**: http://localhost:8888

### Мониторинг
- **Grafana**: http://localhost:3001 (admin/password)
- **Prometheus**: http://localhost:9090
- **Kibana**: http://localhost:5601
- **Alertmanager**: http://localhost:9093

### Метрики
- **Node Exporter**: http://localhost:9100/metrics
- **cAdvisor**: http://localhost:8081
- **Blackbox**: http://localhost:9115

## 🔍 Проверка работоспособности

```bash
# Проверка здоровья контейнеров
docker compose ps

# Проверка логов приложения
docker compose logs -f app

# Проверка API
curl http://localhost:3000/api/health

# Проверка базы данных
docker compose exec db pg_isready -U postgres

# Проверка Redis
docker compose exec redis redis-cli ping
```

## 🔧 Управление

```bash
# Перезапуск приложения
docker compose restart app

# Обновление образов
docker compose pull
docker compose up -d

# Остановка всех сервисов
docker compose down

# Полная очистка (с удалением volumеов)
docker compose down -v
```

## 🚨 Проблемы и решения

### Docker не запускается
```bash
# Перезапуск Docker Desktop
# Проверьте достаточно ли ресурсов (8GB RAM минимум)
```

### Проблемы с портами
```bash
# Проверка занятых портов
netstat -tulpn | grep :3000

# Изменение портов в docker-compose.yml
ports:
  - "3001:3000"  # меняем 3000 на 3001
```

### Проблемы с памятью
```bash
# Очистка Docker
docker system prune -a

# Увеличение памяти в Docker Desktop
# Settings > Resources > Memory > 8GB+
```

## 📁 Структура файлов

```
├── docker-compose.yml              # Development конфигурация
├── docker-compose.prod.yml         # Production инфраструктура
├── docker-compose.minimal.yml      # Минимальная конфигурация
├── Dockerfile                      # Основной образ приложения
├── Dockerfile.dev                  # Development образ
├── Dockerfile.prod                 # Production образ
├── Dockerfile.api                  # API Gateway
├── Dockerfile.websocket           # WebSocket сервер
├── nginx.conf                      # Nginx reverse proxy
└── .env.production                 # Production переменные
```

## 🌐 SSL/HTTPS настройка

Для production с HTTPS:

1. **Получите SSL сертификаты** (Let's Encrypt)
2. **Разместите в папке `./ssl`**
3. **Обновите nginx.conf**
4. **Используйте docker-compose.prod.yml**

```bash
# Пример структуры SSL
mkdir -p ssl
cp your-cert.pem ssl/
cp your-key.pem ssl/
```

## 📈 Мониторинг

### Grafana дашборды
- **System Overview**: общая информация о системе
- **Application Metrics**: метрики приложения
- **Database Performance**: производительность БД
- **Infrastructure**: инфраструктурные метрики

### Алерты
- **High CPU usage**: >80%
- **Memory pressure**: >90%
- **Database connections**: >80%
- **Application errors**: spike detection

## 🔄 CI/CD интеграция

```yaml
# .github/workflows/docker-deploy.yml
name: Deploy Docker
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        run: |
          docker compose -f docker-compose.prod.yml pull
          docker compose -f docker-compose.prod.yml up -d
```

---

## 🎯 Следующие шаги

1. ✅ Запустите Docker Desktop
2. ✅ Настройте `.env.local`  
3. ✅ Запустите `docker compose up -d`
4. ✅ Проверьте http://localhost:3000
5. ✅ Настройте мониторинг в Grafana

Для production развертывания используйте `docker-compose.prod.yml` с полной инфраструктурой мониторинга.
