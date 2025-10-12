import { NextResponse } from 'next/server';
import { ShamirService, KeyPartStorage } from '@/lib/crypto/shamir-service';

/**
 * API эндпоинт для Shamir's Secret Sharing операций
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'split':
        return await handleSplitKey(data);
      case 'recover':
        return await handleRecoverKey(data);
      case 'generate-recovery':
        return await handleGenerateRecovery(data);
      case 'social-recovery':
        return await handleSocialRecovery(data);
      default:
        return NextResponse.json(
          { error: 'Неизвестное действие' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Ошибка в Shamir API:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

/**
 * Разбивает приватный ключ на части
 */
async function handleSplitKey(data: { privateKeyHex: string }) {
  const { privateKeyHex } = data;

  // Валидируем приватный ключ
  if (!ShamirService.validatePrivateKey(privateKeyHex)) {
    return NextResponse.json(
      { error: 'Неверный формат приватного ключа' },
      { status: 400 }
    );
  }

  try {
    const parts = await ShamirService.splitPrivateKey(privateKeyHex);

    // Распределяем части между хранилищами
    const distribution = KeyPartStorage.distributeKeyParts(parts, 'hybrid');

    return NextResponse.json({
      success: true,
      parts,
      distribution,
      message: 'Приватный ключ успешно разбит на части'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при разбиении ключа' },
      { status: 500 }
    );
  }
}

/**
 * Восстанавливает приватный ключ из частей
 */
async function handleRecoverKey(data: { parts: string[] }) {
  const { parts } = data;

  if (!parts || parts.length < 2) {
    return NextResponse.json(
      { error: 'Нужно минимум 2 части для восстановления' },
      { status: 400 }
    );
  }

  try {
    const privateKeyHex = await ShamirService.recoverPrivateKey(parts);

    return NextResponse.json({
      success: true,
      privateKeyHex,
      message: 'Приватный ключ успешно восстановлен'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при восстановлении ключа' },
      { status: 500 }
    );
  }
}

/**
 * Генерирует токен для социального восстановления
 */
async function handleGenerateRecovery(data: { userId: string; privateKeyHex: string }) {
  const { userId, privateKeyHex } = data;

  if (!ShamirService.validatePrivateKey(privateKeyHex)) {
    return NextResponse.json(
      { error: 'Неверный формат приватного ключа' },
      { status: 400 }
    );
  }

  try {
    const recoveryToken = await ShamirService.generateSocialRecoveryToken(userId, privateKeyHex);

    // В реальном приложении сохраните recoveryToken в базу данных
    // Здесь мы просто возвращаем его клиенту для демонстрации

    return NextResponse.json({
      success: true,
      recoveryToken,
      message: 'Токен социального восстановления создан'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при создании токена восстановления' },
      { status: 500 }
    );
  }
}

/**
 * Восстанавливает ключ через социальный recovery
 */
async function handleSocialRecovery(data: {
  recoveryData: { userId: string; parts: string[]; recoveryId: string };
  providedParts: string[];
}) {
  const { recoveryData, providedParts } = data;

  try {
    const privateKeyHex = await ShamirService.recoverFromSocialRecovery(
      recoveryData,
      providedParts
    );

    return NextResponse.json({
      success: true,
      privateKeyHex,
      message: 'Ключ успешно восстановлен через социальный recovery'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при социальном восстановлении' },
      { status: 500 }
    );
  }
}

/**
 * GET метод для получения информации о сервисе
 */
export async function GET() {
  return NextResponse.json({
    service: 'Shamir Secret Sharing API',
    description: 'Сервис для безопасного разбиения и восстановления приватных ключей',
    features: [
      'Разбиение ключа на 3 части (2 нужны для восстановления)',
      'Социальное восстановление',
      'Безопасное хранение частей ключа',
      'Валидация приватных ключей'
    ],
    endpoints: {
      'POST /api/crypto/shamir': {
        actions: ['split', 'recover', 'generate-recovery', 'social-recovery']
      }
    }
  });
}
