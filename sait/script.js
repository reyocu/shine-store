// ==================== СИСТЕМА РЕГИСТРАЦИИ И АВТОРИЗАЦИИ ====================

let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let users = JSON.parse(localStorage.getItem('users')) || [];
let products = JSON.parse(localStorage.getItem('products')) || [];

// Инициализация данных
document.addEventListener('DOMContentLoaded', function() {
    console.log('Страница загружена, проверяем авторизацию...');
    initializeData();
    checkAuthStatus();
});

// Инициализация начальных данных
function initializeData() {
    console.log('Инициализация данных...');
    
    if (users.length === 0) {
        console.log('Создаем тестового пользователя...');
        // Создаем тестового пользователя
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
        console.log('Тестовый пользователь создан');
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
            },
            {
                id: 3,
                name: "Spotify Premium",
                price: 800,
                image: "https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=400&h=250&fit=crop",
                features: ["Высокое качество", "Без ограничений", "Оффлайн прослушивание", "Гарантия 90 дней"]
            },
            {
                id: 4,
                name: "Netflix 4K Premium",
                price: 1800,
                image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&h=250&fit=crop",
                features: ["4K Ultra HD", "4 устройства", "Без рекламы", "Гарантия 30 дней"]
            }
        ];
        localStorage.setItem('products', JSON.stringify(products));
        console.log('Товары созданы');
    }
    
    console.log('Данные инициализированы:', { users, products });
}

// Проверка статуса авторизации
function checkAuthStatus() {
    console.log('Проверка авторизации, currentUser:', currentUser);
    
    if (currentUser) {
        console.log('Пользователь авторизован, показываем магазин');
        showMainApp();
    } else {
        console.log('Пользователь не авторизован, показываем форму входа');
        showAuthModal();
    }
}

// Переключение между вкладками
function switchTab(tab) {
    console.log('Переключение на вкладку:', tab);
    
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    
    if (tab === 'login') {
        document.querySelector('.tab-btn:nth-child(1)').classList.add('active');
        document.getElementById('loginForm').classList.add('active');
    } else {
        document.querySelector('.tab-btn:nth-child(2)').classList.add('active');
        document.getElementById('registerForm').classList.add('active');
    }
}

// Показ модального окна авторизации
function showAuthModal() {
    console.log('Показываем окно авторизации');
    document.getElementById('authModal').classList.add('modal-visible');
    document.getElementById('mainApp').classList.add('hidden');
}

// Показ основного приложения
function showMainApp() {
    console.log('Показываем основное приложение для пользователя:', currentUser);
    document.getElementById('authModal').classList.remove('modal-visible');
    document.getElementById('mainApp').classList.remove('hidden');
    
    updateUserInterface();
    loadProducts();
    updateStats();
}

// Обновление интерфейса пользователя
function updateUserInterface() {
    if (currentUser) {
        console.log('Обновляем интерфейс для пользователя:', currentUser.name);
        document.getElementById('userName').textContent = currentUser.name;
        document.getElementById('userBalance').textContent = currentUser.balance + ' руб.';
        document.getElementById('balanceAmount').textContent = currentUser.balance + ' руб.';
    }
}

// ==================== РЕГИСТРАЦИЯ ====================

document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    console.log('Отправка формы регистрации');
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    console.log('Данные регистрации:', { name, email, password });

    // Валидация email
    if (!isValidEmail(email)) {
        showNotification('❌ Введите корректный email адрес');
        return;
    }

    // Проверка существования пользователя
    if (users.find(user => user.email === email)) {
        showNotification('❌ Пользователь с таким email уже существует');
        return;
    }

    // Создание нового пользователя
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        password: password,
        balance: 0,
        purchases: [],
        registrationDate: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    console.log('Новый пользователь зарегистрирован:', newUser);
    showNotification('✅ Регистрация успешна! Добро пожаловать!');
    showMainApp();
    
    // Очистка формы
    this.reset();
});

// ==================== АВТОРИЗАЦИЯ ====================

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    console.log('Отправка формы входа');
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    console.log('Данные входа:', { email, password });

    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        console.log('Пользователь вошел:', user);
        showNotification('✅ Вход выполнен успешно!');
        showMainApp();
        
        // Очистка формы
        this.reset();
    } else {
        console.log('Неверные данные для входа');
        showNotification('❌ Неверный email или пароль');
    }
});

// Валидация email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ==================== ВЫХОД ====================

