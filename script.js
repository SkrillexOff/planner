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
const auth = getAuth(app);
const db = getFirestore(app);

const logoutBtn = document.getElementById('logout-btn');
const addPageBtn = document.getElementById('add-page-btn');
const pagesList = document.getElementById('pages-list');
const loginMessage = document.getElementById('login-message');
const statusTabs = document.getElementById('status-tabs');

let allPages = []; // Для хранения всех загруженных страниц

// Функция для выхода
function logout() {
  signOut(auth).then(() => {
    console.log('User logged out');
    window.location.href = "auth.html";
  }).catch((error) => {
    console.error('Error:', error.code, error.message);
  });
}

logoutBtn.addEventListener('click', logout);

// Функция для отображения свойств страницы
function renderPageProperties(properties) {
  if (!properties || properties.length === 0) return '';

  return properties
    .map((property) => {
      if (property.type === 'text') {
        return `<p><strong>Текст:</strong> ${property.value}</p>`;
      } else if (property.type === 'status') {
        let statusColor;
        switch (property.value) {
          case 'нужно сделать':
            statusColor = 'red';
            break;
          case 'в работе':
            statusColor = 'orange';
            break;
          case 'готово':
            statusColor = 'green';
            break;
          default:
            statusColor = 'gray';
        }
        return `<p><strong>Статус:</strong> <span class="status-label" style="background-color: ${statusColor};">${property.value}</span></p>`;
      }
      return '';
    })
    .join('');
}

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

    allPages = []; // Сброс перед загрузкой новых данных
    querySnapshot.forEach((doc) => {
      const page = { id: doc.id, ...doc.data() };
      allPages.push(page);
    });

    renderPages('all'); // Отобразить все страницы по умолчанию
  }
}

// Функция для отображения страниц на основе выбранного статуса
function renderPages(filterStatus) {
  pagesList.innerHTML = '';

  const filteredPages = allPages.filter((page) => {
    if (filterStatus === 'all') return true;
    const statusProperty = page.properties?.find((prop) => prop.type === 'status');
    return statusProperty && statusProperty.value === filterStatus;
  });

  filteredPages.forEach((page) => {
    const pageItem = document.createElement('div');
    pageItem.classList.add('page-item');

    // Формируем содержимое страницы
    pageItem.innerHTML = `
      <div>
        <h3>${page.title}</h3>
        ${renderPageProperties(page.properties)}
      </div>
    `;

    pagesList.appendChild(pageItem);
  });
}

// Обработчик смены вкладки
statusTabs.addEventListener('click', (event) => {
  if (event.target.classList.contains('status-tab')) {
    const selectedStatus = event.target.getAttribute('data-status');
    renderPages(selectedStatus);
  }
});

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
  window.location.href = "add-page.html";
});
