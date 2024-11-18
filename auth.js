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

// Функция для обработки авторизации через Telegram
async function handleTelegramAuth() {
    try {
        const telegramData = window.Telegram.WebApp.initDataUnsafe;

        // Проверяем данные Telegram
        if (!telegramData || !telegramData.user || !telegramData.user.id) {
            alert("Telegram данные отсутствуют или некорректны.");
            alert("Проблема с инициализацией Telegram Mini App.");
            window.location.href = 'login.html';
            return;
        }

        const userId = String(telegramData.user.id); // Преобразуем user.id в строку
        const email = `${userId}@example.com`; // Генерируем email
        const password = `TgPass_${userId}_2024`; // Генерируем пароль

        alert(email)
        alert(password)

        // Попытка входа
        try {
            const loginResult = await firebase.auth().signInWithEmailAndPassword(email, password);
            alert("Успешный вход через Telegram:" + loginResult.user);
            window.location.href = 'index.html'; // Перенаправление на главную страницу
        } catch (loginError) {
            alert("Ошибка входа:" + loginError);

            if (loginError.code === 'auth/user-not-found') {
                alert("Пользователь не найден. Выполняем регистрацию...");

                // Выполняем регистрацию
                try {
                    const registerResult = await firebase.auth().createUserWithEmailAndPassword(email, password);
                    console.log("Регистрация успешна:", registerResult.user);

                    // Вход после успешной регистрации
                    const newLoginResult = await firebase.auth().signInWithEmailAndPassword(email, password);
                    console.log("Вход после регистрации выполнен успешно:", newLoginResult.user);
                    window.location.href = 'index.html'; // Перенаправление на главную страницу
                } catch (registerError) {
                    console.error("Ошибка при регистрации:", registerError);
                    alert("Ошибка регистрации: " + registerError.message);

                    if (registerError.code === 'auth/invalid-email') {
                        alert("Некорректный email:" + email);
                    }
                    if (registerError.code === 'auth/weak-password') {
                        alert("Пароль не соответствует требованиям:" + password);
                    }
                }
            } else {
                alert("Ошибка входа: " + loginError.message);
            }
        }
    } catch (generalError) {
        console.error("Общая ошибка авторизации через Telegram:", generalError);
        alert("Ошибка: " + generalError.message);
    }
}


// Обработка DOM загрузки
document.addEventListener('DOMContentLoaded', () => {
    // Если приложение открыто через Telegram Mini App
    if (window.Telegram && window.Telegram.WebApp) {
        handleTelegramAuth();
        return; // Telegram-логика выполнена, остальной код не нужен
    }

    // Обработка стандартной авторизации и регистрации
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
