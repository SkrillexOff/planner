// Инициализация Firebase в auth.js
const firebaseConfig = {
    apiKey: "AIzaSyBYI_LCb4mld3VEfIOU9D49gLV81gKTovE",
    authDomain: "taskcalendarapp-bf3b3.firebaseapp.com",
    projectId: "taskcalendarapp-bf3b3",
    storageBucket: "taskcalendarapp-bf3b3.appspot.com",
    messagingSenderId: "482463811896",
    appId: "1:482463811896:web:11700779551db85f8c59cd",
    measurementId: "G-4V1NYWDVKF"
  };
  
  // Инициализация Firebase приложения
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  } else {
    firebase.app(); // если Firebase уже инициализирован, используем существующее приложение
  }
  
  const auth = firebase.auth();
  
  const loginButton = document.getElementById('loginButton');
  const registerButton = document.getElementById('registerButton');
  
  registerButton.onclick = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
      await auth.createUserWithEmailAndPassword(email, password);
      alert('Регистрация успешна!');
      window.location.href = "index.html"; // Переход на главную страницу после регистрации
    } catch (error) {
      alert(`Ошибка регистрации: ${error.message}`);
    }
  };
  
  loginButton.onclick = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
      await auth.signInWithEmailAndPassword(email, password);
      alert('Вход выполнен успешно!');
      window.location.href = "index.html"; // Переход на главную страницу после входа
    } catch (error) {
      alert(`Ошибка входа: ${error.message}`);
    }
  };
  