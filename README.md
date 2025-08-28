# 🎵 NORMAL DANCE - Децентрализованная музыкальная платформа

Революционная децентрализованная музыкальная платформа, созданная для предоставления артистам полного контроля над их творчеством и монетизацией, а слушателям - доступа к уникальному музыкальному контенту.

## ✨ Основные возможности

### 🎯 Для артистов
- **Полный контроль** над своим творчеством и контентом
- **NFT токенизация** музыки и альбомов
- **Прямые продажи** без посредников
- **Стейкинг** токенов для пассивного дохода
- **Аналитика** прослушиваний и аудитории

### 🎵 Для слушателей
- **Высококачественный звук** с lossless форматами
- **Персональные рекомендации** на основе AI
- **Социальные функции** - подписки, плейлисты, чарты
- **Система наград** и достижений
- **Кроссплатформенность** - веб и мобильное приложение

### 🔐 Web3 интеграция
- **Кошелек Solana** для управления токенами
- **Децентрализованное хранение** на IPFS/Filecoin
- **Умные контракты** для автоматизации выплат
- **Виртуальная валюта** NDT для экосистемы

## 🛠️ Технологический стек

### 🎨 Фронтенд
- **Next.js 15** - React фреймворк для production
- **TypeScript 5** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS
- **shadcn/ui** - High-quality компоненты
- **Framer Motion** - Анимации и переходы

### 🗄️ Бэкенд
- **Node.js** - Runtime среда
- **Prisma** - Modern ORM
- **NextAuth.js** - Аутентификация
- **Socket.IO** - Real-time коммуникация
- **Express.js** - API сервер

### 💾 База данных
- **PostgreSQL** - Основная база данных
- **Redis** - Кеширование и сессии
- **SQLite** - Локальная разработка

### 🌐 Веб3
- **Solana** - Блокчейн платформа
- **Phantom Wallet** - Кошелек для пользователей
- **IPFS/Filecoin** - Децентрализованное хранение
- **Anchor** - Framework для Solana программ

### 📱 Мобильное приложение
- **React Native** - Кроссплатформенная разработка
- **Expo** - Development platform
- **React Navigation** - Навигация
- **React Native Track Player** - Аудио плеер

## 🚀 Быстрый старт

### Требования
- Node.js 18+
- npm или yarn
- Блокчейн кошелек (Phantom)

### Установка

1. **Клонируйте репозиторий**
```bash
git clone https://github.com/your-org/normaldance.git
cd normaldance
```

2. **Установите зависимости**
```bash
npm install
cd mobile-app && npm install
```

3. **Настройте переменные окружения**
```bash
cp .env.example .env.local
# Заполните необходимые переменные
```

4. **Настройте базу данных**
```bash
npm run db:migrate
npm run db:generate
```

5. **Запустите разработку**
```bash
# Веб приложение
npm run dev

# Мобильное приложение (в отдельном терминале)
cd mobile-app && npm start
```

6. **Откройте приложение**
- Веб: [http://localhost:3000](http://localhost:3000)
- Мобильное: Запустите через Expo Go

## 🧪 Тестирование

Проект включает comprehensive тестовую suite:

```bash
# Запуск всех тестов
npm test

# Unit тесты
npm run test:unit

# Интеграционные тесты
npm run test:integration

# E2E тесты
npm run test:e2e

# Мобильные тесты
cd mobile-app && npm test

# Тесты производительности
npm run test:performance
```

## 📁 Структура проекта

```
normaldance/
├── src/                    # Веб приложение
│   ├── app/               # Next.js App Router
│   ├── components/        # React компоненты
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Утилиты и конфигурация
│   └── store/             # State management
├── mobile-app/            # Мобильное приложение
│   ├── src/               # React Native компоненты
│   └── services/          # Мобильные сервисы
├── programs/              # Solana программы
│   ├── ndt/               # NDT токен
│   ├── tracknft/          # Track NFT
│   └── staking/           # Стейкинг
├── prisma/                # Схема базы данных
├── docs/                  # Документация
└── .github/               # GitHub Actions
```

## 🚀 Деплой

### Ручной деплой
```bash
# Сборка для production
npm run build

# Запуск production сервера
npm start
```

### Автоматический деплой
Проект настроен на автоматический деплой через GitHub Actions:
- **Staging**: Автоматический деплой на ветке `develop`
- **Production**: Ручной деплой на ветке `main`

## 📚 Документация

### Для разработчиков
- [API документация](docs/api.md)
- [Руководство по тестированию](docs/testing.md)
- [Руководство по деплою](docs/deployment.md)
- [Руководство по Web3 интеграции](docs/web3.md)

### Для пользователей
- [Руководство пользователя](docs/user-guide.md)
- [FAQ](docs/faq.md)
- [Туториалы для артистов](docs/artist-tutorials.md)

## 🎯 Конtributing

Мы приветствуем contributions! Пожалуйста, ознакомьтесь с [CONTRIBUTING.md](CONTRIBUTING.md) для получения информации о том, как внести свой вклад.

### Процесс
1. Fork репозитория
2. Создайте ветку (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в ветку (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🤝 Сообщество

- **Discord**: [Присоединяйтесь к нашему Discord](https://discord.gg/normaldance)
- **Twitter**: [@normaldance](https://twitter.com/normaldance)
- **Telegram**: [@normaldance](https://t.me/normaldance)

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 🙏 Благодарности

- [Solana Foundation](https://solana.com) за поддержку Web3 проектов
- [Phantom](https://phantom.app) за отличный кошелек
- [IPFS](https://ipfs.tech) за децентрализованное хранение
- Весь open source сообщество

---

**Built with ❤️ by the NormalDance team**

🎵 *Music should be free, artists should be paid.*
