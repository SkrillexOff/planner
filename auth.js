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
  

const auth = firebase.auth();

const loginButton = document.getElementById('loginButton');
const registerButton = document.getElementById('registerButton');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

loginButton.onclick = () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  if (email && password) {
    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        window.location.href = "index.html";
      })
      .catch(error => {
        alert(`Ошибка входа: ${error.message}`);
      });
  }
};

registerButton.onclick = () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  if (email && password) {
    auth.createUserWithEmailAndPassword(email, password)
      .then(() => {
        window.location.href = "index.html";
      })
      .catch(error => {
        alert(`Ошибка регистрации: ${error.message}`);
      });
  }
};
