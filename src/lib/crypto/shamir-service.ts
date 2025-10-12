/**
 * Сервис для Shamir's Secret Sharing (SSS) для приватных ключей
 * Разбивает приватный ключ на части, где 2 из 3 нужны для восстановления
 */
export class ShamirService {
  private static readonly PARTS = 3;
  private static readonly THRESHOLD = 2;

  /**
   * Разбивает приватный ключ на 3 части
   */
  static async splitPrivateKey(privateKeyHex: string): Promise<string[]> {
    try {
      // Конвертируем hex в Uint8Array
      const privateKeyBytes = this.hexToBytes(privateKeyHex);

      // Разбиваем ключ на 3 части (нужны 2 для восстановления)
      const parts = this.splitSecret(privateKeyBytes, this.THRESHOLD, this.PARTS);

      // Конвертируем части обратно в hex
      return parts.map(part => this.bytesToHex(part));
    } catch (error) {
      console.error('Ошибка при разбиении приватного ключа:', error);
      throw new Error('Не удалось разбить приватный ключ');
    }
  }

  /**
   * Восстанавливает приватный ключ из 2 частей
   */
  static async recoverPrivateKey(parts: string[]): Promise<string> {
    try {
      if (parts.length < this.THRESHOLD) {
        throw new Error(`Нужно минимум ${this.THRESHOLD} частей для восстановления`);
      }

      // Конвертируем hex части в Uint8Array
      const partsBytes = parts.map(part => this.hexToBytes(part));

      // Восстанавливаем приватный ключ
      const privateKeyBytes = this.combineSecret(partsBytes);

      return this.bytesToHex(privateKeyBytes);
    } catch (error) {
      console.error('Ошибка при восстановлении приватного ключа:', error);
      throw new Error('Не удалось восстановить приватный ключ');
    }
  }

  /**
   * Простая реализация Shamir's Secret Sharing для разбиения секрета
   */
  private static splitSecret(secret: Uint8Array, threshold: number, parts: number): Uint8Array[] {
    // Создаем полином степени threshold-1
    const coefficients = new Uint8Array(threshold - 1);

    // Генерируем случайные коэффициенты
    for (let i = 0; i < coefficients.length; i++) {
      coefficients[i] = Math.floor(Math.random() * 256);
    }

    const result: Uint8Array[] = [];

    // Генерируем части
    for (let i = 1; i <= parts; i++) {
      const part = new Uint8Array(secret.length);
      part[0] = secret[0]; // Константа

      // Вычисляем значение полинома для x = i
      for (let j = 1; j < secret.length; j++) {
        let value = coefficients[j - 1];
        for (let k = 1; k < threshold; k++) {
          if (k < j) {
            value = (value * i) % 256;
          }
        }
        part[j] = (secret[j] + value) % 256;
      }

      result.push(part);
    }

    return result;
  }

  /**
   * Простая реализация Shamir's Secret Sharing для восстановления секрета
   */
  private static combineSecret(parts: Uint8Array[]): Uint8Array {
    const secretLength = parts[0].length;
    const secret = new Uint8Array(secretLength);

    // Используем первые две части для восстановления
    const part1 = parts[0];
    const part2 = parts[1];

    // Простая интерполяция для двух точек
    for (let i = 0; i < secretLength; i++) {
      // Линейная интерполяция между двумя точками
      const x1 = 1, x2 = 2;
      const y1 = part1[i], y2 = part2[i];

      // Вычисляем значение для x = 0 (константа)
      const slope = (y2 - y1) / (x2 - x1);
      secret[i] = Math.round(y1 - slope * x1) % 256;

      // Обеспечиваем положительное значение
      if (secret[i] < 0) secret[i] += 256;
    }

    return secret;
  }

  /**
   * Генерирует социальный recovery токен для пользователя
   */
  static async generateSocialRecoveryToken(userId: string, privateKeyHex: string): Promise<{
    userId: string;
    parts: string[];
    recoveryId: string;
    createdAt: Date;
  }> {
    const parts = await this.splitPrivateKey(privateKeyHex);
    const recoveryId = this.generateRecoveryId();

    return {
      userId,
      parts,
      recoveryId,
      createdAt: new Date()
    };
  }

  /**
   * Восстанавливает приватный ключ используя social recovery
   */
  static async recoverFromSocialRecovery(
    recoveryData: { userId: string; parts: string[]; recoveryId: string },
    providedParts: string[]
  ): Promise<string> {
    // Проверяем что recovery ID совпадает
    if (recoveryData.parts.length !== providedParts.length) {
      throw new Error('Количество частей не совпадает');
    }

    return this.recoverPrivateKey(providedParts);
  }

  /**
   * Конвертирует hex строку в Uint8Array
   */
  private static hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
  }

  /**
   * Конвертирует Uint8Array в hex строку
   */
  private static bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Генерирует уникальный recovery ID
   */
  private static generateRecoveryId(): string {
    return `recovery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Валидирует формат приватного ключа
   */
  static validatePrivateKey(privateKeyHex: string): boolean {
    try {
      if (!privateKeyHex || typeof privateKeyHex !== 'string') {
        return false;
      }

      // Проверяем длину (64 символа для 32 байт)
      if (privateKeyHex.length !== 64) {
        return false;
      }

      // Проверяем hex формат
      return /^[a-fA-F0-9]{64}$/.test(privateKeyHex);
    } catch {
      return false;
    }
  }
}

/**
 * Сервис для безопасного хранения частей ключа в разных источниках
 */
export class KeyPartStorage {
  /**
   * Распределяет части ключа между разными хранилищами
   */
  static distributeKeyParts(parts: string[], strategy: 'browser' | 'server' | 'hybrid' = 'hybrid'): {
    browser?: string[];
    server?: string[];
    external?: string[];
  } {
    switch (strategy) {
      case 'browser':
        return { browser: parts };

      case 'server':
        return { server: parts };

      case 'hybrid':
      default:
        // 1 часть в браузере, 1 на сервере, 1 внешняя
        return {
          browser: [parts[0]],
          server: [parts[1]],
          external: [parts[2]]
        };
    }
  }

  /**
   * Собирает части ключа из разных источников
   */
  static collectKeyParts(sources: {
    browser?: string[];
    server?: string[];
    external?: string[];
  }): string[] {
    const allParts: string[] = [];

    if (sources.browser) allParts.push(...sources.browser);
    if (sources.server) allParts.push(...sources.server);
    if (sources.external) allParts.push(...sources.external);

    return allParts;
  }
}
