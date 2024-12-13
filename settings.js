import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";
import { getFirestore, collection, getDocs, setDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";

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

// Элементы страницы
const backBtn = document.getElementById('back-btn');
const statusList = document.getElementById('status-list');
const newStatusInput = document.getElementById('new-status');
const addStatusBtn = document.getElementById('add-status-btn');

// Переход назад
backBtn.addEventListener('click', () => {
  window.location.href = 'index.html';
});

// Загрузка статусов из базы данных
async function loadStatuses() {
  const user = auth.currentUser;
  if (!user) return;

  const statusesRef = collection(db, `users/${user.uid}/statuses`);
  const statusesSnapshot = await getDocs(statusesRef);

  const statuses = statusesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // Сортируем статусы по полю `order`
  statuses.sort((a, b) => a.order - b.order);

  renderStatuses(statuses);
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

    const statusesRef = collection(db, `users/${user.uid}/statuses`);
    const statusesSnapshot = await getDocs(statusesRef);

    const newOrder = statusesSnapshot.docs.length;

    await setDoc(doc(statusesRef), { name: newStatus, order: newOrder });
    newStatusInput.value = '';
    loadStatuses();
  }
});

// Редактирование статуса
async function editStatus(id, newName) {
  const user = auth.currentUser;
  if (!user) return;

  const statusRef = doc(db, `users/${user.uid}/statuses`, id);
  await setDoc(statusRef, { name: newName }, { merge: true });

  loadStatuses();
}

// Удаление статуса
async function deleteStatus(id) {
  const user = auth.currentUser;
  if (!user) return;

  const statusRef = doc(db, `users/${user.uid}/statuses`, id);
  await deleteDoc(statusRef);

  loadStatuses();
}

// Обновление порядка статусов
async function swapOrders(statuses, fromIndex, toIndex) {
  const user = auth.currentUser;
  if (!user) return;

  const fromStatus = statuses[fromIndex];
  const toStatus = statuses[toIndex];

  // Меняем порядок в базе данных
  const fromStatusRef = doc(db, `users/${user.uid}/statuses`, fromStatus.id);
  const toStatusRef = doc(db, `users/${user.uid}/statuses`, toStatus.id);

  await setDoc(fromStatusRef, { order: toIndex }, { merge: true });
  await setDoc(toStatusRef, { order: fromIndex }, { merge: true });

  loadStatuses();
}

// Проверка авторизации
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadStatuses();
  } else {
    alert("Вы не авторизованы!");
    window.location.href = 'login.html';
  }
});
