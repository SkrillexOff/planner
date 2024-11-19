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

document.addEventListener('DOMContentLoaded', async () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // Telegram Mini App обработка
    if (window.Telegram && Telegram.WebApp.initDataUnsafe) {
        const initData = Telegram.WebApp.initDataUnsafe;

        if (initData && initData.user) {
            const userId = String(initData.user.id); // Преобразуем userId в строку
            const username = initData.user.username || `user${userId}`; // Если username отсутствует, используем "user{userId}"
            const email = `${userId}@example.com`;
            const password = username;

            try {
                alert('Попытка входа с email:' + email);
                // Попытка входа в Firebase
                await firebase.auth().signInWithEmailAndPassword(email, password);
                alert('Вход выполнен успешно через Telegram Mini App');
            } catch (error) {
                if (error.code === 'auth/user-not-found') {
                    alert('Пользователь не найден. Регистрация нового пользователя с email:' + email);
                    try {
                        // Регистрация нового пользователя
                        await firebase.auth().createUserWithEmailAndPassword(email, password);
                        alert('Пользователь успешно зарегистрирован через Telegram Mini App');
                    } catch (registerError) {
                        console.error('Ошибка регистрации пользователя через Telegram:', registerError.message);
                        alert('Ошибка регистрации:' + registerError.message);
                        return;
                    }
                } else {
                    console.error('Ошибка входа через Telegram:', error.message);
                    alert('Ошибка входа через Telegram:' + error.message);
                    return;
                }
            }

            // После успешного входа или регистрации
            window.location.href = 'index.html';
            return;
        } else {
            console.error('Данные пользователя из Telegram недоступны.');
            alert('Ошибка: Telegram не передал данные пользователя.');
        }
    }

    // Обработчики форм для стандартной авторизации
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
