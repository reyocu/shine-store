// auth.js - система регистрации и авторизации

// Инициализация данных
function initializeData() {
    console.log('Инициализация данных...');
    
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let products = JSON.parse(localStorage.getItem('products')) || [];

    // Создаем демо пользователя если нет пользователей
    if (users.length === 0) {
        users = [{
            id: 1,
            email: 'demo@shinecookies.ru',
            password: 'demo123',
            name: 'Демо пользователь',
            balance: 1000,
            registrationDate: new Date().toISOString(),
            purchases: []
        }];
        localStorage.setItem('users', JSON.stringify(users));
        console.log('Создан демо пользователь');
    }

    // Создаем товары если их нет - УПРОЩЕННАЯ ВЕРСИЯ
    if (products.length === 0) {
        products = [
            {
                id: 1,
                name: "Steam Premium аккаунт",
                price: 1500,
                image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=250&fit=crop",
                category: "games",
                features: ["Уровень 50+", "10+ игр в библиотеке", "Гарантия 30 дней", "Полный доступ"],
                fileContent: "steam_accounts.txt"
            },
            {
                id: 2,
                name: "YouTube Premium",
                price: 1200,
                image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=250&fit=crop",
                category: "streaming",
                features: ["Семейная подписка", "Без рекламы", "Фоновая работа", "Гарантия 60 дней"],
                fileContent: "youtube_accounts.txt"
            },
            {
                id: 3,
                name: "Spotify Premium",
                price: 800,
                image: "https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=400&h=250&fit=crop",
                category: "streaming",
                features: ["Высокое качество", "Без ограничений", "Оффлайн прослушивание", "Гарантия 90 дней"],
                fileContent: "spotify_accounts.txt"
            },
            {
                id: 4,
                name: "Netflix 4K Premium",
                price: 1800,
                image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&h=250&fit=crop",
                category: "streaming",
                features: ["4K Ultra HD", "4 устройства", "Без рекламы", "Гарантия 30 дней"],
                fileContent: "netflix_accounts.txt"
            },
            {
                id: 5,
                name: "Discord Nitro",
                price: 600,
                image: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&h=250&fit=crop",
                category: "other",
                features: ["HD видео", "Улучшенный звук", "Анимированные эмодзи", "Гарантия 60 дней"],
                fileContent: "discord_accounts.txt"
            },
            {
                id: 6,
                name: "Microsoft Office 365",
                price: 900,
                image: "https://images.unsplash.com/photo-1588690154757-badf464419d9?w=400&h=250&fit=crop",
                category: "software",
                features: ["Полный пакет", "1TB OneDrive", "Поддержка 5 устройств", "Гарантия 1 год"],
                fileContent: "office_accounts.txt"
            }
        ];
        localStorage.setItem('products', JSON.stringify(products));
        console.log('Созданы товары');
    }
}

// Получить текущего пользователя
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Регистрация пользователя
function registerUser(name, email, password, confirmPassword) {
    // Валидация
    if (!name || !email || !password || !confirmPassword) {
        showNotification('❌ Заполните все поля');
        return false;
    }

    if (!isValidEmail(email)) {
        showNotification('❌ Введите корректный email');
        return false;
    }

    if (password.length < 6) {
        showNotification('❌ Пароль должен быть не менее 6 символов');
        return false;
    }

    if (password !== confirmPassword) {
        showNotification('❌ Пароли не совпадают');
        return false;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Проверка существования пользователя
    if (users.find(user => user.email === email)) {
        showNotification('❌ Пользователь с таким email уже существует');
        return false;
    }

    // Создание нового пользователя
    const newUser = {
        id: Date.now(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: password,
        balance: 0,
        purchases: [],
        registrationDate: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    console.log('Зарегистрирован новый пользователь:', newUser);
    showNotification('✅ Регистрация успешна! Добро пожаловать!');
    return true;
}

// Авторизация пользователя
function loginUser(email, password) {
    if (!email || !password) {
        showNotification('❌ Заполните все поля');
        return false;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.password === password
    );
    
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        console.log('Пользователь вошел:', user);
        showNotification('✅ Вход выполнен успешно!');
        return true;
    } else {
        showNotification('❌ Неверный email или пароль');
        return false;
    }
}

// Выход пользователя
function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        localStorage.removeItem('currentUser');
        showNotification('👋 До свидания! Возвращайтесь снова!');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// Валидация email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Показать уведомление
function showNotification(message) {
    // Удаляем существующие уведомления
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Инициализация при загрузке
initializeData();