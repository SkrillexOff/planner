import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, collection, getDocs, orderBy, query, where } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

const logoutBtn = document.getElementById('logout-btn');
const addPageBtn = document.getElementById('add-page-btn');
const pagesList = document.getElementById('pages-list');
const loginMessage = document.getElementById('login-message');
const statusTabs = document.getElementById('status-tabs');

let allPages = [];

function logout() {
  signOut(auth).then(() => {
    window.location.href = "auth.html";
  }).catch((error) => {
    console.error('Error:', error.message);
  });
}

logoutBtn.addEventListener('click', logout);

function renderPageProperties(properties) {
  if (!properties || properties.length === 0) return '';
  return properties.map((property) => {
    if (property.type === 'text') {
      return `<p><strong>Текст:</strong> ${property.value}</p>`;
    } else if (property.type === 'status') {
      const statusColors = { "нужно сделать": "red", "в работе": "orange", "готово": "green" };
      const color = statusColors[property.value] || "gray";
      return `<p><strong>Статус:</strong> <span class="status-label" style="background-color: ${color};">${property.value}</span></p>`;
    }
    return '';
  }).join('');
}

async function loadPages() {
  const user = auth.currentUser;
  if (user) {
    const pagesQuery = query(
      collection(db, "pages"),
      where("userUID", "==", user.uid),
      orderBy("createdAt")
    );
    const querySnapshot = await getDocs(pagesQuery);
    allPages = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    renderPages('all');
  }
}

// Добавляем обработчик клика на превью страницы
function setupPageClickListeners() {
  const pageItems = document.querySelectorAll('.page-item');
  
  pageItems.forEach((pageItem) => {
    pageItem.addEventListener('click', () => {
      const pageId = pageItem.dataset.pageId; // Берем ID страницы из атрибута
      if (pageId) {
        // Переходим на страницу редактирования с передачей ID через URL
        window.location.href = `add-page.html?pageId=${pageId}`;
      }
    });
  });
}


// Обновляем renderPages для добавления ID в элемент
function renderPages(filterStatus) {
  pagesList.innerHTML = '';

  const filteredPages = allPages.filter((page) => {
    if (filterStatus === 'all') return true;
    const statusProperty = page.properties?.find((prop) => prop.type === 'status');
    return statusProperty && statusProperty.value === filterStatus;
  });

  filteredPages.forEach((page) => {
    const pageItem = document.createElement('div');
    pageItem.classList.add('page-item');
    pageItem.dataset.pageId = page.id; // Устанавливаем ID страницы

    // Формируем содержимое страницы
    pageItem.innerHTML = `
      <div>
        <h3>${page.title}</h3>
        ${renderPageProperties(page.properties)}
      </div>
    `;

    pagesList.appendChild(pageItem);
  });

  setupPageClickListeners(); // Устанавливаем обработчики клика
}


statusTabs.addEventListener('click', (event) => {
  if (event.target.classList.contains('status-tab')) {
    const selectedStatus = event.target.getAttribute('data-status');
    renderPages(selectedStatus);
  }
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById('app').style.display = 'block';
    loginMessage.style.display = 'none';
    loadPages();
  } else {
    document.getElementById('app').style.display = 'none';
    loginMessage.style.display = 'block';
  }
});

addPageBtn.addEventListener('click', () => {
  window.location.href = "add-page.html";
});
