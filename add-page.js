// add-page.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

// Элементы DOM
const savePageBtn = document.getElementById('save-page-btn');
const cancelBtn = document.getElementById('cancel-btn');
const pageTitleInput = document.getElementById('page-title');
const addPropertyBtn = document.getElementById('add-property-btn');
const propertiesContainer = document.getElementById('properties-container');
const propertyModal = document.getElementById('property-modal');
const closeModalBtn = document.getElementById('close-modal');

// Массив для хранения свойств
const pageProperties = [];

// Функция для добавления текстового свойства
function addTextProperty() {
  const propertyId = `property-${Date.now()}`; // Уникальный ID для свойства
  const propertyElement = document.createElement('div');
  propertyElement.classList.add('property-item');
  propertyElement.innerHTML = `
    <label for="${propertyId}">Текст:</label>
    <input type="text" id="${propertyId}" class="property-input" placeholder="Введите текст">
  `;
  propertiesContainer.appendChild(propertyElement);

  // Сохраняем свойство в массив
  pageProperties.push({
    type: 'text',
    id: propertyId,
  });
}

// Функция для сохранения страницы
async function savePage() {
  const title = pageTitleInput.value;

  if (!title) {
    alert('Введите название страницы!');
    return;
  }

  const user = auth.currentUser;
  if (user) {
    try {
      // Сохраняем свойства из DOM
      const properties = pageProperties.map((prop) => {
        const inputElement = document.getElementById(prop.id);
        return {
          type: prop.type,
          value: inputElement ? inputElement.value : '',
        };
      });

      // Добавляем страницу в Firestore
      await addDoc(collection(db, "pages"), {
        title: title,
        properties: properties,
        userUID: user.uid,
        createdAt: serverTimestamp(),
      });

      window.location.href = "index.html";
    } catch (e) {
      console.error("Ошибка при добавлении страницы: ", e);
    }
  } else {
    console.log("Пользователь не авторизован");
  }
}

// Открытие модального окна
addPropertyBtn.addEventListener('click', () => {
  propertyModal.style.display = 'block';
});

// Закрытие модального окна
closeModalBtn.addEventListener('click', () => {
  propertyModal.style.display = 'none';
});

// Обработчик выбора свойства
propertyModal.addEventListener('click', (event) => {
  if (event.target.classList.contains('property-option')) {
    const type = event.target.getAttribute('data-type');
    if (type === 'text') {
      addTextProperty();
    }
    propertyModal.style.display = 'none';
  }
});

// Сохранение страницы
savePageBtn.addEventListener('click', savePage);

// Отмена
cancelBtn.addEventListener('click', () => {
  window.location.href = "index.html";
});
