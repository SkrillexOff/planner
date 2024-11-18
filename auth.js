// Firebase конфигурация
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
  firebase.initializeApp(firebaseConfig);
  
  // Firebase Authentication
  const auth = firebase.auth();
  
  // Регистрация нового пользователя
  async function registerUser(email, password) {
    try {
      await auth.createUserWithEmailAndPassword(email, password);
      alert("Регистрация прошла успешно! Войдите в систему.");
      window.location.href = "login.html";
    } catch (error) {
      alert(`Ошибка регистрации: ${error.message}`);
    }
  }
  
  // Вход в систему
  async function loginUser(email, password) {
    try {
      await auth.signInWithEmailAndPassword(email, password);
      alert("Вход выполнен успешно!");
      window.location.href = "index.html";
    } catch (error) {
      alert(`Ошибка входа: ${error.message}`);
    }
  }
  
  // Выход из системы
  async function logoutUser() {
    try {
      await auth.signOut();
      alert("Вы вышли из системы.");
      window.location.href = "login.html";
    } catch (error) {
      alert(`Ошибка выхода: ${error.message}`);
    }
  }
  