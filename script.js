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

// Глобальные переменные
let selectedDate = null;
let selectedTaskId = null;

// Элементы DOM
const calendarEl = document.getElementById('calendar');
const taskModal = document.getElementById('taskModal');
const editTaskModal = document.getElementById('editTaskModal');
const taskInput = document.getElementById('taskInput');
const editTaskInput = document.getElementById('editTaskInput');
const addTaskButton = document.getElementById('addTaskButton');
const saveTaskButton = document.getElementById('saveTaskButton');
const deleteTaskButton = document.getElementById('deleteTaskButton');
const closeBtns = document.querySelectorAll('.close-btn');
const logoutButton = document.getElementById('logoutButton');

// === Функции ===

// Авторизация пользователя
auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById('userEmail').textContent = user.email;
    Calendar.create();
  } else {
    window.location.href = "login.html";
  }
});

// Вход и выход
logoutButton.onclick = async () => {
  try {
    await auth.signOut();
    window.location.href = "login.html";
  } catch (error) {
    alert(`Ошибка выхода: ${error.message}`);
  }
};

// Модальные окна
const Modal = {
  open(modal) {
    modal.classList.add('show');
  },
  close(modal) {
    modal.classList.remove('show');
  }
};

closeBtns.forEach(btn => btn.onclick = () => {
  const modal = btn.closest('.modal');
  if (modal) Modal.close(modal);
});

window.onclick = (event) => {
  if (event.target.classList.contains('modal')) {
    Modal.close(event.target);
  }
};

// Календарь
const Calendar = {
  create() {
    const today = new Date();
    const displayedDates = new Set();

    for (let i = 0; i < 30; i++) {
      const day = new Date(today);
      day.setDate(today.getDate() + i);

      const dayStr = Utils.formatDateISO(day);
      if (displayedDates.has(dayStr)) continue;

      displayedDates.add(dayStr);

      const dayEl = Calendar.createDayElement(day, dayStr);
      calendarEl.appendChild(dayEl);

      TaskManager.subscribe(dayStr, dayEl.querySelector('.tasks-list'));
    }
  },
  createDayElement(day, dayStr) {
    const dayEl = document.createElement('div');
    dayEl.classList.add('calendar-day');
    dayEl.dataset.date = dayStr;

    dayEl.innerHTML = `
      <div class="day-header">
        <div class="day-date">${day.getDate()} ${day.toLocaleString('ru-RU', { month: 'long' })}</div>
        <div class="day-weekday">${day.toLocaleString('ru-RU', { weekday: 'long' })}</div>
      </div>
      <ul class="tasks-list"></ul>
      <button class="add-task-btn">
        <img src="images/plus.svg" class="plus-button"> Добавить задачу
      </button>
    `;

    dayEl.querySelector('.add-task-btn').onclick = () => {
      selectedDate = dayStr;
      Modal.open(taskModal);
    };

    return dayEl;
  }
};

// Утилиты
const Utils = {
  formatDateISO(date) {
    return date.toISOString().split('T')[0];
  }
};

// Задачи
const TaskManager = {
  async add(task) {
    if (!task) return;

    const userId = auth.currentUser.uid;
    const taskData = { task, date: selectedDate, completed: false, userId };

    await db.collection('tasks').add(taskData);
    TaskManager.reload(selectedDate);
    Modal.close(taskModal);
  },
  async update(taskId, taskText) {
    await db.collection('tasks').doc(taskId).update({ task: taskText });
    TaskManager.reload(selectedDate);
    Modal.close(editTaskModal);
  },
  async delete(taskId) {
    await db.collection('tasks').doc(taskId).delete();
    TaskManager.reload(selectedDate);
    Modal.close(editTaskModal);
  },
  async toggleCompletion(taskId, completed) {
    await db.collection('tasks').doc(taskId).update({ completed });
  },
  subscribe(date, tasksListEl) {
    const userId = auth.currentUser.uid;

    db.collection('tasks')
      .where('date', '==', date)
      .where('userId', '==', userId)
      .onSnapshot(snapshot => {
        tasksListEl.innerHTML = '';
        snapshot.forEach(doc => {
          tasksListEl.appendChild(TaskManager.createTaskElement(doc));
        });
      });
  },
  createTaskElement(doc) {
    const taskData = doc.data();
    const taskItemEl = document.createElement('li');
    taskItemEl.className = 'task-item';
    taskItemEl.dataset.taskId = doc.id;

    if (taskData.completed) taskItemEl.classList.add('done');

    taskItemEl.innerHTML = `
      <input type="checkbox" class="checkbox-item" ${taskData.completed ? 'checked' : ''}>
      <span>${taskData.task}</span>
    `;

    taskItemEl.querySelector('.checkbox-item').onchange = (event) => {
      TaskManager.toggleCompletion(doc.id, event.target.checked);
    };

    taskItemEl.onclick = (event) => {
      if (event.target.tagName !== 'INPUT') {
        selectedTaskId = doc.id;
        editTaskInput.value = taskData.task;
        Modal.open(editTaskModal);
      }
    };

    return taskItemEl;
  },
  reload(date) {
    const tasksListEl = document.querySelector(`[data-date="${date}"] .tasks-list`);
    if (tasksListEl) TaskManager.subscribe(date, tasksListEl);
  }
};

// Обработчики кнопок
addTaskButton.onclick = () => TaskManager.add(taskInput.value.trim());
saveTaskButton.onclick = () => TaskManager.update(selectedTaskId, editTaskInput.value.trim());
deleteTaskButton.onclick = () => TaskManager.delete(selectedTaskId);
