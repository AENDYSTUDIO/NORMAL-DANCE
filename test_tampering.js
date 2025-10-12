const crypto = require("crypto");

const MOCK_BOT_TOKEN = "1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghi";

// Копируем функцию generateValidInitData из теста
function generateValidInitData(userId, authDate) {
  const timestamp = authDate || Math.floor(Date.now() / 1000);
  const user = JSON.stringify({
    id: parseInt(userId),
    first_name: "Test",
    username: "testuser",
  });

  const params = new URLSearchParams({
    auth_date: timestamp.toString(),
    user: user,
  });

  // Generate valid HMAC
  const sortedParams = Array.from(params.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  const dataCheckString = sortedParams
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(MOCK_BOT_TOKEN)
    .digest();

  const hash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  params.set("hash", hash);
  return params.toString();
}

// Имитируем функцию validateTelegramInitData
function validateTelegramInitData(initData, botToken, maxAge = 3600) {
  try {
    // Parse URLSearchParams
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    const authDate = params.get("auth_date");

    if (!hash) {
      return {
        valid: false,
        error: "Missing hash parameter",
      };
    }

    if (!authDate) {
      return {
        valid: false,
        error: "Missing auth_date parameter",
      };
    }

    // Check timestamp (prevent replay attacks)
    const authTimestamp = parseInt(authDate);
    const currentTimestamp = Math.floor(Date.now() / 1000);

    if (isNaN(authTimestamp)) {
      return {
        valid: false,
        error: "Invalid auth_date format",
      };
    }

    // Use >= to match the updated logic
    if (currentTimestamp - authTimestamp >= maxAge) {
      return {
        valid: false,
        error: `initData expired (older than or equal to ${maxAge}s)`,
      };
    }

    // Remove hash from params and sort alphabetically
    params.delete("hash");
    const sortedParams = Array.from(params.entries()).sort(([a], [b]) =>
      a.localeCompare(b)
    );

    // Create data check string
    const dataCheckString = sortedParams
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    // Compute HMAC-SHA256
    // Step 1: Create secret key from bot token
    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(botToken)
      .digest();

    // Step 2: Create hash from data check string
    const computedHash = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    // Step 3: Compare hashes (constant-time comparison)
    // First check if hashes have same length (timingSafeEqual requirement)
    const hashBuffer = Buffer.from(hash, "hex");
    const computedHashBuffer = Buffer.from(computedHash, "hex");

    if (hashBuffer.length !== computedHashBuffer.length) {
      return {
        valid: false,
        error: "Invalid signature - possible tampering detected",
      };
    }

    if (!crypto.timingSafeEqual(hashBuffer, computedHashBuffer)) {
      return {
        valid: false,
        error: "Invalid signature - possible tampering detected",
      };
    }

    // Extract user information after successful signature validation
    const userParam = params.get("user");
    if (!userParam) {
      return {
        valid: true,
        userId: undefined,
        timestamp: authTimestamp,
      };
    }

    try {
      const user = JSON.parse(userParam);
      return {
        valid: true,
        userId: user.id.toString(),
        username: user.username,
        timestamp: authTimestamp,
      };
    } catch {
      return {
        valid: true,
        userId: undefined,
        timestamp: authTimestamp,
      };
    }
  } catch (error) {
    console.error("[TelegramValidator] Unexpected error:", error);
    return {
      valid: false,
      error: "Validation failed due to internal error",
    };
  }
}

// Повторяем тест
console.log("=== Testing Tampered User Data ===");
const validInitData = generateValidInitData("123456789");
console.log("Original:", validInitData);

// Пытаемся подделать данные, как в тесте
const tamperedInitData = validInitData.replace(
  /"id":123456789/,
  '"id":999999999'
);
console.log("Tampered attempt:", tamperedInitData);
console.log("Are they different?", validInitData !== tamperedInitData);

// Но посмотрим, как строка выглядит в URL-декодированном виде
console.log("Original decoded:", decodeURIComponent(validInitData));
console.log("Tampered decoded:", decodeURIComponent(tamperedInitData));

// Проверяем, действительно ли замена не происходит
if (validInitData === tamperedInitData) {
  console.log("REPLACEMENT DID NOT OCCUR - this explains the test failure");

  // Давайте попробуем другой подход - может быть, в тесте строка сначала декодируется?
  // Нет, это не имеет смысла, так как validInitData - это уже закодированная строка

  // Давайте попробуем найти закодированную подстроку вручную
  const encodedOriginal = encodeURIComponent(
    '{"id":123456789,"first_name":"Test","username":"testuser"}'
  );
  const encodedTarget = encodeURIComponent(
    '{"id":999999999,"first_name":"Test","username":"testuser"}'
  );

  console.log("Encoded original user param:", encodedOriginal);
  console.log("Encoded target user param:", encodedTarget);

  // Попробуем заменить закодированную версию
  const tamperedByEncoded = validInitData.replace(
    "%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Test%22%2C%22username%22%3A%22testuser%22%7D",
    "%7B%22id%22%3A99999999%2C%22first_name%22%3A%22Test%22%2C%22username%22%3A%22testuser%22%7D"
  );

  console.log("Tampered by encoded:", tamperedByEncoded);
  console.log("Encoded tampering worked?", validInitData !== tamperedByEncoded);

  // Проверим оба варианта
  const originalResult = validateTelegramInitData(
    validInitData,
    MOCK_BOT_TOKEN
  );
  const tamperedResult = validateTelegramInitData(
    tamperedByEncoded,
    MOCK_BOT_TOKEN
  );

  console.log("Original result:", originalResult);
  console.log("Tampered (by encoded) result:", tamperedResult);
} else {
  // Если замена произошла, проверим результаты
  const originalResult = validateTelegramInitData(
    validInitData,
    MOCK_BOT_TOKEN
  );
  const tamperedResult = validateTelegramInitData(
    tamperedInitData,
    MOCK_BOT_TOKEN
  );

  console.log("Original result:", originalResult);
  console.log("Tampered result:", tamperedResult);
}
