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

// Элементы DOM
const calendarEl = document.getElementById('calendar');
const taskModal = document.getElementById('taskModal');
const taskInput = document.getElementById('taskInput');
const descriptionInput = document.getElementById('descriptionInput');
const toggleDescriptionButton = document.getElementById('toggleDescriptionButton');
const addTaskButton = document.getElementById('addTaskButton');
const closeBtns = document.querySelectorAll('.close-btn');
const logoutButton = document.getElementById('logoutButton');
const viewTaskModal = document.getElementById('viewTaskModal');
const viewTaskText = document.getElementById('viewTaskText');
const viewDescriptionContainer = document.getElementById('viewDescriptionContainer');
const viewTaskDescription = document.getElementById('viewTaskDescription');
const editFromViewButton = document.getElementById('editFromViewButton');
const editTaskModal = document.getElementById('editTaskModal');
const editTaskInput = document.getElementById('editTaskInput');
const editDescriptionInput = document.getElementById('editDescriptionInput');
const toggleEditDescriptionButton = document.getElementById('toggleEditDescriptionButton');
const saveTaskButton = document.getElementById('saveTaskButton');
const deleteFromViewButton = document.getElementById('deleteFromViewButton');

let selectedDate = null;
let selectedTaskId = null;

// Логика для управления полем описания в модальных окнах
toggleDescriptionButton.onclick = () => {
  if (descriptionInput.style.display === 'none') {
    descriptionInput.style.display = 'block';
    toggleDescriptionButton.textContent = 'Удалить описание';
  } else {
    descriptionInput.style.display = 'none';
    toggleDescriptionButton.textContent = 'Добавить описание';
    descriptionInput.value = '';
  }
};

toggleEditDescriptionButton.onclick = () => {
  if (editDescriptionInput.style.display === 'none') {
    editDescriptionInput.style.display = 'block';
    toggleEditDescriptionButton.textContent = 'Удалить описание';
  } else {
    editDescriptionInput.style.display = 'none';
    toggleEditDescriptionButton.textContent = 'Добавить описание';
    editDescriptionInput.value = '';
  }
};

// Закрытие всех модальных окон
function closeModal() {
  taskModal.classList.remove('show');
  editTaskModal.classList.remove('show');
  viewTaskModal.classList.remove('show');
}

closeBtns.forEach(btn => btn.onclick = closeModal);

// Открытие модального окна добавления задачи
function openTaskModal(date) {
  selectedDate = date;
  taskModal.classList.add('show');
  taskInput.value = '';
  descriptionInput.value = '';
  descriptionInput.style.display = 'none';
  toggleDescriptionButton.textContent = 'Добавить описание';
  taskInput.focus();
}

// Открытие модального окна просмотра задачи
function openViewTaskModal(taskId, taskText, taskDescription) {
  selectedTaskId = taskId;
  viewTaskText.textContent = taskText;

  if (taskDescription && taskDescription !== '-') {
    viewTaskDescription.textContent = taskDescription;
    viewDescriptionContainer.style.display = 'block';
  } else {
    viewDescriptionContainer.style.display = 'none';
  }

  viewTaskModal.classList.add('show');
}

// Добавление задачи
addTaskButton.onclick = async () => {
  const task = taskInput.value.trim();
  const description = descriptionInput.value.trim();

  if (!task) return;

  const userId = auth.currentUser.uid;

  try {
    await db.collection('tasks').add({
      task,
      description,
      date: selectedDate,
      completed: false,
      userId
    });
    closeModal();
  } catch (error) {
    alert(`Ошибка при добавлении задачи: ${error.message}`);
  }
};

// Открываем модальное окно редактирования задачи

editFromViewButton.onclick = () => {
  if (!selectedTaskId) return;

  // Получение данных задачи из Firestore
  db.collection('tasks')
    .doc(selectedTaskId)
    .get()
    .then((doc) => {
      if (doc.exists) {
        const { task, description } = doc.data();

        // Открываем модальное окно редактирования и заполняем поля
        editTaskInput.value = task || '';
        editDescriptionInput.value = description || '';
        editDescriptionInput.style.display = description ? 'block' : 'none';
        toggleEditDescriptionButton.textContent = description ? 'Удалить описание' : 'Добавить описание';

        closeModal(); // Закрываем текущее окно просмотра
        editTaskModal.classList.add('show'); // Открываем окно редактирования
      } else {
        alert('Задача не найдена!');
      }
    })
    .catch((error) => {
      alert(`Ошибка при загрузке задачи: ${error.message}`);
    });
};

// Сохранение изменений в задаче
saveTaskButton.onclick = async () => {
  const updatedTask = editTaskInput.value.trim();
  const updatedDescription = editDescriptionInput.value.trim();

  if (!updatedTask || !selectedTaskId) return;

  try {
    await db.collection('tasks').doc(selectedTaskId).update({
      task: updatedTask,
      description: updatedDescription || '-',
    });

    closeModal();
  } catch (error) {
    alert(`Ошибка при сохранении изменений: ${error.message}`);
  }
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

        const taskElementsDiv = document.createElement('div');
        taskElementsDiv.className = 'task-elements';

        const taskTextEl = document.createElement('span');
        taskTextEl.textContent = taskData.task;

        const taskDescriptionEl = document.createElement('p');
        taskDescriptionEl.className = 'task-description';
        taskDescriptionEl.textContent = taskData.description || '';
        if (taskData.completed) taskDescriptionEl.classList.add('done');

        taskElementsDiv.appendChild(taskTextEl);
        if (taskData.description) taskElementsDiv.appendChild(taskDescriptionEl);

        taskItemEl.appendChild(checkboxEl);
        taskItemEl.appendChild(taskElementsDiv);

        taskItemEl.onclick = (event) => {
          if (event.target !== checkboxEl) {
            openViewTaskModal(doc.id, taskData.task, taskData.description);
          }
        };

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
  const newDescription = editDescriptionInput.value.trim();

  if (newTaskText === '') return;

  try {
    await db.collection('tasks').doc(selectedTaskId).update({
      task: newTaskText,
      description: newDescription
    });
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

// Отображение текущего пользователя и инициализация календаря
auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById('userEmail').textContent = user.email;
    createCalendar();
  } else {
    window.location.href = 'login.html';
  }
});
