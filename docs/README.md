# 📚 NormalDance Documentation

## 🎯 Активные стандарты

### ✅ Актуальные документы
- **[Coding Standards v2.0](./NORMALDANCE_Coding_Standards_v2.0.md)** - Основа основ, ОБЯЗАТЕЛЬНО для прочтения
- **[Architecture Patterns](./ARCHITECTURE_PATTERNS.md)** - Кастомный сервер и паттерны
- **[Web3 Protocol](./WEB3_PROTOCOL.md)** - Правила работы с блокчейном (КРИТИЧЕСКИ ВАЖНО)

## 🔄 v1.0 → v2.0 Что изменилось

| Раздел | v1.0 (Fantasy) | v2.0 (Reality) |
|--------|----------------|----------------|
| **База данных** | PostgreSQL (Neon) | SQLite + Prisma Singleton |
| **ESLint** | strict mode включен | Отключен, TypeScript + Prettier |
| **TypeScript** | `noImplicitAny: true` | `false`, `any` разрешен в Web3 |
| **Сервер** | Стандартный Next.js | Кастомный `server.ts` + Socket.IO |
| **Wallet** | Поддержка множества | **ТОЛЬКО Phantom** |
| **Тестирование** | 80% покрытие | **70% threshold** + двойная среда |
| **Мобильное** | Не упомянуто | **Отдельная Expo среда** |
| **Web3** | Не описан | **Нуллед протоколы + 2% burn** |

## 🚨 КРИТИЧЕСКИЕ ПРАВИЛА (BLOCKER ПРИ НАРУШЕНИИ)

### 1. Web3 Security
- **НЕТ** `window.solana` → использовать `getPhantomProvider()`
- **НЕТ** direct transfer → только `transferWithTax()` (2% burn)
- **НЕТ** seed фраз в коде → только env переменные
- **ВСЕ** ошибки обернуты в `PhantomUserRejectedError`

### 2. Code Quality
- **НЕТ** `console.log` → `logger.warn/error`
- **ВАЛИДИРОВАТЬ** все env переменные в `env.ts`
- **ИЗОЛИРОВАТЬ** mobile код в `mobile-app/`

### 3. Architecture
- **Socket.IO** только через `/socketio/**`
- **Rate limiting** на ALL API routes
- **CORS** строго `NEXT_PUBLIC_SITE_URL`

## 📋 Quick Onboarding Checklist

Для нового разработчика на проекте:

### 🎓 Чтение (порядок важен)
1. [ ] **Coding Standards v2.0** - база
2. [ ] **Web3 Protocol** - безопасность блокчейна
3. [ ] **Architecture Patterns** - кастомный сервер
4. [ ] `AGENTS.md` в корне - build/test команды

### ⚙️ Настройка среды
```bash
# Клонировать и установить
git clone <repo>
cd NORMALDANCE
npm install

# Проверить конфигурацию
npm run type-check  # TypeScript валидация
npm run lint        # Prettier formatting
npm run test        # Jest тесты (30s timeout)

# Запустить разработку
npm run dev         # Кастомный сервер с Socket.IO
```

### 🔐 Environment Setup
```bash
# Копировать шаблон
cp .env.example .env.local

# ОБЯЗАТЕЛЬНЫЕ переменные:
NEXT_PUBLIC_PROGRAM_ID=NDanCeXXXXXXXXXX
NEXT_PUBLIC_RPC_URL=https://api.mainnet-beta.solana.com
RPC_URL=https://api.mainnet-beta.solana.com  # для сервера
# НИКОГДА: NEXT_PUBLIC_PRIVATE_KEY
```

### 📱 Mobile App (если нужно)
```bash
cd mobile-app
npm install
npm run test        # отдельная среда тестирования
```

## 🐛 Common Pitfalls

### ❌ Частые ошибки
1. **Прямой доступ к `window.solana`** → 使用 `getPhantomProvider()`
2. **Console.log в.production** → Использовать `logger`
3. **Seed фраза в коде** → Только env (без префикса)
4. **Direct transaction** → Использовать `transferWithTax()`
5. **Mobile код в `src/`** → Только в `mobile-app/`

### ✅ Правильные паттерны
```typescript
// ✅ Phantom подключение
const provider = await getPhantomProvider();

// ✅ Трансфер с налогом
const result = await transferWithTax({ from, to, amount });

// ✅ Env валидация
const programId = env.NEXT_PUBLIC_PROGRAM_ID;

// ✅ Логирование
logger.warn('Wallet connection failed', { error });

// ✅ Mobile API
fetch('/api/mobile/auth', { method: 'POST' });
```

## 📞 Поддержка

- **Технические вопросы**: `#tech-support` в Slack
- **Code Review assistance**: `@senior-devs` mention
- **Security issues**: `@security-team` IMMEDIATE notification

---

**Помни: читать документацию = экономить 5 часов отладки!** 💪
