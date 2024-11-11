const calendarEl = document.getElementById('calendar');
const taskModal = document.getElementById('taskModal');
const closeModal = document.getElementById('closeModal');
const selectedDateEl = document.getElementById('selectedDate');
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');

let selectedDate = '';

// Создаем календарь с учетом данных из localStorage
function createCalendar() {
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const day = new Date(today);
    day.setDate(today.getDate() + i);

    const dayEl = document.createElement('div');
    dayEl.classList.add('calendar-day');
    dayEl.dataset.date = day.toISOString().split('T')[0];

    // Добавляем отображение количества задач
    updateDayElement(dayEl);

    dayEl.onclick = () => openTaskModal(day);

    calendarEl.appendChild(dayEl);
  }
}

// Обновление элемента дня с учетом задач
function updateDayElement(dayEl) {
  const date = dayEl.dataset.date;
  const tasks = JSON.parse(localStorage.getItem(date)) || [];

  dayEl.textContent = new Date(date).toLocaleDateString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'numeric'
  });

  // Отображаем количество задач, если они есть
  if (tasks.length > 0) {
    dayEl.classList.add('has-tasks');

    const taskCountEl = document.createElement('span');
    taskCountEl.classList.add('task-count');
    taskCountEl.textContent = `(${tasks.length})`;

    dayEl.appendChild(taskCountEl);
  } else {
    dayEl.classList.remove('has-tasks');
  }
}

// Открытие модального окна для выбранного дня
function openTaskModal(day) {
  selectedDate = day.toISOString().split('T')[0];
  selectedDateEl.textContent = day.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  loadTasks(selectedDate);
  taskModal.style.display = 'block';
}

// Закрытие модального окна
closeModal.onclick = () => {
  taskModal.style.display = 'none';
  taskList.innerHTML = '';
};

// Загрузка задач для выбранной даты
function loadTasks(date) {
  taskList.innerHTML = '';
  const tasks = JSON.parse(localStorage.getItem(date)) || [];
  tasks.forEach(task => addTaskToList(task));
}

// Добавление задачи в список
function addTaskToList(taskText) {
  const taskEl = document.createElement('li');
  taskEl.classList.add('task-item');
  taskEl.textContent = taskText;

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Удалить';
  deleteBtn.onclick = () => {
    taskEl.remove();
    saveTasks();
    updateCalendarDisplay();
  };

  taskEl.appendChild(deleteBtn);
  taskList.appendChild(taskEl);
}

// Сохранение задач для выбранной даты
function saveTasks() {
  const tasks = Array.from(taskList.children).map(item => item.firstChild.textContent);
  localStorage.setItem(selectedDate, JSON.stringify(tasks));
}

// Добавление задачи и обновление календаря
addTaskBtn.onclick = () => {
  const taskText = taskInput.value.trim();
  if (taskText) {
    addTaskToList(taskText);
    saveTasks();
    taskInput.value = '';
    updateCalendarDisplay();
  }
};

// Обновление отображения всего календаря
function updateCalendarDisplay() {
  const dayElements = document.querySelectorAll('.calendar-day');
  dayElements.forEach(updateDayElement);
}

// Закрытие модального окна при клике вне его
window.onclick = (event) => {
  if (event.target === taskModal) {
    taskModal.style.display = 'none';
    taskList.innerHTML = '';
  }
};

// Инициализация календаря
createCalendar();
