# 🎵 NORMAL DANCE
## Техническая презентация проекта
### Децентрализованная музыкальная платформа нового поколения

---

## 💡 Ценностное предложение

### 🎯 Проблема рынка
- **Централизованные платформы** забирают до 50% доходов артистов
- **Отсутствие прозрачности** в распределении роялти
- **Ограниченный контроль** над интеллектуальной собственностью
- **Высокие барьеры входа** для независимых артистов

### ✨ Наше решение
- **Мгновенные выплаты** через блокчейн (комиссия 2.5%)
- **Полная прозрачность** всех транзакций
- **NFT-владение** музыкальными активами
- **Децентрализованное хранение** через IPFS

---

## 🏗️ Архитектура системы

### Высокоуровневая архитектура
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Blockchain    │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   (Solana)      │
│                 │    │                 │    │                 │
│ • React UI      │    │ • API Routes    │    │ • Smart         │
│ • Web3 Wallet   │    │ • Auth System   │    │   Contracts     │
│ • Audio Player  │    │ • File Upload   │    │ • NFT Minting   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Storage       │
                    │   (IPFS/Redis)  │
                    │                 │
                    │ • Music Files   │
                    │ • Metadata      │
                    │ • Cache Layer   │
                    └─────────────────┘
```

### Компоненты системы

#### 🎨 Frontend Layer
- **Next.js 15** - React фреймворк с App Router
- **TypeScript** - типизированная разработка
- **Tailwind CSS** - утилитарные стили
- **Phantom Wallet** - Web3 интеграция

#### ⚙️ Backend Layer
- **Node.js** - серверная среда выполнения
- **Prisma ORM** - типобезопасная работа с БД
- **NextAuth** - система аутентификации
- **Redis** - кэширование и сессии

#### 🔗 Blockchain Layer
- **Solana** - высокопроизводительный блокчейн
- **Smart Contracts** - автоматизация роялти
- **NFT Standards** - уникальные музыкальные токены

#### 💾 Storage Layer
- **IPFS** - децентрализованное хранение файлов
- **PostgreSQL** - реляционная база данных
- **Redis** - кэш и временные данные

---

## 🐳 Docker Compose Configuration

### Минимальная конфигурация для разработки

```yaml
version: '3.8'

services:
  # Основное приложение
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: dev
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:password@postgres:5432/normaldance
      - NEXTAUTH_URL=http://localhost:3000
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
      - ipfs

  # PostgreSQL база данных
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=normaldance
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  # Redis кэш
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

  # IPFS для файлов
  ipfs:
    image: ipfs/kubo:v0.21.0
    ports:
      - "5001:5001"  # API
      - "8080:8080"  # Gateway
    volumes:
      - ipfs_data:/data/ipfs

  # Redis Commander (управление)
  redis-commander:
    image: rediscommander/redis-commander:latest
    ports:
      - "8081:8081"
    environment:
      - REDIS_HOSTS=local:redis:6379
    depends_on:
      - redis
```

### Сетевая конфигурация
- **Изолированная сеть** `normaldance-network`
- **Подсеть** 172.25.0.0/16
- **Health checks** для всех сервисов
- **Автоматический restart** при сбоях

---

## 📊 Схема базы данных

### Основные сущности

```sql
-- Пользователи (артисты и слушатели)
User {
  id: String (PK)
  email: String (unique)
  username: String (unique)
  wallet: String (Web3 адрес)
  balance: Float ($NDT токены)
  level: UserLevel (BRONZE|SILVER|GOLD|PLATINUM)
  role: UserRole (LISTENER|ARTIST|CURATOR|ADMIN)
}

-- Музыкальные треки
Track {
  id: String (PK)
  title: String
  artistName: String
  genre: String
  duration: Int (секунды)
  ipfsHash: String (IPFS хэш файла)
  price: Float ($NDT цена)
  playCount: Int
  likeCount: Int
}

-- NFT токены
NFT {
  id: String (PK)
  tokenId: String (Solana token ID)
  name: String
  metadata: Json
  price: Float
  status: NFTStatus (LISTED|SOLD|MINTED)
  type: NFTType (TRACK|ALBUM|PLAYLIST)
}

