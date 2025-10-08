// dashboard.js - улучшенная логика магазина

let currentUser = null;
let products = [];
let selectedPaymentMethod = 'crypto';

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
    updateProfileStats();
});

// Обновление интерфейса пользователя
function updateUserInterface() {
    if (currentUser) {
        document.getElementById('userName').textContent = currentUser.name;
        document.getElementById('userBalance').textContent = currentUser.balance + ' руб.';
        document.getElementById('profileName').textContent = currentUser.name;
        document.getElementById('profileEmail').textContent = currentUser.email;
    }
}

// Обновление статистики профиля
function updateProfileStats() {
    if (!currentUser) return;
    
    const totalSpent = currentUser.purchases ? 
        currentUser.purchases.reduce((sum, purchase) => sum + purchase.price, 0) : 0;
    
    const registrationDate = new Date(currentUser.registrationDate);
    const daysSinceRegistration = Math.floor((new Date() - registrationDate) / (1000 * 60 * 60 * 24));
    
    document.getElementById('statBalance').textContent = currentUser.balance + '₽';
    document.getElementById('statPurchases').textContent = currentUser.purchases ? currentUser.purchases.length : 0;
    document.getElementById('statSpent').textContent = totalSpent + '₽';
    document.getElementById('statSince').textContent = daysSinceRegistration;
}

// Загрузка товаров
function loadProducts() {
    const grid = document.getElementById('productsGrid');
    
    if (!currentUser || !products.length) return;
    
    grid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" 
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDQwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjMWExYTJlIi8+CjxwYXRoIGQ9Ik0yMDAgMTIwQzE3Mi4zIDExMi42IDE1MCA5MCAxNTAgNjBDMTUwIDM4LjIgMTY3LjggMjAgMTkwIDIwQzIxMi4yIDIwIDIzMCAzOC4yIDIzMCA2MEMyMzAgOTAgMjA3LjcgMTEyLjYgMTgwIDEyMFoiIGZpbGw9IiM2MzY2ZjEiIG9wYWNpdHk9IjAuMyIvPgo8Y2lyY2xlIGN4PSIyMDAiIGN5PSI4MCIgcj0iMzAiIGZpbGw9IiM2MzY2ZjEiIG9wYWNpdHk9IjAuNSIvPgo8L3N2Zz4K'">
                <div class="product-badge">HOT</div>
            </div>
            <div class="product-info">
                <div class="product-header">
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">${product.price}₽</div>
                </div>
                <div class="product-features">
                    ${product.features.map(feature => 
                        `<div class="feature">${feature}</div>`
                    ).join('')}
                </div>
                <button class="buy-button" onclick="buyProduct(${product.id})" 
                        ${currentUser.balance < product.price ? 'disabled' : ''}>
                    ${currentUser.balance < product.price ? 
                      '<i class="fas fa-lock"></i> Недостаточно средств' : 
                      '<i class="fas fa-shopping-cart"></i> Купить сейчас'}
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
    updateProfileStats();
    
    showNotification(`✅ Успешная покупка! ${product.name} за ${product.price} руб.`);
    deliverProduct(product);
}

// Выдача товара
function deliverProduct(product) {
    console.log('Выдача товара:', product);
    
    try {
        const fileContent = generateFileContent(product);
        downloadFile(fileContent, `${product.name.replace(/\s+/g, '_')}.txt`, 'text/plain');
        
        setTimeout(() => {
            showPurchaseSuccessModal(product);
        }, 500);
    } catch (error) {
        console.error('Ошибка выдачи товара:', error);
        showNotification('❌ Ошибка при создании файла. Свяжитесь с поддержкой.');
    }
}

// Генерация содержимого файла
function generateFileContent(product) {
    const timestamp = new Date().toLocaleString('ru-RU');
    const orderId = 'SC' + Date.now().toString().slice(-8);
    
    return `🎉 SHINE COOKIES - ДАННЫЕ АККАУНТА 🎉

🤝 Благодарим за покупку!
📦 Заказ: #${orderId}
🕐 Дата: ${timestamp}
👤 Покупатель: ${currentUser.email}

══════════════════════════════════════

🎯 КУПЛЕННЫЙ ТОВАР:
   • Название: ${product.name}
   • Стоимость: ${product.price} руб.
   • Категория: ${product.category || 'Premium'}

📋 ДАННЫЕ ДЛЯ ДОСТУПА:

Логин: premium_user_${orderId}
Пароль: Shine${orderId}!
Email: ${orderId}@shinecookies.ru

🔧 ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ:
   • Срок действия: 30 дней
   • Поддержка: 24/7
   • Гарантия: 14 дней

══════════════════════════════════════

📞 ТЕХНИЧЕСКАЯ ПОДДЕРЖКА:
   • Telegram: @shinecookies_support
   • Email: support@shine-store.ru
   • Сайт: shine-store.ru

💫 Спасибо, что выбрали Shine Cookies!
   Желаем приятного использования! 🍪`;
}

