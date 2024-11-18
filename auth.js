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

    // Логирование Telegram данных
    alert("Telegram initData:", telegramData);

    if (telegramData && telegramData.user && telegramData.user.username) {
        const userId = String(telegramData.user.id); // Преобразование user.id в строку
        const email = `${userId}@telegram.com`; // Используем корректный тестовый домен
        const password = `TgPass_${userId}_2024`; // Генерируем безопасный пароль

        alert(email)
        alert(password)

        try {
            // Попробуем войти с такими учетными данными
            await firebase.auth().signInWithEmailAndPassword(email, password);
            alert("Вход через Telegram выполнен успешно!");
            window.location.href = 'index.html'; // Перенаправление на главную страницу
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                // Если пользователь не найден, регистрируем его
                try {
                    await firebase.auth().createUserWithEmailAndPassword(email, password);
                    alert("Регистрация через Telegram выполнена успешно!");
                    // После регистрации сразу входим
                    await firebase.auth().signInWithEmailAndPassword(email, password);
                    alert("Вход после регистрации успешен!");
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
        console.error("Telegram data отсутствует или повреждено");
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