-- Система стейкинга
Stake {
  id: String (PK)
  amount: Float (количество NDT)
  rewardRate: Float (APR %)
  earned: Float (заработанные награды)
  status: StakeStatus (ACTIVE|WITHDRAWN)
}
```

### Связи между сущностями
- **User ↔ Track** (один ко многим)
- **Track ↔ NFT** (один к одному)
- **User ↔ Purchase** (многие ко многим через NFT)
- **User ↔ Stake** (один ко многим)

---

## 🚀 API Endpoints

### Аутентификация
```typescript
POST /api/auth/signin     // Вход в систему
POST /api/auth/signout    // Выход из системы
GET  /api/auth/session    // Текущая сессия
POST /api/auth/wallet     // Подключение кошелька
```

### Музыкальные треки
```typescript
GET    /api/tracks        // Список треков
POST   /api/tracks        // Загрузка трека
GET    /api/tracks/[id]   // Детали трека
PUT    /api/tracks/[id]   // Обновление трека
DELETE /api/tracks/[id]   // Удаление трека
POST   /api/tracks/[id]/play // Воспроизведение
```

### NFT Marketplace
```typescript
GET  /api/nft             // Список NFT
POST /api/nft/mint        // Создание NFT
POST /api/nft/[id]/buy    // Покупка NFT
GET  /api/nft/[id]/history // История транзакций
```

### Стейкинг
```typescript
POST /api/staking/stake   // Стейкинг токенов
POST /api/staking/unstake // Вывод токенов
GET  /api/staking/rewards // Расчет наград
```

---

## 📈 Потоки данных

### Загрузка музыки
```
Артист → Frontend → API → IPFS → Database → Blockchain
  ↓         ↓        ↓      ↓        ↓          ↓
Файл → Валидация → Хэш → Метаданные → NFT Mint
```

### Воспроизведение
```
Слушатель → Frontend → IPFS → Audio Player → Analytics
     ↓         ↓        ↓         ↓           ↓
  Запрос → Авторизация → Файл → Воспроизведение → Статистика
```

### Покупка NFT
```
Покупатель → Wallet → Smart Contract → Database → Уведомление
     ↓        ↓           ↓              ↓           ↓
  Транзакция → Подпись → Перевод → Обновление → Артисту
```

---

## 🛠️ Этапы развертывания

### 1. Подготовка окружения
```bash
# Клонирование репозитория
git clone https://github.com/normaldance/platform.git
cd platform

# Установка зависимостей
npm install

# Настройка переменных окружения
cp .env.example .env.local
```

### 2. Запуск через Docker
```bash
# Сборка и запуск всех сервисов
docker-compose -f docker-compose.cyberentics-minimal.yml up -d

# Проверка статуса сервисов
docker-compose ps

# Просмотр логов
docker-compose logs -f app
```

### 3. Инициализация базы данных
```bash
# Генерация Prisma клиента
npm run db:generate

# Применение миграций
npm run db:migrate

# Запуск Prisma Studio (опционально)
npm run db:studio
```

### 4. Проверка работоспособности
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api/health
- **Redis Commander**: http://localhost:8081
- **IPFS Gateway**: http://localhost:8080

---

## 📊 Мониторинг и метрики

### Ключевые метрики
- **Время отклика API** < 200ms
- **Доступность системы** > 99.9%
- **Пропускная способность** > 1000 RPS
- **Время загрузки треков** < 3s

### Инструменты мониторинга
- **Prometheus** - сбор метрик
- **Grafana** - визуализация
- **Alertmanager** - уведомления
- **Health checks** - проверка сервисов

---

## 🔒 Безопасность

### Меры защиты
- **JWT токены** для аутентификации
- **Rate limiting** для API
- **CORS** настройки
- **Валидация входных данных**
- **Шифрование паролей** (bcrypt)

### Блокчейн безопасность
- **Multi-signature** кошельки
- **Smart contract** аудит
- **Decentralized storage** (IPFS)
- **Immutable** записи транзакций

---

## 💰 Экономическая модель

### Токеномика NDT
- **Общий объем**: 1,000,000,000 NDT
- **Распределение**:
  - 40% - Награды пользователям
  - 25% - Команда и разработка
  - 20% - Маркетинг и партнерства
  - 15% - Резерв экосистемы

### Источники дохода
1. **Комиссии NFT** (2.5% с продаж)
2. **Premium подписки** ($9.99/месяц)
3. **Листинг сборы** ($50 за размещение)
4. **Стейкинг комиссии** (0.5% от наград)

---

## 📱 Демонстрация функций

### Основной интерфейс
```
┌─────────────────────────────────────────┐
│ 🎵 NORMAL DANCE                         │
├─────────────────────────────────────────┤
│ 🔍 [Поиск музыки...]        👤 Profile │
├─────────────────────────────────────────┤
│                                         │
│ 🎧 Сейчас играет:                       │
│ ▶️ Artist Name - Track Title            │
│ ████████████░░░░ 2:34 / 3:45           │
│                                         │
│ 🔥 Популярные треки:                    │
│ 1. Track 1 - Artist 1    💎 0.5 NDT    │
│ 2. Track 2 - Artist 2    🆓 Free       │
│ 3. Track 3 - Artist 3    💎 1.2 NDT    │
│                                         │
│ 🎨 NFT Marketplace:                     │
│ [NFT Card] [NFT Card] [NFT Card]        │
│                                         │
└─────────────────────────────────────────┘
```

### Кошелек интеграция
```typescript
// Подключение Phantom Wallet
const connectWallet = async () => {
  const { solana } = window;
  if (solana?.isPhantom) {
    const response = await solana.connect();
    setWallet(response.publicKey.toString());
  }
};

