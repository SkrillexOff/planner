import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, query, where, orderBy, doc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";


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
const settingsModal = document.getElementById('status-settings-modal');
const statusList = document.getElementById('status-list');
const addStatusBtn = document.getElementById('add-status-btn');
const closeSettingsModalBtn = document.getElementById('close-settings-modal');
const newStatusInput = document.getElementById('new-status');
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

// Обработка кнопки "Добавить страницу"
addPageBtn.addEventListener('click', () => {
  window.location.href = 'add-page.html';
});

// Открытие модального окна настроек
settingsBtn.addEventListener('click', () => {
  settingsModal.style.display = 'block';
  loadStatuses();
});

// Закрытие модального окна
closeSettingsModalBtn.addEventListener('click', () => {
  settingsModal.style.display = 'none';
});

// Загрузка статусов из Firebase
async function loadStatuses() {
  const user = auth.currentUser;
  if (!user) return;

  const statusesRef = collection(db, `users/${user.uid}/statuses`);
  const statusesSnapshot = await getDocs(statusesRef);

  statuses = statusesSnapshot.docs.map(doc => doc.data().name);
  renderStatuses();
  renderStatusTabs();
}

// Рендеринг списка статусов
function renderStatuses() {
  statusList.innerHTML = '';
  statuses.forEach((status, index) => {
    const statusItem = document.createElement('li');
    statusItem.classList.add('draggable');
    statusItem.draggable = true;
    statusItem.dataset.index = index;

    statusItem.innerHTML = `
      <span>${status}</span>
      <button class="edit-status-btn">✏️</button>
      <button class="delete-status-btn">🗑️</button>
    `;

    statusItem.querySelector('.edit-status-btn').addEventListener('click', () => {
      const newName = prompt('Введите новое имя статуса:', status);
      if (newName && newName.trim() !== '') {
        editStatus(status, newName.trim());
      }
    });

    statusItem.querySelector('.delete-status-btn').addEventListener('click', () => {
      if (confirm(`Удалить статус "${status}"?`)) {
        deleteStatus(status);
      }
    });

    statusItem.addEventListener('dragstart', handleDragStart);
    statusItem.addEventListener('dragover', handleDragOver);
    statusItem.addEventListener('drop', handleDrop);
    statusItem.addEventListener('dragend', handleDragEnd);

    statusList.appendChild(statusItem);
  });
}


// Добавление нового статуса
addStatusBtn.addEventListener('click', async () => {
  const newStatus = newStatusInput.value.trim();
  if (newStatus) {
    const user = auth.currentUser;
    if (!user) return;

    await addDoc(collection(db, `users/${user.uid}/statuses`), { name: newStatus });
    newStatusInput.value = ''; // Очистка поля ввода
    loadStatuses(); // Перезагружаем список статусов
  }
});

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

// Создание стандартных статусов для нового пользователя
async function createDefaultStatuses(user) {
  const statusesRef = collection(db, `users/${user.uid}/statuses`);
  const statusesSnapshot = await getDocs(statusesRef);

  if (statusesSnapshot.empty) {
    const defaultStatuses = ["нужно сделать", "в работе", "готово"];
    for (const status of defaultStatuses) {
      await addDoc(statusesRef, { name: status });
    }
  }
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

// Проверка авторизации
onAuthStateChanged(auth, async user => {
  if (user) {
    document.getElementById('app').style.display = 'block';
    loginMessage.style.display = 'none';

    await createDefaultStatuses(user);
    await loadStatuses();
    await loadPages();
  } else {
    document.getElementById('app').style.display = 'none';
    loginMessage.style.display = 'block';
  }
});


async function editStatus(oldName, newName) {
  const user = auth.currentUser;
  if (!user) return;

  const statusesRef = collection(db, `users/${user.uid}/statuses`);
  const statusesSnapshot = await getDocs(statusesRef);

  statusesSnapshot.forEach(async docSnapshot => {
    if (docSnapshot.data().name === oldName) {
      await setDoc(docSnapshot.ref, { name: newName }, { merge: true });
    }
  });

  await updatePageStatuses(oldName, newName); // Обновляем статус страниц
  loadStatuses();
}

async function deleteStatus(statusName) {
  const user = auth.currentUser;
  if (!user) return;

  const statusesRef = collection(db, `users/${user.uid}/statuses`);
  const statusesSnapshot = await getDocs(statusesRef);

  statusesSnapshot.forEach(async docSnapshot => {
    if (docSnapshot.data().name === statusName) {
      await deleteDoc(docSnapshot.ref);
    }
  });

  await updatePageStatuses(statusName, null); // Удаляем статус из страниц
  loadStatuses();
}

async function updatePageStatuses(oldStatus, newStatus) {
  const user = auth.currentUser;
  if (!user) return;

  const pagesQuery = query(
    collection(db, `users/${user.uid}/pages`),
    where("properties", "array-contains", { type: "status", value: oldStatus })
  );

  const pagesSnapshot = await getDocs(pagesQuery);

  pagesSnapshot.forEach(async pageDoc => {
    const pageData = pageDoc.data();
    const updatedProperties = pageData.properties.map(prop => {
      if (prop.type === "status" && prop.value === oldStatus) {
        return { ...prop, value: newStatus }; // Заменяем старый статус на новый
      }
      return prop;
    }).filter(prop => prop.value !== null); // Убираем удалённые статусы

    await setDoc(doc(db, `users/${user.uid}/pages`, pageDoc.id), {
      ...pageData,
      properties: updatedProperties
    });
  });

  loadPages(); // Перезагружаем страницы
}


let dragStartIndex;

function handleDragStart(e) {
  dragStartIndex = +e.target.dataset.index;
  e.target.classList.add('dragging');
}

function handleDragOver(e) {
  e.preventDefault();
}

function handleDrop(e) {
  const dragEndIndex = +e.target.dataset.index;
  [statuses[dragStartIndex], statuses[dragEndIndex]] = [statuses[dragEndIndex], statuses[dragStartIndex]];
  saveStatusOrder();
  renderStatuses();
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging');
}

async function saveStatusOrder() {
  const user = auth.currentUser;
  if (!user) return;

  const statusesRef = collection(db, `users/${user.uid}/statuses`);
  const statusesSnapshot = await getDocs(statusesRef);

  statusesSnapshot.forEach(async (docSnapshot, index) => {
    await setDoc(docSnapshot.ref, { name: statuses[index] }, { merge: true });
  });
}