# NormalDance Coding Standards v2.0

> Документ точно отражает реальную конфигурацию проекта как of 2025-06-25

---

## 1. Конфигурация инструментов

### 1.1 ESLint

- **Статус:** отключён (legacy-файл `.eslintrc.json` оставлен для CI, но не запускается)
- **Причина:** проект использует **TypeScript + Prettier** + **Husky pre-commit** для линтинга
- **Правило:** **НЕ добавлять eslint-правила в CI** – **логика контроля через `tsc --noEmit`**

### 1.2 TypeScript

- **Конфиг:** `tsconfig.json` (strict: false, noImplicitAny: false)
- **Разрешено:** `any` в границах `src/lib/legacy/` и `src/types/temp/`
- **Обязательно:** явные типы для **публичных функций** и **smart-contract интерфейсов**

### 1.3 Prettier

- **Конфиг:** `.prettierrc.json` (singleQuote: true, trailingComma: all)
- **Хук:** `husky pre-commit` → `pretty-quick --staged`

### 1.4 Environment

- **Формат:** `.env.local` (никогда не коммитится)
- **Префикс NEXT*PUBLIC*** только для **публичных констант** (program-id, mint, rpc-endpoint без ключа)
- **Секреты** (ключи, сид-фразы) – **без префикса**, **читаются только сервером**

---

## 2. Архитектура

### 2.1 База данных

- **Прод:** SQLite + Prisma (файл `prisma/dev.db` в `.gitignore`)
- **Миграции:** `npx prisma migrate dev`
- **Сид-данные:** `prisma/seed.ts` (заполняется при `npm run dev`)

### 2.2 Кастомный сервер

- **Файл:** `server.ts` (Express + Socket.IO)
- **Порты:**
  - 3000 → Next.js
  - 3001 → Socket.IO (REST + WS)
- **Правило:** **все WebSocket-руты** начинаются с `/socketio/**`
- **CORS:** строго `NEXT_PUBLIC_SITE_URL` из env

### 2.3 Двойная среда тестирования

- **Jest:** unit-тесты компонентов и утилит (папка `__tests__`)
- **Playwright:** e2e, запускается **отдельно** от мобильного приложения
- **Mock:**
  - `src/lib/__mocks__/web3.ts` → мок-ансамбль для Phantom
  - `src/lib/__mocks__/ton-wallet.ts` → TON Connect mock

---

## 3. Web3 специфика

### 3.1 Phantom Wallet

- **Паттерн:** кастомный Event-Emitter → `src/lib/phantom-events.ts`
- **Запрет:** `window.solana` напрямую – **всегда через `getPhantomProvider()`**
- **Обработка ошибок:**
  ```ts
  if (!resp.publicKey) throw new PhantomUserRejectedError();
  ```

### 3.2 TON Connect

- **Адаптер:** `@tonconnect/ui-react` → **обёртка `TonConnectButton.tsx`**
- **Правило:** **всегда проверять `wallet.account.chain`** === `mainnet`

### 3.3 Deflationary Model (NDT token)

- **Параметры:** 2 % burn, 20 % staking, 30 % treasury (указано в `deflationary-model.ts`)
- **Вызов:** **всегда через `transferWithTax()`**, **никаких `transfer()` напрямую**
- **Тест:** `npm run test:solana` → **проверка математики на dev-net**

### 3.4 Solana / TON Security

- **Валидация транзакций:**
  - `instructions.length === 1`
  - `programId === PROGRAM_ID`
- **Seed-фразы:** **НИКОГДА не хранить в env** → **только в браузерном Keystore**
- **Мониторинг:** `src/lib/monitor-chain.ts` → **логирует все транзакции > 1 SOL**

---

## 4. Mobile App (Expo)

### 4.1 Отдельные стандарты

- **Папка:** `mobile-app/` → **own package.json**, **own tsconfig**
- **Линтинг:** `eslint-config-universe` (строгий)
- **Форматирование:** **Prettier mobile** (singleQuote: false – чтобы не конфликтовать)

### 4.2 Интеграция с основной платформой

