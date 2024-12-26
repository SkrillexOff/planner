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

const loader = document.getElementById("loader");

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
    window.location.href = "login.html";
  }
});


logoutBtn.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      window.location.href = "login.html";
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
  // Показываем лоадер перед загрузкой
  loader.style.display = "flex";

  const userRef = doc(db, `users/${userId}`);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    console.error("Данные пользователя не найдены.");
    loader.style.display = "none";
    return;
  }

  const userData = userSnapshot.data();
  const ownedBases = userData.bases || {};
  const joinedBases = userData.joinedAt || {};

  const allBaseIds = [
    ...Object.keys(ownedBases),
    ...Object.keys(joinedBases),
  ];

  const basePromises = allBaseIds.map(async (baseId) => {
    const baseDoc = await getDoc(doc(db, `bases/${baseId}`));
    return baseDoc.exists() ? { id: baseId, ...baseDoc.data() } : null;
  });

  const bases = (await Promise.all(basePromises)).filter(Boolean);

  // Скрываем лоадер после загрузки
  loader.style.display = "none";
  
  renderBases(bases, userId);
}

function renderBases(bases, userId) {
  basesList.innerHTML = ""; // Очищаем контейнер

  bases.forEach((base) => {
    const isOwner = base.owner === userId;
    const isShared = !isOwner; // База добавлена через joinedAt

    // Создаём основной блок base-item
    const baseElement = document.createElement("div");
    baseElement.classList.add("base-item");
    baseElement.dataset.id = base.id;

    // Создаём обёртку для аватара
    const avatarWrapper = document.createElement("div");
    avatarWrapper.classList.add("avatar-wrapper");

    // Добавляем аватар в обёртку
    const avatarElement = document.createElement("img");
    avatarElement.classList.add("base-avatar");
    avatarElement.src = "/images/base-avatar.svg"; // Укажите источник изображения или добавьте динамически
    avatarElement.alt = "base-avatar";

    avatarWrapper.appendChild(avatarElement); // Помещаем img внутрь avatar-wrapper

    // Создаём блок описания
    const descriptionElement = document.createElement("div");
    descriptionElement.classList.add("base-description");

    // Добавляем название базы
    const nameElement = document.createElement("div");
    nameElement.classList.add("base-name");
    nameElement.textContent = base.name;

    // Добавляем роль (участник/владелец)
    const roleElement = document.createElement("div");
    roleElement.classList.add("base-role");
    roleElement.textContent = isShared ? "(Участник)" : "(Владелец)";

    // Собираем блок описания
    descriptionElement.appendChild(nameElement);
    descriptionElement.appendChild(roleElement);

    // Собираем основной блок
    baseElement.appendChild(avatarWrapper);  // Добавляем обёртку с аватаром
    baseElement.appendChild(descriptionElement);

    // Добавляем обработчик клика
    baseElement.addEventListener("click", () => {
      window.location.href = `index.html?baseId=${base.id}`;
    });

    // Добавляем base-item в контейнер
    basesList.appendChild(baseElement);
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