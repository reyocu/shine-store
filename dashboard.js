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

// Выдача товара с генерацией файла - ИСПРАВЛЕННАЯ ВЕРСИЯ
function deliverProduct(product) {
    console.log('Выдача товара:', product);
    
    try {
        // Генерируем содержимое файла
        const fileContent = generateFileContent(product);
        
        // Создаем и скачиваем файл
        downloadFile(fileContent, product.fileContent, 'text/plain');
        
        // Показываем информацию о покупке
        setTimeout(() => {
            showPurchaseSuccessModal(product, fileContent);
        }, 500);
    } catch (error) {
        console.error('Ошибка выдачи товара:', error);
        showNotification('❌ Ошибка при создании файла. Свяжитесь с поддержкой.');
    }
}

// Генерация содержимого файла - ИСПРАВЛЕННАЯ ВЕРСИЯ
function generateFileContent(product) {
    const timestamp = new Date().toLocaleString('ru-RU');
    const orderId = 'SC' + Date.now().toString().slice(-8);
    
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
    
    return `╔══════════════════════════════════╗
║           SHINE COOKIES           ║
╚══════════════════════════════════╝

🎯 Товар: ${product.name}
💰 Стоимость: ${product.price} руб.
📦 Заказ: #${orderId}
📅 Дата: ${timestamp}
📧 Покупатель: ${currentUser.email}

══════════════════════════════════════

${content}
══════════════════════════════════════

📞 Поддержка: @shinecookies_support
🌐 Сайт: shine-store.ru

💫 Спасибо за покупку! Удачного использования! 🍪`;
}

