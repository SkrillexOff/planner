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

// Функция авторизации через Telegram
async function telegramAuth() {
    if (window.Telegram && Telegram.WebApp) {
        const tg = Telegram.WebApp;
        const initDataUnsafe = tg.initDataUnsafe;

        if (initDataUnsafe && initDataUnsafe.user) {
            const userId = String(initDataUnsafe.user.id);
            const username = initDataUnsafe.user.username || `user${userId}`;
            const email = `${userId}@example.com`;
            const password = username;

            try {
                // Проверяем, существует ли пользователь
                await firebase.auth().signInWithEmailAndPassword(email, password);
                console.log('Вход выполнен успешно через Telegram!');
            } catch (error) {
                if (error.code === 'auth/user-not-found') {
                    // Если пользователя нет, создаём нового
                    try {
                        await firebase.auth().createUserWithEmailAndPassword(email, password);
                        console.log('Регистрация прошла успешно через Telegram!');
                    } catch (registerError) {
                        console.error('Ошибка при регистрации:', registerError.message);
                        return;
                    }
                } else {
                    console.error('Ошибка при входе:', error.message);
                    return;
                }
            }

            // Перенаправляем на главную страницу
            window.location.href = 'index.html';
        } else {
            console.error('Не удалось получить данные пользователя из Telegram.');
        }
    } else {
        console.error('Telegram WebApp SDK недоступен.');
    }
}

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

    // Автоматическая авторизация через Telegram при загрузке страницы
    telegramAuth();
});
