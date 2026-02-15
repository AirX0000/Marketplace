let nodemailer;
if (process.env.MOCK_EMAIL) {
    nodemailer = {
        createTransport: () => ({
            sendMail: async (opts) => {
                console.log(`[MOCK EMAIL] To: ${opts.to}, Subject: ${opts.subject}`);
                return { messageId: 'mock-id' };
            }
        })
    };
} else {
    nodemailer = require('nodemailer');
}

// Lazy transporter creation to avoid blocking server startup
let transporter = null;

function getTransporter() {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    return transporter;
}

// Email templates
function getCustomerOrderEmail(order, items) {
    const itemsList = items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <strong>${item.name}</strong><br>
                <span style="color: #666; font-size: 12px;">${item.quantity} × ${item.price.toLocaleString()} So'm</span>
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
                ${(item.quantity * item.price).toLocaleString()} So'm
            </td>
        </tr>
    `).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .order-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                table { width: 100%; border-collapse: collapse; }
                .total { font-size: 18px; font-weight: bold; color: #667eea; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">✅ Заказ Подтверждён!</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Спасибо за ваш заказ</p>
                </div>
                <div class="content">
                    <div class="order-info">
                        <h2 style="margin-top: 0; color: #667eea;">Детали Заказа</h2>
                        <p><strong>Номер заказа:</strong> #${order.id.substring(0, 8).toUpperCase()}</p>
                        <p><strong>Дата:</strong> ${new Date(order.createdAt).toLocaleString('ru-RU')}</p>
                        <p><strong>Статус:</strong> <span style="color: #f59e0b;">⏳ Ожидает обработки</span></p>
                    </div>

                    <h3>Ваши товары:</h3>
                    <table style="background: white; border-radius: 8px; overflow: hidden;">
                        ${itemsList}
                        <tr>
                            <td style="padding: 15px; text-align: right;" colspan="2">
                                <span class="total">Итого: ${order.total.toLocaleString()} So'm</span>
                            </td>
                        </tr>
                    </table>

                    <div class="order-info">
                        <h3 style="margin-top: 0;">📍 Адрес доставки</h3>
                        <p>${order.shippingAddress || 'Самовывоз'}</p>
                        
                        <h3>💳 Способ оплаты</h3>
                        <p>${order.paymentMethod === 'FULL' ? 'Полная оплата' : `Рассрочка (${order.installmentMonths} месяцев)`}</p>
                        <p><strong>Провайдер:</strong> ${order.paymentProvider}</p>
                    </div>

                    <div style="background: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea;">
                        <p style="margin: 0;"><strong>📞 Контакты:</strong> ${order.contactPhone}</p>
                        <p style="margin: 5px 0 0 0;"><strong>✉️ Email:</strong> ${order.contactEmail}</p>
                    </div>
                </div>
                <div class="footer">
                    <p>Если у вас есть вопросы, свяжитесь с нами по адресу support@marketplace.uz</p>
                    <p>© 2026 Marketplace. Все права защищены.</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

function getPartnerOrderEmail(order, items, partnerEmail) {
    const itemsList = items.map(item => `
        <li><strong>${item.name}</strong> - ${item.quantity} шт. × ${item.price.toLocaleString()} So'm</li>
    `).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .alert { background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
                .info-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; }
                .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">🔔 Новый Заказ!</h1>
                    <p style="margin: 10px 0 0 0;">Требуется обработка</p>
                </div>
                <div class="content">
                    <div class="alert">
                        <strong>⚡ Внимание!</strong> Поступил новый заказ. Пожалуйста, обработайте его как можно скорее.
                    </div>

                    <div class="info-box">
                        <h2 style="margin-top: 0; color: #10b981;">Информация о заказе</h2>
                        <p><strong>ID:</strong> #${order.id.substring(0, 8).toUpperCase()}</p>
                        <p><strong>Дата:</strong> ${new Date(order.createdAt).toLocaleString('ru-RU')}</p>
                        <p><strong>Сумма:</strong> ${order.total.toLocaleString()} So'm</p>
                    </div>

                    <div class="info-box">
                        <h3 style="margin-top: 0;">👤 Клиент</h3>
                        <p><strong>Имя:</strong> ${order.contactName}</p>
                        <p><strong>Телефон:</strong> ${order.contactPhone}</p>
                        <p><strong>Email:</strong> ${order.contactEmail}</p>
                        <p><strong>Адрес:</strong> ${order.shippingAddress || 'Самовывоз'}</p>
                    </div>

                    <div class="info-box">
                        <h3 style="margin-top: 0;">📦 Товары</h3>
                        <ul style="padding-left: 20px;">
                            ${itemsList}
                        </ul>
                    </div>

                    <div class="info-box">
                        <h3 style="margin-top: 0;">💳 Оплата</h3>
                        <p><strong>Метод:</strong> ${order.paymentMethod === 'FULL' ? 'Полная оплата' : `Рассрочка (${order.installmentMonths} мес.)`}</p>
                        <p><strong>Провайдер:</strong> ${order.paymentProvider}</p>
                        <p><strong>Статус:</strong> <span style="color: #f59e0b;">Ожидает подтверждения</span></p>
                    </div>

                    <div style="text-align: center;">
                        <a href="http://localhost:5173/admin/orders" class="button">Перейти к заказам</a>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
}

// Status change email
function getStatusChangeEmail(order, newStatus) {
    const statusLabels = {
        'CREATED': 'Создан',
        'PENDING_PAYMENT': 'Ожидает оплаты',
        'PAID': 'Оплачен',
        'PROCESSING': 'В обработке',
        'SHIPPED': 'Отправлен',
        'COMPLETED': 'Доставлен',
        'CANCELLED': 'Отменён'
    };

    const statusColors = {
        'CREATED': '#6b7280',
        'PENDING_PAYMENT': '#f59e0b',
        'PAID': '#3b82f6',
        'PROCESSING': '#8b5cf6',
        'SHIPPED': '#6366f1',
        'COMPLETED': '#10b981',
        'CANCELLED': '#ef4444'
    };

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: ${statusColors[newStatus]}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .status-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">📦 Статус Заказа Обновлён</h1>
                </div>
                <div class="content">
                    <div class="status-box">
                        <h2 style="color: ${statusColors[newStatus]}; margin-top: 0;">
                            ${statusLabels[newStatus]}
                        </h2>
                        <p><strong>Заказ:</strong> #${order.id.substring(0, 8).toUpperCase()}</p>
                        <p><strong>Сумма:</strong> ${order.total.toLocaleString()} So'm</p>
                    </div>
                    
                    ${newStatus === 'SHIPPED' ? `
                        <div style="background: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                            <p style="margin: 0;"><strong>🚚 Ваш заказ в пути!</strong></p>
                            <p style="margin: 5px 0 0 0;">Ожидайте доставку в ближайшее время.</p>
                        </div>
                    ` : ''}
                    
                    ${newStatus === 'COMPLETED' ? `
                        <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
                            <p style="margin: 0;"><strong>✅ Заказ доставлен!</strong></p>
                            <p style="margin: 5px 0 0 0;">Спасибо за покупку!</p>
                        </div>
                    ` : ''}
                </div>
                <div class="footer">
                    <p>© 2026 Marketplace. Все права защищены.</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

// Send email function
async function sendOrderEmails(order, items) {
    try {
        // Send to customer
        if (order.contactEmail) {
            await getTransporter().sendMail({
                from: process.env.EMAIL_FROM,
                to: order.contactEmail,
                subject: `✅ Заказ #${order.id.substring(0, 8).toUpperCase()} подтверждён`,
                html: getCustomerOrderEmail(order, items)
            });
            console.log(`✅ Email sent to customer: ${order.contactEmail}`);
        }

        // Send to admin/partner (you can customize this logic)
        const adminEmail = process.env.EMAIL_USER; // Or fetch from database
        if (adminEmail) {
            await getTransporter().sendMail({
                from: process.env.EMAIL_FROM,
                to: adminEmail,
                subject: `🔔 Новый заказ #${order.id.substring(0, 8).toUpperCase()}`,
                html: getPartnerOrderEmail(order, items, adminEmail)
            });
            console.log(`✅ Email sent to admin: ${adminEmail}`);
        }

        return { success: true };
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        // Don't throw - we don't want to fail the order if email fails
        return { success: false, error: error.message };
    }
}

