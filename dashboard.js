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

// Выдача товара с генерацией файла
function deliverProduct(product) {
    console.log('Выдача товара:', product);
    
    // Генерируем содержимое файла
    const fileContent = generateFileContent(product);
    
    // Создаем и скачиваем файл
    downloadFile(fileContent, product.fileContent, 'text/plain');
    
    // Показываем информацию о покупке
    setTimeout(() => {
        showPurchaseSuccessModal(product, fileContent);
    }, 1000);
}

// Генерация содержимого файла
function generateFileContent(product) {
    const timestamp = new Date().toLocaleString();
    let content = '';
    
    switch(product.category) {
        case 'games':
            content = generateGameAccounts(product);
            break;
        case 'streaming':
            content = generateStreamingAccounts(product);
            break;
        case 'software':
            content = generateSoftwareKeys(product);
            break;
        default:
            content = generateDefaultAccounts(product);
    }
    
    return `Shine Cookies - ${product.name}\n` +
           `Заказ #${Date.now()}\n` +
           `Дата: ${timestamp}\n` +
           `Email: ${currentUser.email}\n` +
           `=================================\n\n` +
           content +
           `\n\n=================================\n` +
           `Поддержка: @shinecookies_support\n` +
           `Сайт: shine-store.ru\n` +
           `Удачных покупок! 🍪`;
}

// Генерация игровых аккаунтов
function generateGameAccounts(product) {
    let accounts = '';
    const count = product.price > 1000 ? 4 : 2; // Больше аккаунтов за дорогие товары
    
    for (let i = 1; i <= count; i++) {
        accounts += `Аккаунт ${i}:\n`;
        accounts += `Логин: shine_${generateRandomString(8)}@gmail.com\n`;
        accounts += `Пароль: ${generateRandomString(12)}\n`;
        
        if (product.name.includes('Steam')) {
            accounts += `Steam Guard: ${generateRandomCode(5)}\n`;
        }
        
        accounts += `Доп. информация: ${product.features.join(', ')}\n\n`;
    }
    
    return accounts;
}

// Генерация стриминговых аккаунтов
function generateStreamingAccounts(product) {
    let accounts = '';
    const count = 3; // 3 аккаунта для стриминга
    
    for (let i = 1; i <= count; i++) {
        accounts += `Аккаунт ${i}:\n`;
        accounts += `Email: shine${generateRandomString(6)}@outlook.com\n`;
        accounts += `Пароль: ${generateRandomString(10)}\n`;
        accounts += `Срок действия: ${getFutureDate(30)}\n\n`;
    }
    
    return accounts;
}

// Генерация ключей для софта
function generateSoftwareKeys(product) {
    let keys = '';
    const count = product.name.includes('Windows') ? 1 : 2;
    
    for (let i = 1; i <= count; i++) {
        if (product.name.includes('Windows')) {
            keys += `Ключ Windows 11 Pro:\n`;
            keys += `XXXXX-XXXXX-XXXXX-XXXXX-${generateRandomString(5).toUpperCase()}\n\n`;
        } else {
            keys += `Аккаунт ${i}:\n`;
            keys += `Логин: shine_${generateRandomString(8)}@outlook.com\n`;
            keys += `Пароль: ${generateRandomString(12)}\n\n`;
        }
    }
    
    return keys;
}

// Утилиты для генерации
function generateRandomString(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function generateRandomCode(length) {
    const chars = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function getFutureDate(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('ru-RU');
}

// Скачивание файла
function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Модальное окно успешной покупки
function showPurchaseSuccessModal(product, fileContent) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>🎉 Поздравляем с покупкой!</h3>
            <div class="purchase-info">
                <p><strong>Товар:</strong> ${product.name}</p>
                <p><strong>Сумма:</strong> ${product.price} руб.</p>
                <p><strong>Файл с данными автоматически скачан</strong></p>
                
                <div class="purchase-actions">
                    <button onclick="downloadAgain('${product.fileContent}', \`${fileContent.replace(/`/g, '\\`')}\`)" class="payment-btn">
                        📥 Скачать еще раз
                    </button>
                    <button onclick="closeModal()" class="modal-cancel-btn">
                        ❌ Закрыть
                    </button>
                </div>
                
                <div class="support-info">
                    <p>📞 Если возникли проблемы:</p>
                    <p>Telegram: <strong>@shinecookies_support</strong></p>
                    <p>Email: <strong>support@shine-store.ru</strong></p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function downloadAgain(fileName, content) {
    downloadFile(content, fileName, 'text/plain');
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// Исправленная функция показа модального окна пополнения
function showTopUpModal() {
    // Создаем модальное окно если его нет
    let modal = document.getElementById('topUpModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'topUpModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>💳 Пополнение баланса</h3>
                <div class="modal-form">
                    <div class="amount-selector">
                        <label>Сумма пополнения (USDT):</label>
                        <input type="number" id="topUpAmount" value="10" min="1" class="modal-input">
                    </div>
                    <div class="payment-methods">
                        <h4>Способы оплаты:</h4>
                        <button onclick="processPayment('crypto')" class="payment-btn crypto-pay">
                            🤖 Crypto Bot (USDT)
                        </button>
                        <button onclick="processTestPayment()" class="payment-btn card-pay">
                            💳 Тестовое пополнение
                        </button>
                    </div>
                    <button onclick="closeModal('topUpModal')" class="modal-cancel-btn">❌ Отмена</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    modal.style.display = 'flex';
}

// Закрытие модального окна
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Обработка платежа
function processPayment(method) {
    const amountInput = document.getElementById('topUpAmount');
    const amount = parseInt(amountInput.value);
    
    if (!amount || amount < 1) {
        showNotification('❌ Введите корректную сумму (мин. 1 USDT)');
        return;
    }

    closeModal('topUpModal');
    
    if (method === 'crypto') {
        processCryptoPayment(amount);
    }
}

// Тестовое пополнение (для проверки)
function processTestPayment() {
    const amount = parseInt(document.getElementById('topUpAmount').value);
    
    if (!amount || amount < 1) {
        showNotification('❌ Введите корректную сумму');
        return;
    }

    // Симулируем успешный платеж
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
        
        showNotification(`✅ Баланс пополнен на ${amount} USDT! (тестовый режим)`);
        closeModal('topUpModal');
    }
}

<script src="payment.js"></script>

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
// Обработчики для модальных окон
document.addEventListener('click', function(e) {
    // Закрытие модальных окон при клике вне их
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// Предотвращение закрытия при клике на контент модалки
document.addEventListener('click', function(e) {
    if (e.target.closest('.modal-content')) {
        e.stopPropagation();
    }
});

// Инициализация при загрузке
console.log('Dashboard initialized');