// Покупка NFT
const buyNFT = async (nftId: string, price: number) => {
  const transaction = new Transaction();
  // Добавление инструкций для перевода
  const signature = await sendTransaction(transaction);
  // Обновление базы данных
  await updateNFTOwnership(nftId, wallet);
};
```

---

## 🎯 Конкурентные преимущества

| Параметр | NORMAL DANCE | Spotify | SoundCloud |
|----------|--------------|---------|------------|
| **Комиссия** | 2.5% | 30% | 15-30% |
| **Время выплат** | Мгновенно | 30-90 дней | 45-60 дней |
| **Владение контентом** | Артист (NFT) | Платформа | Платформа |
| **Прозрачность** | 100% | Ограничена | Ограничена |
| **Децентрализация** | Да | Нет | Нет |
| **Web3 интеграция** | Полная | Нет | Частичная |

---

## 📈 Roadmap развития

### Q1 2024 ✅
- MVP платформы
- Базовый NFT функционал
- Phantom Wallet интеграция
- IPFS хранение

### Q2 2024 🔄
- Мобильное приложение (React Native)
- Расширенная аналитика
- Социальные функции
- Партнерства с артистами

### Q3 2024 📋
- DAO управление
- Кросс-чейн интеграция (Ethereum)
- AI рекомендации
- Глобальная экспансия

### Q4 2024 📋
- Виртуальные концерты (Metaverse)
- Продвинутые смарт-контракты
- Институциональные инвестиции
- IPO подготовка

---

## 💡 Инновации и технологии

### Уникальные решения
- **Дефляционная модель токена** - сжигание при каждой транзакции
- **Динамические роялти** - автоматическое распределение
- **Социальный стейкинг** - награды за активность
- **Децентрализованная модерация** - DAO голосование

### Технологические инновации
- **Layer 2 решения** для масштабирования
- **IPFS кластеризация** для надежности
- **WebRTC** для P2P стриминга
- **Machine Learning** для рекомендаций

---

## 🤝 Партнерская экосистема

### Текущие партнеры
- **Phantom Wallet** - Web3 интеграция
- **IPFS Protocol Labs** - децентрализованное хранение
- **Solana Foundation** - блокчейн инфраструктура

### Планируемые партнерства
- **Независимые лейблы** - контент-партнеры
- **Музыкальные фестивали** - эксклюзивные записи
- **Стриминговые сервисы** - кросс-платформенная интеграция
- **DeFi протоколы** - расширенные финансовые услуги

---

## 📞 Техническая поддержка

### Контакты команды
- **CTO**: tech@normaldance.io
- **DevOps**: devops@normaldance.io
- **Security**: security@normaldance.io
- **API Support**: api@normaldance.io

### Документация
- **API Docs**: https://docs.normaldance.io
- **GitHub**: https://github.com/normaldance
- **Discord**: https://discord.gg/normaldance
- **Technical Blog**: https://blog.normaldance.io

---

## 🎉 Заключение

### Ключевые выводы
- **Революционная платформа** для музыкальной индустрии
- **Передовые технологии** Web3 и блокчейн
- **Справедливая монетизация** для артистов
- **Масштабируемая архитектура** для глобального роста

### Следующие шаги
1. **Техническая интеграция** с вашими системами
2. **Пилотное тестирование** с избранными артистами
3. **Постепенное масштабирование** пользовательской базы
4. **Стратегическое партнерство** для роста экосистемы

---

**NORMAL DANCE** - Будущее музыки уже здесь! 🚀

*Техническая презентация подготовлена для разработчиков и технических специалистов*
*© 2024 NORMAL DANCE. Все права защищены.*