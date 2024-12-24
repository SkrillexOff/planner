import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, onSnapshot, query } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBYI_LCb4mld3VEfIOU9D49gLV81gKTovE",
  authDomain: "taskcalendarapp-bf3b3.firebaseapp.com",
  projectId: "taskcalendarapp-bf3b3",
  storageBucket: "taskcalendarapp-bf3b3.firebasestorage.app",
  messagingSenderId: "482463811896",
  appId: "1:482463811896:web:11700779551db85f8c59cd",
  measurementId: "G-4V1NYWDVKF",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const logoutBtn = document.getElementById("logout-btn");
const createBaseBtn = document.getElementById("create-base-btn");
const modal = document.getElementById("modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const saveBaseBtn = document.getElementById("save-base-btn");
const baseNameInput = document.getElementById("base-name");
const basesList = document.getElementById("bases-list");

// Получение текущего пользователя
auth.onAuthStateChanged(async (user) => {
  if (user) {
    await ensureUserData(user); // Передаем весь объект user
    loadBases(user.uid);

    // Отображаем почту пользователя
    const userEmailElement = document.getElementById("user-email");
    if (userEmailElement) {
      userEmailElement.textContent = user.email; // Устанавливаем почту пользователя
    }
  } else {
    window.location.href = "auth.html";
  }
});


logoutBtn.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      window.location.href = "auth.html";
    })
    .catch((error) => {
      console.error("Ошибка выхода:", error);
    });
});

createBaseBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

closeModalBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

saveBaseBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const baseName = baseNameInput.value.trim();
  if (baseName === "") {
    alert("Название базы не может быть пустым.");
    return;
  }

  try {
    const baseId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const baseData = {
      name: baseName,
      owner: user.uid,
      createdAt: new Date(),
    };
    await setDoc(doc(db, `bases`, baseId), baseData);

    const userRef = doc(db, `users`, user.uid);
    await updateDoc(userRef, {
      [`bases.${baseId}`]: baseName,
    });

    baseNameInput.value = "";
    modal.classList.add("hidden");
  } catch (error) {
    console.error("Ошибка при создании базы:", error);
    alert("Не удалось сохранить базу. Повторите попытку.");
  }
});

async function loadBases(userId) {
  const userRef = doc(db, `users/${userId}`);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    console.error("Данные пользователя не найдены.");
    return;
  }

  const userData = userSnapshot.data();
  const ownedBases = userData.bases || {}; // базы, где пользователь - владелец
  const joinedBases = userData.joinedAt || {}; // базы, где пользователь - участник

  // Собираем все уникальные идентификаторы баз
  const allBaseIds = [
    ...Object.keys(ownedBases),
    ...Object.keys(joinedBases),
  ];

  // Загружаем данные баз
  const basePromises = allBaseIds.map(async (baseId) => {
    const baseDoc = await getDoc(doc(db, `bases/${baseId}`));
    return baseDoc.exists() ? { id: baseId, ...baseDoc.data() } : null;
  });

  const bases = (await Promise.all(basePromises)).filter(Boolean);

  // Рендерим базы
  renderBases(bases, userId);
}

function renderBases(bases, userId) {
  basesList.innerHTML = ""; // Очищаем контейнер

  bases.forEach((base) => {
    const isOwner = base.owner === userId;
    const isShared = !isOwner; // База добавлена через joinedAt

    const baseElement = document.createElement("div"); // Вместо <li>
    baseElement.classList.add("base-item"); // Добавляем класс для стилизации
    baseElement.textContent = `${base.name} ${isShared ? "(Участник)" : "(Владелец)"}`;
    baseElement.dataset.id = base.id;

    baseElement.addEventListener("click", () => {
      window.location.href = `index.html?baseId=${base.id}`;
    });

    basesList.appendChild(baseElement); // Добавляем элемент в контейнер
  });
}



// Убедиться, что пользовательские данные существуют
async function ensureUserData(user) {
  const userRef = doc(db, `users`, user.uid);
  const userSnapshot = await getDoc(userRef);
  if (!userSnapshot.exists()) {
    const userData = {
      email: user.email,
      createdAt: new Date(),
      bases: {},
    };
    try {
      await setDoc(userRef, userData);
    } catch (error) {
      console.error("Ошибка при создании профиля пользователя:", error);
    }
  }
}