// Проверим, как работает замена в URL-закодированной строке
const userString = '{"id":123456789,"first_name":"Test","username":"testuser"}';
const encodedUser = encodeURIComponent(userString);
console.log("Original user JSON:", userString);
console.log("Encoded user:", encodedUser);

const originalString = `user=${encodedUser}&auth_date=1234567890&hash=abc123`;
console.log("Full string:", originalString);

// Попробуем разные замены
let tampered1 = originalString.replace(/"id":123456789/, '"id":99999999');
console.log("After replace with original format:", tampered1);

// Теперь посмотрим, что будет если закодировать новое значение
const newUserString = '{"id":99999,"first_name":"Test","username":"testuser"}';
const newEncodedUser = encodeURIComponent(newUserString);
console.log("New encoded user:", newEncodedUser);

// Проверим, есть ли в закодированной строке искомая подстрока
console.log(
  "Original encoded contains %22id%22%3A123456789?",
  encodedUser.includes("%22id%22%3A123456789")
);
console.log(
  "Original string contains %22id%22%3A123456789?",
  originalString.includes("%22id%22%3A123456789")
);

// Проверим, что в строке действительно есть закодированная версия
console.log(
  "Original string includes encoded id?",
  originalString.includes("%22id%22%3A123456789")
);
