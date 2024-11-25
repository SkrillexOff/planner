// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, collection, getDocs, orderBy, query, where } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// Конфигурация Firebase
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
const auth = getAuth(app);  // Получаем auth для текущего экземпляра приложения
const db = getFirestore(app); // Получаем firestore для текущего экземпляра

const logoutBtn = document.getElementById('logout-btn');
const addPageBtn = document.getElementById('add-page-btn');
const pagesList = document.getElementById('pages-list');
const loginMessage = document.getElementById('login-message');

// Функция для выхода
function logout() {
  signOut(auth).then(() => {
    console.log('User logged out');
    window.location.href = "auth.html";  // Перенаправляем на страницу авторизации
  }).catch((error) => {
    console.error('Error:', error.code, error.message);
  });
}

logoutBtn.addEventListener('click', logout);

// Функция для загрузки страниц
async function loadPages() {
  const user = auth.currentUser;
  if (user) {
    const pagesQuery = query(
      collection(db, "pages"),
      where("userUID", "==", user.uid),
      orderBy("createdAt")
    );
    const querySnapshot = await getDocs(pagesQuery);
    pagesList.innerHTML = '';
    querySnapshot.forEach((doc) => {
      const page = doc.data();
      const pageItem = document.createElement('div');
      pageItem.classList.add('page-item');
      pageItem.innerHTML = `<strong>${page.title}</strong><p>${page.content}</p>`;
      pagesList.appendChild(pageItem);
    });
  }
}

// Проверка авторизации
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById('app').style.display = 'block';
    loginMessage.style.display = 'none';
    loadPages();
  } else {
    document.getElementById('app').style.display = 'none';
    loginMessage.style.display = 'block';
  }
});

// Обработчик для кнопки "Добавить страницу"
addPageBtn.addEventListener('click', () => {
  window.location.href = "add-page.html";  // Перенаправляем на страницу добавления страницы
});
