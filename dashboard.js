// dashboard.js - логика основного приложения

let currentUser = null;
let products = [];

// Инициализация dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard загружен');
    
    // Проверка авторизации
    currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Загрузка данных
    products = JSON.parse(localStorage.getItem('products')) || [];
    
    // Инициализация интерфейса
    updateUserInterface();
    loadProducts();
    updateStats();
});

// Обновление интерфейса пользователя
function updateUserInterface() {
    if (currentUser) {
        document.getElementById('userName').textContent = currentUser.name;
        document.getElementById('userBalance').textContent = currentUser.balance + ' руб.';
    }
}

// Загрузка товаров
function loadProducts() {
    const grid = document.getElementById('productsGrid');
    
    if (!currentUser || !products.length) return;
    
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
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (currentUser.balance >= product.price) {
        if (confirm(`Купить "${product.name}" за ${product.price} руб.?`)) {
            processPurchase(product);
        }
    } else {
        showNotification('❌ Недостаточно средств на балансе');
        showTopUpModal();
    }
}

// Обработка покупки
function processPurchase(product) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex === -1) return;

    // Списание средств
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

    // Сохранение данных
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Обновление интерфейса
    updateUserInterface();
    loadProducts();
    updateStats();
    
    showNotification(`✅ Успешная покупка! ${product.name} за ${product.price} руб.`);
    deliverProduct(product);
}

// Выдача товара
function deliverProduct(product) {
    console.log('Выдача товара:', product);
    
    // Здесь должна быть ваша логика выдачи товара
    // Например, отправка данных на сервер, генерация аккаунта и т.д.
    
    setTimeout(() => {
        alert(`🎉 Поздравляем с покупкой!\n\nТовар: ${product.name}\nСумма: ${product.price} руб.\n\nДанные для доступа будут отправлены вам на email: ${currentUser.email}\n\nДля получения товара свяжитесь с поддержкой: @shinecookies_support`);
    }, 1000);
}

// Обновление статистики
function updateStats() {
    if (!currentUser) return;
    
    document.getElementById('balanceAmount').textContent = currentUser.balance + ' руб.';
    const purchaseCount = currentUser.purchases ? currentUser.purchases.length : 0;
    document.getElementById('purchasesCount').textContent = purchaseCount;
}

// Показ истории покупок
function showPurchaseHistory() {
    if (!currentUser.purchases || currentUser.purchases.length === 0) {
        alert('📦 История покупок пуста\n\nЗдесь будут отображаться ваши покупки');
        return;
    }
    
    const purchasesList = currentUser.purchases.map(purchase => 
        `• ${purchase.productName} - ${purchase.price} руб. (${new Date(purchase.purchaseDate).toLocaleDateString()})`
    ).join('\n');
    
    const totalSpent = currentUser.purchases.reduce((sum, purchase) => sum + purchase.price, 0);
    
    alert(`📦 История покупок:\n\n${purchasesList}\n\n💎 Всего потрачено: ${totalSpent} руб.\n💰 Текущий баланс: ${currentUser.balance} руб.`);
}

// Система пополнения баланса
function showTopUpModal() {
    document.getElementById('topUpModal').style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function processPayment(method) {
    const amount = parseInt(document.getElementById('topUpAmount').value);
    
    if (!amount || amount < 10) {
        showNotification('❌ Введите корректную сумму (мин. 10 руб.)');
        return;
    }

    closeModal('topUpModal');
    
    switch(method) {
        case 'card':
            processCardPayment(amount);
            break;
        case 'crypto':
            processCryptoPayment(amount);
            break;
        case 'other':
            processOtherPayment(amount);
            break;
    }
}

function processCardPayment(amount) {
    showNotification('🔄 Открытие платежной формы...');
    
    setTimeout(() => {
        simulatePayment(amount, 'банковская карта');
    }, 1500);
}

function processCryptoPayment(amount) {
    showNotification('🔄 Перенаправление в Crypto Bot...');
    
    setTimeout(() => {
        simulatePayment(amount, 'Crypto Bot');
    }, 2000);
}

function processOtherPayment(amount) {
    alert(`📱 Альтернативные методы оплаты\n\nСумма: ${amount} руб.\n\nДоступные методы:\n• QIWI\n• ЮMoney\n• СБП\n• Криптовалюты\n\nДля оплаты свяжитесь с поддержкой: @shinecookies_support`);
}

function simulatePayment(amount, method) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        users[userIndex].balance += amount;
        currentUser.balance += amount;
        
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        updateUserInterface();
        loadProducts();
        updateStats();
        
        showNotification(`✅ Баланс пополнен на ${amount} руб. через ${method}!`);
    }
}

// Закрытие модальных окон при клике вне их
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// Предотвращение закрытия при клике на контент модалки
document.querySelectorAll('.modal-content').forEach(content => {
    content.addEventListener('click', function(e) {
        e.stopPropagation();
    });
});