// Send status change email
async function sendStatusChangeEmail(order, newStatus) {
    try {
        if (order.contactEmail) {
            await getTransporter().sendMail({
                from: process.env.EMAIL_FROM,
                to: order.contactEmail,
                subject: `📦 Статус заказа #${order.id.substring(0, 8).toUpperCase()} обновлён`,
                html: getStatusChangeEmail(order, newStatus)
            });
            console.log(`✅ Status change email sent to: ${order.contactEmail}`);
        }
        return { success: true };
    } catch (error) {
        console.error('❌ Status change email failed:', error);
        return { success: false, error: error.message };
    }
}

// Send bulk email to multiple recipients
async function sendBulkEmail(recipients, subject, message) {
    let sentCount = 0;
    const errors = [];

    for (const recipient of recipients) {
        try {
            await getTransporter().sendMail({
                from: process.env.EMAIL_FROM,
                to: recipient,
                subject,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1 style="margin: 0;">${subject}</h1>
                            </div>
                            <div class="content">
                                ${message}
                            </div>
                        </div>
                    </body>
                    </html>
                `
            });
            sentCount++;
            console.log(`✅ Email sent to: ${recipient}`);
        } catch (error) {
            console.error(`❌ Failed to send email to ${recipient}:`, error.message);
            errors.push({ recipient, error: error.message });
        }
    }

    console.log(`📧 Bulk email complete: ${sentCount}/${recipients.length} sent`);
    return sentCount;
}


// Offer Received Email (To Seller)
function getOfferReceivedEmail(offer, marketplace, buyer) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .info-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; }
                .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                .amount { font-size: 24px; font-weight: bold; color: #10b981; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">💰 Новое Предложение!</h1>
                </div>
                <div class="content">
                    <div class="info-box">
                        <h2 style="margin-top: 0;">${marketplace.name}</h2>
                        <p>Пользователь <strong>${buyer.name || 'Покупатель'}</strong> предложил цену:</p>
                        <p class="amount">${offer.amount.toLocaleString()} So'm</p>
                        <p>Ваша цена: <span style="text-decoration: line-through; color: #999;">${marketplace.price.toLocaleString()} So'm</span></p>
                    </div>

                    <div style="text-align: center;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/partner/offers" class="button">Посмотреть и Ответить</a>
                    </div>
                </div>
                <div class="footer" style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
                    <p>© 2026 Marketplace. Все права защищены.</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

// Offer Status Update Email (To Buyer)
function getOfferStatusUpdateEmail(offer, marketplace, status) {
    const statusLabels = {
        'ACCEPTED': '✅ Принято',
        'REJECTED': '❌ Отклонено',
        'COUNTERED': '🔄 Встречное предложение'
    };

    const statusColors = {
        'ACCEPTED': '#10b981',
        'REJECTED': '#ef4444',
        'COUNTERED': '#f59e0b'
    };

    const isCounter = status === 'COUNTERED';

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: ${statusColors[status] || '#667eea'}; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .info-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; }
                .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">${statusLabels[status]}</h1>
                    <p style="margin: 5px 0 0 0;">Ваше предложение по ${marketplace.name}</p>
                </div>
                <div class="content">
                    <div class="info-box">
                        ${isCounter ? `
                            <p>Продавец сделал встречное предложение:</p>
                            <h2 style="color: #f59e0b;">${offer.counterAmount.toLocaleString()} So'm</h2>
                        ` : `
                            <p>Статус вашего предложения на сумму <strong>${offer.amount.toLocaleString()} So'm</strong> был обновлен.</p>
                        `}
                    </div>

                    <div style="text-align: center;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile/offers" class="button">Перейти к предложению</a>
                    </div>
                </div>
                <div class="footer" style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
                    <p>© 2026 Marketplace. Все права защищены.</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

// Send Offer Email
async function sendOfferEmail(type, offer, marketplace, relatedUser, recipientEmail) {
    try {
        if (!recipientEmail) return { success: false, error: "No recipient email" };

        let subject, html;

        if (type === 'CREATED') {
            subject = `💰 Новое предложение: ${marketplace.name}`;
            html = getOfferReceivedEmail(offer, marketplace, relatedUser);
        } else if (type === 'STATUS_UPDATE') {
            const statusLabels = {
                'ACCEPTED': '✅ Предложение принято',
                'REJECTED': '❌ Предложение отклонено',
                'COUNTERED': '🔄 Встречное предложение'
            };
            subject = `${statusLabels[offer.status]}: ${marketplace.name}`;
            html = getOfferStatusUpdateEmail(offer, marketplace, offer.status);
        } else {
            return { success: false, error: "Invalid email type" };
        }

        const transporter = getTransporter();
        if (transporter) {
            await transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: recipientEmail,
                subject,
                html
            });
            console.log(`✅ Offer email (${type}) sent to: ${recipientEmail}`);
            return { success: true };
        } else {
            console.log(`⚠️ Offer email (${type}) SKIPPED: No transporter`);
            return { success: false, error: "No transporter" };
        }

    } catch (error) {
        console.error('❌ Offer email failed:', error);
        return { success: false, error: error.message };
    }
}

module.exports = { sendOrderEmails, sendStatusChangeEmail, sendBulkEmail, sendOfferEmail };
