const calendarEl = document.getElementById('calendar');

// Функция для форматирования даты в ISO формате (YYYY-MM-DD)
function formatDateISO(date) {
  return date.toISOString().split('T')[0];
}

// Функция для создания календаря с задачами
function createCalendar() {
  const today = new Date();

  // Очистка календаря перед повторным заполнением
  calendarEl.innerHTML = '';

  for (let i = 0; i < 30; i++) {
    const day = new Date(today);
    day.setDate(today.getDate() + i);

    const dayEl = document.createElement('div');
    dayEl.classList.add('calendar-day');

    // Заголовок дня
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
    dayEl.appendChild(dayHeader);

    // Контейнер для добавления задач
    const addTaskContainer = document.createElement('div');
    addTaskContainer.classList.add('add-task-container');

    const addTaskBtn = document.createElement('button');
    addTaskBtn.innerHTML = '<i class="fas fa-plus"></i>'; // Иконка "плюс"
    addTaskBtn.classList.add('add-task-btn');

    // Обработчик клика по кнопке "Добавить"
    addTaskBtn.onclick = () => {
      const taskText = prompt("Введите задачу:");
      if (taskText) {
        addTask(formatDateISO(day), taskText);
      }
    };

    addTaskContainer.appendChild(addTaskBtn);
    dayEl.appendChild(addTaskContainer);

    // Список задач
    const taskList = document.createElement('ul');
    taskList.classList.add('task-list');
    const tasks = JSON.parse(localStorage.getItem(formatDateISO(day))) || [];
    tasks.forEach(task => {
      const taskItem = document.createElement('li');
      const taskText = document.createElement('span');
      taskText.classList.add('task-text');
      if (task.done) taskText.classList.add('done');
      taskText.textContent = task.text;
      taskItem.appendChild(taskText);

      // Кнопка удаления задачи
      const deleteBtn = document.createElement('span');
      deleteBtn.classList.add('delete-task');
      deleteBtn.innerHTML = '&times;';
      deleteBtn.onclick = () => {
        removeTask(formatDateISO(day), task.text);
      };
      taskItem.appendChild(deleteBtn);

      // Кнопка для завершения задачи
      taskText.onclick = () => {
        toggleTaskDone(formatDateISO(day), task.text);
      };

      taskList.appendChild(taskItem);
    });

    dayEl.appendChild(taskList);

    // Добавляем день в календарь
    calendarEl.appendChild(dayEl);
  }
}

// Функция для добавления задачи в localStorage
function addTask(date, taskText) {
  if (taskText.trim() === '') return; // Не добавляем пустые задачи

  let tasks = JSON.parse(localStorage.getItem(date)) || [];
  tasks.push({ text: taskText, done: false });
  localStorage.setItem(date, JSON.stringify(tasks));
  createCalendar(); // Обновляем календарь
}

// Функция для удаления задачи
function removeTask(date, taskText) {
  let tasks = JSON.parse(localStorage.getItem(date)) || [];
  tasks = tasks.filter(task => task.text !== taskText);
  localStorage.setItem(date, JSON.stringify(tasks));
  createCalendar(); // Обновляем календарь
}

// Функция для изменения состояния задачи
function toggleTaskDone(date, taskText) {
  let tasks = JSON.parse(localStorage.getItem(date)) || [];
  tasks.forEach(task => {
    if (task.text === taskText) {
      task.done = !task.done;
    }
  });
  localStorage.setItem(date, JSON.stringify(tasks));
  createCalendar(); // Обновляем календарь
}

// Инициализация календаря при загрузке страницы
document.addEventListener('DOMContentLoaded', createCalendar);
