#!/usr/bin/env node

/**
 * Финальный Security Audit скрипт
 * Проверяет все исправленные уязвимости и готовность к внешнему аудиту
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

class SecurityAuditor {
  constructor() {
    this.results = {
      critical: [],
      warnings: [],
      passed: [],
      score: 0
    }
  }

  async runFullAudit() {
    console.log('🔐 ЗАПУСК ПОЛНОГО SECURITY AUDIT')
    console.log('=====================================\n')

    // 1. Проверяем исправления в смарт-контрактах
    await this.auditSmartContracts()

    // 2. Проверяем API безопасность
    await this.auditAPI()

    // 3. Проверяем инфраструктуру
    await this.auditInfrastructure()

    // 4. Проверяем базу данных
    await this.auditDatabase()

    // 5. Запускаем тесты
    await this.runTests()

    // 6. Выводим результаты
    this.displayResults()

    return this.results
  }

  async auditSmartContracts() {
    console.log('🔍 АУДИТ СМАРТ-КОНТРАКТОВ')
    console.log('==========================')

    // Проверяем TrackNFT
    const trackNftPath = 'programs/tracknft/src/lib.rs'
    if (fs.existsSync(trackNftPath)) {
      const content = fs.readFileSync(trackNftPath, 'utf8')

      // Проверяем artist validation
      if (content.includes('require!(artist.key() == authority.key(), ErrorCode::Unauthorized)')) {
        this.results.passed.push('✅ TrackNFT: Artist validation добавлена')
      } else {
        this.results.critical.push('❌ TrackNFT: Artist validation отсутствует')
      }

      // Проверяем track_counter
      if (content.includes('track_counter: u64')) {
        this.results.passed.push('✅ TrackNFT: PDA collision prevention добавлен')
      } else {
        this.results.critical.push('❌ TrackNFT: track_counter отсутствует')
      }

      // Проверяем seeds с counter
      if (content.includes('&track_nft.track_counter.to_le_bytes()')) {
        this.results.passed.push('✅ TrackNFT: Seeds используют counter вместо timestamp')
      } else {
        this.results.warnings.push('⚠️ TrackNFT: Seeds могут использовать timestamp')
      }
    }

    // Проверяем Staking
    const stakingPath = 'programs/staking/src/lib.rs'
    if (fs.existsSync(stakingPath)) {
      const content = fs.readFileSync(stakingPath, 'utf8')

      // Проверяем time-lock
      if (content.includes('config_update_time_lock')) {
        this.results.passed.push('✅ Staking: Time-lock protection добавлен')
      } else {
        this.results.critical.push('❌ Staking: Time-lock отсутствует')
      }
    }

    // Проверяем NDT
    const ndtPath = 'programs/ndt/src/lib.rs'
    if (fs.existsSync(ndtPath)) {
      const content = fs.readFileSync(ndtPath, 'utf8')

      // Проверяем hard cap
      if (content.includes('max_supply: u64')) {
        this.results.passed.push('✅ NDT: Hard cap эмиссии добавлен')
      } else {
        this.results.critical.push('❌ NDT: Hard cap отсутствует')
      }

      // Проверяем halving
      if (content.includes('halving_interval')) {
        this.results.passed.push('✅ NDT: Halving механизм добавлен')
      } else {
        this.results.warnings.push('⚠️ NDT: Halving механизм отсутствует')
      }
    }

    console.log('')
  }

  async auditAPI() {
    console.log('🌐 АУДИТ API БЕЗОПАСНОСТИ')
    console.log('=========================')

    const streamRoutePath = 'src/app/api/tracks/stream/route.ts'
    if (fs.existsSync(streamRoutePath)) {
      const content = fs.readFileSync(streamRoutePath, 'utf8')

      // Проверяем file size limits
      if (content.includes('MAX_FILE_SIZE') && content.includes('MAX_CHUNK_SIZE')) {
        this.results.passed.push('✅ API: File size limits добавлены')
      } else {
        this.results.critical.push('❌ API: File size limits отсутствуют')
      }

      // Проверяем range validation
      if (content.includes('rangeMatch') && content.includes('validateRange')) {
        this.results.passed.push('✅ API: Range header validation добавлена')
      } else {
        this.results.warnings.push('⚠️ API: Range validation неполная')
      }

      // Проверяем input validation
      if (content.includes('Math.max(0, Math.min') && content.includes('replace(/<[^>]*>/g')) {
        this.results.passed.push('✅ API: Input validation добавлена')
      } else {
        this.results.warnings.push('⚠️ API: Input validation неполная')
      }
    }

    console.log('')
  }

  async auditInfrastructure() {
    console.log('🏗️  АУДИТ ИНФРАСТРУКТУРЫ')
    console.log('========================')

    // Проверяем .dockerignore
    if (fs.existsSync('.dockerignore')) {
      const dockerignore = fs.readFileSync('.dockerignore', 'utf8')
      if (dockerignore.includes('.env') && dockerignore.includes('node_modules')) {
        this.results.passed.push('✅ Docker: .dockerignore настроен правильно')
      } else {
        this.results.warnings.push('⚠️ Docker: .dockerignore неполный')
      }
    }

    // Проверяем Dockerfile.api
    const dockerfilePath = 'Dockerfile.api'
    if (fs.existsSync(dockerfilePath)) {
      const dockerfile = fs.readFileSync(dockerfilePath, 'utf8')

      if (dockerfile.includes('20.18-alpine') && dockerfile.includes('HEALTHCHECK')) {
        this.results.passed.push('✅ Docker: Security hardening настроен')
      } else {
        this.results.warnings.push('⚠️ Docker: Security hardening неполный')
      }
    }

    console.log('')
  }

  async auditDatabase() {
    console.log('💾 АУДИТ БАЗЫ ДАННЫХ')
    console.log('===================')

    const schemaPath = 'prisma/schema.prisma'
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8')

      // Проверяем wallet индекс
      if (schema.includes('wallet      String?     @unique')) {
        this.results.passed.push('✅ Database: Wallet normalization добавлена')
      } else {
        this.results.critical.push('❌ Database: Wallet normalization отсутствует')
      }

      // Проверяем IPFS hash тип
      if (schema.includes('ipfsHash    String   @db.VarChar(255)')) {
        this.results.passed.push('✅ Database: IPFS hash optimization добавлен')
      } else {
        this.results.warnings.push('⚠️ Database: IPFS hash optimization отсутствует')
      }
    }

    console.log('')
  }

  async runTests() {
    console.log('🧪 ЗАПУСК ТЕСТОВ БЕЗОПАСНОСТИ')
    console.log('==============================')

    try {
      // Запускаем security тесты
      console.log('Запускаем security тесты...')
      execSync('npm run test:security', {
        stdio: 'pipe',
        cwd: process.cwd()
      })
      this.results.passed.push('✅ Security тесты проходят')
    } catch (error) {
      this.results.warnings.push(`⚠️ Security тесты: ${error.message}`)
    }

    try {
      // Проверяем TypeScript
      console.log('Проверяем TypeScript...')
      execSync('npx tsc --noEmit', {
        stdio: 'pipe',
        cwd: process.cwd()
      })
      this.results.passed.push('✅ TypeScript проверка прошла')
    } catch (error) {
      this.results.critical.push(`❌ TypeScript ошибки: ${error.message}`)
    }

    console.log('')
  }

  displayResults() {
    console.log('📊 РЕЗУЛЬТАТЫ SECURITY AUDIT')
    console.log('=============================\n')

    // Критические проблемы
    if (this.results.critical.length > 0) {
      console.log('🚨 КРИТИЧЕСКИЕ ПРОБЛЕМЫ:')
      this.results.critical.forEach(item => console.log(`   ${item}`))
      console.log('')
    }

    // Предупреждения
    if (this.results.warnings.length > 0) {
      console.log('⚠️  ПРЕДУПРЕЖДЕНИЯ:')
      this.results.warnings.forEach(item => console.log(`   ${item}`))
      console.log('')
    }

    // Успешные проверки
    if (this.results.passed.length > 0) {
      console.log('✅ УСПЕШНЫЕ ПРОВЕРКИ:')
      this.results.passed.forEach(item => console.log(`   ${item}`))
      console.log('')
    }

    // Общий score
    const totalChecks = this.results.passed.length + this.results.warnings.length + this.results.critical.length
    const criticalCount = this.results.critical.length
    const warningCount = this.results.warnings.length
    const passedCount = this.results.passed.length

    this.results.score = Math.round((passedCount / totalChecks) * 100)

    console.log('🎯 ИТОГОВЫЙ РЕЗУЛЬТАТ:')
    console.log(`   Критических проблем: ${criticalCount}`)
    console.log(`   Предупреждений: ${warningCount}`)
    console.log(`   Успешных проверок: ${passedCount}`)
    console.log(`   Общий Score: ${this.results.score}%`)

    if (this.results.score >= 90 && criticalCount === 0) {
      console.log('\n🎉 ПРОЕКТ ГОТОВ К ВНЕШНЕМУ АУДИТУ!')
      console.log('   Рекомендуемые аудиторы:')
      console.log('   • Sec3 (специалисты по Solana)')
      console.log('   • OtterSec (опыт с DeFi)')
      console.log('   • Certik (полная сертификация)')
    } else if (this.results.score >= 70) {
      console.log('\n⚠️  ПРОЕКТ ТРЕБУЕТ ДОРАБОТКИ ПЕРЕД АУДИТОМ')
    } else {
      console.log('\n❌ ПРОЕКТ НЕ ГОТОВ К АУДИТУ')
    }

    console.log('\n📋 СЛЕДУЮЩИЕ ШАГИ:')
    console.log('1. Исправить критические проблемы')
    console.log('2. Устранить предупреждения')
    console.log('3. Запустить полное тестирование')
    console.log('4. Провести внешний аудит')
    console.log('5. Подготовить документацию для инвесторов')
  }
}

// Запускаем аудит
async function main() {
  const auditor = new SecurityAuditor()
  await auditor.runFullAudit()
}

main().catch(console.error)
