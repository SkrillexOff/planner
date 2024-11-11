const calendarEl = document.getElementById('calendar');
const taskModal = document.getElementById('taskModal');
const taskInput = document.getElementById('taskInput');
const addTaskButton = document.getElementById('addTaskButton');
const closeBtn = document.querySelector('.close-btn');

let selectedDate = null;

// Открытие модального окна или bottom sheet
function openModal(date) {
  console.log(`Открытие модального окна для даты: ${date}`);
  selectedDate = date;
  taskModal.classList.add('show');
  taskInput.value = '';
  taskInput.focus();
}

// Закрытие модального окна
function closeModal() {
  console.log("Закрытие модального окна");
  taskModal.classList.remove('show');
  selectedDate = null;
}

// Обработчик для кнопки закрытия
closeBtn.onclick = closeModal;

// Закрытие модального окна при клике вне его области
window.onclick = (event) => {
  if (event.target === taskModal) closeModal();
};

// Добавление задачи
addTaskButton.onclick = () => {
  const taskText = taskInput.value.trim();
  console.log(`Нажата кнопка добавления задачи. Текст задачи: "${taskText}"`);
  if (taskText && selectedDate) {
    addTask(selectedDate, taskText);
    updateDayTasks(document.querySelector(`[data-date="${selectedDate}"]`), selectedDate);
    closeModal();
  }
};

// Форматирование даты в ISO
function formatDateISO(date) {
  return date.toISOString().split('T')[0];
}

// Создание календаря
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
    dayDate.textContent = day.toLocaleDateString('ru-RU', {
      weekday: 'short',
      day: 'numeric',
      month: 'numeric'
    });

    dayHeader.appendChild(dayDate);

    const addTaskBtn = document.createElement('button');
    addTaskBtn.classList.add('add-task-btn');
    addTaskBtn.innerHTML = '<i class="fas fa-plus"></i>';
    addTaskBtn.onclick = () => openModal(formatDateISO(day));

    dayHeader.appendChild(addTaskBtn);
    dayEl.appendChild(dayHeader);

    const taskList = document.createElement('ul');
    taskList.classList.add('tasks-list');
    dayEl.appendChild(taskList);

    calendarEl.appendChild(dayEl);
    updateDayTasks(dayEl, formatDateISO(day));
  }
}

// Добавление задачи
function addTask(date, taskText) {
  console.log(`Добавление задачи для даты ${date}: "${taskText}"`);
  const tasks = JSON.parse(localStorage.getItem(date)) || [];
  tasks.push({ text: taskText, done: false });
  localStorage.setItem(date, JSON.stringify(tasks));
}

// Обновление задач
function updateDayTasks(dayEl, date) {
  const tasks = JSON.parse(localStorage.getItem(date)) || [];
  const taskList = dayEl.querySelector('.tasks-list');
  taskList.innerHTML = '';

  tasks.forEach((task) => {
    const taskEl = document.createElement('li');
    taskEl.classList.add('task-item');
    if (task.done) taskEl.classList.add('done');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.onchange = () => toggleTaskStatus(date, task.text);

    const taskText = document.createElement('span');
    taskText.textContent = task.text;

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
    deleteBtn.onclick = () => {
      deleteTask(date, task.text);
      updateDayTasks(dayEl, date);
    };

    taskEl.appendChild(checkbox);
    taskEl.appendChild(taskText);
    taskEl.appendChild(deleteBtn);
    taskList.appendChild(taskEl);
  });
}

function toggleTaskStatus(date, taskText) {
  const tasks = JSON.parse(localStorage.getItem(date)) || [];
  const task = tasks.find((task) => task.text === taskText);
  if (task) {
    task.done = !task.done;
    localStorage.setItem(date, JSON.stringify(tasks));
  }
}

function deleteTask(date, taskText) {
  let tasks = JSON.parse(localStorage.getItem(date)) || [];
  tasks = tasks.filter((task) => task.text !== taskText);
  localStorage.setItem(date, JSON.stringify(tasks));
}

// Инициализация
document.addEventListener('DOMContentLoaded', createCalendar);
