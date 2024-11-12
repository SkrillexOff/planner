// Firebase конфигурация
const firebaseConfig = {
  apiKey: "AIzaSyBYI_LCb4mld3VEfIOU9D49gLV81gKTovE",
  authDomain: "taskcalendarapp-bf3b3.firebaseapp.com",
  projectId: "taskcalendarapp-bf3b3",
  storageBucket: "taskcalendarapp-bf3b3.appspot.com",
  messagingSenderId: "482463811896",
  appId: "1:482463811896:web:11700779551db85f8c59cd",
  measurementId: "G-4V1NYWDVKF"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
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

function openTaskModal(date) {
  selectedDate = date;
  taskModal.classList.add('show');
  taskInput.value = '';
  taskInput.focus();
}

function closeModal() {
  taskModal.classList.remove('show');
  authModal.classList.remove('show');
}

closeBtns.forEach(btn => btn.onclick = closeModal);
window.onclick = (event) => {
  if (event.target === taskModal || event.target === authModal) closeModal();
};

registerButton.onclick = async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  try {
    await auth.createUserWithEmailAndPassword(email, password);
    alert('Регистрация успешна!');
    closeModal();
  } catch (error) {
    alert(`Ошибка регистрации: ${error.message}`);
  }
};

loginButton.onclick = async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  try {
    await auth.signInWithEmailAndPassword(email, password);
    alert('Вход выполнен успешно!');
    closeModal();
  } catch (error) {
    alert(`Ошибка входа: ${error.message}`);
  }
};

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
    dayHeader.innerHTML = `<div class="day-date">${day.getDate()} ${day.toLocaleString('ru-RU', { month: 'long' })}</div>
      <div class="day-weekday">${day.toLocaleString('ru-RU', { weekday: 'long' })}</div>`;

    const taskList = document.createElement('ul');
    taskList.classList.add('tasks-list');
    dayEl.appendChild(dayHeader);
    dayEl.appendChild(taskList);

    const addTaskBtn = document.createElement('button');
    addTaskBtn.classList.add('add-task-btn');
    addTaskBtn.innerHTML = '<i class="fas fa-plus"></i> Добавить задачу';
    addTaskBtn.onclick = () => openTaskModal(dayEl.dataset.date);

    dayEl.appendChild(addTaskBtn);
    calendarEl.appendChild(dayEl);
  }
}

function formatDateISO(date) {
  return date.toISOString().split('T')[0];
}

auth.onAuthStateChanged(user => {
  if (user) {
    loadTasks(user.uid);
  } else {
    authModal.classList.add('show');
  }
});

async function addTask(date, text) {
  try {
    const user = auth.currentUser;
    const taskRef = await db.collection('tasks').add({
      date,
      text,
      done: false,
      userId: user.uid
    });
    displayTask(date, text, false, taskRef.id);
  } catch (error) {
    alert(`Ошибка при добавлении задачи: ${error.message}`);
  }
}

addTaskButton.onclick = () => {
  if (taskInput.value.trim()) {
    addTask(selectedDate, taskInput.value.trim());
    closeModal();
  }
};

async function loadTasks(userId) {
  try {
    const querySnapshot = await db.collection('tasks').where('userId', '==', userId).get();
    querySnapshot.forEach((doc) => {
      const { date, text, done } = doc.data();
      displayTask(date, text, done, doc.id);
    });
  } catch (error) {
    alert(`Ошибка при загрузке задач: ${error.message}`);
  }
}

function displayTask(date, text, done, taskId) {
  const dayEl = document.querySelector(`.calendar-day[data-date="${date}"]`);
  if (!dayEl) return;

  const taskList = dayEl.querySelector('.tasks-list');
  const taskItem = document.createElement('li');
  taskItem.classList.add('task-item');
  taskItem.id = taskId;
  if (done) taskItem.classList.add('done');

  taskItem.innerHTML = `
    <span>${text}</span>
    <button onclick="deleteTask('${taskId}')"><i class="fas fa-trash-alt"></i></button>
  `;

  taskList.appendChild(taskItem);
}

async function deleteTask(taskId) {
  try {
    await db.collection('tasks').doc(taskId).delete();
    const taskItem = document.getElementById(taskId);
    if (taskItem) taskItem.remove();
  } catch (error) {
    alert(`Ошибка при удалении задачи: ${error.message}`);
  }
}

createCalendar();
