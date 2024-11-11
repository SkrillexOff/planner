const calendarEl = document.getElementById('calendar');

// Функция для форматирования даты в ISO формате (YYYY-MM-DD)
function formatDateISO(date) {
  return date.toISOString().split('T')[0];
}

// Функция для создания календаря с задачами
function createCalendar() {
  const today = new Date();

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

    // Список задач
    const taskList = document.createElement('ul');
    taskList.classList.add('tasks-list');
    dayEl.appendChild(taskList);

    // Контейнер для добавления задач
    const addTaskContainer = document.createElement('div');
    addTaskContainer.classList.add('add-task-container');

    const addTaskInput = document.createElement('input');
    addTaskInput.type = 'text';
    addTaskInput.placeholder = "Новая задача...";
    addTaskInput.classList.add('add-task-input');

    const addTaskBtn = document.createElement('button');
    addTaskBtn.innerHTML = '<i class="fas fa-plus"></i>'; // Иконка "плюс"
    addTaskBtn.classList.add('add-task-btn');

    // Обработчик клика по кнопке "Добавить"
    addTaskBtn.onclick = () => {
      const taskText = addTaskInput.value.trim();
      if (taskText) {
        addTask(formatDateISO(day), taskText);
        addTaskInput.value = '';
        updateDayTasks(dayEl, formatDateISO(day));
      }
    };

    addTaskContainer.appendChild(addTaskInput);
    addTaskContainer.appendChild(addTaskBtn);
    dayEl.appendChild(addTaskContainer);

    // Добавляем день в календарь
    calendarEl.appendChild(dayEl);

    // Загружаем и отображаем задачи для этого дня
    updateDayTasks(dayEl, formatDateISO(day));
  }
}

// Функция для добавления задачи в localStorage и обновления отображения
function addTask(date, taskText) {
  const tasks = JSON.parse(localStorage.getItem(date)) || [];
  tasks.push({ text: taskText, done: false });
  localStorage.setItem(date, JSON.stringify(tasks));
}

// Функция для обновления списка задач для конкретного дня
function updateDayTasks(dayEl, date) {
  const tasks = JSON.parse(localStorage.getItem(date)) || [];
  const taskList = dayEl.querySelector('.tasks-list');
  taskList.innerHTML = ''; // Очищаем текущий список задач

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
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>'; // Иконка "крестик"
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

// Функция для изменения статуса задачи в localStorage
function toggleTaskStatus(date, taskText) {
  const tasks = JSON.parse(localStorage.getItem(date)) || [];
  const taskIndex = tasks.findIndex(task => task.text === taskText);
  if (taskIndex !== -1) {
    tasks[taskIndex].done = !tasks[taskIndex].done;
    localStorage.setItem(date, JSON.stringify(tasks));
  }
}

// Функция для удаления задачи из localStorage
function deleteTask(date, taskText) {
  let tasks = JSON.parse(localStorage.getItem(date)) || [];
  tasks = tasks.filter(task => task.text !== taskText);
