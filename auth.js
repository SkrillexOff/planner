// auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBYI_LCb4mld3VEfIOU9D49gLV81gKTovE",
  authDomain: "taskcalendarapp-bf3b3.firebaseapp.com",
  databaseURL: "https://taskcalendarapp-bf3b3-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "taskcalendarapp-bf3b3",
  storageBucket: "taskcalendarapp-bf3b3.firebasestorage.app",
  messagingSenderId: "482463811896",
  appId: "1:482463811896:web:11700779551db85f8c59cd",
  measurementId: "G-4V1NYWDVKF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const loginButton = document.getElementById('login-btn');
const registerButton = document.getElementById('register-btn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

loginButton.addEventListener('click', async () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  
  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "bases.html";  // Перенаправление после входа
  } catch (error) {
    console.error("Error logging in: ", error.message);
  }
});

registerButton.addEventListener('click', async () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    window.location.href = "bases.html";  // Перенаправление после регистрации
  } catch (error) {
    console.error("Error registering: ", error.message);
  }
});

// Проверка авторизации
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "bases.html";  // Если пользователь авторизован, перенаправляем на главную
  }
});
