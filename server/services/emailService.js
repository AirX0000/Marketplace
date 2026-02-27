const nodemailer = require('nodemailer');

let transporter = null;

async function createTransporter() {
    if (transporter) return transporter;

    // Use Ethereal for testing if no real SMTP provided
    if (!process.env.SMTP_HOST) {
        console.log("No SMTP_HOST found. Creating Ethereal test account...");
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        console.log("Ethereal Transporter Ready. Emails will be previewable via console URL.");
    } else {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT, // 587
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    return transporter;
}

// Helper to send mail
async function sendMail({ to, subject, html }) {
    try {
        const transport = await createTransporter();
        const info = await transport.sendMail({
            from: '"Marketplace Support" <noreply@marketplace.com>',
            to,
            subject,
            html,
        });

        console.log("Message sent: %s", info.messageId);
        // Preview only available when sending through an Ethereal account
        if (nodemailer.getTestMessageUrl(info)) {
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

// Templates
const getOrderConfirmationTemplate = (order) => `
    <h1>Order Confirmed!</h1>
    <p>Thank you for your order #${order.id.slice(0, 8)}.</p>
    <p><strong>Total:</strong> ${order.total.toLocaleString()} So'm</p>
    <ul>
        ${order.items.map(item => `<li>${item.marketplace.name} x${item.quantity}</li>`).join('')}
    </ul>
    <p>We will notify you when your items ship!</p>
`;

const getStatusUpdateTemplate = (orderItem, status) => `
    <h1>Order Update</h1>
    <p>The status of your item <strong>${orderItem.marketplace.name}</strong> has changed to:</p>
    <h2 style="color: blue;">${status}</h2>
    <p>Order #${orderItem.order.id.slice(0, 8)}</p>
`;

module.exports = {
    sendOrderConfirmation: async (order, user) => {
        const email = user.email || order.contactEmail;
        if (!email) return console.log("No email found for order", order.id);

        await sendMail({
            to: email,
            subject: `Order Confirmation #${order.id.slice(0, 8)}`,
            html: getOrderConfirmationTemplate(order)
        });
    },
    sendOrderStatusUpdate: async (orderItem, status, user) => {
        const email = user.email || orderItem.order.contactEmail;
        if (!email) return console.log("No email found for status update");

        await sendMail({
            to: email,
            subject: `Update on Order #${orderItem.order.id.slice(0, 8)}`,
            html: getStatusUpdateTemplate(orderItem, status)
        });
    },
    sendBulkEmail: async (recipients, subject, content) => {
        console.log(`Starting bulk email to ${recipients.length} recipients...`);
        let successCount = 0;

        // In a real production app, use a queue (Bull/RabbitMQ) or batching
        // For this demo, we'll send sequentially but async
        for (const email of recipients) {
            try {
                await sendMail({
                    to: email,
                    subject,
                    html: `
                        <div style="font-family: Arial, sans-serif; color: #333;">
                            <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
                                <h2 style="color: #2563eb;">Marketplace News</h2>
                            </div>
                            <div style="padding: 20px; line-height: 1.6;">
                                ${content.replace(/\n/g, '<br>')}
                            </div>
                            <div style="margin-top: 30px; font-size: 12px; color: #888; text-align: center;">
                                <p>You received this email because you are a registered user of Marketplace.</p>
                                <p>© ${new Date().getFullYear()} Marketplace App</p>
                            </div>
                        </div>
                    `
                });
                successCount++;
            } catch (err) {
                console.error(`Failed to send to ${email}:`, err.message);
            }
        }
        return successCount;
    }
};
