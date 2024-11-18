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

// Ожидаем, что Telegram WebApp SDK будет загружен
window.onload = () => {
  const tg = window.Telegram.WebApp;
  tg.ready(); // Указывает, что SDK готово к использованию
  console.log("Telegram Web App is ready!");

  // Получаем данные пользователя из Telegram
  const userData = tg.initDataUnsafe;
  if (userData && userData.user) {
    const telegramUser = userData.user;
    signUpOrLoginWithTelegram(telegramUser);
  }
};

// Функция авторизации или регистрации через Telegram
function signUpOrLoginWithTelegram(telegramUser) {
  const userId = telegramUser.id;
  const userEmail = `${userId}@telegram.com`; // Уникальный email для пользователя Telegram

  // Проверим, есть ли уже такой пользователь в Firebase
  const userRef = db.collection('users').doc(userEmail);

  userRef.get().then(docSnapshot => {
    if (docSnapshot.exists) {
      // Пользователь существует, выполняем вход
      auth.signInWithEmailAndPassword(userEmail, userId).then(() => {
        console.log('Пользователь вошел через Telegram');
        createCalendar();
      }).catch(error => {
        console.error("Ошибка при входе:", error);
      });
    } else {
      // Если пользователя нет, создаём нового
      auth.createUserWithEmailAndPassword(userEmail, userId).then(() => {
        console.log('Пользователь зарегистрирован через Telegram');
        createCalendar();
      }).catch(error => {
        console.error("Ошибка при регистрации:", error);
      });
      // Сохраняем пользователя в базе данных
      userRef.set({
        userId: userId,
        email: userEmail,
        name: telegramUser.username || "Без имени"
      });
    }
  }).catch(error => {
    console.error("Ошибка при получении данных пользователя:", error);
  });
}

// Создание календаря
function createCalendar() {
  try {
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
  } catch (error) {
    console.error("Ошибка при создании календаря:", error);
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
  auth.signOut().then(() => {
    window.location.href = 'login.html';
  });
};

// Проверка состояния авторизации
auth.onAuthStateChanged(user => {
  if (user) {
    console.log("Пользователь авторизован:", user.email);
    createCalendar();
  } else {
    console.log("Пользователь не авторизован");
    window.location.href = 'login.html';
  }
});