// Показ модального окна пополнения
function showTopUpModal() {
    document.getElementById('paymentModal').style.display = 'flex';
    selectedPaymentMethod = 'crypto';
    updatePaymentMethods();
}

// Закрытие модального окна
function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

// Выбор метода оплаты
function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    updatePaymentMethods();
}

// Обновление отображения методов оплаты
function updatePaymentMethods() {
    document.querySelectorAll('.payment-method').forEach(method => {
        method.classList.remove('active');
    });
    
    document.querySelector(`.payment-method:nth-child(${
        selectedPaymentMethod === 'crypto' ? 1 : 
        selectedPaymentMethod === 'card' ? 2 : 3
    })`).classList.add('active');
}

// Обработка платежа
function processPayment() {
    const amountInput = document.getElementById('topUpAmount');
    const amount = parseInt(amountInput.value);
    
    if (!amount || amount < 50) {
        showNotification('❌ Минимальная сумма пополнения - 50 руб.');
        return;
    }

    closePaymentModal();

    switch(selectedPaymentMethod) {
        case 'crypto':
            processCryptoPayment(amount);
            break;
        case 'card':
            processCardPayment(amount);
            break;
        case 'qiwi':
            processQiwiPayment(amount);
            break;
    }
}

// Обработка Crypto Bot платежа
function processCryptoPayment(amount) {
    showNotification('🔄 Подготовка платежа через Crypto Bot...');
    
    setTimeout(() => {
        // Симуляция успешного платежа
        completePayment(amount, 'Crypto Bot');
        showNotification(`✅ Баланс пополнен на ${amount} руб. через Crypto Bot!`);
    }, 2000);
}

// Обработка карточного платежа
function processCardPayment(amount) {
    showNotification('🔄 Перенаправление на страницу оплаты...');
    
    setTimeout(() => {
        completePayment(amount, 'Банковская карта');
        showNotification(`✅ Баланс пополнен на ${amount} руб. с карты!`);
    }, 2000);
}

// Обработка QIWI платежа
function processQiwiPayment(amount) {
    const phone = prompt('Введите номер QIWI кошелька:');
    if (!phone) return;
    
    showNotification(`🔄 Создание счета QIWI на ${amount} руб. для ${phone}...`);
    
    setTimeout(() => {
        completePayment(amount, 'QIWI');
        showNotification(`✅ Счет на ${amount} руб. создан для ${phone}!`);
    }, 2000);
}

// Завершение платежа
function completePayment(amount, method) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        users[userIndex].balance += amount;
        currentUser.balance += amount;
        
        // Добавляем запись о пополнении
        if (!users[userIndex].topups) {
            users[userIndex].topups = [];
        }
        
        users[userIndex].topups.push({
            amount: amount,
            method: method,
            date: new Date().toISOString(),
            status: 'completed'
        });
        
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        updateUserInterface();
        loadProducts();
        updateProfileStats();
    }
}

// Модальное окно успешной покупки
function showPurchaseSuccessModal(product) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
            <div style="text-align: center;">
                <div style="font-size: 4rem; color: #10b981; margin-bottom: 20px;">🎉</div>
                <h3 style="color: #10b981; margin-bottom: 15px;">Покупка успешна!</h3>
            </div>
            
            <div style="background: rgba(16, 185, 129, 0.1); padding: 20px; border-radius: 15px; margin: 20px 0;">
                <p><strong>Товар:</strong> ${product.name}</p>
                <p><strong>Сумма:</strong> ${product.price} руб.</p>
                <p><strong>Статус:</strong> <span style="color: #10b981;">✅ Успешно</span></p>
            </div>
            
            <p style="text-align: center; margin: 20px 0; color: var(--gray);">
                Файл с данными автоматически скачан. Проверьте папку "Загрузки".
            </p>
            
            <button onclick="this.closest('.modal').remove()" class="auth-btn">
                <i class="fas fa-check"></i> Понятно
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Утилиты
function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function showNotification(message) {
    // Реализация уведомлений из предыдущего кода
    console.log('Notification:', message);
    alert(message); // Временная реализация
}