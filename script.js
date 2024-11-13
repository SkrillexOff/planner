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

// Открытие модального окна для задачи
function openTaskModal(date) {
  selectedDate = date;
  taskModal.classList.add('show');
  taskInput.value = '';
  taskInput.focus();
}

// Закрытие модального окна
function closeModal() {
  taskModal.classList.remove('show');
  authModal.classList.remove('show');
}

closeBtns.forEach(btn => btn.onclick = closeModal);
window.onclick = (event) => {
  if (event.target === taskModal || event.target === authModal) closeModal();
};

// Регистрация пользователя
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

// Вход пользователя
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

// Создание календаря
function createCalendar() {
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const day = new Date(today);
    day.setDate(today.getDate() + i);

    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    dayEl.dataset.date = formatDateISO(day);

    const dayHeader = document.createElement('div');
    dayHeader.className = 'day-header';
    dayHeader.innerHTML = `<div class="day-date">${day.getDate()} ${day.toLocaleString('ru-RU', { month: 'long' })}</div>
      <div class="day-weekday">${day.toLocaleString('ru-RU', { weekday: 'long' })}</div>`;

    const taskList = document.createElement('ul');
    taskList.className = 'tasks-list';
    dayEl.appendChild(dayHeader);
    dayEl.appendChild(taskList);

    const addTaskBtn = document.createElement('button');
    addTaskBtn.className = 'add-task-btn';
    addTaskBtn.innerHTML = '<i class="fas fa-plus"></i> Добавить задачу';
    addTaskBtn.onclick = () => openTaskModal(dayEl.dataset.date);

    dayEl.appendChild(addTaskBtn);
    calendarEl.appendChild(dayEl);

    loadTasks(dayEl.dataset.date, taskList);
  }
}

// Формат даты в ISO
function formatDateISO(date) {
  return date.toISOString().split('T')[0];
}

// Добавление задачи
addTaskButton.onclick = async () => {
  const task = taskInput.value.trim();
  if (task === '') return;

  const taskData = {
    task,
    date: selectedDate,
    completed: false
  };

  await db.collection('tasks').add(taskData);

  // Найти элемент tasksList для обновлённого дня
  const tasksListEl = document.querySelector(`[data-date="${selectedDate}"] .tasks-list`);
  closeModal();

  // Загрузить задачи снова, чтобы показать новую задачу
  loadTasks(selectedDate, tasksListEl);
};

// Загрузка задач для выбранной даты
async function loadTasks(date, tasksListEl) {
  tasksListEl.innerHTML = '';

  const snapshot = await db.collection('tasks').where('date', '==', date).get();
  snapshot.forEach((doc) => {
    const taskData = doc.data();
    const taskItemEl = document.createElement('li');
    taskItemEl.className = 'task-item';
    if (taskData.completed) taskItemEl.classList.add('done');

    const checkboxEl = document.createElement('input');
    checkboxEl.type = 'checkbox';
    checkboxEl.checked = taskData.completed;
    checkboxEl.onchange = () => toggleTaskCompletion(doc.id, checkboxEl.checked, taskItemEl);

    const taskTextEl = document.createElement('span');
    taskTextEl.textContent = taskData.task;

    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteButton.onclick = () => deleteTask(doc.id, tasksListEl);

    taskItemEl.appendChild(checkboxEl);
    taskItemEl.appendChild(taskTextEl);
    taskItemEl.appendChild(deleteButton);
    tasksListEl.appendChild(taskItemEl);
  });
}

// Переключение состояния выполнения задачи
async function toggleTaskCompletion(taskId, completed, taskItemEl) {
  await db.collection('tasks').doc(taskId).update({ completed });
  taskItemEl.classList.toggle('done', completed);
}

// Удаление задачи
async function deleteTask(taskId, tasksListEl) {
  await db.collection('tasks').doc(taskId).delete();
  loadTasks(tasksListEl.parentNode.querySelector('.day-date').textContent, tasksListEl);
}

// Состояние аутентификации
auth.onAuthStateChanged((user) => {
  if (user) {
    createCalendar();
  } else {
    authModal.classList.add('show');
  }
});

// Инициализация календаря
createCalendar();
