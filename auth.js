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
    const telegramData = window.Telegram.WebApp.initDataUnsafe;

    if (telegramData && telegramData.user) {
        const userId = String(telegramData.user.id); // Преобразование user.id в строку
        const email = `${userId}@baza.pw`; // Используем корректный домен
        const password = `tg_${userId}_pass`; // Генерируем безопасный пароль

        try {
            // Попробуем войти с такими учетными данными
            await firebase.auth().signInWithEmailAndPassword(email, password);
            console.log("Вход через Telegram выполнен успешно!");
            window.location.href = 'index.html'; // Перенаправление на главную страницу
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                // Если пользователь не найден, регистрируем его
                try {
                    await firebase.auth().createUserWithEmailAndPassword(email, password);
                    console.log("Регистрация через Telegram выполнена успешно!");
                    window.location.href = 'index.html'; // Перенаправление на главную страницу
                } catch (registerError) {
                    console.error("Ошибка регистрации через Telegram:", registerError);
                    alert("Ошибка регистрации через Telegram: " + registerError.message);
                }
            } else {
                console.error("Ошибка входа через Telegram:", error);
                alert("Ошибка входа через Telegram: " + error.message);
            }
        }
    } else {
        // Если пользователь не зашел через Telegram, отправляем на страницу входа
        window.location.href = 'login.html';
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
