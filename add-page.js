import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, getDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

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

// DOM-элементы
const statusSelect = document.getElementById("status-select");
const pageTitle = document.getElementById("page-title");
const pageDescription = document.getElementById("page-description");
const savePageBtn = document.getElementById("save-page-btn");
const cancelBtn = document.getElementById("cancel-btn");

// Получение pageId из URL
const urlParams = new URLSearchParams(window.location.search);
const pageId = urlParams.get("pageId");

// Загрузка статусов из Firebase
async function loadStatuses(userUID) {
    statusSelect.innerHTML = "";

    const statusesSnapshot = await getDocs(collection(db, `users/${userUID}/statuses`));
    const statuses = statusesSnapshot.docs.map(doc => doc.data().name);

    statuses.forEach(status => {
        const option = document.createElement("option");
        option.value = status;
        option.textContent = status;
        if (![...statusSelect.options].some(opt => opt.value === status)) {
            statusSelect.appendChild(option);
        }
    });

    if (pageId) {
        await loadPageStatus(userUID);
    }
}

// Загрузка статуса страницы
async function loadPageStatus(userUID) {
    const pageDoc = await getDoc(doc(db, `users/${userUID}/pages`, pageId));
    if (pageDoc.exists()) {
        const pageData = pageDoc.data();
        if (pageData.properties && pageData.properties[0]?.type === "status") {
            statusSelect.value = pageData.properties[0].value;
        }
    }
}

// Загрузка данных страницы для редактирования
async function loadPageData(pageId, userUID) {
    const pageDoc = await getDoc(doc(db, `users/${userUID}/pages`, pageId));
    if (pageDoc.exists()) {
        const pageData = pageDoc.data();
        pageTitle.value = pageData.title || "";
        pageDescription.value = pageData.description || "";
    } else {
        alert("Страница не найдена!");
        window.location.href = "index.html";
    }
}

// Инициализация при загрузке страницы
onAuthStateChanged(auth, async (user) => {
    if (user) {
        await loadStatuses(user.uid);
        if (pageId) {
            await loadPageData(pageId, user.uid);
        }
    } else {
        alert("Вы не авторизованы!");
        window.location.href = "login.html";
    }
});

// Сохранение страницы
savePageBtn.addEventListener("click", async () => {
    const title = pageTitle.value.trim();
    const description = pageDescription.value.trim();
    const status = statusSelect.value;

    if (title && status) {
        const user = auth.currentUser;
        if (user) {
            const pageData = {
                title,
                description,
                properties: [
                    { type: "status", value: status },
                    { type: "text", value: description }
                ],
                updatedAt: new Date()
            };

            if (pageId) {
                await setDoc(doc(db, `users/${user.uid}/pages`, pageId), pageData, { merge: true });
            } else {
                pageData.createdAt = new Date();
                await addDoc(collection(db, `users/${user.uid}/pages`), pageData);
            }

            window.location.href = "index.html";
        }
    } else {
        alert("Пожалуйста, заполните все обязательные поля.");
    }
});

// Отмена
cancelBtn.addEventListener("click", () => {
    window.location.href = "index.html";
});
