import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    setDoc
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

// Загрузка статусов из Firestore
async function loadStatuses(userUID) {
    statusSelect.innerHTML = ""; // Очищаем селектор перед загрузкой

    const baseDoc = await getDoc(doc(db, "bases", baseId)); // Получаем документ базы

    if (baseDoc.exists()) {
        const baseData = baseDoc.data();
        const statuses = baseData.statuses;

        if (statuses) {
            const statusesArray = Object.entries(statuses).map(([id, status]) => ({
                id,
                name: status.name,
                order: status.order
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
            alert("Статусы не найдены!");
            window.location.href = "index.html";
        }
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
    const baseDoc = await getDoc(doc(db, "bases", baseId));
    if (baseDoc.exists()) {
        const baseData = baseDoc.data();
        const pages = baseData.pages || {};

        if (pages[pageId] && pages[pageId].status) {
            statusSelect.value = pages[pageId].status;
        }
    }
}
// Загрузка данных страницы для редактирования
async function loadPageData(userUID) {
    const baseDoc = await getDoc(doc(db, "bases", baseId));

    if (baseDoc.exists()) {
        const baseData = baseDoc.data();
        const pages = baseData.pages || {};

        if (pages[pageId]) {
            const pageData = pages[pageId];
            pageTitle.value = pageData.title || "";
            pageDescription.value = pageData.description || "";
            statusSelect.value = pageData.status || "";
        } else {
            alert("Страница не найдена!");
            window.location.href = `index.html?baseId=${baseId}`;
        }
    } else {
        alert("База не найдена!");
        window.location.href = "index.html";
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
            const baseDocRef = doc(db, "bases", baseId);
            const baseDoc = await getDoc(baseDocRef);

            if (baseDoc.exists()) {
                const baseData = baseDoc.data();
                const pages = baseData.pages || {};

                const pageData = {
                    title,
                    description,
                    status,
                    updatedAt: new Date().toISOString(),
                };

                if (pageId) {
                    // Обновление существующей страницы
                    pages[pageId] = { ...pages[pageId], ...pageData };
                } else {
                    // Создание новой страницы
                    const newPageId = `page_${Date.now()}`;
                    pages[newPageId] = { ...pageData, createdAt: new Date().toISOString() };
                }

                // Обновляем документ базы
                await setDoc(baseDocRef, { pages }, { merge: true });
                window.location.href = `index.html?baseId=${baseId}`;
            } else {
                alert("База не найдена!");
                window.location.href = "index.html";
            }
        }
    } else {
        alert("Пожалуйста, заполните все обязательные поля.");
    }
});


// Отмена
cancelBtn.addEventListener("click", () => {
    window.location.href = `index.html?baseId=${baseId}`;
});
