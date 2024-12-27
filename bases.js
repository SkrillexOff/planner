import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

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
const basesList = document.getElementById("bases-list");
const loader = document.getElementById("loader");

// Получение текущего пользователя
auth.onAuthStateChanged(async (user) => {
  if (user) {
    await ensureUserData(user);
    loadBases(user.uid);

    const userEmailElement = document.getElementById("user-email");
    if (userEmailElement) {
      userEmailElement.textContent = user.email;
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
  window.location.href = "add-base.html";
});

async function loadBases(userId) {
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
  loader.style.display = "none";
  renderBases(bases, userId);
}

function renderBases(bases, userId) {
  basesList.innerHTML = "";

  bases.forEach((base) => {
    const isOwner = base.owner === userId;
    const isShared = !isOwner;

    const baseElement = document.createElement("div");
    baseElement.classList.add("base-item");
    baseElement.dataset.id = base.id;

    const avatarWrapper = document.createElement("div");
    avatarWrapper.classList.add("avatar-wrapper");

    const avatarElement = document.createElement("img");
    avatarElement.classList.add("base-avatar");

    // Подставляем выбранный аватар или дефолтный
    const avatarSrc = base.avatar ? `/images/avatars/${base.avatar}` : "/images/avatars/base-avatar.png";
    avatarElement.src = avatarSrc;
    avatarElement.alt = "base-avatar";

    avatarWrapper.appendChild(avatarElement);

    const descriptionElement = document.createElement("div");
    descriptionElement.classList.add("base-description");

    const nameElement = document.createElement("div");
    nameElement.classList.add("base-name");
    nameElement.textContent = base.name;

    const roleElement = document.createElement("div");
    roleElement.classList.add("base-role");
    roleElement.textContent = isShared ? "Участник" : "Владелец";

    descriptionElement.appendChild(nameElement);
    descriptionElement.appendChild(roleElement);

    baseElement.appendChild(avatarWrapper);
    baseElement.appendChild(descriptionElement);

    baseElement.addEventListener("click", () => {
      window.location.href = `index.html?baseId=${base.id}`;
    });

    basesList.appendChild(baseElement);
  });
}


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
