# Архитектурные паттерны NormalDance

## Кастомный сервер (server.ts)

### 1. Структура портов
```typescript
// 3000 - Next.js (HTTP)
// 3001 - Socket.IO (WebSocket + REST API)
const HTTP_PORT = 3000;
const WS_PORT = 3001;
```

### 2. Socket.IO паттерны
```typescript
// ❌ BAD: прямое использование window.solana
const wallet = window.solana;

// ✅ GOOD: через phantom-events
import { getPhantomProvider } from '@/lib/phantom-events';
const wallet = await getPhantomProvider();
```

### 3. WebSocket комнаты
```typescript
// Паттерн именования комнат
socket.join(`user:${userId}`);        // юзер-специфичные
socket.join('track:play');           // общие для треков
socket.join('mobile:${userId}');     // мобильные клиенты
```

### 4. API Routes правила
```typescript
// Все API routes должны начинаться с /api/
// WebSocket события без префикса /api/
app.use('/api/transaction', transactionRoutes);
io.on('connection', (socket) => {
  socket.on('transaction', handler);
});
```

## Deflationary Model


### 1. Только через transferWithTax()
```typescript
// ❌ BAD: прямой вызов transfer
await connection.sendTransaction(transferTx);

// ✅ GOOD: через налоговую систему
const result = await transferWithTax({
  from: sender,
  to: recipient,
  amount,
  tax: 0.02 // 2%
});
```

### 2. Burn значения
- **Always burn:** 2% от любой транзакции
- **Distribution:** 20% staking, 30% treasury, 50% burn
- **Validation:** Все burn операции логируются через `deflationary-monitor.ts`

## Phantom Wallet паттерны

### 1. Event-emitter система
```typescript
import { PhantomEmitter } from '@/lib/phantom-events';

PhantomEmitter.on('connected', (publicKey) => {
  // Update UI
});

PhantomEmitter.on('disconnected', () => {
  // Clear state
});
```

### 2. Обработка ошибок
```typescript
import { PhantomError, PhantomUserRejectedError } from '@/lib/phantom-errors';

try {
  const transaction = await signTransaction(tx);
} catch (error) {
  if (error instanceof PhantomUserRejectedError) {
    // Пользователь отклонил
  } else if (error instanceof PhantomError) {
    // Web3 ошибка
  }
}
```

## Тестирование паттернов

### 1. Мокирование Web3
```typescript
// src/lib/__mocks__/web3.ts
export const mockPhantomProvider = {
  publicKey: new PublicKey('11111111111111111111111111111112'),
  signTransaction: jest.fn(),
  connect: jest.fn(),
};

jest.mock('@/lib/phantom-events', () => ({
  getPhantomProvider: () => mockPhantomProvider,
}));
```

### 2. Тестирование deflationary логики
```typescript
test('2% burn applied correctly', async () => {
  const amount = new BN(1000000); // 1 SOL in lamports
  const result = await transferWithTax({ amount });
  
  expect(result.burnAmount.toString()).toBe('20000'); // 2%
  expect(result.finalAmount.toString()).toBe('980000'); // 98%
});
```

## Mobile Integration

### 1. API Gateway
```typescript
// Только через /api/mobile/**
app.use('/api/mobile/auth', require('./api/mobile/auth'));
app.use('/api/mobile/tracks', require('./api/mobile/tracks'));
```

### 2. Auth паттерн
```typescript
// Отдельный JWT для mobile
const mobileToken = jwt.sign(
  { userId, type: 'mobile' }, 
  process.env.JWT_MOBILE_SECRET,
  { expiresIn: '24h' }
);
```
