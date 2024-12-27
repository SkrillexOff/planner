import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import { getFirestore, doc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

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

const saveBaseBtn = document.getElementById("save-base-btn");
const baseNameInput = document.getElementById("base-name");

saveBaseBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) {
    alert("Вы не авторизованы.");
    return;
  }

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

    alert("База успешно добавлена!");
    window.location.href = "bases.html";
  } catch (error) {
    console.error("Ошибка при создании базы:", error);
    alert("Не удалось создать базу. Попробуйте снова.");
  }
});
