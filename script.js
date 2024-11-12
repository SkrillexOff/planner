// Firebase конфигурация
const firebaseConfig = {
  apiKey: "AIzaSyBYI_LCb4mld3VEfIOU9D49gLV81gKTovE",
  authDomain: "taskcalendarapp-bf3b3.firebaseapp.com",
  projectId: "taskcalendarapp-bf3b3",
  storageBucket: "taskcalendarapp-bf3b3.firebasestorage.app",
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
const authModal = document.getElementById('authModal');
const taskInput = document.getElementById('taskInput');
const addTaskButton = document.getElementById('addTaskButton');
const loginButton = document.getElementById('loginButton');
const registerButton = document.getElementById('registerButton');
const closeBtns = document.querySelectorAll('.close-btn');

let selectedDate = null;

function openTaskModal(date) {
  selectedDate = date;
  taskModal.classList.add('show');
  taskInput.value = '';
  taskInput.focus();
}

function closeModal() {
  taskModal.classList.remove('show');
  authModal.classList.remove('show');
}

closeBtns.forEach(btn => btn.onclick = closeModal);
window.onclick = (event) => {
  if (event.target === taskModal || event.target === authModal) closeModal();
};

registerButton.onclick = async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  try {
    await auth.createUserWithEmailAndPassword(email, password);
    alert('Регистрация успешна!');
    closeModal();
  } catch (error) {
    alert(`Ошибка регистрации: ${error.message}`);
  }
};

loginButton.onclick = async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  try {
    await auth.signInWithEmailAndPassword(email, password);
    alert('Вход выполнен успешно!');
    closeModal();
  } catch (error) {
    alert(`Ошибка входа: ${error.message}`);
  }
};

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

    const addTaskBtn = document.createElement('button');
    addTaskBtn.classList.add('add-task-btn');
    addTaskBtn.innerHTML = '<i class="fas fa-plus-circle"></i>Добавить задачу';
    addTaskBtn.onclick = () => openTaskModal(dayEl.dataset.date);

    dayEl.appendChild(addTaskBtn);
    calendarEl.appendChild(dayEl);
  }
}

async function loadTasks() {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const snapshot = await db.collection('tasks')
      .where('userId', '==', user.uid)
      .get();

    snapshot.forEach(doc => {
      const taskData = doc.data();
      displayTask(taskData.date, taskData.text, taskData.done, doc.id);
    });
  } catch (error) {
    console.error("Ошибка при загрузке задач:", error.message);
  }
}

function displayTask(date, text, done, taskId) {
  const dayEl = document.querySelector(`.calendar-day[data-date="${date}"]`);
  if (!dayEl) return;

  const taskList = dayEl.querySelector('.tasks-list');
  const taskItem = document.createElement('li');
  taskItem.classList.add('task-item');
  if (done) taskItem.classList.add('done');

  taskItem.innerHTML = `
    <span>${text}</span>
    <button onclick="deleteTask('${taskId}')"><i class="fas fa-trash-alt"></i></button>
  `;

  taskList.appendChild(taskItem);
}

async function deleteTask(taskId) {
  try {
    await db.collection('tasks').doc(taskId).delete();
    document.getElementById(taskId).remove();
    console.log("Задача удалена:", taskId);
  } catch (error) {
    console.error("Ошибка при удалении задачи:", error.message);
  }
}

addTaskButton.onclick = async () => {
  const taskText = taskInput.value.trim();
  if (taskText && selectedDate) {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("Пользователь не авторизован");
        return alert("Авторизуйтесь, чтобы добавлять задачи.");
      }

      const docRef = await db.collection('tasks').add({
        date: selectedDate,
        text: taskText,
        done: false,
        userId: user.uid,
      });
      displayTask(selectedDate, taskText, false, docRef.id);
      console.log("Задача добавлена в Firestore:", { date: selectedDate, text: taskText });
      alert('Задача добавлена!');
      closeModal();
    } catch (error) {
      console.error("Ошибка при добавлении задачи:", error.message);
      alert(`Ошибка при добавлении задачи: ${error.message}`);
    }
  } else {
    console.warn("Пустой текст задачи или не выбрана дата.");
  }
};

document.addEventListener('DOMContentLoaded', () => {
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      console.log("Пользователь авторизован:", user.email);
      createCalendar();
      await loadTasks();
    } else {
      console.log("Пользователь не авторизован, показываем окно авторизации.");
      authModal.classList.add('show');
    }
  });
});

function formatDateISO(date) {
  return date.toISOString().split('T')[0];
}
