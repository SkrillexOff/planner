import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    setDoc,
    query,
    where,
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBYI_LCb4mld3VEfIOU9D49gLV81gKTovE",
    authDomain: "taskcalendarapp-bf3b3.firebaseapp.com",
    projectId: "taskcalendarapp-bf3b3",
    storageBucket: "taskcalendarapp-bf3b3.firebasestorage.app",
    messagingSenderId: "482463811896",
    appId: "1:482463811896:web:11700779551db85f8c59cd",
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
    statusSelect.innerHTML = ""; // Очищаем селектор перед загрузкой

    // Получаем документ базы
    const baseRef = doc(db, `users/${userUID}/bases/${baseId}`);
    const baseSnap = await getDoc(baseRef);

    if (baseSnap.exists()) {
        const baseData = baseSnap.data();
        const statuses = baseData.statuses || {};

        // Преобразуем объект статусов в массив для сортировки
        const statusesArray = Object.entries(statuses).map(([id, data]) => ({
            id,
            name: data.name,
            order: data.order
        }));

        // Сортируем статусы по полю order
        statusesArray.sort((a, b) => a.order - b.order);

        // Добавляем статусы в селектор
        statusesArray.forEach(status => {
            const option = document.createElement("option");
            option.value = status.id;
            option.textContent = status.name;
            statusSelect.appendChild(option);
        });
    } else {
        alert("База не найдена!");
        window.location.href = "index.html";
    }

    // Если редактируется страница, загружаем её статус
    if (pageId) {
        await loadPageStatus(userUID);
    }
}


// Загрузка статуса существующей страницы
async function loadPageStatus(userUID) {
    const pageDoc = await getDoc(doc(db, `users/${userUID}/bases/${baseId}/pages/${pageId}`));
    if (pageDoc.exists()) {
        const pageData = pageDoc.data();
        if (pageData.status) {
            statusSelect.value = pageData.status;
        }
    }
}

// Загрузка данных страницы для редактирования
async function loadPageData(userUID) {
    const baseRef = doc(db, `users/${userUID}/bases/${baseId}`);
    const baseSnap = await getDoc(baseRef);

    if (baseSnap.exists()) {
        const baseData = baseSnap.data();
        const pageData = baseData.pages?.[pageId];

        if (pageData) {
            pageTitle.value = pageData.title || "";
            pageDescription.value = pageData.description || "";
            statusSelect.value = pageData.status || "";
        } else {
            alert("Страница не найдена!");
            window.location.href = `index.html?baseId=${baseId}`;
        }
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
            const baseRef = doc(db, `users/${user.uid}/bases/${baseId}`);
            const baseSnap = await getDoc(baseRef);

            let pages = {};
            if (baseSnap.exists()) {
                const baseData = baseSnap.data();
                pages = baseData.pages || {}; // Загружаем существующий объект pages
            }

            const pageData = {
                title,
                description,
                status,
                updatedAt: new Date(),
            };

            if (pageId) {
                // Обновление существующей страницы
                pages[pageId] = { ...pages[pageId], ...pageData };
            } else {
                // Создание новой страницы с уникальным ID
                const newPageId = Date.now().toString(); // Генерируем уникальный ID (можно использовать UUID)
                pageData.createdAt = new Date();
                pages[newPageId] = pageData;
            }

            // Обновляем документ базы с вложенным объектом pages
            await setDoc(baseRef, { pages }, { merge: true });

            window.location.href = `index.html?baseId=${baseId}`;
        }
    } else {
        alert("Пожалуйста, заполните все обязательные поля.");
    }
});



// Отмена
cancelBtn.addEventListener("click", () => {
    window.location.href = `index.html?baseId=${baseId}`;
});
