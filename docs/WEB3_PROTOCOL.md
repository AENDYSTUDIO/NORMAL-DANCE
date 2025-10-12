# Web3 Protocol NormalDance

## Обязательные паттерны для работы с блокчейном

### 🚨 КРИТИЧЕСКИЕ ПРАВИЛА
**Нарушение = немедленный блок в PR!**

---

## 1. Phantom Wallet - ЕДИНСТВЕННЫЙ ПАТТЕРН

### ❌ ЗАПРЕЩЕНО
```typescript
// НИКОГДА НЕ ПИСАТЬ ЭТО
const wallet = window.phantom?.solana;
const publicKey = wallet.publicKey;
```

### ✅ ОБЯЗАТЕЛЬНО
```typescript
import { getPhantomProvider } from '@/lib/phantom-events';

// ВСЕГДА ЧЕРЕЗ ЭТУ ФУНКЦИЮ
const provider = await getPhantomProvider();

// Проверка подключения
if (!provider.publicKey) {
  throw new PhantomNotConnectedError();
}
```

### Обработка ошибок
```typescript
try {
  const signature = await provider.signTransaction(transaction);
  return signature;
} catch (error) {
  // ВСЕГДА обрабатываем эти типы ошибок
  if (error.code === 4001) {
    throw new PhantomUserRejectedError();
  }
  throw new PhantomWalletError(error.message);
}
```

---

## 2. Deflationary Model - 2% BURN ОБЯЗАТЕЛЬНО

### ❌ ЗАПРЕЩЕНО
```typescript
// НИКОГДА не использовать direct transfer
const transfer = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: sender,
    toPubkey: recipient,
    lamports: amount
  })
);
```

### ✅ ОБЯЗАТЕЛЬНО
```typescript
import { transferWithTax } from '@/lib/deflationary-model';

// ВСЕГДА через эту функцию
const result = await transferWithTax({
  from: sender,
  to: recipient,
  amount,
  taxRate: 0.02 // 2% - константа!
});

// Результат содержит все поля
console.log({
  originalAmount: result.originalAmount,
  taxAmount: result.taxAmount,      // 2%
  finalAmount: result.finalAmount,   // 98%
  burnTransaction: result.burnTx,   // Отдельная транзакция
  mainTransaction: result.mainTx    // Основная транзакция
});
```

### Валидация математики
```typescript
// Всегда проверять в тестах
test('deflationary math validation', async () => {
  const amount = new BN(1000000); // 1 SOL
  
  const result = await transferWithTax({ amount });
  
  expect(result.taxAmount.toString()).toBe('20000');      // 2%
  expect(result.finalAmount.toString()).toBe('980000');  // 98%
  expect(result.originalAmount.toString()).toBe('1000000');
  
  // Проверка что taxAmount + finalAmount = originalAmount
  expect(
    result.taxAmount.add(result.finalAmount).toString()
  ).toBe(result.originalAmount.toString());
});
```

---

## 3. Anchor Programs - ФИКСИРОВАННЫЕ ID

### Program IDs (НОВЕРЯТЬ!)
```typescript
// solana-program/src/id.ts
export const NORMALDANCE_PROGRAM_ID = new PublicKey(
  'NDanCeXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
);

export const TOKEN_MINT_ID = new PublicKey(
  'NDTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
);

export const STAKING_PROGRAM_ID = new PublicKey(
  'StakeXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
);
```

### Вызов инструкций
```typescript
import { NormalDanceProgram } from '@project/anchor';

// ВСЕГДА проверять program ID
const program = new NormalDanceProgram(NORMALDANCE_PROGRAM_ID, provider);

// Валидация транзакции
if (transaction.instructions[0].programId.toString() !== NORMALDANCE_PROGRAM_ID.toString()) {
  throw new InvalidProgramIdError();
}
```

---

## 4. Security Protocol - КЛЮЧИ НЕ В КОДЕ

### ❌ ЗАПРЕЩЕНО
```typescript
// НИКОГДА!
const privateKey = '5K...'; // Seed фраза в коде
const rpcUrl = 'https://api.mainnet-beta.solana.com/?token=...'; // API ключ в коде
```

### ✅ ОБЯЗАТЕЛЬНО
```typescript
// Только через ENV (без префикса!)
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY; // NEVER IN FRONTEND!

// Для публичных констант - с префиксом
const PROGRAM_ID = process.env.NEXT_PUBLIC_PROGRAM_ID;
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;
```

### Валидация ключей
```typescript
// env.ts - обязательная валидация
export const env = {
  NEXT_PUBLIC_PROGRAM_ID: process.env.NEXT_PUBLIC_PROGRAM_ID || (() => {
    throw new Error('NEXT_PUBLIC_PROGRAM_ID required');
  })(),
  
  RPC_URL: process.env.RPC_URL || 'https://api.mainnet-beta.solana.com',
  
  PRIVATE_KEY: process.env.PRIVATE_KEY || (() => {
    if (typeof window !== 'undefined') {
      return undefined; // Never in browser
    }
    throw new Error('PRIVATE_KEY required for server');
  })(),
};
```

---

## 5. Транзакции - ВАЛИДАЦИЯ ОБЯЗАТЕЛЬНА

### Проверка перед отправкой
```typescript
import { validateTransaction } from '@/lib/transaction-validator';

// Всегда валидировать
const isValid = await validateTransaction(transaction);

if (!isValid) {
  throw new InvalidTransactionError();
}

// Логгирование для монитора
await logTransaction({
  type: 'TRANSFER_WITH_TAX',
  amount: result.taxAmount.toString(),
  sender: result.from.toString(),
  recipient: result.to.toString(),
  timestamp: Date.now()
});
```

### Мониторинг больших транзакций
```typescript
// Автоматический мониторинг >1 SOL
if (amount.gt(new BN(1000000000))) { // 1 SOL
  await sendSecurityAlert({
    type: 'LARGE_TRANSACTION',
    amount: amount.toString(),
    user: wallet.publicKey.toString()
  });
}
```

---

## 6. Mobile App - ОТДЕЛЬНЫЕ PATTERNS

### API Gateway паттерн
```typescript
// Только через мобильный API
app.use('/api/mobile/wallet', require('./api/mobile/wallet'));
app.use('/api/mobile/tracks', require('./api/mobile/tracks'));

// Мобильные клиенты в отдельных Socket.IO комнатах
socket.join(`mobile:${userId}`);
```

### TON Connect интеграция
```typescript
import { useTonWallet } from '@tonconnect/ui-react';

// TON отдельная логика от Solana
if (wallet?.account.chain === 'mainnet') {
  // Работаем с TON
} else {
  throw new TonWrongNetworkError();
}
```

---

## 🔥 QUICK CHEAT SHEET

```typescript
// 1. Подключение Phantom
const provider = await getPhantomProvider();
if (!provider.publicKey) throw new PhantomNotConnectedError();

// 2. Трансфер с налогом
const result = await transferWithTax({ from, to, amount });
// automatically: 2% burn + 98% transfer

// 3. Валидация транзакции
await validateTransaction(transaction);
await logTransaction({...});

// 4. Env переменные
const PROGRAM_ID = env.NEXT_PUBLIC_PROGRAM_ID;
const RPC_URL = env.RPC_URL;
```

---

**Строго следовать протоколу = безопасность WebView + доверие пользователей!** 🎯
