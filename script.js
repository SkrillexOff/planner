const calendarEl = document.getElementById('calendar');
const taskModal = document.getElementById('taskModal');
const taskInput = document.getElementById('taskInput');
const addTaskButton = document.getElementById('addTaskButton');
const closeBtn = document.querySelector('.close-btn');

let selectedDate = null;

// Проверка типа устройства
function isMobileDevice() {
  return window.innerWidth <= 768;
}

// Адаптация высоты при появлении клавиатуры
function adjustForKeyboard() {
  if (isMobileDevice()) {
    const initialHeight = window.innerHeight;

    // Обработчик для сдвига окна при появлении клавиатуры
    function adjustForKeyboard() {
      if (window.innerHeight < initialHeight) {
        // Вычисляем сдвиг и применяем к модальному окну
        taskModal.style.transform = `translateY(-${initialHeight - window.innerHeight}px)`;
      }
    }

    // Восстановление положения при закрытии клавиатуры
    function resetPosition() {
      taskModal.style.transform = 'translateY(0)';
    }

    // Слушаем изменение размера окна
    window.addEventListener('resize', adjustForKeyboard);
    taskInput.addEventListener('blur', resetPosition); // при потере фокуса восстанавливаем положение
  }
}

// Изменение способа открытия модального окна для iOS
function openModal(date) {
  selectedDate = date;
  document.body.classList.add('modal-open');
  taskModal.classList.add('show');
  taskModal.classList.toggle('desktop', !isMobileDevice());
  taskInput.value = '';
  taskInput.focus();

  // Включаем обработку сдвига окна для клавиатуры на мобильных устройствах
  adjustForKeyboard();
}


// Закрытие модального окна
function closeModal() {
  document.body.classList.remove('modal-open'); // Включаем скролл страницы
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
    addTaskBtn.onclick = () => openModal(formatDateISO(day));
    dayEl.appendChild(addTaskBtn);

    calendarEl.appendChild(dayEl);

    // Загружаем задачи для дня
    updateDayTasks(dayEl, formatDateISO(day));
  }
}

// Добавление задачи в localStorage
function addTask(date, taskText) {
  const tasks = JSON.parse(localStorage.getItem(date)) || [];
  tasks.push({ text: taskText, done: false });
  localStorage.setItem(date, JSON.stringify(tasks));
}

// Обновление списка задач для дня
function updateDayTasks(dayEl, date) {
  const tasks = JSON.parse(localStorage.getItem(date)) || [];
  const taskList = dayEl.querySelector('.tasks-list');
  taskList.innerHTML = '';

  tasks.forEach(task => {
    const taskEl = document.createElement('li');
    taskEl.classList.add('task-item');
    if (task.done) taskEl.classList.add('done');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add('task-checkbox');
    checkbox.checked = task.done;
    checkbox.onchange = () => {
      toggleTaskStatus(date, task.text);
      updateDayTasks(dayEl, date);
    };

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

// Изменение статуса задачи
function toggleTaskStatus(date, taskText) {
  const tasks = JSON.parse(localStorage.getItem(date)) || [];
  const taskIndex = tasks.findIndex(task => task.text === taskText);
  if (taskIndex !== -1) {
    tasks[taskIndex].done = !tasks[taskIndex].done;
    localStorage.setItem(date, JSON.stringify(tasks));
  }
}

// Удаление задачи
function deleteTask(date, taskText) {
  let tasks = JSON.parse(localStorage.getItem(date)) || [];
  tasks = tasks.filter(task => task.text !== taskText);
  localStorage.setItem(date, JSON.stringify(tasks));
}

// Инициализация календаря
document.addEventListener('DOMContentLoaded', createCalendar);