function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        console.log('Выход пользователя:', currentUser);
        currentUser = null;
        localStorage.removeItem('currentUser');
        showNotification('👋 До свидания! Возвращайтесь снова!');
        showAuthModal();
        
        // Очистка форм
        document.getElementById('loginForm').reset();
        document.getElementById('registerForm').reset();
        
        // Сброс на вкладку входа
        switchTab('login');
    }
}

// ==================== СИСТЕМА БАЛАНСА И ПЛАТЕЖЕЙ ====================

// Показ модального окна пополнения
function showTopUpModal() {
    if (!currentUser) {
        showNotification('❌ Сначала войдите в аккаунт');
        showAuthModal();
        return;
    }
    document.getElementById('topUpModal').classList.add('modal-visible');
}

// Закрытие модального окна пополнения
function closeTopUpModal() {
    document.getElementById('topUpModal').classList.remove('modal-visible');
}

// Обработка платежа через Platega
function processPlategaPayment() {
    const amount = parseInt(document.getElementById('topUpAmount').value);
    
    if (!amount || amount < 10) {
        showNotification('❌ Введите корректную сумму (мин. 10 руб.)');
        return;
    }

    document.getElementById('topUpModal').classList.remove('modal-visible');
    document.getElementById('plategaModal').classList.add('modal-visible');
    document.getElementById('plategaAmount').textContent = amount + ' руб.';
}

// Закрытие модального окна Platega
function closePlategaModal() {
    document.getElementById('plategaModal').classList.remove('modal-visible');
}

// Обработка платежа по карте
function processCardPayment() {
    const cardNumber = document.getElementById('cardNumber').value;
    const cardExpiry = document.getElementById('cardExpiry').value;
    const cardCvv = document.getElementById('cardCvv').value;
    const amount = parseInt(document.getElementById('topUpAmount').value);

    // Базовая валидация
    if (!cardNumber || !cardExpiry || !cardCvv) {
        showNotification('❌ Заполните все поля карты');
        return;
    }

    if (cardNumber.replace(/\s/g, '').length !== 16) {
        showNotification('❌ Неверный номер карты');
        return;
    }

    showNotification('🔄 Обработка платежа...');

    // Имитация платежа через Platega API
    setTimeout(() => {
        simulatePlategaPayment(amount);
    }, 2000);
}

// Имитация успешного платежа через Platega
function simulatePlategaPayment(amount) {
    if (!currentUser) return;
    
    // Обновление баланса пользователя
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].balance += amount;
        currentUser.balance += amount;
        
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        updateUserInterface();
        loadProducts(); // Обновляем кнопки покупки
    }

    closePlategaModal();
    showNotification(`✅ Баланс пополнен на ${amount} руб. через Platega!`);
    
    // Очистка формы
    document.getElementById('cardNumber').value = '';
    document.getElementById('cardExpiry').value = '';
    document.getElementById('cardCvv').value = '';
}

// Обработка платежа через Crypto Bot
function processCryptoPayment() {
    const amount = parseInt(document.getElementById('topUpAmount').value);
    
    if (!amount || amount < 10) {
        showNotification('❌ Введите корректную сумму (мин. 10 руб.)');
        return;
    }

    if (!currentUser) return;

    showNotification('🔄 Перенаправление в Crypto Bot...');

    // Имитация интеграции с Crypto Bot
    setTimeout(() => {
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].balance += amount;
            currentUser.balance += amount;
            
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            updateUserInterface();
            loadProducts();
        }

        closeTopUpModal();
        showNotification(`✅ Баланс пополнен на ${amount} руб. через Crypto Bot!`);
    }, 1500);
}

// Альтернативные методы оплаты
function processOtherPayment() {
    const amount = parseInt(document.getElementById('topUpAmount').value);
    alert(`📱 Альтернативные методы оплаты\n\nСумма: ${amount} руб.\n\nДоступные методы:\n• QIWI\n• ЮMoney\n• СБП\n• Криптовалюты\n\nДля оплаты свяжитесь с поддержкой: @shinecookies_support`);
}

// ==================== СИСТЕМА ПОКУПОК ====================

