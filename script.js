// Firebase конфигурация

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBYI_LCb4mld3VEfIOU9D49gLV81gKTovE",
  authDomain: "taskcalendarapp-bf3b3.firebaseapp.com",
  projectId: "taskcalendarapp-bf3b3",
  storageBucket: "taskcalendarapp-bf3b3.firebasestorage.app",
  messagingSenderId: "482463811896",
  appId: "1:482463811896:web:11700779551db85f8c59cd",
  measurementId: "G-4V1NYWDVKF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);

// Проверка, инициализирован ли Firebase
console.log("Firebase инициализирован:", firebase.apps.length > 0);

// Сервисы Firebase
const auth = firebase.auth();
const db = firebase.firestore();

const calendarEl = document.getElementById('calendar');
const taskModal = document.getElementById('taskModal');
const authModal = document.getElementById('authModal');
const taskInput = document.getElementById('taskInput');
const addTaskButton = document.getElementById('addTaskButton');
const loginButton = document.getElementById('loginButton');
const registerButton = document.getElementById('registerButton');
const closeBtns = document.querySelectorAll('.close-btn');

let selectedDate = null;

// Открытие модального окна задач
function openTaskModal(date) {
  selectedDate = date;
  taskModal.classList.add('show');
  taskInput.value = '';
  taskInput.focus();
  console.log("Модальное окно для добавления задачи открыто. Дата:", selectedDate);
}

// Закрытие модальных окон
function closeModal() {
  taskModal.classList.remove('show');
  authModal.classList.remove('show');
}

// Добавляем события для закрытия окон
closeBtns.forEach(btn => btn.onclick = closeModal);
window.onclick = (event) => {
  if (event.target === taskModal || event.target === authModal) closeModal();
};

// Функции регистрации и входа
registerButton.onclick = async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  try {
    await auth.createUserWithEmailAndPassword(email, password);
    console.log("Регистрация успешна для пользователя:", email);
    alert('Регистрация успешна!');
    closeModal();
  } catch (error) {
    console.error("Ошибка регистрации:", error.message);
    alert(`Ошибка регистрации: ${error.message}`);
  }
};

loginButton.onclick = async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  try {
    await auth.signInWithEmailAndPassword(email, password);
    console.log("Вход выполнен для пользователя:", email);
    alert('Вход выполнен успешно!');
    closeModal();
  } catch (error) {
    console.error("Ошибка входа:", error.message);
    alert(`Ошибка входа: ${error.message}`);
  }
};

// Инициализация календаря
function createCalendar() {
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const day = new Date(today);
    day.setDate(today.getDate() + i);

    const dayEl = document.createElement('div');
    dayEl.classList.add('calendar-day');
    dayEl.dataset.date = formatDateISO(day);

    const dayHeader = document.createElement('div');
    dayHeader.classList.add('day-header');

    const dayDate = document.createElement('div');
    dayDate.classList.add('day-date');
    dayDate.innerHTML = `${day.getDate()} ${day.toLocaleString('ru-RU', { month: 'long' })}`;

    const dayWeekday = document.createElement('div');
    dayWeekday.classList.add('day-weekday');
    dayWeekday.textContent = day.toLocaleString('ru-RU', { weekday: 'long' });

    dayHeader.appendChild(dayDate);
    dayHeader.appendChild(dayWeekday);
    dayEl.appendChild(dayHeader);

    const taskList = document.createElement('ul');
    taskList.classList.add('tasks-list');
    dayEl.appendChild(taskList);

    // Кнопка добавления задачи
    const addTaskBtn = document.createElement('button');
    addTaskBtn.classList.add('add-task-btn');
    addTaskBtn.innerHTML = '<i class="fas fa-plus"></i> Добавить задачу';
    addTaskBtn.onclick = () => openTaskModal(formatDateISO(day));
    dayEl.appendChild(addTaskBtn);

    calendarEl.appendChild(dayEl);
  }
}

// Форматирование даты в ISO
function formatDateISO(date) {
  return date.toISOString().split('T')[0];
}

// Сохранение задач в Firestore
addTaskButton.onclick = async () => {
  const taskText = taskInput.value.trim();
  if (taskText && selectedDate) {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("Пользователь не авторизован");
        return alert("Авторизуйтесь, чтобы добавлять задачи.");
      }
      await db.collection('tasks').add({
        date: selectedDate,
        text: taskText,
        done: false,
        userId: user.uid,
      });
      console.log("Задача добавлена в Firestore:", { date: selectedDate, text: taskText });
      alert('Задача добавлена!');
      closeModal();
    } catch (error) {
      console.error("Ошибка при добавлении задачи:", error.message);
      alert(`Ошибка при добавлении задачи: ${error.message}`);
    }
  } else {
    console.warn("Пустой текст задачи или не выбрана дата.");
  }
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
  auth.onAuthStateChanged(user => {
    if (user) {
      console.log("Пользователь авторизован:", user.email);
      createCalendar();
    } else {
      console.log("Пользователь не авторизован, показываем окно авторизации.");
      authModal.classList.add('show');
    }
  });
});
