// Проверим, как именно генерируется строка в generateValidInitData
const crypto = require("crypto");

function generateValidInitData(userId, authDate) {
  const timestamp = authDate || Math.floor(Date.now() / 1000);
  const user = JSON.stringify({
    id: parseInt(userId),
    first_name: "Test",
    username: "testuser",
  });

  console.log("User JSON string:", user);

  const params = new URLSearchParams({
    auth_date: timestamp.toString(),
    user: user, // user - это JSON строка, которая будет закодирована URLSearchParams
  });

  console.log("Params before hash:", params.toString());

  // Generate valid HMAC
  const sortedParams = Array.from(params.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  console.log("Sorted params entries:", sortedParams);

  const dataCheckString = sortedParams
    .map(([key, value]) => `${key}=${value}`) // ВАЖНО: value - это уже декодированное значение!
    .join("\n");

  console.log("Data check string:");
  console.log(dataCheckString);

  const MOCK_BOT_TOKEN = "1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghi";
  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(MOCK_BOT_TOKEN)
    .digest();

  const hash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  console.log("Computed hash:", hash);

  params.set("hash", hash);
  const result = params.toString();
  console.log("Final result:", result);
  return result;
}

const validInitData = generateValidInitData("123456789");
console.log("\nTrying replace...");
const tamperedInitData = validInitData.replace(
  /"id":123456789/,
  '"id":9999999'
);
console.log("Tampered:", tamperedInitData);
console.log("Are they different?", validInitData !== tamperedInitData);
