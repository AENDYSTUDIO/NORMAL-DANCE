# NormalDance Mobile

Мобильное приложение NormalDance - децентрализованная музыкальная платформа на базе Web3 технологий.

## 🎵 Описание

NormalDance Mobile - это кроссплатформенное мобильное приложение, которое позволяет:
- Слушать музыку в децентрализованной сети
- Загружать треки на IPFS/Filecoin
- Стейкинг токенов NDT
- Создавать и управлять плейлистами
- Получать NFT за музыку
- Зарабатывать на роялти

## 🚀 Технологии

- **React Native** - кроссплатформенная разработка
- **Expo** - платформа для мобильных приложений
- **TypeScript** - статическая типизация
- **React Navigation** - навигация
- **Zustand** - управление состоянием
- **Expo AV** - аудио плеер
- **React Native Track Player** - управление воспроизведением

## 📱 Функциональность

### Основные экраны
- **Home** - главная страница с популярными треками
- **Search** - поиск музыки
- **Upload** - загрузка треков
- **Profile** - профиль пользователя
- **Settings** - настройки приложения

### Ключевые возможности
- 🎵 Воспроизведение музыки
- 📤 Загрузка треков в IPFS
- 💰 Стейкинг токенов NDT
- 🎨 Создание NFT для музыки
- 📊 Статистика и аналитика
- 🔐 Кошелек Web3 (Phantom)
- 🎚️ Настройки качества звука

## 🛠️ Установка

### Предварительные требования
- Node.js 18+
- npm или yarn
- Expo CLI

### Шаги установки

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd mobile-app
```

2. Установите зависимости:
```bash
npm install
```

3. Установите Expo CLI:
```bash
npm install -g @expo/cli
```

4. Запустите приложение:
```bash
npm start
```

5. Для запуска на устройстве:
```bash
# Android
npm run android

# iOS
npm run ios
```

## 📁 Структура проекта

```
mobile-app/
├── src/
│   ├── components/     # Reusable components
│   ├── hooks/         # Custom hooks
│   ├── navigation/    # Navigation setup
│   ├── screens/       # Screen components
│   ├── services/      # API services
│   └── types/         # TypeScript types
├── assets/            # Images and assets
├── App.tsx           # Main app component
├── index.ts          # Entry point
├── package.json       # Dependencies
├── tsconfig.json     # TypeScript config
└── app.json          # Expo config
```

## 🔧 Конфигурация

### Environment Variables
Создайте файл `.env` в корне проекта:

```env
EXPO_PUBLIC_API_URL=https://api.normaldance.com
EXPO_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
EXPO_PUBLIC_SOLANA_NETWORK=devnet
```

### Настройка кошелька
Приложение поддерживает кошелек Phantom. Для настройки:
1. Установите Phantom на мобильном устройстве
2. Подключите кошелек в приложении
3. Авторизуйте транзакции

## 🧪 Тестирование

```bash
# Запуск тестов
npm test

# Тесты с покрытием
npm run test:coverage

# Линтинг
npm run lint

# Проверка типов
npm run type-check
```

## 📦 Сборка

```bash
# Сборка для Android
npm run build:android

# Сборка для iOS
npm run build:ios

# Сборка для Web
npm run build:web
```

## 🚀 Деплой

Для деплоя используйте Expo EAS:

```bash
# Настройка EAS
eas login

# Сборка и деплой
eas build --platform all
```

## 📄 Лицензия

MIT License

## 🤝 Вклад

Вклады приветствуются! Пожалуйста, создайте issue или pull request.

## 📞 Контакты

- Email: contact@normaldance.com
- Website: https://normaldance.com
- Twitter: @normaldance