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
const viewTaskModal = document.getElementById('viewTaskModal');
const viewTaskText = document.getElementById('viewTaskText');
const editFromViewButton = document.getElementById('editFromViewButton');
const editTaskModal = document.getElementById('editTaskModal');
const editTaskInput = document.getElementById('editTaskInput');
const saveTaskButton = document.getElementById('saveTaskButton');
const deleteFromViewButton = document.getElementById('deleteFromViewButton');


let selectedDate = null;
let selectedTaskId = null;

// Открытие модального окна добавления задачи
function openTaskModal(date) {
  selectedDate = date;
  taskModal.classList.add('show');
  taskInput.value = '';
  taskInput.focus();
}

// Открытие модального окна просмотра задачи
function openViewTaskModal(taskId, taskText) {
  selectedTaskId = taskId;
  viewTaskText.textContent = taskText;
  viewTaskModal.classList.add('show');
}

// Закрытие всех модальных окон
function closeModal() {
  taskModal.classList.remove('show');
  editTaskModal.classList.remove('show');
  viewTaskModal.classList.remove('show');
}

// Обработчик для кнопок закрытия
closeBtns.forEach(btn => {
  btn.onclick = closeModal;
});

// Переход от просмотра задачи к её редактированию
editFromViewButton.onclick = () => {
  viewTaskModal.classList.remove('show');
  editTaskModal.classList.add('show');
  editTaskInput.value = viewTaskText.textContent;
  editTaskInput.focus();
};

// Универсальный обработчик для клика вне модальных окон
window.onclick = (event) => {
  if (event.target === taskModal) taskModal.classList.remove('show');
  if (event.target === editTaskModal) editTaskModal.classList.remove('show');
  if (event.target === viewTaskModal) viewTaskModal.classList.remove('show');
};

// Закрытие модальных окон при нажатии клавиши Esc
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeModal();
});

// Добавление задачи
addTaskButton.onclick = async () => {
  const task = taskInput.value.trim();
  if (task === '') return;

  const userId = auth.currentUser.uid;

  const taskData = {
    task,
    date: selectedDate,
    completed: false,
    userId
  };

  await db.collection('tasks').add(taskData);
  taskInput.value = '';
  closeModal();
};

// Создание календаря
function createCalendar() {
  const today = new Date();
  const displayedDates = new Set();

  for (let i = 0; i < 30; i++) {
    const day = new Date(today);
    day.setDate(today.getDate() + i);

    const dayStr = formatDateISO(day);

    if (displayedDates.has(dayStr)) continue;
    displayedDates.add(dayStr);

    const existingDayElement = document.querySelector(`[data-date="${dayStr}"]`);
    if (existingDayElement) continue;

    const dayEl = document.createElement('div');
    dayEl.classList.add('calendar-day');
    dayEl.dataset.date = dayStr;

    const dayHeader = document.createElement('div');
    dayHeader.classList.add('day-header');
    dayHeader.innerHTML = `
      <div class="day-date">${day.getDate()} ${day.toLocaleString('ru-RU', { month: 'long' })}</div>
      <div class="day-weekday">${day.toLocaleString('ru-RU', { weekday: 'long' })}</div>
    `;

    const taskList = document.createElement('ul');
    taskList.classList.add('tasks-list');
    dayEl.appendChild(dayHeader);
    dayEl.appendChild(taskList);

    const addTaskBtn = document.createElement('button');
    addTaskBtn.classList.add('add-task-btn');
    addTaskBtn.innerHTML = '<img src="images/plus.svg" class="plus-button"> Добавить задачу';
    addTaskBtn.onclick = () => openTaskModal(dayEl.dataset.date);

    dayEl.appendChild(addTaskBtn);
    calendarEl.appendChild(dayEl);

    subscribeToTasks(dayStr, taskList);
  }
}

// Формат даты в ISO
function formatDateISO(date) {
  return date.toISOString().split('T')[0];
}

// Подписка на задачи
function subscribeToTasks(date, tasksListEl) {
  const userId = auth.currentUser.uid;

  db.collection('tasks')
    .where('date', '==', date)
    .where('userId', '==', userId)
    .onSnapshot(snapshot => {
      tasksListEl.innerHTML = '';

      snapshot.forEach(doc => {
        const taskData = doc.data();
        const taskItemEl = document.createElement('li');
        taskItemEl.className = 'task-item';
        taskItemEl.dataset.taskId = doc.id;
        if (taskData.completed) taskItemEl.classList.add('done');

        const checkboxEl = document.createElement('input');
        checkboxEl.type = 'checkbox';
        checkboxEl.className = 'checkbox-item';
        checkboxEl.checked = taskData.completed;
        checkboxEl.onchange = () => toggleTaskCompletion(doc.id, checkboxEl.checked, taskItemEl);

        const taskTextEl = document.createElement('span');
        taskTextEl.textContent = taskData.task;

        taskItemEl.onclick = (event) => {
          if (event.target !== checkboxEl) {
            openViewTaskModal(doc.id, taskData.task);
          }
        };

        taskItemEl.appendChild(checkboxEl);
        taskItemEl.appendChild(taskTextEl);
        tasksListEl.appendChild(taskItemEl);
      });
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

// Сохранение изменений задачи
saveTaskButton.onclick = async () => {
  const newTaskText = editTaskInput.value.trim();
  if (newTaskText === '') return;

  try {
    await db.collection('tasks').doc(selectedTaskId).update({ task: newTaskText });
    editTaskModal.classList.remove('show');
  } catch (error) {
    alert(`Ошибка при сохранении задачи: ${error.message}`);
  }
};

// Удаление задачи из окна просмотра задачи
deleteFromViewButton.onclick = async () => {
  if (selectedTaskId) {
    try {
      await db.collection('tasks').doc(selectedTaskId).delete();
      viewTaskModal.classList.remove('show');
    } catch (error) {
      alert(`Ошибка при удалении задачи: ${error.message}`);
    }
  }
};


// Выход из аккаунта
logoutButton.onclick = () => {
  auth.signOut();
};

// Отображение почты аакаунта
auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById('userEmail').textContent = user.email;
    createCalendar(); // Инициализация календаря
  } else {
    window.location.href = "login.html";
  }
});

// Инициализация
auth.onAuthStateChanged(user => {
  if (user) {
    createCalendar();
  } else {
    window.location.href = 'login.html';
  }
});
