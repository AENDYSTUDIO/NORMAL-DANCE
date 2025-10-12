const crypto = require("crypto");
const MOCK_BOT_TOKEN = "1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghi";

function generateValidInitData(userId) {
  const timestamp = Math.floor(Date.now() / 1000);
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

const validInitData = generateValidInitData("123456789");
console.log("Original:", validInitData);
console.log("URL decoded version:");
console.log(decodeURIComponent(validInitData));

// Теперь правильно заменим закодированную строку
const tamperedInitData = validInitData.replace(
  /%22id%22%3A123456789/g,
  "%22id%22%3A9999"
);
console.log("After replace:", tamperedInitData);
console.log("URL decoded tampered version:");
console.log(decodeURIComponent(tamperedInitData));

// Проверим параметры
const originalParams = new URLSearchParams(validInitData);
const tamperedParams = new URLSearchParams(tamperedInitData);

console.log("\nOriginal user param:", originalParams.get("user"));
console.log("Tampered user param:", tamperedParams.get("user"));

// Проверим, как будет работать валидация
console.log("\n--- Testing validation ---");
const {
  validateTelegramInitData,
} = require("./src/lib/security/telegram-validator");
const originalResult = validateTelegramInitData(validInitData, MOCK_BOT_TOKEN);
const tamperedResult = validateTelegramInitData(
  tamperedInitData,
  MOCK_BOT_TOKEN
);

console.log("Original result:", originalResult);
console.log("Tampered result:", tamperedResult);
