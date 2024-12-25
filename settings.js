import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";
import { getFirestore, doc, getDoc, getDocs, updateDoc, deleteDoc, setDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";

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

const loader = document.getElementById('loader');

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
    const statusRefs = baseSnap.data().statuses || {};
    const statusPromises = Object.keys(statusRefs).map(async (statusId) => {
      const statusDoc = await getDoc(doc(db, `statuses/${statusId}`));
      return statusDoc.exists() ? { id: statusId, ...statusDoc.data() } : null;
    });

    const statusesArray = (await Promise.all(statusPromises)).filter(Boolean);
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
        deleteStatus(status.id, statuses);
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
    const baseRef = doc(db, `bases/${baseId}`);
    const baseSnap = await getDoc(baseRef);

    if (baseSnap.exists()) {
      const statuses = baseSnap.data().statuses || {};
      const newOrder = Object.keys(statuses).length;

      const newStatusRef = await addDoc(collection(db, 'statuses'), {
        name: newStatus,
        order: newOrder
      });

      statuses[newStatusRef.id] = null;
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
  const statusRef = doc(db, `statuses/${id}`);
  await updateDoc(statusRef, { name: newName });
  loadStatuses();
}

// Удаление статуса с обновлением порядка
async function deleteStatus(id, statuses) {
  const baseRef = doc(db, `bases/${baseId}`);
  const baseSnap = await getDoc(baseRef);

  if (baseSnap.exists()) {
    const statusesData = baseSnap.data().statuses || {};
    delete statusesData[id];
    await updateDoc(baseRef, { statuses: statusesData });

    await deleteDoc(doc(db, `statuses/${id}`));

    // Обновляем порядок оставшихся статусов
    const updatedStatuses = statuses.filter((status) => status.id !== id);
    for (let i = 0; i < updatedStatuses.length; i++) {
      const statusRef = doc(db, `statuses/${updatedStatuses[i].id}`);
      await updateDoc(statusRef, { order: i });
    }

    loadStatuses();
  }
}

// Обновление порядка статусов
async function swapOrders(statuses, fromIndex, toIndex) {
  const fromStatus = statuses[fromIndex];
  const toStatus = statuses[toIndex];

  const fromStatusRef = doc(db, `statuses/${fromStatus.id}`);
  const toStatusRef = doc(db, `statuses/${toStatus.id}`);

  const tempOrder = fromStatus.order;
  await updateDoc(fromStatusRef, { order: toStatus.order });
  await updateDoc(toStatusRef, { order: tempOrder });

  loadStatuses();
}

// Загрузка участников с отображением email и владельца базы
async function loadParticipants() {
  const user = auth.currentUser;
  if (!user) return;

  const baseRef = doc(db, `bases/${baseId}`);
  const baseSnap = await getDoc(baseRef);

  if (baseSnap.exists()) {
    const sharedWith = baseSnap.data().sharedWith || {}; // Список участников
    const ownerId = baseSnap.data().owner; // Владелец базы

    const userIds = [...Object.keys(sharedWith), ownerId];
    const userPromises = userIds.map(async (userId) => {
      const userDoc = await getDoc(doc(db, `users/${userId}`));
      return userDoc.exists() ? { id: userId, email: userDoc.data().email || "Неизвестно" } : null;
    });

    const users = (await Promise.all(userPromises)).filter(Boolean);

    renderParticipants(users, ownerId);
  }
}

// Рендеринг списка участников с email
function renderParticipants(users, ownerId) {
  participantList.innerHTML = '';
  users.forEach((user) => {
    const participantItem = document.createElement('li');
    participantItem.textContent = user.email;

    if (user.id === ownerId) {
      participantItem.textContent += ' (Владелец)';
    } else {
      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Удалить';
      removeBtn.addEventListener('click', () => removeParticipant(user.id));

      participantItem.appendChild(removeBtn);
    }

    participantList.appendChild(participantItem);
  });
}

// Добавление нового участника по email или ID
addParticipantBtn.addEventListener('click', async () => {
  const input = newParticipantInput.value.trim();
  if (input) {
    const user = auth.currentUser;
    if (!user) return;

    const baseRef = doc(db, `bases/${baseId}`);
    const baseSnap = await getDoc(baseRef);

    if (baseSnap.exists()) {
      let userId = input;

      // Проверяем, указан ли email вместо ID
      if (input.includes('@')) {
        const usersQuery = collection(db, 'users');
        const userDocs = await getDocs(usersQuery);
        const matchedUser = userDocs.docs.find((doc) => doc.data().email === input);

        if (matchedUser) {
          userId = matchedUser.id;
        } else {
          alert('Пользователь с таким email не найден.');
          return;
        }
      }

      const sharedWith = baseSnap.data().sharedWith || {};
      sharedWith[userId] = null;

      await updateDoc(baseRef, { sharedWith });

      // Обновляем joinedAt у пользователя
      const userRef = doc(db, `users/${userId}`);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Если пользователя еще нет в коллекции users, создаем документ
        await setDoc(userRef, { joinedAt: { [baseId]: null } });
      } else {
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


// Показать лоадер
function showLoader() {
  loader.style.display = 'flex';
}

// Скрыть лоадер
function hideLoader() {
  loader.style.display = 'none';
}

// Включаем лоадер перед загрузкой данных
showLoader();

async function loadData() {
  try {
    await loadStatuses();
    await loadParticipants();
  } catch (error) {
    console.error("Ошибка загрузки данных: ", error);
    alert("Ошибка загрузки данных.");
  } finally {
    hideLoader();
  }
}

// Запуск загрузки данных
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadData();
  } else {
    window.location.href = 'auth.html';
  }
});