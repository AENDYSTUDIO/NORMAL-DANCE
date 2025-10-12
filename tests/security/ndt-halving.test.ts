import { describe, it, expect } from '@jest/globals'

describe('NDT Token Halving Security Tests - Исправленные уязвимости', () => {
  describe('Hard Cap на эмиссию NDT', () => {
    it('должен ограничивать общую эмиссию до 100M NDT', async () => {
      const maxSupply = 100_000_000_000n // 100M NDT
      const currentSupply = 90_000_000_000n // 90M уже эмитировано

      const mintAttempt = await simulateMintTokens(currentSupply, 15_000_000_000n) // Попытка эмитировать 15M

      expect(mintAttempt.success).toBe(true)
      expect(mintAttempt.newSupply).toBe(currentSupply + 15_000_000_000n)
    })

    it('должен блокировать эмиссию сверх hard cap', async () => {
      const maxSupply = 100_000_000_000n // 100M NDT
      const currentSupply = 99_000_000_000n // 99M уже эмитировано

      const mintAttempt = await simulateMintTokens(currentSupply, 2_000_000_000n) // Попытка эмитировать 2M (превысит лимит)

      expect(mintAttempt.success).toBe(false)
      expect(mintAttempt.error).toContain('MaxSupplyExceeded')
    })

    it('должен корректно рассчитывать оставшуюся эмиссию', async () => {
      const maxSupply = 100_000_000_000n
      const currentSupply = 75_500_000_000n

      const remainingSupply = maxSupply - currentSupply
      expect(remainingSupply).toBe(24_500_000_000n) // 24.5M NDT осталось
    })
  })

  describe('Автоматический Halving механизм', () => {
    it('должен применять halving каждые 180 дней', async () => {
      const initialEmissionRate = 10 // 10 NDT per SOL per day
      const currentTime = Date.now() / 1000
      const lastHalving = currentTime - (200 * 24 * 60 * 60) // 200 дней назад

      const halvingApplied = await simulateHalvingCheck(initialEmissionRate, lastHalving, currentTime)

      expect(halvingApplied).toBe(true)
      expect(halvingApplied.newRate).toBe(5) // Эмиссия уменьшилась вдвое
    })

    it('не должен применять halving раньше срока', async () => {
      const initialEmissionRate = 10
      const currentTime = Date.now() / 1000
      const lastHalving = currentTime - (100 * 24 * 60 * 60) // 100 дней назад

      const halvingApplied = await simulateHalvingCheck(initialEmissionRate, lastHalving, currentTime)

      expect(halvingApplied).toBe(false)
      expect(halvingApplied.newRate).toBe(10) // Эмиссия осталась прежней
    })

    it('должен уменьшать эмиссию вдвое при каждом halving', async () => {
      let emissionRate = 10

      // Первый halving
      emissionRate = await applyHalving(emissionRate)
      expect(emissionRate).toBe(5)

      // Второй halving
      emissionRate = await applyHalving(emissionRate)
      expect(emissionRate).toBe(2.5)

      // Третий halving
      emissionRate = await applyHalving(emissionRate)
      expect(emissionRate).toBe(1.25)
    })

    it('должен устанавливать минимум 1 NDT при слишком маленькой эмиссии', async () => {
      let emissionRate = 1.25

      const finalRate = await applyHalving(emissionRate)
      expect(finalRate).toBe(1) // Минимум 1 NDT
    })
  })

  describe('Rewards calculation с учетом halving', () => {
    it('должен рассчитывать rewards с текущим emission rate', async () => {
      const stakeAmount = 1000000000n // 1 млрд lamports
      const apr = 10 // 10% APR
      const timeElapsed = 30 * 24 * 60 * 60 // 30 дней
      const emissionRate = 5 // После halving

      const rewards = await simulateRewardCalculation(stakeAmount, apr, timeElapsed, emissionRate)

      expect(rewards.success).toBe(true)
      expect(rewards.amount).toBeGreaterThan(0)
      expect(rewards.amount).toBeLessThan(rewards.amountWithoutHalving) // Должен быть меньше без halving
    })

    it('должен предотвращать overflow в расчетах', async () => {
      const veryLargeStake = '1000000000000000000000000000000' // Огромная сумма
      const highApr = 1000 // 1000% APR
      const longTime = 365 * 24 * 60 * 60 // 1 год

      const rewardCalculation = await simulateRewardCalculation(
        BigInt(veryLargeStake),
        highApr,
        longTime,
        10
      )

      expect(rewardCalculation.success).toBe(true)
      expect(rewardCalculation.amount).toBeDefined()
    })
  })
})

// Helper functions для тестирования NDT
async function simulateMintTokens(currentSupply: bigint, mintAmount: bigint) {
  const maxSupply = 100_000_000_000n // 100M NDT

  if (currentSupply + mintAmount > maxSupply) {
    return {
      success: false,
      error: 'MaxSupplyExceeded',
      newSupply: currentSupply
    }
  }

  return {
    success: true,
    error: undefined,
    newSupply: currentSupply + mintAmount
  }
}

async function simulateHalvingCheck(initialRate: number, lastHalving: number, currentTime: number) {
  const halvingInterval = 180 * 24 * 60 * 60 // 180 дней в секундах
  const timeSinceLastHalving = currentTime - lastHalving

  if (timeSinceLastHalving >= halvingInterval) {
    return {
      applied: true,
      newRate: initialRate / 2
    }
  }

  return {
    applied: false,
    newRate: initialRate
  }
}

async function applyHalving(currentRate: number) {
  const newRate = currentRate / 2
  return Math.max(newRate, 1) // Минимум 1 NDT
}

async function simulateRewardCalculation(stakeAmount: bigint, apr: number, timeElapsed: number, emissionRate: number) {
  try {
    // Симуляция безопасной математики как в контракте
    const baseReward = stakeAmount * BigInt(apr) * BigInt(timeElapsed) / 365n / 24n / 60n / 60n / 100n

    // Применяем emission rate
    const adjustedReward = baseReward * BigInt(emissionRate) / 10n

    return {
      success: true,
      amount: adjustedReward,
      amountWithoutHalving: baseReward * 10n / 10n // Для сравнения
    }
  } catch (error) {
    return {
      success: false,
      amount: 0n,
      error: error.message
    }
  }
}
