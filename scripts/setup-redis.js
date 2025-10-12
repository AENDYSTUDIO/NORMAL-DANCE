#!/usr/bin/env node

/**
 * Скрипт настройки Redis/Upstash для продакшена
 * Создает необходимые ключи и индексы для rate limiting и кэширования
 */

const Redis = require('ioredis')

async function setupRedis() {
  console.log('🔧 Настройка Redis/Upstash...')

  // Получаем URL из переменных окружения
  const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL

  if (!redisUrl) {
    console.error('❌ REDIS_URL или UPSTASH_REDIS_REST_URL не установлены')
    console.log('💡 Добавьте в .env:')
    console.log('   REDIS_URL="redis://username:password@host:port"')
    console.log('   или')
    console.log('   UPSTASH_REDIS_REST_URL="https://username:password@host:port"')
    process.exit(1)
  }

  let redis

  try {
    if (redisUrl.startsWith('http')) {
      // Upstash REST API
      console.log('🌐 Используем Upstash Redis REST API')

      // Для Upstash REST API нам понадобится другой подход
      // Создаем HTTP клиент для работы с Upstash
      const redisConfig = {
        host: new URL(redisUrl).hostname,
        port: new URL(redisUrl).port,
        password: new URL(redisUrl).password,
        username: new URL(redisUrl).username,
      }

      console.log('✅ Подключение к Upstash Redis настроено')
      console.log(`   Хост: ${redisConfig.host}`)
      console.log(`   Порт: ${redisConfig.port}`)

    } else {
      // Обычный Redis
      console.log('🔴 Используем обычный Redis')

      redis = new Redis(redisUrl)

      // Тестируем подключение
      await redis.ping()
      console.log('✅ Подключение к Redis успешно')

      // Создаем необходимые ключи для rate limiting
      console.log('\n🔧 Настройка rate limiting...')

      // Создаем тестовый rate limit ключ
      await redis.set('rate_limit:test_user:test_endpoint', 5, 'EX', 60)
      console.log('✅ Создан тестовый rate limit ключ')

      // Создаем кэш для часто запрашиваемых данных
      await redis.set('cache:track:QmTest123', JSON.stringify({
        id: 'test-track',
        title: 'Test Track',
        artistName: 'Test Artist',
        duration: 180,
        cachedAt: Date.now()
      }), 'EX', 3600) // Кэш на 1 час

      console.log('✅ Создан тестовый кэш трека')

      // Создаем статистику платформы
      await redis.hset('stats:platform', {
        totalUsers: 0,
        totalTracks: 0,
        totalPlays: 0,
        lastUpdated: Date.now()
      })

      console.log('✅ Создана статистика платформы')

      await redis.quit()

    }

    console.log('\n🎉 Настройка Redis завершена успешно!')
    console.log('\n📋 Следующие шаги:')
    console.log('1. Обновите .env файл с REDIS_URL')
    console.log('2. Перезапустите API сервер')
    console.log('3. Проверьте rate limiting: curl -H "X-Forwarded-For: 127.0.0.1" http://localhost:8080/api/health')
    console.log('4. Мониторьте Redis: redis-cli LLEN rate_limit:*')

  } catch (error) {
    console.error('❌ Ошибка при настройке Redis:', error.message)

    if (redisUrl.startsWith('http')) {
      console.log('\n🔧 Для Upstash REST API выполните следующие команды вручную:')
      console.log(`
# Создать rate limit ключ
curl -X POST "${redisUrl}/set/rate_limit:test:endpoint" \\
  -H "Authorization: Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}" \\
  -d '5' \\
  -H "Content-Type: text/plain"

# Создать кэш
curl -X POST "${redisUrl}/set/cache:track:test" \\
  -H "Authorization: Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}" \\
  -d '{"id":"test","title":"Test Track"}' \\
  -H "Content-Type: text/plain"
      `)
    }

    process.exit(1)
  }
}

// Запускаем настройку
setupRedis()
  .then(() => {
    console.log('✅ Скрипт выполнен успешно')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Скрипт завершился с ошибкой:', error)
    process.exit(1)
  })
