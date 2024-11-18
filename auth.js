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
    tg.ready(); // Устанавливаем, что SDK готово к использованию

    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;

        // Формируем данные для авторизации
        const email = `${user.id}@telegram.com`;
        const password = String(user.id);

        try {
            // Проверяем, существует ли пользователь
            await firebase.auth().signInWithEmailAndPassword(email, password);
            console.log('Вход выполнен успешно через Telegram');
            window.location.href = 'index.html'; // Перенаправление на главную страницу
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                // Если пользователь не существует, регистрируем его
                try {
                    await firebase.auth().createUserWithEmailAndPassword(email, password);
                    console.log('Регистрация выполнена успешно через Telegram');
                    window.location.href = 'index.html'; // Перенаправление на главную страницу
                } catch (registerError) {
                    console.error('Ошибка при регистрации:', registerError.message);
                }
            } else {
                console.error('Ошибка при входе:', error.message);
            }
        }
    } else {
        // Если пользователь не вошёл через Telegram
        window.location.href = 'login.html'; // Перенаправление на страницу входа
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
