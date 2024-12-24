import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, setDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";

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

const participantList = document.getElementById('participant-list');
const newParticipantInput = document.getElementById('new-participant');
const addParticipantBtn = document.getElementById('add-participant-btn');

// Переход назад
backBtn.addEventListener('click', () => {
  window.location.href = `index.html?baseId=${baseId}`;
});

// Загрузка статусов из базы данных
async function loadStatuses() {
  const user = auth.currentUser;
  if (!user) return;

  const baseRef = doc(db, `bases/${baseId}`);
  const baseSnap = await getDoc(baseRef);

  if (baseSnap.exists()) {
    const statusRefs = baseSnap.data().statuses || {}; // Получаем ссылки на статусы
    const statusPromises = Object.keys(statusRefs).map(async (statusId) => {
      const statusDoc = await getDoc(doc(db, `statuses/${statusId}`));
      return statusDoc.exists() ? { id: statusId, ...statusDoc.data() } : null;
    });

    const statusesArray = (await Promise.all(statusPromises)).filter(Boolean);

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

    const newStatusRef = await addDoc(collection(db, 'statuses'), {
      name: newStatus,
      order: 0 // временно ставим 0, обновим позже
    });

    const baseRef = doc(db, `bases/${baseId}`);
    const baseSnap = await getDoc(baseRef);

    if (baseSnap.exists()) {
      const statuses = baseSnap.data().statuses || {};

      // Добавляем новый статус в базу
      statuses[newStatusRef.id] = null;
      await updateDoc(baseRef, { statuses });

      // Обновляем order нового статуса
      const newOrder = Object.keys(statuses).length - 1;
      await updateDoc(newStatusRef, { order: newOrder });

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

  const statusRef = doc(db, `statuses/${id}`);
  await updateDoc(statusRef, { name: newName });
  loadStatuses();
}

// Удаление статуса
async function deleteStatus(id) {
  const user = auth.currentUser;
  if (!user) return;

  const baseRef = doc(db, `bases/${baseId}`);
  const baseSnap = await getDoc(baseRef);

  if (baseSnap.exists()) {
    const statuses = baseSnap.data().statuses || {};
    if (statuses[id] !== undefined) {
      delete statuses[id];
      await updateDoc(baseRef, { statuses });

      // Удаляем статус из коллекции
      const statusRef = doc(db, `statuses/${id}`);
      await updateDoc(statusRef, null); // Удаление из базы
      loadStatuses();
    }
  }
}

// Обновление порядка статусов
async function swapOrders(statuses, fromIndex, toIndex) {
  const fromStatus = statuses[fromIndex];
  const toStatus = statuses[toIndex];

  const fromStatusRef = doc(db, `statuses/${fromStatus.id}`);
  const toStatusRef = doc(db, `statuses/${toStatus.id}`);

  // Меняем порядок местами
  const tempOrder = fromStatus.order;
  await updateDoc(fromStatusRef, { order: toStatus.order });
  await updateDoc(toStatusRef, { order: tempOrder });

  loadStatuses();
}


// Загрузка участников из базы данных
async function loadParticipants() {
  const user = auth.currentUser;
  if (!user) return;

  const baseRef = doc(db, `bases/${baseId}`);
  const baseSnap = await getDoc(baseRef);

  if (baseSnap.exists()) {
    const sharedWith = baseSnap.data().sharedWith || {}; // Получаем список участников
    renderParticipants(Object.keys(sharedWith));
  }
}

// Рендеринг списка участников
function renderParticipants(participants) {
  participantList.innerHTML = '';
  participants.forEach(participant => {
    const participantItem = document.createElement('li');
    participantItem.textContent = participant;

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Удалить';
    removeBtn.addEventListener('click', () => removeParticipant(participant));

    participantItem.appendChild(removeBtn);
    participantList.appendChild(participantItem);
  });
}

// Добавление нового участника
addParticipantBtn.addEventListener('click', async () => {
  const newParticipant = newParticipantInput.value.trim();
  if (newParticipant) {
    const user = auth.currentUser;
    if (!user) return;

    const baseRef = doc(db, `bases/${baseId}`);
    const baseSnap = await getDoc(baseRef);

    if (baseSnap.exists()) {
      const sharedWith = baseSnap.data().sharedWith || {};
      sharedWith[newParticipant] = null;

      await updateDoc(baseRef, { sharedWith });

      // Добавляем в joinedAt пользователя
      const userRef = doc(db, `users/${newParticipant}`);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Если пользователя еще нет в коллекции users, создаем документ
        await setDoc(userRef, { joinedAt: { [baseId]: null } });
      } else {
        // Если пользователь уже существует, обновляем его joinedAt
        const joinedAt = userSnap.data().joinedAt || {};
        joinedAt[baseId] = null;
        await updateDoc(userRef, { joinedAt });
      }

      newParticipantInput.value = '';
      loadParticipants();
    }
  }
});

// Удаление участника
async function removeParticipant(participant) {
  const user = auth.currentUser;
  if (!user) return;

  const baseRef = doc(db, `bases/${baseId}`);
  const baseSnap = await getDoc(baseRef);

  if (baseSnap.exists()) {
    const sharedWith = baseSnap.data().sharedWith || {};
    if (sharedWith[participant] !== undefined) {
      delete sharedWith[participant];
      await updateDoc(baseRef, { sharedWith });

      // Удаляем baseId из joinedAt пользователя
      const userRef = doc(db, `users/${participant}`);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const joinedAt = userSnap.data().joinedAt || {};
        delete joinedAt[baseId];
        await updateDoc(userRef, { joinedAt });
      }

      loadParticipants();
    }
  }
}


// Проверка авторизации
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadStatuses();
    loadParticipants();
  } else {
    alert("Вы не авторизованы!");
    window.location.href = 'auth.html';
  }
});
