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

const loader = document.getElementById('loader');

// Получение параметров из URL
const urlParams = new URLSearchParams(window.location.search);
const pageId = urlParams.get("pageId");
const baseId = urlParams.get("baseId");

// Загрузка статусов из Firestore
async function loadStatuses(userUID) {
    statusSelect.innerHTML = ""; // Очищаем селектор перед загрузкой

    // Получаем документ базы
    const baseDoc = await getDoc(doc(db, `bases/${baseId}`));

    if (baseDoc.exists()) {
        const baseData = baseDoc.data();
        const statusLinks = baseData.statuses || {}; // Ссылки на статусы

        if (Object.keys(statusLinks).length > 0) {
            const statusEntries = await Promise.all(
                Object.keys(statusLinks).map(async (statusId) => {
                    const statusDoc = await getDoc(doc(db, `statuses/${statusId}`));
                    if (statusDoc.exists()) {
                        const statusData = statusDoc.data();
                        return {
                            id: statusId,
                            name: statusData.name,
                            order: statusData.order
                        };
                    }
                    return null;
                })
            );

            // Фильтруем отсутствующие статусы и сортируем их
            const statusesArray = statusEntries
                .filter(status => status !== null)
                .sort((a, b) => a.order - b.order);

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
    const pageDoc = await getDoc(doc(db, "pages", pageId));
    if (pageDoc.exists()) {
        const pageData = pageDoc.data();
        if (pageData.status) {
            statusSelect.value = pageData.status;
        }
    }
}

// Загрузка данных страницы для редактирования
async function loadPageData(userUID) {
    const pageDoc = await getDoc(doc(db, "pages", pageId));

    if (pageDoc.exists()) {
        const pageData = pageDoc.data();
        pageTitle.value = pageData.title || "";
        pageDescription.value = pageData.description || "";
        statusSelect.value = pageData.status || "";
    } else {
        alert("Страница не найдена!");
        window.location.href = `index.html?baseId=${baseId}`;
    }
}

// Показ лоадера
function showLoader() {
    loader.style.display = 'flex';
}

// Скрытие лоадера
function hideLoader() {
    loader.style.display = 'none';
}

// Инициализация при загрузке страницы
onAuthStateChanged(auth, async (user) => {
    showLoader();  // Показ лоадера при старте
    if (user) {
        try {
            await loadStatuses(user.uid);
            if (pageId) {
                await loadPageData(user.uid);
            }
        } catch (error) {
            console.error("Ошибка загрузки данных", error);
            alert("Ошибка загрузки данных");
        } finally {
            hideLoader();  // Скрытие лоадера после завершения загрузки
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
            if (pageId) {
                // Обновление существующей страницы
                const pageDocRef = doc(db, "pages", pageId);
                await setDoc(pageDocRef, {
                    title,
                    description,
                    status,
                    baseId,
                    updatedAt: new Date().toISOString(),
                }, { merge: true });

                const baseDocRef = doc(db, "bases", baseId);
                const baseDoc = await getDoc(baseDocRef);
                if (baseDoc.exists()) {
                    const baseData = baseDoc.data();
                    const pages = baseData.pages || {};
                    pages[pageId] = null; // Ссылка на страницу
                    await setDoc(baseDocRef, { pages }, { merge: true });
                }
            } else {
                // Создание новой страницы
                const newPageId = `page_${Date.now()}`;
                const pageDocRef = doc(db, "pages", newPageId);
                await setDoc(pageDocRef, {
                    title,
                    description,
                    status,
                    baseId,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });

                const baseDocRef = doc(db, "bases", baseId);
                const baseDoc = await getDoc(baseDocRef);
                if (baseDoc.exists()) {
                    const baseData = baseDoc.data();
                    const pages = baseData.pages || {};
                    pages[newPageId] = null; // Ссылка на страницу
                    await setDoc(baseDocRef, { pages }, { merge: true });
                }
            }
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
