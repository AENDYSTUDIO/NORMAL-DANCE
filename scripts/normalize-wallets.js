#!/usr/bin/env node

/**
 * Скрипт нормализации wallet адресов в базе данных
 * Исправляет проблему с дублированием пользователей из-за разного регистра
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function normalizeWallets() {
  console.log('🔄 Начинаем нормализацию wallet адресов...')

  try {
    // Получаем всех пользователей с wallet адресами
    const usersWithWallets = await prisma.user.findMany({
      where: {
        wallet: {
          not: null
        }
      },
      select: {
        id: true,
        wallet: true,
        email: true,
        username: true
      }
    })

    console.log(`📊 Найдено ${usersWithWallets.length} пользователей с wallet адресами`)

    // Группируем по нормализованному wallet адресу
    const walletGroups = new Map()

    for (const user of usersWithWallets) {
      if (!user.wallet) continue

      // Нормализуем wallet адрес (приводим к нижнему регистру)
      const normalizedWallet = user.wallet.toLowerCase()

      if (!walletGroups.has(normalizedWallet)) {
        walletGroups.set(normalizedWallet, [])
      }

      walletGroups.get(normalizedWallet).push(user)
    }

    console.log(`📋 Найдено ${walletGroups.size} уникальных нормализованных адресов`)

    // Обрабатываем дубликаты
    let processedCount = 0
    let mergedCount = 0

    for (const [normalizedWallet, users] of walletGroups) {
      if (users.length <= 1) continue

      console.log(`\n🔍 Найден дубликат для адреса ${normalizedWallet}:`)
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email} (${user.username}) - ID: ${user.id}`)
      })

      // Оставляем первого пользователя, остальных удаляем
      const [keepUser, ...duplicateUsers] = users

      console.log(`✅ Оставляем пользователя: ${keepUser.email} (${keepUser.username})`)

      for (const duplicateUser of duplicateUsers) {
        console.log(`🗑️  Удаляем дубликат: ${duplicateUser.email} (${duplicateUser.username})`)

        // Удаляем дублирующегося пользователя
        await prisma.user.delete({
          where: { id: duplicateUser.id }
        })

        mergedCount++
      }

      processedCount++
    }

    // Обновляем все wallet адреса, приводя их к нижнему регистру
    console.log('\n🔄 Нормализуем регистр всех wallet адресов...')

    const updateResult = await prisma.user.updateMany({
      where: {
        wallet: {
          not: null
        }
      },
      data: {
        wallet: {
          // Приводим к нижнему регистру через SQL
          set: prisma.$queryRaw`LOWER(wallet)`
        }
      }
    })

    console.log(`✅ Нормализовано ${updateResult.count} wallet адресов`)

    console.log(`\n🎉 Нормализация завершена:`)
    console.log(`   - Обработано групп дубликатов: ${processedCount}`)
    console.log(`   - Удалено дублирующихся пользователей: ${mergedCount}`)
    console.log(`   - Нормализовано адресов: ${updateResult.count}`)

  } catch (error) {
    console.error('❌ Ошибка при нормализации:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Запускаем нормализацию
normalizeWallets()
  .then(() => {
    console.log('✅ Скрипт выполнен успешно')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Скрипт завершился с ошибкой:', error)
    process.exit(1)
  })
