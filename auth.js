
  
// Инициализация Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // если Firebase уже инициализирован
}

// Инициализация Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBYI_LCb4mld3VEfIOU9D49gLV81gKTovE",
    authDomain: "taskcalendarapp-bf3b3.firebaseapp.com",
    projectId: "taskcalendarapp-bf3b3",
    storageBucket: "taskcalendarapp-bf3b3.appspot.com",
    messagingSenderId: "482463811896",
    appId: "1:482463811896:web:11700779551db85f8c59cd",
    measurementId: "G-4V1NYWDVKF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Основная логика авторизации через Telegram Mini App
function handleTelegramAuth() {
    // Получаем данные из Telegram Mini App
    const initData = window.Telegram.WebApp.initDataUnsafe;
    if (!initData || !initData.user || !initData.user.id) {
        console.error("Ошибка: Данные Telegram недоступны.");
        return;
    }

    const userId = String(initData.user.id); // Приводим user.id к строке
    const email = `${userId}@example.com`;
    const password = userId;

    // Попытка входа
    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            console.log("Вход выполнен успешно.");
            window.location.href = "index.html"; // Перенаправление
        })
        .catch((error) => {
            if (error.code === "auth/user-not-found") {
                // Если пользователь не найден, регистрируем нового
                createUserWithEmailAndPassword(auth, email, password)
                    .then((userCredential) => {
                        const user = userCredential.user;
                        console.log("Пользователь зарегистрирован:", user);

                        // Сохраняем пользователя в Firestore
                        const userDocRef = doc(db, "users", userId);
                        setDoc(userDocRef, {
                            email: email,
                            telegramUserId: userId,
                            createdAt: new Date().toISOString()
                        })
                        .then(() => {
                            console.log("Данные пользователя сохранены в Firestore.");
                            window.location.href = "index.html"; // Перенаправление
                        })
                        .catch((firestoreError) => {
                            console.error("Ошибка сохранения данных в Firestore:", firestoreError);
                        });
                    })
                    .catch((registrationError) => {
                        console.error("Ошибка регистрации:", registrationError);
                    });
            } else {
                console.error("Ошибка входа:", error);
            }
        });
}

// Вызываем функцию при загрузке страницы
window.addEventListener("DOMContentLoaded", handleTelegramAuth);

  
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

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

