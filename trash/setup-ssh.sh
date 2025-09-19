#!/bin/bash
# Скрипт настройки SSH доступа для NORMALDANCE

echo "🔑 Настройка SSH доступа для NORMALDANCE"
echo "========================================"

# Переменные
TARGET_SERVER="176.108.246.49"
TARGET_USER="aendy"
KEY_NAME="id_ed25519_normaldance"

# Проверка существования ключа
if [ ! -f ~/.ssh/$KEY_NAME ]; then
    echo "📝 Генерация нового SSH ключа..."
    ssh-keygen -t ed25519 -f ~/.ssh/$KEY_NAME -C "normaldance@$TARGET_SERVER" -N ""
    echo "✅ Ключ создан: ~/.ssh/$KEY_NAME"
fi

# Показать публичный ключ
echo ""
echo "🔓 Ваш публичный ключ:"
echo "======================"
cat ~/.ssh/$KEY_NAME.pub
echo ""

# Инструкции для добавления ключа
echo "📋 Инструкции по добавлению ключа на сервер:"
echo "============================================="
echo "1. Войдите на сервер $TARGET_SERVER любым доступным способом"
echo "2. Создайте директорию: mkdir -p ~/.ssh"
echo "3. Установите права: chmod 700 ~/.ssh"
echo "4. Добавьте ключ в файл: echo 'ПУБЛИЧНЫЙ_КЛЮЧ_ВЫШЕ' >> ~/.ssh/authorized_keys"
echo "5. Установите права: chmod 600 ~/.ssh/authorized_keys"
echo ""

# Тест подключения
echo "🧪 Тестирование подключения..."
echo "=============================="
if ssh -i ~/.ssh/$KEY_NAME -o ConnectTimeout=10 -o BatchMode=yes $TARGET_USER@$TARGET_SERVER exit 2>/dev/null; then
    echo "✅ SSH подключение успешно!"
else
    echo "❌ SSH подключение не удалось. Проверьте настройки."
fi

echo ""
echo "🚀 Для подключения используйте:"
echo "ssh -i ~/.ssh/$KEY_NAME $TARGET_USER@$TARGET_SERVER"