// Модальное окно успешной покупки - ИСПРАВЛЕННАЯ ВЕРСИЯ
function showPurchaseSuccessModal(product, fileContent) {
    // Экранируем специальные символы для передачи в функцию
    const escapedContent = fileContent.replace(/'/g, "\\'").replace(/\n/g, "\\n");
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>🎉 Поздравляем с покупкой!</h3>
            <div class="purchase-info">
                <div style="text-align: center; margin: 15px 0;">
                    <div style="font-size: 3rem;">🍪</div>
                    <p style="color: #00ffaa; font-weight: bold;">Товар успешно приобретен!</p>
                </div>
                
                <div style="background: rgba(0,204,255,0.1); padding: 15px; border-radius: 10px; margin: 15px 0;">
                    <p><strong>Товар:</strong> ${product.name}</p>
                    <p><strong>Сумма:</strong> ${product.price} руб.</p>
                    <p><strong>Статус:</strong> <span style="color: #00ffaa;">✅ Успешно</span></p>
                </div>
                
                <p style="text-align: center; margin: 15px 0;">
                    <strong>Файл с данными автоматически скачан</strong><br>
                    Если скачивание не началось, нажмите кнопку ниже
                </p>
                
                <div class="purchase-actions">
                    <button onclick="downloadProductFile('${product.fileContent}', '${escapedContent}')" class="payment-btn crypto-pay">
                        📥 Скачать файл с данными
                    </button>
                    <button onclick="closeCurrentModal()" class="modal-cancel-btn">
                        ✅ Понятно
                    </button>
                </div>
                
                <div class="support-info">
                    <p><strong>📞 Нужна помощь?</strong></p>
                    <p>Telegram: <strong>@shinecookies_support</strong></p>
                    <p>Email: <strong>support@shine-store.ru</strong></p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Функция для скачивания файла - ИСПРАВЛЕННАЯ ВЕРСИЯ
function downloadProductFile(fileName, content) {
    try {
        // Восстанавливаем переносы строк
        const restoredContent = content.replace(/\\n/g, '\n');
        downloadFile(restoredContent, fileName, 'text/plain');
        showNotification('📥 Файл скачан!');
    } catch (error) {
        console.error('Download error:', error);
        showNotification('❌ Ошибка скачивания файла');
    }
}

// Улучшенная функция скачивания файла
function downloadFile(content, fileName, mimeType) {
    try {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Освобождаем память
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        
        console.log('Файл успешно скачан:', fileName);
        return true;
    } catch (error) {
        console.error('Ошибка скачивания файла:', error);
        return false;
    }
}

// Система пополнения баланса
function showTopUpModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>💳 Пополнение баланса</h3>
            <div class="modal-form">
                <div class="amount-selector">
                    <label>Сумма пополнения (руб.):</label>
                    <input type="number" id="topUpAmount" value="100" min="10" max="10000" class="modal-input">
                </div>
                <div class="payment-methods">
                    <h4>Способы оплаты:</h4>
                    <button onclick="processCryptoPayment()" class="payment-btn crypto-pay">
                        🤖 Crypto Bot (USDT)
                    </button>
                    <button onclick="processTestPayment()" class="payment-btn card-pay">
                        💳 Тестовое пополнение
                    </button>
                </div>
                <button onclick="closeCurrentModal()" class="modal-cancel-btn">❌ Отмена</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Закрытие модального окна
function closeCurrentModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// Обработка платежа
function processCryptoPayment() {
    const amountInput = document.getElementById('topUpAmount');
    const amount = parseInt(amountInput.value);
    
    if (!amount || amount < 10) {
        showNotification('❌ Введите корректную сумму (мин. 10 руб.)');
        return;
    }

    closeCurrentModal();
    showCryptoPaymentModal(amount);
}

// Тестовое пополнение
function processTestPayment() {
    const amountInput = document.getElementById('topUpAmount');
    const amount = parseInt(amountInput.value);
    
    if (!amount || amount < 10) {
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
        
        showNotification(`✅ Баланс пополнен на ${amount} руб.! (тестовый режим)`);
        closeCurrentModal();
    }
}

// Модальное окно для Crypto Bot оплаты с реальной интеграцией
async function showCryptoPaymentModal(amount) {
    const usdtAmount = (amount / 100).toFixed(2); // Конвертация в USDT
    
    try {
        showNotification('🔄 Создание счета в Crypto Bot...');
        
        // Создаем инвойс через Crypto Bot API
        const invoiceResult = await createCryptoBotInvoice(usdtAmount, amount);
        
        if (invoiceResult.success) {
            showCryptoPaymentModalWithInvoice(amount, usdtAmount, invoiceResult.pay_url, invoiceResult.invoice_id);
        } else {
            showNotification('❌ Ошибка при создании счета: ' + invoiceResult.error);
            // Показываем fallback вариант
            showCryptoPaymentModalFallback(amount, usdtAmount);
        }
    } catch (error) {
        console.error('Crypto Bot error:', error);
        showNotification('❌ Ошибка подключения к Crypto Bot');
        showCryptoPaymentModalFallback(amount, usdtAmount);
    }
}

// Создание инвойса через Crypto Bot API
async function createCryptoBotInvoice(usdtAmount, rubAmount) {
    try {
        const invoiceData = {
            asset: 'USDT',
            amount: usdtAmount,
            description: `Пополнение баланса на shine-store.ru - ${rubAmount} руб.`,
            paid_btn_name: 'viewItem',
            paid_btn_url: 'https://shine-store.ru/dashboard.html',
            payload: JSON.stringify({
                userId: currentUser.id,
                type: 'balance_topup',
                amount: rubAmount,
                email: currentUser.email
            }),
            allow_comments: false,
            allow_anonymous: false
        };

        // ЗАМЕНИТЕ 'YOUR_CRYPTO_BOT_TOKEN' на ваш реальный токен из @CryptoBot
        const response = await fetch('https://pay.crypt.bot/api/createInvoice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Crypto-Pay-API-Token': 'YOUR_CRYPTO_BOT_TOKEN'
            },
            body: JSON.stringify(invoiceData)
        });

        const result = await response.json();
        
        if (result.ok) {
            return {
                success: true,
                pay_url: result.result.pay_url,
                invoice_id: result.result.invoice_id,
                hash: result.result.hash
            };
        } else {
            console.error('Crypto Bot API Error:', result);
            return {
                success: false,
                error: result.error?.name || 'Unknown error'
            };
        }
    } catch (error) {
        console.error('Crypto Bot request failed:', error);
        return {
            success: false,
            error: 'Network error'
        };
    }
}

// Модальное окно с реальной ссылкой на оплату
function showCryptoPaymentModalWithInvoice(amount, usdtAmount, payUrl, invoiceId) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>💳 Оплата через Crypto Bot</h3>
            <div class="payment-info">
                <div class="amount-display">
                    <strong>Сумма:</strong> ${amount} руб. (${usdtAmount} USDT)
                </div>
                <div class="payment-instructions">
                    <p><strong>Счет создан! Для оплаты:</strong></p>
                    <ol>
                        <li>Нажмите кнопку "🔗 Перейти к оплате"</li>
                        <li>Оплатите счет в Crypto Bot</li>
                        <li>После оплаты нажмите "✅ Проверить оплату"</li>
                        <li>Баланс обновится автоматически</li>
                    </ol>
                </div>
                <div class="payment-buttons">
                    <button onclick="window.open('${payUrl}', '_blank')" class="payment-btn crypto-pay">
                        🔗 Перейти к оплате
                    </button>
                    <button onclick="checkCryptoPayment('${invoiceId}', ${amount})" class="payment-btn card-pay">
                        ✅ Проверить оплату
                    </button>
                    <button onclick="closeCurrentModal()" class="modal-cancel-btn">
                        ❌ Отмена
                    </button>
                </div>
                <div class="payment-status" id="paymentStatus">
                    ⏳ Ожидание оплаты...
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Запускаем автоматическую проверку
    startCryptoPaymentChecking(invoiceId, amount);
}

