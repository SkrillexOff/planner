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
const taskInput = document.getElementById('taskInput');
const addTaskButton = document.getElementById('addTaskButton');
const closeBtns = document.querySelectorAll('.close-btn');
const logoutButton = document.getElementById('logoutButton');

let selectedDate = null;

function openTaskModal(date) {
  selectedDate = date;
  taskModal.classList.add('show');
  taskInput.value = '';
  taskInput.focus();
}

function closeModal() {
  taskModal.classList.remove('show');
}

closeBtns.forEach(btn => btn.onclick = closeModal);
window.onclick = (event) => {
  if (event.target === taskModal) closeModal();
};

// Обработчик кнопки выхода
logoutButton.onclick = async () => {
  try {
    await auth.signOut();
    window.location.href = "login.html";
  } catch (error) {
    alert(`Ошибка выхода: ${error.message}`);
  }
};

auth.onAuthStateChanged(user => {
  if (user) {
    createCalendar();
  } else {
    window.location.href = "login.html";
  }
});

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

  const userId = auth.currentUser.uid; // Получаем идентификатор текущего пользователя

  const taskData = {
    task,
    date: selectedDate,
    completed: false,
    userId // Добавляем userId
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

  const userId = auth.currentUser.uid; // Получаем идентификатор текущего пользователя

  const snapshot = await db.collection('tasks')
    .where('date', '==', date)
    .where('userId', '==', userId) // Фильтруем задачи по userId
    .get();

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


// Завершение задачи
async function toggleTaskCompletion(taskId, completed, taskItemEl) {
  try {
    await db.collection('tasks').doc(taskId).update({ completed });
    taskItemEl.classList.toggle('done', completed);
  } catch (error) {
    alert(`Ошибка при обновлении задачи: ${error.message}`);
  }
}

// Удаление задачи
async function deleteTask(taskId, tasksListEl) {
  const userId = auth.currentUser.uid; // Получаем идентификатор текущего пользователя

  const taskRef = db.collection('tasks').doc(taskId);
  const taskDoc = await taskRef.get();

  if (taskDoc.exists && taskDoc.data().userId === userId) {
    await taskRef.delete();
    loadTasks(tasksListEl.parentNode.querySelector('.day-date').textContent, tasksListEl);
  }
}
