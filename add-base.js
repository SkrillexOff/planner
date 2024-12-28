import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBYI_LCb4mld3VEfIOU9D49gLV81gKTovE",
  authDomain: "taskcalendarapp-bf3b3.firebaseapp.com",
  projectId: "taskcalendarapp-bf3b3",
  storageBucket: "taskcalendarapp-bf3b3.appspot.com",
  messagingSenderId: "482463811896",
  appId: "1:482463811896:web:11700779551db85f8c59cd",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const saveBaseBtn = document.getElementById("save-base-btn");
const baseNameInput = document.getElementById("base-name");
const avatarButtons = document.querySelectorAll(".avatar-option");
const avatarPreview = document.getElementById("avatar-preview");
const avatarModal = document.getElementById("avatar-modal");
const changeAvatarBtn = document.getElementById("change-avatar-btn");
const closeModalBtn = document.getElementById("close-modal");

const participantList = document.getElementById("participant-list");
const newParticipantInput = document.getElementById("new-participant");
const addParticipantBtn = document.getElementById("add-participant-btn");

let selectedAvatar = "base-avatar.png"; // Значение по умолчанию
let participants = {}; // Хранение участников

changeAvatarBtn.addEventListener("click", () => {
  avatarModal.classList.remove("hidden");
});

closeModalBtn.addEventListener("click", () => {
  avatarModal.classList.add("hidden");
});

avatarButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedAvatar = button.dataset.avatar;
    avatarPreview.src = `images/avatars/${selectedAvatar}`;
    avatarModal.classList.add("hidden");
  });
});

// Добавление нового участника по email или ID
addParticipantBtn.addEventListener('click', async () => {
    const input = newParticipantInput.value.trim();
    if (!input) {
      alert('Введите email или ID участника.');
      return;
    }
  
    const user = auth.currentUser;
    if (!user) return;
  
    let userId = input;
    let userEmail = input;
  
    // Если введен email, ищем UID
    if (input.includes('@')) {
      const usersQuery = collection(db, 'users');
      const userDocs = await getDocs(usersQuery);
      const matchedUser = userDocs.docs.find((doc) => doc.data().email === input);
  
      if (matchedUser) {
        userId = matchedUser.id;
        userEmail = matchedUser.data().email;
      } else {
        alert('Пользователь с таким email не найден.');
        return;
      }
    }
  
    // Проверка на дублирование
    if (participants[userId]) {
      alert('Этот участник уже добавлен.');
      return;
    }
  
    // Добавляем в sharedWith как userId: null
    participants[userId] = { email: userEmail, value: null };
    
    renderParticipants();
    newParticipantInput.value = '';
  });
  
  // Удаление участника
  function removeParticipant(uid) {
    delete participants[uid];
    renderParticipants();
  }
  
  // Рендеринг списка участников
  function renderParticipants() {
    participantList.innerHTML = '';
    Object.entries(participants).forEach(([uid, { email }]) => {
      const li = document.createElement('li');
      li.textContent = email;
  
      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Удалить';
      removeBtn.addEventListener('click', () => removeParticipant(uid));
  
      li.appendChild(removeBtn);
      participantList.appendChild(li);
    });
  }
  
  // Сохранение базы с участниками
  saveBaseBtn.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) return;
  
    const baseName = baseNameInput.value.trim();
    if (!baseName) {
      alert('Название базы не может быть пустым.');
      return;
    }
  
    try {
      const baseId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const sharedWith = {};
  
      // Формируем sharedWith с null значением
      Object.keys(participants).forEach((uid) => {
        sharedWith[uid] = null;
      });
  
      const baseData = {
        name: baseName,
        owner: user.uid,
        createdAt: new Date(),
        avatar: selectedAvatar,
        sharedWith,
      };
  
      await setDoc(doc(db, `bases`, baseId), baseData);
  
      const userRef = doc(db, `users`, user.uid);
      await updateDoc(userRef, {
        [`bases.${baseId}`]: baseName,
      });
  
      // Обновляем joinedAt у добавленных участников
      for (const userId of Object.keys(sharedWith)) {
        const userRef = doc(db, `users/${userId}`);
        const userSnap = await getDoc(userRef);
  
        if (!userSnap.exists()) {
          await setDoc(userRef, { joinedAt: { [baseId]: null } });
        } else {
          const joinedAt = userSnap.data().joinedAt || {};
          joinedAt[baseId] = null;
          await updateDoc(userRef, { joinedAt });
        }
      }
  
      alert('База успешно добавлена!');
      window.location.href = 'bases.html';
    } catch (error) {
      console.error('Ошибка при создании базы:', error);
      alert('Не удалось создать базу.');
    }
  });
  