// Fallback вариант если API не работает
function showCryptoPaymentModalFallback(amount, usdtAmount) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>💳 Оплата через Crypto Bot</h3>
            <div class="payment-info">
                <div class="amount-display">
                    <strong>Сумма:</strong> ${amount} руб. (${usdtAmount} USDT)
                </div>
                <div class="payment-instructions">
                    <p><strong>Инструкция по оплате:</strong></p>
                    <ol>
                        <li>Откройте @CryptoBot в Telegram</li>
                        <li>Нажмите "Crypto Pay" → "Create invoice"</li>
                        <li>Сумма: <strong>${usdtAmount} USDT</strong></li>
                        <li>Описание: "Пополнение баланса shine-store.ru"</li>
                        <li>После оплаты нажмите "Подтвердить оплату"</li>
                    </ol>
                    <p><strong>Или отправьте ${usdtAmount} USDT на адрес:</strong></p>
                    <p style="background: rgba(0,204,255,0.1); padding: 10px; border-radius: 5px; font-family: monospace; word-break: break-all;">
                        TALnGAaUETzokzAwZRCdFmA1Dhg3pBSQZh
                    </p>
                </div>
                <div class="payment-buttons">
                    <button onclick="openCryptoBot()" class="payment-btn crypto-pay">
                        📱 Открыть Crypto Bot
                    </button>
                    <button onclick="simulateCryptoPayment(${amount})" class="payment-btn card-pay">
                        ✅ Тестовая оплата
                    </button>
                    <button onclick="closeCurrentModal()" class="modal-cancel-btn">
                        ❌ Отмена
                    </button>
                </div>
                <div class="payment-status" id="paymentStatus">
                    ⏳ Ожидание оплаты...
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Проверка статуса платежа
async function checkCryptoPayment(invoiceId, amount) {
    try {
        const status = await getCryptoInvoiceStatus(invoiceId);
        
        if (status === 'paid') {
            await completeCryptoPayment(amount, invoiceId);
        } else if (status === 'active') {
            document.getElementById('paymentStatus').innerHTML = 
                '❌ Оплата еще не получена. Пожалуйста, оплатите счет и попробуйте снова.';
        } else {
            document.getElementById('paymentStatus').innerHTML = 
                `❌ Статус: ${status}. Счет не оплачен.`;
        }
    } catch (error) {
        document.getElementById('paymentStatus').innerHTML = 
            '❌ Ошибка проверки платежа. Попробуйте позже.';
    }
}

// Получение статуса инвойса
async function getCryptoInvoiceStatus(invoiceId) {
    try {
        const response = await fetch(`https://pay.crypt.bot/api/getInvoices?invoice_ids=${invoiceId}`, {
            headers: {
                'Crypto-Pay-API-Token': '458065:AAyevV2X8IGYbHfLZfyqc7yMdXcFBA1e4uv'
            }
        });

        const result = await response.json();
        
        if (result.ok && result.result.items.length > 0) {
            return result.result.items[0].status; // active, paid, expired
        }
        
        return 'unknown';
    } catch (error) {
        console.error('Check invoice error:', error);
        return 'error';
    }
}

// Автоматическая проверка платежа
function startCryptoPaymentChecking(invoiceId, amount) {
    let attempts = 0;
    const maxAttempts = 30; // 5 минут (каждые 10 секунд)
    
    const checkInterval = setInterval(async () => {
        attempts++;
        const status = await getCryptoInvoiceStatus(invoiceId);
        
        if (status === 'paid') {
            clearInterval(checkInterval);
            await completeCryptoPayment(amount, invoiceId);
        } else if (status === 'expired' || attempts >= maxAttempts) {
            clearInterval(checkInterval);
            document.getElementById('paymentStatus').innerHTML = 
                '❌ Время оплаты истекло. Создайте новый счет.';
        }
    }, 10000); // Проверка каждые 10 секунд
}

// Завершение Crypto Bot платежа
async function completeCryptoPayment(amount, invoiceId) {
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
            method: 'crypto_bot',
            invoiceId: invoiceId,
            date: new Date().toISOString(),
            status: 'completed'
        });
        
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        updateUserInterface();
        loadProducts();
        updateStats();
        
        document.getElementById('paymentStatus').innerHTML = 
            '✅ Оплата получена! Баланс пополнен.';
        
        showNotification(`✅ Баланс пополнен на ${amount} руб.!`);
        
        // Автоматически закрываем через 3 секунды
        setTimeout(() => {
            closeCurrentModal();
        }, 3000);
    }
}