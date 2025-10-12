# Стандарты кодирования NormalDance

**Версия 1.0**  
**Дата: Декабрь 2025**

---

## 1. Введение

Данный документ содержит стандарты кодирования для команды разработки NormalDance. Цель документа - обеспечение 一致 ности кода, ускорение code review и повышение качества программного обеспечения.

Стандарты внедряются поэтапно после согласования с вице-президентом по разработке. Документ будет регулярно обновляться на основе обратной связи от команды.

## 2. Общие принципы кодирования

- **Читаемость кода превыше оптимизации производительности**
- **DRY (Don't Repeat Yourself)** - избегайте дублирования кода
- **KISS (Keep It Simple, Stupid)** - простота превыше сложности
- **Явное лучше неявного** (вдохновлено Python)
- **Код должен быть самодокументируемым**
- **Безопасность и надежность превыше скорости разработки**

## 3. Технологический стек и конфигурации

### 3.1 Основные технологии

- **Frontend**: React 18, Next.js 15, TypeScript 5
- **Backend**: Node.js, TypeScript с кастомным сервером Socket.IO
- **Database**: SQLite (production), Prisma ORM с глобальным инстансом
- **Testing**: Jest (multi-project конфигурация), React Testing Library, Playwright
- **Styling**: Tailwind CSS 4x
- **Deployment**: Vercel, Docker, Kubernetes
- **Web3**: Solana blockchain, Phantom wallet, Anchor программы
- **IPFS**: Filecoin redundancy с множественными gateway репликами
- **MCP**: Model Context Protocol сервер встроен

### 3.2 Конфигурации линтеров и форматтеров

- **ESLint**: next/core-web-vitals базовая конфигурация (некоторые правила отключены для Web3)
- **TypeScript**: `noImplicitAny: true`, но с ослабленными правилами для Web3 компонент
- **Таймауты тестов**: 30 секунд для async операций (Web3 транзакции)
- **Coverage**: 70% порог глобально, исключая API и тестовые директории

### 3.3 Специфичные архитектурные паттерны

- **Сервер**: Кастомный `server.ts` с Socket.IO интеграцией, путь `/api/socketio`
- **Wallet**: Только Phantom wallet с кастомной системой событий
- **Deflationary модель**: 2% burn на всех транзакциях
- **База данных**: Синглтон паттерн для Prisma клиента
- **Мобильное приложение**: Отдельная Expo среда с собственными тестами

## 4. Стилистические стандарты

### 4.1 Именование

- Переменные и функции: `camelCase`
- Компоненты и классы: `PascalCase`
- Константы: `UPPER_SNAKE_CASE`
- Файлы: `kebab-case.tsx`
- Папки: `kebab-case`

### 4.2 Импорты

- React импорты отдельно от остальных
- Группировка: React, сторонние библиотеки, внутренние модули
- Абсолютные импорты через `@/` для `src/`

### 4.3 Компоненты React

- Функциональные компоненты с хуками
- Деструктуризация пропсов
- Ранний return для условного рендеринга

## 5. Тестирование

### 5.1 Обязательные тесты

- **Unit тесты** для утилит и хуков (Jest)
- **Component тесты** для UI компонентов (React Testing Library)
- **Integration тесты** для API endpoints
- **E2E тесты** для критических пользовательских сценариев (Playwright)

### 5.2 Требования к покрытию

- Минимум 80% покрытие для новых компонентов
- 100% покрытие для бизнес-логики
- Критические пути: 100% покрытие

### 5.3 Соглашения по именованию

- Тестовые файлы: `*.test.ts`, `*.test.tsx`
- Describe блоки: описание компонента/функции
- It блоки: конкретное поведение

## 6. Документация

### 6.1 JSDoc комментарии

- Обязательны для публичных API функций
- Сложные бизнес-логика функции
- Пропсы компонентов с неочевидным назначением

### 6.2 README файлы

- Обязательны для новых модулей/пакетов
- Описание API, примеры использования
- Инструкции по настройке и запуску

### 6.3 Storybook

- Обязателен для переиспользуемых UI компонентов
- Документация пропсов и вариантов использования

## 7. Git Workflow

### 7.1 Branch naming

- `feature/description-kebab-case`
- `bugfix/issue-description`
- `hotfix/critical-fix`
- `refactor/component-improvement`

### 7.2 Pull Request titles

- `[FEATURE] Добавление новой функциональности`
- `[BUGFIX] Исправление ошибки в компоненте`
- `[REFACTOR] Улучшение структуры кода`
- `[DOCS] Обновление документации`

### 7.3 Commit messages

```
type(scope): description

[optional body]
```

**Types**: feat, fix, docs, style, refactor, test, chore

## 8. Code Review

### 8.1 Автоматизированные проверки

- **ESLint ошибки**: blocking
- **TypeScript ошибки**: blocking
- **Тесты**: blocking при падении
- **Prettier**: auto-fix

### 8.2 Ручной review

- Логика и алгоритмы
- Безопасность (SQL injection, XSS)
- Производительность
- Читабельность и поддерживаемость

### 8.3 Процесс

- Максимум 2-3 ревьювера
- Обязательный approval от code owner
- Разрешение конфликтов через обсуждение

## 9. Безопасность

### 9.1 Валидация данных

- Все пользовательские входные данные
- SQL параметры через Prisma
- API responses sanitization

### 9.2 Аутентификация и авторизация

- JWT tokens с expiration
- Role-based access control
- Secure headers (helmet.js)

### 9.3 Мониторинг

- Rate limiting на API endpoints
- Error logging и alerting
- Security audit logs

## 10. Производительность

### 10.1 Frontend

- Bundle size < 500KB (gzip)
- First Contentful Paint < 2s
- Lighthouse score > 90

### 10.2 Backend

- API response time < 500ms
- Database queries optimization
- Memory leaks prevention

### 10.3 Мониторинг

- Web Vitals tracking
- Performance budgets
- Automated alerts

---

## Приложения

### Приложение A: Примеры кода

#### Хороший пример компонента React:

```tsx
interface UserCardProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
  onEdit: (userId: string) => void;
}

export function UserCard({ user, onEdit }: UserCardProps) {
  if (!user) return null;

  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <button onClick={() => onEdit(user.id)}>Редактировать</button>
    </div>
  );
}
```

#### Плохой пример (нарушение принципов):

```tsx
// ❌ Нарушение: неявные типы, длинная функция, отсутствие JSDoc
function usercard(props) {
  // Много логики в одном компоненте
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ... 50+ строк кода
}
```

### Приложение B: Чек-лист Code Review

- [ ] Код соответствует ESLint правилам
- [ ] TypeScript ошибки отсутствуют
- [ ] Тесты написаны и проходят
- [ ] Документация обновлена
- [ ] Безопасность проверена
- [ ] Производительность оптимизирована
- [ ] Код читаем и поддерживаем

---

_Этот документ является живым и будет обновляться на основе опыта команды. Предложения по улучшению приветствуются через Pull Request._
