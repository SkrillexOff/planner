import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDocs, updateDoc, onSnapshot, query } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

// Инициализация Firebase
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

// Элементы DOM
const logoutBtn = document.getElementById("logout-btn");
const createBaseBtn = document.getElementById("create-base-btn");
const modal = document.getElementById("modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const saveBaseBtn = document.getElementById("save-base-btn");
const baseNameInput = document.getElementById("base-name");
const basesList = document.getElementById("bases-list");

// Получение текущего пользователя
auth.onAuthStateChanged((user) => {
  if (user) {
    ensureUserData(user.uid); // Убедимся, что пользовательские данные существуют
    loadBases(user.uid);
  } else {
    window.location.href = "auth.html";
  }
});

// Выход из аккаунта
logoutBtn.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      window.location.href = "auth.html";
    })
    .catch((error) => {
      console.error("Ошибка выхода:", error);
    });
});

// Открыть модальное окно
createBaseBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

// Закрыть модальное окно
closeModalBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

// Сохранить новую базу
saveBaseBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const baseName = baseNameInput.value.trim();
  if (baseName === "") {
    alert("Название базы не может быть пустым.");
    return;
  }

  try {
    // Создаём уникальный ID для базы
    const baseId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Сохраняем базу в коллекции `bases`
    const baseData = {
      name: baseName,
      owner: user.uid,
      createdAt: new Date(),
    };
    await setDoc(doc(db, `bases`, baseId), baseData);

    // Обновляем данные пользователя (добавляем ссылку на базу в `users/${user.uid}/bases`)
    const userRef = doc(db, `users`, user.uid);
    await updateDoc(userRef, {
      [`bases.${baseId}`]: baseName, // Обновляем объект bases
    });

    baseNameInput.value = ""; // Очистить инпут
    modal.classList.add("hidden"); // Закрыть модальное окно
  } catch (error) {
    console.error("Ошибка при создании базы:", error);
    alert("Не удалось сохранить базу. Проверьте подключение к сети и повторите попытку.");
  }
});

// Загрузка списка баз
function loadBases(userId) {
  const basesRef = query(collection(db, `bases`));

  onSnapshot(
    basesRef,
    (snapshot) => {
      basesList.innerHTML = ""; // Очистить список
      if (!snapshot.empty) {
        snapshot.forEach((doc) => {
          const base = doc.data();

          // Проверяем, является ли пользователь владельцем базы или включён в sharedWith
          const isOwner = base.owner === userId;
          const isSharedWith = base.sharedWith && userId in base.sharedWith; // Проверяем ключ в объекте

          if (isOwner || isSharedWith) {
            const li = document.createElement("li");
            li.textContent = base.name + (isSharedWith ? " (Shared)" : ""); // Добавляем пометку для баз, где пользователь shared
            li.dataset.id = doc.id; // Сохранить ID базы
            li.addEventListener("click", () => {
              window.location.href = `index.html?baseId=${doc.id}`;
            });
            basesList.appendChild(li);
          }
        });
      } else {
        basesList.innerHTML = "<li>Базы отсутствуют.</li>";
      }
    },
    (error) => {
      console.error("Ошибка при загрузке баз:", error);
    }
  );
}



// Убедиться, что пользовательские данные существуют
async function ensureUserData(userId) {
  const userRef = doc(db, `users`, userId);
  const userData = {
    identifier: userId,
    bases: {},
  };
  try {
    await setDoc(userRef, userData, { merge: true });
  } catch (error) {
    console.error("Ошибка при проверке данных пользователя:", error);
  }
}
