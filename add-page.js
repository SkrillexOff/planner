import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyBYI_LCb4mld3VEfIOU9D49gLV81gKTovE",
  authDomain: "taskcalendarapp-bf3b3.firebaseapp.com",
  databaseURL: "https://taskcalendarapp-bf3b3-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "taskcalendarapp-bf3b3",
  storageBucket: "taskcalendarapp-bf3b3.firebasestorage.app",
  messagingSenderId: "482463811896",
  appId: "1:482463811896:web:11700779551db85f8c59cd",
  measurementId: "G-4V1NYWDVKF"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const statusSelect = document.getElementById("status-select");
const pageTitle = document.getElementById("page-title");
const pageDescription = document.getElementById("page-description");
const savePageBtn = document.getElementById("save-page-btn");
const cancelBtn = document.getElementById("cancel-btn");

// Загрузка статусов из Firebase
async function loadStatuses() {
  const statusesSnapshot = await getDocs(collection(db, 'statuses'));
  const statuses = statusesSnapshot.docs.map(doc => doc.data().name);
  
  statuses.forEach(status => {
    const option = document.createElement('option');
    option.value = status;
    option.textContent = status;
    statusSelect.appendChild(option);
  });
}

// Сохранение новой страницы
savePageBtn.addEventListener('click', async () => {
  const title = pageTitle.value.trim();
  const description = pageDescription.value.trim();
  const status = statusSelect.value;

  if (title && status) {
    const user = auth.currentUser;
    if (user) {
      const newPage = {
        title,
        description,
        status,
        userUID: user.uid,
        createdAt: new Date(),
        properties: [
          { type: "status", value: status },
          { type: "text", value: description }
        ]
      };

      await addDoc(collection(db, "pages"), newPage);
      window.location.href = "index.html";
    }
  } else {
    alert("Пожалуйста, заполните все обязательные поля.");
  }
});

// Отмена
cancelBtn.addEventListener('click', () => {
  window.location.href = "index.html";
});

// Загрузка статусов при загрузке страницы
loadStatuses();
