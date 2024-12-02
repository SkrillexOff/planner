import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, query, orderBy, doc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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

const logoutBtn = document.getElementById('logout-btn');
const settingsBtn = document.getElementById('settings-btn');
const pagesList = document.getElementById('pages-list');
const statusTabs = document.getElementById('status-tabs');
const addPageBtn = document.getElementById('add-page-btn');
const loginMessage = document.getElementById('login-message');

let allPages = [];
let statuses = [];

// Функция для выхода
function logout() {
  signOut(auth).then(() => {
    window.location.href = "auth.html";
  }).catch((error) => {
    console.error('Error:', error.message);
  });
}

logoutBtn.addEventListener('click', logout);

// Открытие страницы настроек
settingsBtn.addEventListener('click', () => {
  window.location.href = 'settings.html';
});

// Открытие страницы добавления новой страницы
addPageBtn.addEventListener('click', () => {
  window.location.href = 'add-page.html';
});

// Загрузка статусов из Firebase
async function loadStatuses() {
  const user = auth.currentUser;
  if (!user) return;

  const statusesRef = collection(db, `users/${user.uid}/statuses`);
  const statusesSnapshot = await getDocs(statusesRef);

  statuses = statusesSnapshot.docs.map(doc => doc.data().name);
  renderStatusTabs();
}

// Рендеринг вкладок статусов
function renderStatusTabs() {
  statusTabs.innerHTML = '';

  statuses.forEach(status => {
    const tab = document.createElement('button');
    tab.classList.add('status-tab');
    tab.textContent = status;
    tab.dataset.status = status;

    tab.addEventListener('click', () => {
      renderPages(status);
    });

    statusTabs.appendChild(tab);
  });

  // Добавляем вкладку "Все"
  const allTab = document.createElement('button');
  allTab.classList.add('status-tab');
  allTab.textContent = "Все";
  allTab.dataset.status = "all";
  allTab.addEventListener('click', () => {
    renderPages('all');
  });

  statusTabs.prepend(allTab);
}

// Загрузка страниц из Firebase
async function loadPages() {
  const user = auth.currentUser;
  if (!user) return;

  const pagesQuery = query(
    collection(db, `users/${user.uid}/pages`),
    orderBy("createdAt")
  );

  const querySnapshot = await getDocs(pagesQuery);
  allPages = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderPages('all');
}

// Рендеринг страниц
function renderPages(filterStatus) {
  pagesList.innerHTML = '';

  const filteredPages = allPages.filter(page => {
    if (filterStatus === 'all') return true;
    const statusProperty = page.properties?.find(prop => prop.type === 'status');
    return statusProperty && statusProperty.value === filterStatus;
  });

  filteredPages.forEach(page => {
    const pageItem = document.createElement('div');
    pageItem.classList.add('page-item');
    pageItem.dataset.pageId = page.id;

    pageItem.innerHTML = `
      <div>
        <h3>${page.title}</h3>
        ${renderPageProperties(page.properties)}
      </div>
    `;

    pagesList.appendChild(pageItem);
  });
}

// Рендеринг свойств страницы
function renderPageProperties(properties) {
  if (!properties || properties.length === 0) return '';
  return properties.map(property => {
    if (property.type === 'text') {
      return `<p><strong>Текст:</strong> ${property.value}</p>`;
    } else if (property.type === 'status') {
      const statusColors = { "нужно сделать": "red", "в работе": "orange", "готово": "green" };
      const color = statusColors[property.value] || "gray";
      return `<p><strong>Статус:</strong> <span class="status-label" style="background-color: ${color};">${property.value}</span></p>`;
    }
    return '';
  }).join('');
}

// Открытие страницы редактирования
pagesList.addEventListener("click", (event) => {
  const pageItem = event.target.closest(".page-item");
  if (!pageItem) return;

  const pageId = pageItem.dataset.pageId;
  window.location.href = `add-page.html?pageId=${pageId}`;
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
