module.exports = {
  root: true,
  extends: ['next/core-web-vitals'],
  overrides: [
    {
      files: ['**/components/wallet/**', '**/lib/web3/**', '**/lib/solana/**'],
      rules: {
        // Web3 специфичные ослабления
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        // Разрешаем console.log для отладки Web3 транзакций (но с предупреждением)
        'no-console': 'warn',
        // Не строгий return для wallet операций
        '@typescript-eslint/no-unsafe-return': 'off',
        // Разрешаем ! для wallet.connect() после проверки
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
    {
      files: ['**/mobile-app/**'],
      extends: ['@react-native-community'],
      rules: {
        // Строгие правила для mobile
        '@typescript-eslint/no-explicit-any': 'error',
        'no-console': 'error',
        'react-hooks/exhaustive-deps': 'warn',
      },
    },
    {
      files: ['**/tests/**', '**/__tests__/**'],
      rules: {
        // Либеральные правила для тестов
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off',
        '@typescript-eslint/no-empty-function': 'off',
      },
    },
  ],
  globals: {
    // Web3 глобалы
    phantom: 'readonly',
    solanaWeb3: 'readonly',
    tonconnect: 'readonly',
    // Telegram Mini App
    window: 'readonly',
    TelegramWebviewProxy: 'readonly',
  },
  rules: {
    // Базовые правила
    'prefer-const': 'error',
    'no-var': 'error',
    'no-duplicate-imports': 'error',
    // Web3 специфичные правила
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    // Security
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
  },
};
