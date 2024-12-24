import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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
const db = getFirestore(app);

const backBtn = document.getElementById('back-btn');
const settingsBtn = document.getElementById('settings-btn');
const pagesList = document.getElementById('pages-list');
const statusTabs = document.getElementById('status-tabs');
const addPageBtn = document.getElementById('add-page-btn');
const loginMessage = document.getElementById('login-message');

// Ссылки на элементы
const userEmailElement = document.getElementById('user-email');
const baseNameElement = document.getElementById('base-name');

let allPages = [];
let statuses = [];

// Получение baseId из URL
const urlParams = new URLSearchParams(window.location.search);
const baseId = urlParams.get('baseId');

if (!baseId) {
  alert('Base ID не найден. Вернитесь на страницу выбора базы.');
  window.location.href = 'bases.html'; // Перенаправление обратно
}

// Переход на страницу выбора баз
backBtn.addEventListener('click', () => {
  window.location.href = 'bases.html';
});

// Открытие страницы настроек
settingsBtn.addEventListener('click', () => {
  window.location.href = `settings.html?baseId=${baseId}`;
});

// Открытие страницы добавления новой страницы
addPageBtn.addEventListener('click', () => {
  window.location.href = `add-page.html?baseId=${baseId}`;
});

// Загрузка статусов из Firestore
async function loadStatuses() {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const baseDoc = await getDoc(doc(db, "bases", baseId));
    if (!baseDoc.exists()) {
      alert("База данных не найдена.");
      return;
    }

    const baseData = baseDoc.data();
    const statusLinks = baseData.statuses || {};

    const statusPromises = Object.keys(statusLinks).map(async statusId => {
      const statusDoc = await getDoc(doc(db, "statuses", statusId));
      if (statusDoc.exists()) {
        return { id: statusId, ...statusDoc.data() };
      }
    });

    statuses = (await Promise.all(statusPromises)).filter(Boolean);

    statuses.sort((a, b) => a.order - b.order); // Сортируем статусы по order

    renderStatusTabs();
  } catch (error) {
    console.error('Ошибка при загрузке статусов:', error);
    alert('Не удалось загрузить статусы.');
  }
}

// Рендеринг вкладок статусов
function renderStatusTabs() {
  statusTabs.innerHTML = '';

  statuses.forEach(status => {
    const tab = document.createElement('button');
    tab.classList.add('status-tab');
    tab.textContent = status.name;
    tab.dataset.status = status.id;

    tab.addEventListener('click', () => {
      renderPages(status.id);
    });

    statusTabs.appendChild(tab);
  });

  const allTab = document.createElement('button');
  allTab.classList.add('status-tab');
  allTab.textContent = "Все";
  allTab.dataset.status = "all";
  allTab.addEventListener('click', () => {
    renderPages('all');
  });

  statusTabs.prepend(allTab); // Кнопка "Все" всегда первая
}

// Загрузка страниц из Firestore
async function loadPages() {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const baseDoc = await getDoc(doc(db, "bases", baseId));
    if (!baseDoc.exists()) {
      alert("База данных не найдена.");
      return;
    }

    const baseData = baseDoc.data();
    const pageLinks = baseData.pages || {};

    const pagePromises = Object.keys(pageLinks).map(async pageId => {
      const pageDoc = await getDoc(doc(db, "pages", pageId));
      if (pageDoc.exists()) {
        return { id: pageId, ...pageDoc.data() };
      }
    });

    allPages = (await Promise.all(pagePromises)).filter(Boolean);

    renderPages('all');
  } catch (error) {
    console.error('Ошибка при загрузке страниц:', error);
    alert('Не удалось загрузить страницы.');
  }
}

// Рендеринг страниц с учётом фильтрации по статусу
function renderPages(filterStatus) {
  pagesList.innerHTML = '';

  const filteredPages = allPages.filter(page => {
    if (filterStatus === 'all') return true; // Показываем все страницы
    return page.status === filterStatus; // Фильтруем по статусу
  });

  filteredPages.forEach(page => {
    const pageItem = document.createElement('div');
    pageItem.classList.add('page-item');
    pageItem.dataset.pageId = page.id;

    pageItem.innerHTML = `
      <div>
        <h3>${page.title}</h3>
        <p><strong>Описание:</strong> ${page.description || 'Нет описания'}</p>
        <p><strong>Статус:</strong> ${renderStatusLabel(page.status)}</p>
      </div>
    `;

    pagesList.appendChild(pageItem);
  });
}

// Рендеринг метки статуса
function renderStatusLabel(statusId) {
  const status = statuses.find(s => s.id === statusId);
  if (!status) return '<span class="status-label" style="background-color: gray;">Неизвестно</span>';

  return `<span class="status-label" style="background-color: #E4E2D9; color: #000;">${status.name}</span>`;
}

// Открытие страницы редактирования
pagesList.addEventListener("click", (event) => {
  const pageItem = event.target.closest(".page-item");
  if (!pageItem) return;

  const pageId = pageItem.dataset.pageId;
  window.location.href = `add-page.html?pageId=${pageId}&baseId=${baseId}`;
});

// Загрузка почты пользователя и названия базы
async function loadUserDataAndBaseName() {
  const user = auth.currentUser;

  if (user) {
    // Отображаем почту пользователя
    userEmailElement.textContent = `Пользователь: ${user.email}`;
  }

  try {
    const baseDoc = await getDoc(doc(db, "bases", baseId));
    if (!baseDoc.exists()) {
      alert("База данных не найдена.");
      return;
    }

    // Отображаем название базы
    const baseData = baseDoc.data();
    baseNameElement.textContent = `Текущая база: ${baseData.name}`;
  } catch (error) {
    console.error('Ошибка при загрузке названия базы:', error);
    alert('Не удалось загрузить данные базы.');
  }
}

// Проверка авторизации и загрузка данных
onAuthStateChanged(auth, async user => {
  if (user) {
    document.getElementById('app').style.display = 'block';
    loginMessage.style.display = 'none';

    // Загружаем данные о пользователе и базе
    await loadUserDataAndBaseName();
    await loadStatuses();
    await loadPages();
  } else {
    document.getElementById('app').style.display = 'none';
    loginMessage.style.display = 'block';
  }
});
