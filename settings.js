import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";

// Инициализация Firebase
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

// Функция для перехода назад на главную страницу
backBtn.addEventListener('click', () => {
  window.location.href = 'index.html';
});

// Загрузка статусов из Firebase
async function loadStatuses() {
  const user = auth.currentUser;
  if (!user) return;

  const statusesRef = collection(db, `users/${user.uid}/statuses`);
  const statusesSnapshot = await getDocs(statusesRef);
  
  const statuses = statusesSnapshot.docs.map(doc => doc.data().name);
  renderStatuses(statuses);
}

// Рендеринг списка статусов
function renderStatuses(statuses) {
  statusList.innerHTML = '';
  statuses.forEach((status, index) => {
    const statusItem = document.createElement('li');
    statusItem.classList.add('draggable');
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

// Редактирование статуса
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

  await updatePageStatuses(oldName, newName); // Обновляем статусы в страницах
  loadStatuses(); // Перезагружаем список статусов
}

// Удаление статуса
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

  loadStatuses(); // Перезагружаем список статусов
}

// Обновление статусов в страницах
async function updatePageStatuses(oldStatus, newStatus) {
  const user = auth.currentUser;
  if (!user) return;

  const pagesRef = collection(db, `users/${user.uid}/pages`);
  const pagesSnapshot = await getDocs(pagesRef);

  pagesSnapshot.forEach(async docSnapshot => {
    const pageData = docSnapshot.data();
    const statusProperty = pageData.properties.find(prop => prop.type === 'status');
    
    if (statusProperty && statusProperty.value === oldStatus) {
      statusProperty.value = newStatus;
      await setDoc(docSnapshot.ref, { properties: pageData.properties }, { merge: true });
    }
  });
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
