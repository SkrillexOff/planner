import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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

// Загрузка статусов из Firebase (типа Map)
async function loadStatuses() {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const statusesRef = doc(db, `users/${user.uid}/bases/${baseId}`);
    const statusesDoc = await getDoc(statusesRef);

    if (statusesDoc.exists()) {
      const data = statusesDoc.data();

      // Преобразование объекта статусов в массив и сортировка по 'order'
      statuses = Object.entries(data.statuses || {}).map(([id, status]) => ({
        id,
        ...status,
      })).sort((a, b) => (a.order || 0) - (b.order || 0)); // Сортировка по order

      renderStatusTabs();
    } else {
      console.warn('Документ базы не найден или статусы отсутствуют.');
    }
  } catch (error) {
    console.error('Ошибка при загрузке статусов:', error);
    alert('Не удалось загрузить статусы. Проверьте подключение.');
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


// Загрузка страниц из Firebase (типа Map)
async function loadPages() {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const pagesRef = doc(db, `users/${user.uid}/bases/${baseId}`);
    const pagesDoc = await getDoc(pagesRef);

    if (pagesDoc.exists()) {
      const data = pagesDoc.data();
      allPages = Object.entries(data.pages || {}).map(([id, page]) => ({
        id,
        ...page,
      }));

      renderPages('all');
    } else {
      console.warn('Документ базы не найден или страницы отсутствуют.');
    }
  } catch (error) {
    console.error('Ошибка при загрузке страниц:', error);
    alert('Не удалось загрузить страницы. Проверьте подключение.');
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

  const statusColors = { "нужно сделать": "red", "в работе": "orange", "готово": "green" };
  const color = statusColors[status.name] || "gray";
  return `<span class="status-label" style="background-color: ${color};">${status.name}</span>`;
}

// Открытие страницы редактирования
pagesList.addEventListener("click", (event) => {
  const pageItem = event.target.closest(".page-item");
  if (!pageItem) return;

  const pageId = pageItem.dataset.pageId;
  window.location.href = `add-page.html?pageId=${pageId}&baseId=${baseId}`;
});

// Проверка авторизации
onAuthStateChanged(auth, async user => {
  if (user) {
    document.getElementById('app').style.display = 'block';
    loginMessage.style.display = 'none';

    await loadStatuses();
    await loadPages();
  } else {
    document.getElementById('app').style.display = 'none';
    loginMessage.style.display = 'block';
  }
});
