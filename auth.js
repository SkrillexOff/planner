// Инициализация Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBYI_LCb4mld3VEfIOU9D49gLV81gKTovE",
    authDomain: "taskcalendarapp-bf3b3.firebaseapp.com",
    projectId: "taskcalendarapp-bf3b3",
    storageBucket: "taskcalendarapp-bf3b3.appspot.com",
    messagingSenderId: "482463811896",
    appId: "1:482463811896:web:11700779551db85f8c59cd",
    measurementId: "G-4V1NYWDVKF"
};

// Инициализация Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app(); // если Firebase уже инициализирован
}

// Проверка и настройка Telegram Mini App авторизации
async function handleTelegramAuth() {
    const tg = window.Telegram.WebApp;
    tg.ready();

    alert("Telegram Init Data:", tg.initData);
    alert("Telegram Init Data Unsafe:", tg.initDataUnsafe);

    if (!tg.initDataUnsafe || !tg.initDataUnsafe.user || !tg.initDataUnsafe.user.id) {
        alert("Telegram данные пользователя недоступны.");
        alert("Откройте приложение через Telegram Mini App.");
        return;
    }

    const user = tg.initDataUnsafe.user;
    const email = `${user.id}@telegram.com`;
    const password = String(user.id);

    alert("Попытка входа/регистрации с данными:", email, password);

    const currentUser = firebase.auth().currentUser;
    if (currentUser) {
        alert("Пользователь уже аутентифицирован:", currentUser.email);
        window.location.href = 'index.html'; // Перенаправление на главную страницу
        return;
    }

    try {
        // Попытка входа
        await firebase.auth().signInWithEmailAndPassword(email, password);
        alert("Вход выполнен успешно");
        window.location.href = 'index.html'; // Перенаправление на главную страницу
    } catch (error) {
        alert("Ошибка при входе:", error.code, error.message);

        if (error.code === 'auth/user-not-found') {
            alert("Пользователь не найден, регистрируем нового...");
            try {
                // Регистрация нового пользователя
                await firebase.auth().createUserWithEmailAndPassword(email, password);
                alert("Регистрация выполнена успешно");
                // После регистрации перенаправляем
                window.location.href = 'index.html';
            } catch (registerError) {
                alert("Ошибка регистрации:", registerError.code, registerError.message);
                alert("Ошибка регистрации: " + registerError.message);
            }
        } else {
            alert("Ошибка при входе: " + error.message);
        }
    }
}



// Запуск при загрузке страницы
window.onload = () => {
    handleTelegramAuth();
};

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                await firebase.auth().signInWithEmailAndPassword(email, password);
                alert('Вход выполнен успешно!');
                window.location.href = 'index.html'; // Перенаправление на главную страницу
            } catch (error) {
                alert('Ошибка входа: ' + error.message);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;

            try {
                await firebase.auth().createUserWithEmailAndPassword(email, password);
                alert('Регистрация прошла успешно!');
                window.location.href = 'login.html'; // Перенаправление на страницу входа
            } catch (error) {
                alert('Ошибка регистрации: ' + error.message);
            }
        });
    }
});
