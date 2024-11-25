// add-page.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// Конфигурация Firebase (замените на вашу, если используется другая)
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

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Получаем элементы DOM
const savePageBtn = document.getElementById('save-page-btn');
const cancelBtn = document.getElementById('cancel-btn');
const pageTitleInput = document.getElementById('page-title');
const pageContentInput = document.getElementById('page-content');

// Функция для добавления страницы
async function addPage(title, content) {
  const user = auth.currentUser;
  if (user) {
    try {
      await addDoc(collection(db, "pages"), {
        title: title,
        content: content,
        userUID: user.uid, // Привязываем страницу к пользователю
        createdAt: serverTimestamp() // Добавляем временную метку
      });
      window.location.href = "index.html"; // Перенаправляем обратно на главную страницу
    } catch (e) {
      console.error("Ошибка при добавлении страницы: ", e);
    }
  } else {
    console.log("Пользователь не авторизован");
  }
}

// Обработчик для кнопки "Сохранить страницу"
savePageBtn.addEventListener('click', () => {
  const title = pageTitleInput.value;
  const content = pageContentInput.value;
  if (title && content) {
    addPage(title, content); // Добавляем страницу в Firestore
  } else {
    alert('Заполните все поля!');
  }
});

// Обработчик для кнопки "Отмена"
cancelBtn.addEventListener('click', () => {
  window.location.href = "index.html"; // Возвращаемся на главную страницу
});
