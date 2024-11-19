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
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        const initDataUnsafe = tg.initDataUnsafe;

        if (initDataUnsafe && initDataUnsafe.user) {
            const user = initDataUnsafe.user;
            const userId = String(user.id);
            const email = `${userId}@example.com`;
            const password = username;

            alert(email)
            alert(password)

            try {
                // Попытка входа с использованием email и пароля
                await firebase.auth().signInWithEmailAndPassword(email, password);
                console.log('Вход выполнен через Telegram');
            } catch (error) {
                if (error.code === 'auth/user-not-found') {
                    // Регистрация нового пользователя, если он не найден
                    try {
                        await firebase.auth().createUserWithEmailAndPassword(email, password);
                        console.log('Пользователь зарегистрирован через Telegram');
                    } catch (regError) {
                        console.error('Ошибка регистрации через Telegram:', regError.message);
                        alert('Ошибка регистрации через Telegram: ' + regError.message);
                        return;
                    }
                } else {
                    console.error('Ошибка входа через Telegram:', error.message);
                    alert('Ошибка входа через Telegram: ' + error.message);
                    return;
                }
            }

            // Перенаправление на главную страницу
            window.location.href = 'index.html';
        } else {
            alert('Ошибка: данные Telegram недоступны.');
        }
    } else {
        alert('Telegram WebApp SDK не найден.');
    }
}

// Запуск обработчика авторизации при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    if (window.Telegram && window.Telegram.WebApp) {
        handleTelegramAuth();
    }

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