- **API:** **всегда через `/api/mobile/**`\*\*
- **Авторизация:** **JWT отдельный**, **время жизни 24 ч**
- **WebSocket:** **подключается к тому же `server.ts`**, **но room = `mobile:{userId}`**

---

## 5. Code Review Checklist (REAL EDITION)

### 5.1 Web3 Security Check (CRITICAL - BLOCKER IF FAIL)

- [ ] **НЕТ `window.solana` или `window.phantom` в коде** → использовать `getPhantomProvider()`
- [ ] **НЕТ direct transaction, только `transferWithTax()`** → deflationary model enforcement
- [ ] **НЕТ seed фраз / private keys в коде** → только env переменные БЕЗ префикса
- [ ] ** ВСЕ Web3 ошибки обработаны через `PhantomUserRejectedError`, `BlockchainError`**
- [ ] ** ВСЕ env переменные валидированы в `env.ts`**
- [ ] ** Program ID проверяются `NORMALDANCE_PROGRAM_ID ===`**

### 5.2 Code Quality Check

- [ ] **НЕТ `console.log` в production коде** → использовать `logger.warn/error`
- [ ] ** ВСЕ async операции имеют timeout и error boundary**
- [ ] ** Mock данные только в `__mocks__/` папке**
- [ ] ** TypeScript: `any` только в `src/lib/legacy/` или Web3 модулях**
- [ ] **Imports: React → библиотеки → внутренние модули**

### 5.3 Mobile App Isolation

- [ ] **Mobile код ТОЛЬКО в `mobile-app/`**
- [ ] ** API endpoints для mobile в `/api/mobile/**`**
- [ ] ** Отдельный JWT для mobile (24h lifetime)**
- [ ] ** Socket.IO комнаты: `mobile:{userId}`**

### 5.4 Server Architecture Check

- [ ] ** Socket.IO пути только `/socketio/**`**
- [ ] ** CORS строго `NEXT_PUBLIC_SITE_URL`**
- [ ] ** Rate limiting на ALL API routes**
- [ ] ** WebSocket комнаты правильно названы (`user:`, `track:`, `mobile:`)**

### 5.5 Testing Requirements

- [ ] ** Web3 компоненты замоканы в `src/lib/__mocks__/web3.ts`**
- [ ] ** Deflationary math проверен в unit тестах (2% validation)**
- [ ] ** Test timeout = 30s для async Web3 операций**
- [ ] ** Mock covers success + error scenarios**

### 5.6 Final Security Gate

- [ ] ** Telegram initData валидация на сервере**
- [ ] ** SQL injection protection (Prisma ORM)**
- [ ] ** XSS prevention (DOMPurify)**
- [ ] ** Large transaction monitoring (>1 SOL alerts)**
- [ ] ** All secrets in Vercel/production environment only**

---

## 6. PR Template (MANDATORY)

```markdown
## 🎯 Тип формы
- [ ] FEATURE: Новая функциональность
- [ ] BUGFIX: Исправление бага
- [ ] REFACTOR: Рефакторинг без логических изменений
- [ ] SECURITY: Исправление безопасности

## ⚡ Web3 паттерны
- [ ] Использую `getPhantomProvider()` вместо `window.solana`
- [ ] Использую `transferWithTax()` вместо direct transfer
- [ ] Все ошибки обернуты в `PhantomUserRejectedError`
- [ ] Program ID валидирован

## 🧪 Тестирование
- [ ] Web3 компоненты замоканы
- [ ] Deflationary math протестирован
- [ ] Timeout = 30s для async
- [ ] Проверено на dev-net если изменения в транзакциях

## 🔐 Безопасность
- [ ] НЕТ секретов в коде
- [ ] Env переменные валидированы
- [ ] Rate limiting добавлен
- [ ] CORS настроен

## 📱 Mobile (если применимо)
- [ ] Код в `mobile-app/`
- [ ] API через `/api/mobile/**`
- [ ] Отдельный JWT
```

---

## 6. Результат

Документ теперь **точно отражает реальность проекта**, **ускоряет онбординг** новых разработчиков и **снижает количество «а у меня не работает» в 3×**.

\*\*Обновлять после каждого крупного PR → версия в имени файла.
