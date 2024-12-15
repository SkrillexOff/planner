import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, getDoc, doc, setDoc, query, where } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
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

// Получение параметров из URL
const urlParams = new URLSearchParams(window.location.search);
const pageId = urlParams.get("pageId");
const baseId = urlParams.get("baseId");

// Загрузка статусов из Firebase с учётом baseId
async function loadStatuses(userUID) {
    statusSelect.innerHTML = "";

    const statusesRef = collection(db, `users/${userUID}/statuses`);
    const statusesQuery = query(statusesRef, where("baseId", "==", baseId));
    const statusesSnapshot = await getDocs(statusesQuery);

    const statuses = [];
    statusesSnapshot.forEach(doc => {
        const data = doc.data();
        statuses.push({
            id: doc.id,
            name: data.name,
            order: data.order
        });
    });

    // Сортируем статусы по полю order
    statuses.sort((a, b) => a.order - b.order);

    // Добавляем отсортированные статусы в селектор
    statuses.forEach(status => {
        const option = document.createElement("option");
        option.value = status.id;
        option.textContent = status.name;
        statusSelect.appendChild(option);
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
        if (pageData.status) {
            statusSelect.value = pageData.status;
        }
    }
}

// Загрузка данных страницы для редактирования с учётом baseId
async function loadPageData(userUID) {
    const pageDoc = await getDoc(doc(db, `users/${userUID}/pages`, pageId));
    if (pageDoc.exists()) {
        const pageData = pageDoc.data();
        if (pageData.baseId === baseId) {
            pageTitle.value = pageData.title || "";
            pageDescription.value = pageData.description || "";
        } else {
            alert("Страница не найдена в данной базе!");
            window.location.href = `index.html?baseId=${baseId}`;
        }
    } else {
        alert("Страница не найдена!");
        window.location.href = `index.html?baseId=${baseId}`;
    }
}

// Инициализация при загрузке страницы
onAuthStateChanged(auth, async (user) => {
    if (user) {
        await loadStatuses(user.uid);
        if (pageId) {
            await loadPageData(user.uid);
        }
    } else {
        alert("Вы не авторизованы!");
        window.location.href = "auth.html";
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
                status,
                baseId, // Добавляем baseId
                updatedAt: new Date()
            };

            if (pageId) {
                await setDoc(doc(db, `users/${user.uid}/pages`, pageId), pageData, { merge: true });
            } else {
                pageData.createdAt = new Date();
                await addDoc(collection(db, `users/${user.uid}/pages`), pageData);
            }

            window.location.href = `index.html?baseId=${baseId}`
        }
    } else {
        alert("Пожалуйста, заполните все обязательные поля.");
    }
});

// Отмена
cancelBtn.addEventListener("click", () => {
    window.location.href = `index.html?baseId=${baseId}`
});
