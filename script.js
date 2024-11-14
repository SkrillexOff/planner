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
    // Пользователь авторизован, показываем его email
    document.getElementById('userEmail').textContent = user.email;
    createCalendar();  // Инициализация календаря
  } else {
    // Если пользователь не авторизован, редирект на страницу входа
    window.location.href = "login.html";
  }
});

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
    dayHeader.innerHTML = `<div class="day-date">${day.getDate()} ${day.toLocaleString('ru-RU', { month: 'long' })}</div>
      <div class="day-weekday">${day.toLocaleString('ru-RU', { weekday: 'long' })}</div>`;

    const taskList = document.createElement('ul');
    taskList.classList.add('tasks-list');
    dayEl.appendChild(dayHeader);
    dayEl.appendChild(taskList);

    const addTaskBtn = document.createElement('button');
    addTaskBtn.classList.add('add-task-btn');
    addTaskBtn.innerHTML = '<img src="images/plus.svg" class="plus-button"></img> Добавить задачу';
    addTaskBtn.onclick = () => openTaskModal(dayEl.dataset.date);

    dayEl.appendChild(addTaskBtn);
    calendarEl.appendChild(dayEl);

    // Подписываемся на обновления задач для этой даты
    subscribeToTasks(dayStr, taskList);
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

  const userId = auth.currentUser.uid;  // Получаем идентификатор текущего пользователя

  const taskData = {
    task,
    date: selectedDate,
    completed: false,
    userId // Добавляем userId
  };

  // Добавляем задачу в Firestore
  await db.collection('tasks').add(taskData);

  // Обновляем только задачи для текущей выбранной даты
  const tasksListEl = document.querySelector(`[data-date="${selectedDate}"] .tasks-list`);
  closeModal();

  loadTasks(selectedDate, tasksListEl);  // Перезагружаем задачи для выбранного дня
};

// Подписываемся на обновления задач для конкретного пользователя и даты
function subscribeToTasks(date, tasksListEl) {
  const userId = auth.currentUser.uid;

  // Подписка на задачи через onSnapshot
  db.collection('tasks')
    .where('date', '==', date)
    .where('userId', '==', userId)
    .onSnapshot((snapshot) => {
      tasksListEl.innerHTML = ''; // Очищаем список перед обновлением

      snapshot.forEach((doc) => {
        const taskData = doc.data();
        const taskItemEl = document.createElement('li');
        taskItemEl.className = 'task-item';
        taskItemEl.setAttribute('data-task-id', doc.id);
        if (taskData.completed) taskItemEl.classList.add('done');

        const checkboxEl = document.createElement('input');
        checkboxEl.type = 'checkbox';
        checkboxEl.className = 'checkbox-item';
        checkboxEl.checked = taskData.completed;
        checkboxEl.onchange = () => toggleTaskCompletion(doc.id, checkboxEl.checked, taskItemEl);

        const taskTextEl = document.createElement('span');
        taskTextEl.textContent = taskData.task;

        // Добавляем проверку, чтобы не открывалось окно редактирования при клике на чекбокс
        taskItemEl.onclick = (event) => {
          if (event.target !== checkboxEl) {
            openEditTaskModal(doc.id, taskData.task);
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

// Ссылки на элементы модального окна редактирования задачи
const editTaskModal = document.getElementById('editTaskModal');
const editTaskInput = document.getElementById('editTaskInput');
const saveTaskButton = document.getElementById('saveTaskButton');
const deleteTaskButton = document.getElementById('deleteTaskButton');

let selectedTaskId = null; // ID выбранной задачи для редактирования

// Функция для открытия модального окна редактирования задачи
function openEditTaskModal(taskId, currentTaskText) {
  selectedTaskId = taskId; // Запоминаем ID задачи
  editTaskModal.classList.add('show');
  editTaskInput.value = currentTaskText; // Заполняем модальное окно текущим текстом задачи
  editTaskInput.focus();
}

// Закрытие модальных окон
closeBtns.forEach(btn => {
  btn.onclick = () => {
    if (btn.closest('#taskModal')) taskModal.classList.remove('show');
    if (btn.closest('#editTaskModal')) editTaskModal.classList.remove('show');
  };
});

// Закрытие модальных окон при клике вне их
window.onclick = (event) => {
  if (event.target === taskModal) taskModal.classList.remove('show');
  if (event.target === editTaskModal) editTaskModal.classList.remove('show');
};

// Обработчик кнопки "Сохранить"
saveTaskButton.onclick = async () => {
  const newTaskText = editTaskInput.value.trim();
  if (newTaskText === '') return;

  try {
    // Обновление задачи в базе данных
    await db.collection('tasks').doc(selectedTaskId).update({
      task: newTaskText
    });

    // Закрыть модальное окно
    editTaskModal.classList.remove('show');

    // Перезагрузить задачи для этого дня
    const tasksListEl = document.querySelector(`[data-date="${selectedDate}"] .tasks-list`);
    loadTasks(selectedDate, tasksListEl);

  } catch (error) {
    alert(`Ошибка при сохранении задачи: ${error.message}`);
  }
};

// Обработчик кнопки "Удалить"
deleteTaskButton.onclick = async () => {
  if (selectedTaskId) {
    try {
      // Удаление задачи из базы данных
      await db.collection('tasks').doc(selectedTaskId).delete();

      // Закрыть модальное окно
      editTaskModal.classList.remove('show');

      // Перезагрузить задачи для этого дня
      const tasksListEl = document.querySelector(`[data-date="${selectedDate}"] .tasks-list`);
      loadTasks(selectedDate, tasksListEl);

    } catch (error) {
      alert(`Ошибка при удалении задачи: ${error.message}`);
    }
  }
};

// Функция для перезагрузки задач для выбранной даты
function loadTasks(date, tasksListEl) {
  subscribeToTasks(date, tasksListEl);
}
