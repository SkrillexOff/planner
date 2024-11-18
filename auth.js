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

// Проверка состояния авторизации
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    console.log("Пользователь авторизован:", user.email);
  } else {
    console.log("Пользователь не авторизован");
    window.location.href = 'login.html';
  }
});
