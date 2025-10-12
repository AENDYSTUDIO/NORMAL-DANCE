# Redis и QStash Интеграция

## Обзор

В проекте NormalDance реализована интеграция с Upstash Redis и QStash для обеспечения масштабируемости, производительности и надежности. Эта интеграция включает в себя:
r
- Кэширование данных с помощью Upstash Redis
- Ограничение частоты запросов (rate limiting)
- Асинхронная обработка задач через QStash
- Управление сессиями и кэшем

## Конфигурация

### Переменные окружения

```env
# Upstash Redis
UPSTASH_REDIS_REST_URL="https://your-redis-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# QStash
QSTASH_URL="https://qstash.upstash.io"
QSTASH_TOKEN="your-qstash-token"
QSTASH_CURRENT_SIGNING_KEY="sig_..."
QSTASH_NEXT_SIGNING_KEY="sig_..."
```

### Конфигурация в secrets-config.json

Все указанные переменные окружения добавлены в конфигурацию секретов для всех окружений (development, staging, production).

## Архитектура

### Redis-сервис

Расположение: `TELEGRAM 07.10/libs/redis.ts`

Функциональность:
- Кэширование данных
- Управление сессиями
- Ограничение частоты запросов
- Хранение временных данных

### QStash-сервис

Расположение: `src/lib/qstash-service.ts`

Функциональность:
- Публикация асинхронных задач
- Обработка уведомлений
- Отправка email
- Аналитика событий
- Обработка файлов

### Background-задачи

Расположение: `src/lib/background-tasks.ts`

Функциональность:
- Отправка уведомлений
- Обработка email
- Трекинг аналитики
- Обработка файлов
- Транскодирование аудио
- Обработка платежей
- Майнтинг NFT

## Использование

### Кэширование данных

```typescript
import { cacheManager } from 'path/to/cache-manager';

// Сохранение в кэш
await cacheManager.set('users', userId, userData);

// Получение из кэша
const userData = await cacheManager.get('users', userId);
```

### Ограничение частоты запросов

Rate limiting реализовано в `src/middleware/rate-limiter.ts` с использованием Upstash Ratelimit.

### Асинхронные задачи

```typescript
import { backgroundTaskService } from '@/src/lib/background-tasks';

// Отправка уведомления
await backgroundTaskService.sendNotification(userId, 'Title', 'Message');

// Отправка email
await backgroundTaskService.sendEmail('user@example.com', 'Subject', 'Body');

// Трекинг события
await backgroundTaskService.trackEvent(userId, 'event_name', properties);
```

## API-эндпоинты

### QStash Webhook

`POST /api/qstash/{queue-name}`

Этот эндпоинт обрабатывает входящие сообщения от QStash. Поддерживает различные очереди:
- `notifications` - для уведомлений
- `emails` - для email
- `analytics` - для аналитики
- `file-processing` - для обработки файлов
- `audio-transcoding` - для транскодирования аудио
- `payments` - для обработки платежей
- `nft-minting` - для майнтинга NFT

### Тестовый эндпоинт

`GET /api/test-integration`

Проверяет работоспособность Redis и QStash интеграции.

## Безопасность

- Все токены хранятся как секреты
- Подписи QStash проверяются для подтверждения аутентичности сообщений
- Используется HTTPS для всех соединений
- Временные ключи автоматически обновляются

## Мониторинг

Для мониторинга состояния интеграции можно использовать:

- Статистику Redis через команды INFO
- Статус сообщений QStash
- Логи приложения
- Статистику по очередям

## Тестирование

Для проверки интеграции доступен тестовый эндпоинт, который проверяет:
- Подключение к Redis
- Возможность записи и чтения данных
- Публикацию сообщений в QStash