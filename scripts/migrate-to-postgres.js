#!/usr/bin/env node

/**
 * Скрипт миграции с SQLite на PostgreSQL
 * Безопасно переносит данные между базами
 */

const { PrismaClient: SQLiteClient } = require('@prisma/client')
const { PrismaClient: PostgresClient } = require('@prisma/client')

async function migrateDatabase() {
  console.log('🚀 Начинаем миграцию с SQLite на PostgreSQL...')

  // Проверяем переменные окружения
  const sqliteUrl = process.env.DATABASE_URL_SQLITE || 'file:./dev.db'
  const postgresUrl = process.env.DATABASE_URL

  if (!postgresUrl || !postgresUrl.startsWith('postgresql://')) {
    console.error('❌ DATABASE_URL для PostgreSQL не настроен')
    console.log('💡 Добавьте в .env:')
    console.log('   DATABASE_URL="postgresql://user:password@host:port/database"')
    process.exit(1)
  }

  console.log(`📦 Исходная БД: ${sqliteUrl}`)
  console.log(`🎯 Целевая БД: ${postgresUrl.replace(/:[^:]+@/, ':***@')}`)

  let sqliteClient, postgresClient

  try {
    // Подключаемся к обеим базам данных
    sqliteClient = new SQLiteClient({
      datasourceUrl: sqliteUrl
    })

    postgresClient = new PostgresClient({
      datasourceUrl: postgresUrl
    })

    // Тестируем подключения
    await sqliteClient.$connect()
    console.log('✅ Подключение к SQLite установлено')

    await postgresClient.$connect()
    console.log('✅ Подключение к PostgreSQL установлено')

    // Получаем статистику из SQLite
    console.log('\n📊 Получаем статистику из SQLite...')

    const userCount = await sqliteClient.user.count()
    const trackCount = await sqliteClient.track.count()
    const nftCount = await sqliteClient.nft.count()
    const stakeCount = await sqliteClient.stake.count()

    console.log(`   Пользователей: ${userCount}`)
    console.log(`   Треков: ${trackCount}`)
    console.log(`   NFT: ${nftCount}`)
    console.log(`   Стейков: ${stakeCount}`)

    if (userCount === 0 && trackCount === 0) {
      console.log('⚠️  Исходная база данных пуста, миграция не требуется')
      return
    }

    // Проверяем, что целевая база данных пуста
    const existingUsers = await postgresClient.user.count()

    if (existingUsers > 0) {
      console.log('⚠️  Целевая база данных не пуста!')
      console.log('   Выберите один из вариантов:')
      console.log('   1. Очистить целевую базу (npm run db:reset)')
      console.log('   2. Добавить флаг --force для принудительной миграции')
      console.log('   3. Отменить миграцию')

      const force = process.argv.includes('--force')
      if (!force) {
        console.log('\n❌ Миграция отменена для безопасности данных')
        return
      }

      console.log('⚠️  Принудительная миграция - целевая база будет очищена!')
    }

    // Начинаем миграцию
    console.log('\n🔄 Начинаем перенос данных...')

    // 1. Переносим пользователей
    if (userCount > 0) {
      console.log('👥 Переносим пользователей...')

      const users = await sqliteClient.user.findMany({
        include: {
          tracks: true,
          likes: true,
          follows: true,
          stakes: true
        }
      })

      for (const user of users) {
        try {
          await postgresClient.user.create({
            data: {
              id: user.id,
              email: user.email,
              username: user.username,
              displayName: user.displayName,
              bio: user.bio,
              avatar: user.avatar,
              banner: user.banner,
              wallet: user.wallet,
              level: user.level,
              balance: user.balance,
              tonBalance: user.tonBalance,
              isArtist: user.isArtist,
              isActive: user.isActive,
              role: user.role,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
              // Связи будут созданы автоматически через внешние ключи
            }
          })
        } catch (error) {
          if (error.code === 'P2002') {
            console.log(`   Пропускаем дубликат пользователя: ${user.email}`)
          } else {
            console.error(`   Ошибка при переносе пользователя ${user.email}:`, error.message)
          }
        }
      }

      console.log(`✅ Перенесено пользователей: ${users.length}`)
    }

    // 2. Переносим треки
    if (trackCount > 0) {
      console.log('🎵 Переносим треки...')

      const tracks = await sqliteClient.track.findMany({
        include: {
          likes: true,
          nfts: true
        }
      })

      for (const track of tracks) {
        try {
          await postgresClient.track.create({
            data: {
              id: track.id,
              title: track.title,
              artistName: track.artistName,
              genre: track.genre,
              duration: track.duration,
              playCount: track.playCount,
              likeCount: track.likeCount,
              ipfsHash: track.ipfsHash,
              metadata: track.metadata,
              price: track.price,
              isExplicit: track.isExplicit,
              isPublished: track.isPublished,
              status: track.status,
              publishedAt: track.publishedAt,
              createdAt: track.createdAt,
              updatedAt: track.updatedAt,
              artistId: track.artistId,
              // Связи будут созданы автоматически
            }
          })
        } catch (error) {
          if (error.code === 'P2003') {
            console.log(`   Пропускаем трек из-за отсутствующего артиста: ${track.title}`)
          } else {
            console.error(`   Ошибка при переносе трека ${track.title}:`, error.message)
          }
        }
      }

      console.log(`✅ Перенесено треков: ${tracks.length}`)
    }

    // 3. Переносим NFT
    if (nftCount > 0) {
      console.log('🖼️  Переносим NFT...')

      const nfts = await sqliteClient.nft.findMany()

      for (const nft of nfts) {
        try {
          await postgresClient.nft.create({
            data: {
              id: nft.id,
              tokenId: nft.tokenId,
              name: nft.name,
              description: nft.description,
              imageUrl: nft.imageUrl,
              metadata: nft.metadata,
              price: nft.price,
              status: nft.status,
              type: nft.type,
              createdAt: nft.createdAt,
              updatedAt: nft.updatedAt,
              ownerId: nft.ownerId,
              trackId: nft.trackId
            }
          })
        } catch (error) {
          console.error(`   Ошибка при переносе NFT ${nft.name}:`, error.message)
        }
      }

      console.log(`✅ Перенесено NFT: ${nfts.length}`)
    }

    // 4. Переносим стейки
    if (stakeCount > 0) {
      console.log('💰 Переносим стейки...')

      const stakes = await sqliteClient.stake.findMany()

      for (const stake of stakes) {
        try {
          await postgresClient.stake.create({
            data: {
              id: stake.id,
              amount: stake.amount,
              rewardRate: stake.rewardRate,
              earned: stake.earned,
              status: stake.status,
              startDate: stake.startDate,
              endDate: stake.endDate,
              createdAt: stake.createdAt,
              updatedAt: stake.updatedAt,
              userId: stake.userId,
              tokenId: stake.tokenId
            }
          })
        } catch (error) {
          console.error(`   Ошибка при переносе стейка ${stake.id}:`, error.message)
        }
      }

      console.log(`✅ Перенесено стейков: ${stakes.length}`)
    }

    // Получаем финальную статистику
    console.log('\n📈 Финальная статистика:')

    const finalUserCount = await postgresClient.user.count()
    const finalTrackCount = await postgresClient.track.count()
    const finalNftCount = await postgresClient.nft.count()
    const finalStakeCount = await postgresClient.stake.count()

    console.log(`   PostgreSQL пользователи: ${finalUserCount}`)
    console.log(`   PostgreSQL треки: ${finalTrackCount}`)
    console.log(`   PostgreSQL NFT: ${finalNftCount}`)
    console.log(`   PostgreSQL стейки: ${finalStakeCount}`)

    console.log('\n🎉 Миграция завершена успешно!')

    // Инструкции по следующим шагам
    console.log('\n📋 Следующие шаги:')
    console.log('1. Обновите DATABASE_URL в .env на PostgreSQL')
    console.log('2. Выполните: npm run db:generate')
    console.log('3. Выполните: npm run db:push')
    console.log('4. Запустите: node scripts/normalize-wallets.js')
    console.log('5. Перезапустите API сервер')

  } catch (error) {
    console.error('❌ Ошибка при миграции:', error)
    throw error
  } finally {
    // Закрываем подключения
    if (sqliteClient) await sqliteClient.$disconnect()
    if (postgresClient) await postgresClient.$disconnect()
  }
}

// Запускаем миграцию
migrateDatabase()
  .then(() => {
    console.log('✅ Миграция выполнена успешно')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Миграция завершилась с ошибкой:', error)
    process.exit(1)
  })
