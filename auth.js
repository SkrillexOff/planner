async function handleTelegramAuth() {
    try {
        const telegramData = window.Telegram.WebApp.initDataUnsafe;

        // Проверяем данные Telegram
        if (!telegramData || !telegramData.user || !telegramData.user.id) {
            console.error("Telegram данные отсутствуют или некорректны.");
            alert("Проблема с инициализацией Telegram Mini App.");
            window.location.href = 'login.html';
            return;
        }

        const userId = String(telegramData.user.id); // Преобразуем user.id в строку
        const email = `${userId}@example.com`; // Генерируем email
        const password = `TgPass_${userId}_2024`; // Генерируем пароль

        console.log("Сформированные данные для Firebase:", { email, password });

        // Попытка входа
        try {
            const loginResult = await firebase.auth().signInWithEmailAndPassword(email, password);
            console.log("Успешный вход через Telegram:", loginResult.user);
            window.location.href = 'index.html'; // Перенаправление на главную страницу
        } catch (loginError) {
            console.error("Ошибка входа:", loginError);

            if (loginError.code === 'auth/user-not-found') {
                console.log("Пользователь не найден. Выполняем регистрацию...");

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
                        console.error("Некорректный email:", email);
                    }
                    if (registerError.code === 'auth/weak-password') {
                        console.error("Пароль не соответствует требованиям:", password);
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
