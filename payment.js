// payment.js - упрощенная система оплаты

// Упрощенная функция Crypto Bot платежа
async function processCryptoPayment(amount) {
    showNotification('🔄 Подготовка платежа...');
    
    // Временно используем тестовый режим
    setTimeout(() => {
        showCryptoPaymentModal(amount);
    }, 1000);
}

// Модальное окно для Crypto Bot оплаты
function showCryptoPaymentModal(amount) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>💳 Оплата через Crypto Bot</h3>
            <div class="payment-info">
                <div class="amount-display">
                    <strong>Сумма:</strong> ${amount} USDT
                </div>
                <div class="payment-instructions">
                    <p><strong>Инструкция по оплате:</strong></p>
                    <ol>
                        <li>Откройте @CryptoBot в Telegram</li>
                        <li>Отправьте команду: <code>/start</code></li>
                        <li>Выберите "Crypto Pay"</li>
                        <li>Создайте инвойс на ${amount} USDT</li>
                        <li>После оплаты нажмите "Проверить оплату"</li>
                    </ol>
                </div>
                <div class="payment-buttons">
                    <button onclick="openCryptoBot()" class="payment-btn crypto-pay">
                        📱 Открыть Crypto Bot
                    </button>
                    <button onclick="simulateCryptoPayment(${amount})" class="payment-btn check-pay">
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

// Открыть Crypto Bot
function openCryptoBot() {
    window.open('https://t.me/CryptoBot', '_blank');
}

// Симуляция оплаты для тестирования
function simulateCryptoPayment(amount) {
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
            date: new Date().toISOString(),
            status: 'completed'
        });
        
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        updateUserInterface();
        loadProducts();
        updateStats();
        
        document.getElementById('paymentStatus').innerHTML = 
            '✅ Тестовая оплата прошла успешно! Баланс пополнен.';
        
        showNotification(`✅ Баланс пополнен на ${amount} USDT!`);
        
        // Закрываем через 3 секунды
        setTimeout(() => {
            closeCurrentModal();
        }, 3000);
    }
}

// Закрыть текущее модальное окно
function closeCurrentModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// Функция для реальной интеграции (закомментирована)
/*
const CRYPTO_BOT_API = 'https://pay.crypt.bot/api';
const CRYPTO_BOT_TOKEN = '461356:AATCbaohoZfd2swck6qjI9NX0OTBo36qQwU';

async function createRealCryptoInvoice(amount) {
    try {
        const invoiceData = {
            asset: 'USDT',
            amount: amount.toString(),
            description: `Пополнение баланса на shine-store.ru`,
            payload: JSON.stringify({
                userId: currentUser.id,
                type: 'balance_topup'
            })
        };

        const response = await fetch(`${CRYPTO_BOT_API}/createInvoice`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Crypto-Pay-API-Token': CRYPTO_BOT_TOKEN
            },
            body: JSON.stringify(invoiceData)
        });

        const result = await response.json();
        
        if (result.ok) {
            return result.result.pay_url;
        }
    } catch (error) {
        console.error('Payment error:', error);
    }
    return null;
}
*/