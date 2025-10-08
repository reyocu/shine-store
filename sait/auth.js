// auth.js - общие функции для авторизации

// Инициализация данных
function initializeData() {
    console.log('Инициализация данных...');
    
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let products = JSON.parse(localStorage.getItem('products')) || [];

    if (users.length === 0) {
        console.log('Создаем тестового пользователя...');
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
    }

    if (products.length === 0) {
        console.log('Создаем товары...');
        products = [
            {
                id: 1,
                name: "Steam Premium аккаунт",
                price: 1500,
                image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=250&fit=crop",
                features: ["Уровень 50+", "10+ игр в библиотеке", "Гарантия 30 дней", "Полный доступ"]
            },
            {
                id: 2,
                name: "YouTube Premium",
                price: 1200,
                image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=250&fit=crop",
                features: ["Семейная подписка", "Без рекламы", "Фоновая работа", "Гарантия 60 дней"]
            }
        ];
        localStorage.setItem('products', JSON.stringify(products));
    }
}

// Валидация email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Показать уведомление
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(45deg, #00ccff, #00ffaa);
        color: #000;
        padding: 15px 25px;
        border-radius: 10px;
        font-weight: bold;
        z-index: 1000;
        animation: slideInRight 0.3s ease;
        border: 1px solid #00ccff;
        box-shadow: 0 5px 15px rgba(0, 204, 255, 0.3);
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Проверить авторизацию и перенаправить если нужно
function checkAuthAndRedirect() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const isLoginPage = window.location.pathname.includes('index.html') || window.location.pathname === '/';
    const isRegisterPage = window.location.pathname.includes('register.html');
    
    if (currentUser && isRegisterPage) {
        // Если на странице регистрации и уже авторизован - на главную
        window.location.href = 'index.html';
    } else if (!currentUser && isLoginPage) {
        // Если на главной и не авторизован - показать форму входа
        showAuthModal();
    } else if (currentUser && isLoginPage) {
        // Если на главной и авторизован - показать магазин
        showMainApp();
    }
}