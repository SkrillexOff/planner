const calendarEl = document.getElementById('calendar');

// Создаем календарь с задачами
function createCalendar() {
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const day = new Date(today);
    day.setDate(today.getDate() + i);

    const dayEl = document.createElement('div');
    dayEl.classList.add('calendar-day');

    const dayHeader = document.createElement('div');
    dayHeader.classList.add('day-header');
    dayHeader.textContent = day.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'numeric' });
    
    const addTaskInput = document.createElement('input');
    addTaskInput.classList.add('add-task-input');
    addTaskInput.placeholder = "Новая задача...";
    addTaskInput.onkeypress = (e) => {
      if (e.key === 'Enter' && addTaskInput.value.trim()) {
        addTask(day.toISOString().split('T')[0], addTaskInput.value.trim());
        addTaskInput.value = '';
        updateDayTasks(dayEl, day.toISOString().split('T')[0]);
      }
    };

    const taskList = document.createElement('ul');
    taskList.classList.add('tasks-list');
    
    dayEl.appendChild(dayHeader);
    dayEl.appendChild(taskList);
    dayEl.appendChild(addTaskInput);
    
    // Добавляем элемент дня в календарь
    calendarEl.appendChild(dayEl);

    // Обновляем задачи для текущей даты
    updateDayTasks(dayEl, day.toISOString().split('T')[0]);
  }
}

// Добавление задачи в localStorage и обновление отображения
function addTask(date, taskText) {
  const tasks = JSON.parse(localStorage.getItem(date)) || [];
  tasks.push(taskText);
  localStorage.setItem(date, JSON.stringify(tasks));
}

// Обновление задач для дня
function updateDayTasks(dayEl, date) {
  const tasks = JSON.parse(localStorage.getItem(date)) || [];
  const taskList = dayEl.querySelector('.tasks-list');
  taskList.innerHTML = ''; // Очищаем текущий список задач

  tasks.forEach(task => {
    const taskEl = document.createElement('li');
    taskEl.classList.add('task-item');
    taskEl.textContent = task;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Удалить';
    deleteBtn.onclick = () => {
      deleteTask(date, task);
      updateDayTasks(dayEl, date);
    };

    taskEl.appendChild(deleteBtn);
    taskList.appendChild(taskEl);
  });
}

// Удаление задачи из localStorage
function deleteTask(date, taskText) {
  let tasks = JSON.parse(localStorage.getItem(date)) || [];
  tasks = tasks.filter(task => task !== taskText);
  localStorage.setItem(date, JSON.stringify(tasks));
}

// Инициализация календаря
createCalendar();
