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

const validInitData = generateValidInitData("123456789");
console.log("Generated string:");
console.log(validInitData);
console.log("\nDecoded string:");
console.log(decodeURIComponent(validInitData));

// Проверим, что будет, если применить замену из теста
const tamperedInitData = validInitData.replace(
  /"id":123456789/,
  '"id":999999999'
);
console.log("\nAfter tampering:");
console.log(tamperedInitData);
console.log("\nDecoded tampered string:");
console.log(decodeURIComponent(tamperedInitData));

console.log("\nAre they different?", validInitData !== tamperedInitData);
