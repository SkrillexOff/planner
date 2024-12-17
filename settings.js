import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";

// Firebase инициализация
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

// Получение baseId из URL
const urlParams = new URLSearchParams(window.location.search);
const baseId = urlParams.get("baseId");
if (!baseId) {
  alert("Ошибка: baseId не указан в URL.");
  window.location.href = "index.html";
}

// Элементы страницы
const backBtn = document.getElementById('back-btn');
const statusList = document.getElementById('status-list');
const newStatusInput = document.getElementById('new-status');
const addStatusBtn = document.getElementById('add-status-btn');

// Переход назад
backBtn.addEventListener('click', () => {
  window.location.href = `index.html?baseId=${baseId}`
});

// Загрузка статусов из базы данных
async function loadStatuses() {
  const user = auth.currentUser;
  if (!user) return;

  const baseRef = doc(db, `users/${user.uid}/bases/${baseId}`);
  const baseSnap = await getDoc(baseRef);

  if (baseSnap.exists()) {
    const statuses = baseSnap.data().statuses || {}; // Получаем объект статусов
    const statusesArray = Object.entries(statuses).map(([id, data]) => ({ id, ...data }));

    // Сортируем статусы по полю `order`
    statusesArray.sort((a, b) => a.order - b.order);

    renderStatuses(statusesArray);
  } else {
    alert("База не найдена.");
    window.location.href = "index.html";
  }
}

// Рендеринг списка статусов
function renderStatuses(statuses) {
  statusList.innerHTML = '';
  statuses.forEach((status, index) => {
    const statusItem = document.createElement('li');
    statusItem.dataset.id = status.id;

    statusItem.innerHTML = `
      <span>${status.name}</span>
      <button class="edit-status-btn">✏️</button>
      <button class="delete-status-btn">🗑️</button>
      <button class="move-up-btn">↑</button>
      <button class="move-down-btn">↓</button>
    `;

    // Обработчики кнопок
    statusItem.querySelector('.edit-status-btn').addEventListener('click', () => {
      const newName = prompt('Введите новое имя статуса:', status.name);
      if (newName && newName.trim() !== '') {
        editStatus(status.id, newName.trim());
      }
    });

    statusItem.querySelector('.delete-status-btn').addEventListener('click', () => {
      if (confirm(`Удалить статус "${status.name}"?`)) {
        deleteStatus(status.id);
      }
    });

    statusItem.querySelector('.move-up-btn').addEventListener('click', () => {
      if (index > 0) {
        swapOrders(statuses, index, index - 1);
      }
    });

    statusItem.querySelector('.move-down-btn').addEventListener('click', () => {
      if (index < statuses.length - 1) {
        swapOrders(statuses, index, index + 1);
      }
    });

    statusList.appendChild(statusItem);
  });
}

// Добавление нового статуса
addStatusBtn.addEventListener('click', async () => {
  const newStatus = newStatusInput.value.trim();
  if (newStatus) {
    const user = auth.currentUser;
    if (!user) return;

    const baseRef = doc(db, `users/${user.uid}/bases/${baseId}`);
    const baseSnap = await getDoc(baseRef);

    if (baseSnap.exists()) {
      const statuses = baseSnap.data().statuses || {};
      const newId = `${Date.now()}`; // Генерируем уникальный id
      const newOrder = Object.keys(statuses).length;

      statuses[newId] = { name: newStatus, order: newOrder };

      await updateDoc(baseRef, { statuses });
      newStatusInput.value = '';
      loadStatuses();
    } else {
      alert("База не найдена.");
      window.location.href = "index.html";
    }
  }
});

// Редактирование статуса
async function editStatus(id, newName) {
  const user = auth.currentUser;
  if (!user) return;

  const baseRef = doc(db, `users/${user.uid}/bases/${baseId}`);
  const baseSnap = await getDoc(baseRef);

  if (baseSnap.exists()) {
    const statuses = baseSnap.data().statuses || {};
    if (statuses[id]) {
      statuses[id].name = newName;
      await updateDoc(baseRef, { statuses });
      loadStatuses();
    }
  }
}

// Удаление статуса
async function deleteStatus(id) {
  const user = auth.currentUser;
  if (!user) return;

  const baseRef = doc(db, `users/${user.uid}/bases/${baseId}`);
  const baseSnap = await getDoc(baseRef);

  if (baseSnap.exists()) {
    const statuses = baseSnap.data().statuses || {};
    if (statuses[id]) {
      delete statuses[id];
      await updateDoc(baseRef, { statuses });
      loadStatuses();
    }
  }
}

// Обновление порядка статусов
async function swapOrders(statuses, fromIndex, toIndex) {
  const user = auth.currentUser;
  if (!user) return;

  const baseRef = doc(db, `users/${user.uid}/bases/${baseId}`);
  const baseSnap = await getDoc(baseRef);

  if (baseSnap.exists()) {
    const statusesMap = baseSnap.data().statuses || {};
    const fromStatus = statuses[fromIndex];
    const toStatus = statuses[toIndex];

    // Меняем порядок местами
    const tempOrder = fromStatus.order;
    fromStatus.order = toStatus.order;
    toStatus.order = tempOrder;

    statusesMap[fromStatus.id] = fromStatus;
    statusesMap[toStatus.id] = toStatus;

    await updateDoc(baseRef, { statuses: statusesMap });
    loadStatuses();
  }
}

// Проверка авторизации
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadStatuses();
  } else {
    alert("Вы не авторизованы!");
    window.location.href = 'auth.html';
  }
});
