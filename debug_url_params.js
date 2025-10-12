// Проверим, как работает URLSearchParams
const params = new URLSearchParams();

// Добавим параметры вручную
params.append(
  "user",
  '{"id":123456789,"first_name":"Test","username":"testuser"}'
);
params.append("auth_date", "1234567890");
params.append("hash", "abc123");

console.log("Full string:", params.toString());
console.log("URL decoded:", decodeURIComponent(params.toString()));

// Теперь попробуем замену
let tampered = params.toString().replace(/"id":123456789/, '"id":999999');
console.log("After replace:", tampered);
console.log("URL decoded tampered:", decodeURIComponent(tampered));

// Проверим, как извлекаются данные
const tamperedParams = new URLSearchParams(tampered);
console.log("Tampered user param:", tamperedParams.get("user"));
