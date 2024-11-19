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

// Telegram Mini App авторизация
document.addEventListener('DOMContentLoaded', async () => {
    // Проверяем, доступен ли Telegram WebApp SDK
    if (window.Telegram && Telegram.WebApp) {
        const tg = Telegram.WebApp;
        const user = tg.initDataUnsafe.user;

        alert (tg)
        alert (user)

        if (user) {
            const userId = String(user.id);
            const username = user.username || `user${userId}`;
            const email = `${username}@baza.pw`; // Генерация email
            const password = userId; // Используем userId как пароль

            alert(email)
            alert(password)

            try {
                // Попробуем войти в Firebase
                await firebase.auth().signInWithEmailAndPassword(email, password);
                alert('Пользователь успешно вошел через Telegram');
            } catch (error) {
                if (error.code === 'auth/invalid-login-credentials') {
                    // Если пользователя нет, регистрируем его
                    try {
                        await firebase.auth().createUserWithEmailAndPassword(email, password);
                        console.log('Пользователь зарегистрирован через Telegram');
                    } catch (regError) {
                        console.error('Ошибка при регистрации через Telegram:', regError.message);
                        alert('Ошибка при регистрации через Telegram: ' + regError.message);
                        return;
                    }
                } else {
                    console.error('Ошибка при входе через Telegram:', error.message);
                    alert('Ошибка при входе через Telegram: ' + error.message);
                    return;
                }
            }

            // Перенаправляем на главную страницу после успешной авторизации
            window.location.href = 'index.html';
        } else {
            console.error('Не удалось получить данные пользователя Telegram.');
            alert('Не удалось авторизоваться через Telegram.');
        }
    } else {
        console.error('Telegram WebApp SDK не найден.');
        alert('Это приложение должно запускаться через Telegram.');
    }
});

// Обычная авторизация через формы (если Telegram недоступен)
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