// Загрузка товаров
function loadProducts() {
    const grid = document.getElementById('productsGrid');
    
    if (!currentUser) return;
    
    grid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" 
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDQwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjMWExYTJlIi8+CjxwYXRoIGQ9Ik0yMDAgMTIwQzE3Mi4zIDExMi42IDE1MCA5MCAxNTAgNjBDMTUwIDM4LjIgMTY3LjggMjAgMTkwIDIwQzIxMi4yIDIwIDIzMCAzOC4yIDIzMCA2MEMyMzAgOTAgMjA3LjcgMTEyLjYgMTgwIDEyMFoiIGZpbGw9IiMwMENDZkYiIG9wYWNpdHk9IjAuMyIvPgo8Y2lyY2xlIGN4PSIyMDAiIGN5PSI4MCIgcj0iMzAiIGZpbGw9IiMwMENDZkYiIG9wYWNpdHk9IjAuNSIvPgo8L3N2Zz4K'">
            </div>
            <div class="product-info">
                <div class="product-header">
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">${product.price} руб.</div>
                </div>
                <div class="product-features">
                    ${product.features.map(feature => 
                        `<div class="feature">${feature}</div>`
                    ).join('')}
                </div>
                <button class="buy-button" onclick="buyProduct(${product.id})" 
                        ${currentUser.balance < product.price ? 'disabled' : ''}>
                    ${currentUser.balance < product.price ? '❌ Недостаточно средств' : '🛒 Купить сейчас'}
                </button>
            </div>
        </div>
    `).join('');
}

// Покупка товара
function buyProduct(productId) {
    if (!currentUser) {
        showNotification('❌ Сначала войдите в аккаунт');
        showAuthModal();
        return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (currentUser.balance >= product.price) {
        // Списание средств
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].balance -= product.price;
            currentUser.balance -= product.price;
            
            // Добавление покупки в историю
            if (!users[userIndex].purchases) {
                users[userIndex].purchases = [];
            }
            
            users[userIndex].purchases.push({
                productId: product.id,
                productName: product.name,
                price: product.price,
                purchaseDate: new Date().toISOString(),
                status: 'completed'
            });
            
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            updateUserInterface();
            updateStats();
            loadProducts();
            
            showNotification(`✅ Успешная покупка! ${product.name} за ${product.price} руб.`);
            deliverProduct(product);
        }
    } else {
        showNotification('❌ Недостаточно средств на балансе');
        showTopUpModal();
    }
}

// Выдача товара
function deliverProduct(product) {
    console.log('Выдача товара:', product);
    
    // Здесь должна быть ваша логика выдачи товара
    // Например, отправка данных на сервер, генерация аккаунта и т.д.
    
    setTimeout(() => {
        alert(`🎉 Поздравляем с покупкой!\n\nТовар: ${product.name}\nСумма: ${product.price} руб.\n\nДанные для доступа будут отправлены вам на email: ${currentUser.email}`);
    }, 1000);
}

// ==================== КОРЗИНА И СТАТИСТИКА ====================

function showCart() {
    if (!currentUser) {
        showNotification('❌ Сначала войдите в аккаунт');
        showAuthModal();
        return;
    }

    if (!currentUser.purchases || currentUser.purchases.length === 0) {
        alert('🛒 История покупок пуста\n\nЗдесь будут отображаться ваши покупки');
        return;
    }
    
    const purchasesList = currentUser.purchases.map(purchase => 
        `• ${purchase.productName} - ${purchase.price} руб. (${new Date(purchase.purchaseDate).toLocaleDateString()})`
    ).join('\n');
    
    const totalSpent = currentUser.purchases.reduce((sum, purchase) => sum + purchase.price, 0);
    
    alert(`📦 История покупок:\n\n${purchasesList}\n\n💎 Всего потрачено: ${totalSpent} руб.\n💰 Текущий баланс: ${currentUser.balance} руб.`);
}

function updateStats() {
    if (!currentUser) return;
    
    document.getElementById('productsCount').textContent = products.length;
    document.getElementById('purchasesCount').textContent = currentUser.purchases ? currentUser.purchases.length : 0;
    document.getElementById('balanceAmount').textContent = currentUser.balance + ' руб.';
    
    // Обновление текста корзины
    const cartText = document.getElementById('cartText');
    const purchaseCount = currentUser.purchases ? currentUser.purchases.length : 0;
    cartText.textContent = purchaseCount > 0 ? `${purchaseCount} ITEMS` : 'CART IS EMPTY';
}

// ==================== УТИЛИТЫ ====================

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

// Добавление CSS анимаций
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Маска для номера карты
document.getElementById('cardNumber').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let matches = value.match(/\d{4,16}/g);
    let match = matches && matches[0] || '';
    let parts = [];
    
    for (let i = 0; i < match.length; i += 4) {
        parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
        e.target.value = parts.join(' ');
    } else {
        e.target.value = value;
    }
});

// Маска для срока действия
document.getElementById('cardExpiry').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        e.target.value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
});

// Маска для CVV
document.getElementById('cardCvv').addEventListener('input', function(e) {
    e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
});

// Отладочная информация
console.log('Скрипт загружен, готов к работе!');