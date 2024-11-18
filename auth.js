// Инициализация Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBYI_LCb4mld3VEfIOU9D49gLV81gKTovE",
    authDomain: "taskcalendarapp-bf3b3.firebaseapp.com",
    projectId: "taskcalendarapp-bf3b3",
    storageBucket: "taskcalendarapp-bf3b3.appspot.com",
    messagingSenderId: "482463811896",
    appId: "1:482463811896:web:11700779551db85f8c59cd",
    measurementId: "G-4V1NYWDVKF"
};

// Инициализация Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // если Firebase уже инициализирован
}

// Добавим обработку Telegram авторизации
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  const tg = window.Telegram.WebApp;
  tg.ready(); // Убедимся, что Telegram WebApp SDK готово

  // Проверка на данные Telegram
  const userData = tg.initDataUnsafe;
  if (userData && userData.user) {
    const telegramUser = userData.user;
    const userEmail = `${telegramUser.id}@telegram.com`;

    // Если пользователь уже авторизован через Telegram, перенаправляем его на страницу календаря
    firebase.auth().signInWithEmailAndPassword(userEmail, telegramUser.id)
      .then(() => {
        window.location.href = 'index.html'; // Перенаправление на главную страницу
      })
      .catch(error => {
        console.error('Ошибка авторизации через Telegram:', error);
      });

    return; // Прерываем дальнейшее выполнение кода авторизации по email/паролю
  }

  // Если это не Telegram авторизация, то продолжаем работу с email/пароль
  if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const email = document.getElementById('login-email').value;
          const password = document.getElementById('login-password').value;

          try {
              await firebase.auth().signInWithEmailAndPassword(email, password);
              alert('Вход выполнен успешно!');
              window.location.href = 'index.html'; // Перенаправление на главную страницу
          } catch (error) {
              alert('Ошибка входа: ' + error.message);
          }
      });
  }

  if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const email = document.getElementById('register-email').value;
          const password = document.getElementById('register-password').value;

          try {
              await firebase.auth().createUserWithEmailAndPassword(email, password);
              alert('Регистрация прошла успешно!');
              window.location.href = 'login.html'; // Перенаправление на страницу входа
          } catch (error) {
              alert('Ошибка регистрации: ' + error.message);
          }
      });
  }
});
