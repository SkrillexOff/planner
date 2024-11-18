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

        // Проверка данных Telegram
        alert("Telegram initDataUnsafe:", telegramData);

        if (!telegramData || !telegramData.user || !telegramData.user.id) {
            alert("Telegram данные отсутствуют или некорректны.");
            alert("Проблема с инициализацией Telegram Mini App.");
            window.location.href = 'login.html';
            return;
        }

        const userId = String(telegramData.user.id); // Преобразование user.id в строку
        const email = `${userId}@example.com`; // Используем корректный домен
        const password = `TgPass_${userId}_2024`; // Генерируем безопасный пароль

        alert(email)
        alert(password)

        try {
            // Попытка входа
            await firebase.auth().signInWithEmailAndPassword(email, password);
            alert("Успешный вход через Telegram.");
            window.location.href = 'index.html'; // Перенаправление на главную страницу
        } catch (loginError) {
            alert(email)
            alert(password)

            alert("Ошибка входа:", loginError);

            if (loginError.code === 'auth/user-not-found') {
                alert("Пользователь не найден. Пытаемся зарегистрировать...");

                try {
                    // Регистрация нового пользователя
                    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
                    alert("Успешная регистрация:", userCredential);

                    // Выполняем вход сразу после регистрации
                    await firebase.auth().signInWithEmailAndPassword(email, password);
                    alert("Вход после регистрации успешен!");
                    window.location.href = 'index.html'; // Перенаправление на главную страницу
                } catch (registerError) {
                    console.error("Ошибка регистрации через Telegram:", registerError);
                    alert("Ошибка регистрации через Telegram: " + registerError.message);
                }
            } else {
                alert("Ошибка входа через Telegram: " + loginError.message);
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
