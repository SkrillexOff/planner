import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

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

// Функция для добавления свойства
function addProperty(property) {
  properties.push(property);

  // Обновляем список свойств
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

// Функция для открытия модального окна выбора статуса
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

  // Добавление свойства "Статус" через выбор статуса
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

// Обработчик для изменения существующего статуса
propertiesContainer.addEventListener('click', (event) => {
  const target = event.target.closest('.property-item');
  if (target && target.dataset.type === 'status') {
    openStatusModal(newStatus => {
      target.innerHTML = `<strong>Статус:</strong> ${newStatus}`;
      target.dataset.value = newStatus;
    });
  }
});

// Сохранение страницы
saveButton.addEventListener('click', async () => {
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
});

// Проверка авторизации
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'auth.html';
  }
});
