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

    // Проверка, есть ли Mini App SDK
    if (window.Telegram && Telegram.WebApp.initDataUnsafe) {
        const initData = Telegram.WebApp.initDataUnsafe;

        if (initData && initData.user) {
            const userId = String(initData.user.id); // Преобразуем userId в строку
            const username = initData.user.username || 'default_username'; // Если нет username, задаём дефолтное значение
            const email = `${userId}@example.com`;
            const password = username;

            try {
                // Попробуем войти, если пользователь уже существует
                await firebase.auth().signInWithEmailAndPassword(email, password);
                console.log('Вход выполнен через Telegram Mini App');
            } catch (error) {
                // Если пользователь не найден, создаём нового
                if (error.code === 'auth/user-not-found') {
                    try {
                        await firebase.auth().createUserWithEmailAndPassword(email, password);
                        console.log('Пользователь успешно зарегистрирован через Telegram Mini App');
                    } catch (registerError) {
                        console.error('Ошибка регистрации через Telegram:', registerError.message);
                        alert('Не удалось зарегистрироваться через Telegram');
                    }
                } else {
                    console.error('Ошибка входа через Telegram:', error.message);
                }
            }

            // После успешного входа или регистрации перенаправляем на главную страницу
            window.location.href = 'index.html';
            return;
        }
    }

    // Обработчики форм
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
