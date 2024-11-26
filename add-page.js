import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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
const db = getFirestore(app);
const auth = getAuth(app);

// DOM элементы
const titleInput = document.getElementById('page-title');
const saveButton = document.getElementById('save-page-btn');
const addPropertyButton = document.getElementById('add-property-btn');
const propertiesContainer = document.getElementById('properties-container');

// Локальное хранилище свойств
let properties = [];

// Получение ID страницы из URL
const urlParams = new URLSearchParams(window.location.search);
const pageId = urlParams.get('pageId');

// Проверка авторизации
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'auth.html';
  } else if (pageId) {
    loadPageData(pageId); // Загружаем данные для редактирования
  }
});

// Функция для загрузки данных страницы
async function loadPageData(pageId) {
  if (!pageId) return;

  const docRef = doc(db, 'pages', pageId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const pageData = docSnap.data();
    titleInput.value = pageData.title || '';
    properties = pageData.properties || [];

    // Отображение свойств
    propertiesContainer.innerHTML = '';
    properties.forEach(addProperty);
  } else {
    alert('Страница не найдена.');
    window.location.href = 'index.html';
  }
}

// Функция для добавления нового свойства
function addProperty(property) {
  properties.push(property);

  const propertyElement = document.createElement('div');
  propertyElement.classList.add('property-item');
  propertyElement.dataset.type = property.type;
  propertyElement.dataset.value = property.value;

  if (property.type === 'text') {
    propertyElement.innerHTML = `<strong>Текст:</strong> ${property.value}`;
  } else if (property.type === 'status') {
    propertyElement.innerHTML = `<strong>Статус:</strong> ${property.value}`;
  }

  propertiesContainer.appendChild(propertyElement);
}

// Функция для добавления новой страницы
async function addPage() {
  const title = titleInput.value.trim();

  if (!title) {
    alert('Введите название страницы.');
    return;
  }

  const user = auth.currentUser;
  if (user) {
    await addDoc(collection(db, 'pages'), {
      title,
      properties,
      userUID: user.uid,
      createdAt: serverTimestamp()
    });
    alert('Страница успешно добавлена!');
    window.location.href = 'index.html';
  } else {
    alert('Ошибка авторизации.');
  }
}

// Функция для обновления существующей страницы
async function updatePage(pageId) {
  const title = titleInput.value.trim();

  if (!title) {
    alert('Введите название страницы.');
    return;
  }

  const pageRef = doc(db, 'pages', pageId);
  await updateDoc(pageRef, {
    title,
    properties,
  });

  alert('Страница успешно обновлена!');
  window.location.href = 'index.html';
}

// Обработчик кнопки сохранения
saveButton.addEventListener('click', async () => {
  if (pageId) {
    // Обновляем существующую страницу
    await updatePage(pageId);
  } else {
    // Создаем новую страницу
    await addPage();
  }
});

// Обработчик кнопки "Добавить свойство"
addPropertyButton.addEventListener('click', () => {
  const propertyModal = document.createElement('div');
  propertyModal.classList.add('modal');

  propertyModal.innerHTML = `
    <div class="modal-content">
      <h3>Добавить свойство</h3>
      <button id="add-text-property">Текст</button>
      <button id="add-status-property">Статус</button>
      <button id="close-modal">Закрыть</button>
    </div>
  `;

  document.body.appendChild(propertyModal);

  // Добавление свойства "Текст"
  document.getElementById('add-text-property').addEventListener('click', () => {
    const textValue = prompt('Введите текст:');
    if (textValue) {
      addProperty({ type: 'text', value: textValue });
    }
    propertyModal.remove();
  });

  // Добавление свойства "Статус"
  document.getElementById('add-status-property').addEventListener('click', () => {
    propertyModal.remove();
    openStatusModal(selectedStatus => {
      addProperty({ type: 'status', value: selectedStatus });
    });
  });

  // Закрытие модального окна
  document.getElementById('close-modal').addEventListener('click', () => {
    propertyModal.remove();
  });
});

// Функция для открытия модального окна статуса
function openStatusModal(callback) {
  const statusModal = document.createElement('div');
  statusModal.classList.add('modal');

  statusModal.innerHTML = `
    <div class="modal-content">
      <h3>Выберите статус</h3>
      <button class="status-option" data-status="нужно сделать">Нужно сделать</button>
      <button class="status-option" data-status="в работе">В работе</button>
      <button class="status-option" data-status="готово">Готово</button>
      <button id="close-status-modal">Закрыть</button>
    </div>
  `;

  document.body.appendChild(statusModal);

  // Обработчик выбора статуса
  statusModal.querySelectorAll('.status-option').forEach(button => {
    button.addEventListener('click', () => {
      const selectedStatus = button.getAttribute('data-status');
      callback(selectedStatus);
      statusModal.remove();
    });
  });

  // Обработчик закрытия модального окна
  statusModal.querySelector('#close-status-modal').addEventListener('click', () => {
    statusModal.remove();
  });
}
