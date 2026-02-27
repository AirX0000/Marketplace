const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticateToken } = require('../middleware/auth');

const CLICK_SERVICE_ID = process.env.CLICK_SERVICE_ID;
const CLICK_MERCHANT_ID = process.env.CLICK_MERCHANT_ID;
const CLICK_SECRET_KEY = process.env.CLICK_SECRET_KEY;
const PAYME_ID = process.env.PAYME_ID;
const PAYME_KEY = process.env.PAYME_KEY;
const APP_URL = process.env.APP_URL || 'https://autohouse.uz';

// ─────────────────────────────────────────────
// POST /api/payment/create
// Called by frontend to get a redirect URL
// ─────────────────────────────────────────────
router.post('/create', authenticateToken, async (req, res) => {
    const { amount, provider } = req.body; // provider: 'click' | 'payme'
    const userId = req.user.userId;

    if (!amount || amount < 1000) {
        return res.status(400).json({ error: 'Minimum amount is 1,000 UZS' });
    }
    if (!['click', 'payme'].includes(provider)) {
        return res.status(400).json({ error: 'Invalid provider' });
    }

    try {
        // Create a pending PaymentOrder
        const order = await prisma.paymentOrder.create({
            data: {
                userId,
                amount: parseFloat(amount),
                provider,
                status: 'PENDING'
            }
        });

        let redirectUrl;

        if (provider === 'click') {
            // Click payment URL format
            const params = new URLSearchParams({
                service_id: CLICK_SERVICE_ID,
                merchant_id: CLICK_MERCHANT_ID,
                amount: amount,
                transaction_param: order.id,
                return_url: `${APP_URL}/profile?topup=success`,
                cancel_url: `${APP_URL}/profile?topup=cancelled`
            });
            redirectUrl = `https://my.click.uz/services/pay?${params.toString()}`;
        } else {
            // Payme payment URL format (amount in tiyins = UZS * 100)
            const amountTiyin = Math.round(parseFloat(amount) * 100);
            const params = btoa(JSON.stringify({ m: PAYME_ID, ac: { order_id: order.id }, a: amountTiyin }));
            redirectUrl = `https://checkout.paycom.uz/${params}`;
        }

        res.json({ redirectUrl, orderId: order.id });
    } catch (error) {
        console.error('Payment create error:', error);
        res.status(500).json({ error: 'Failed to create payment' });
    }
});

// ─────────────────────────────────────────────
// Click Webhooks
// ─────────────────────────────────────────────

// PREPARE — Click verifies the order before charging the user
router.post('/click/prepare', async (req, res) => {
    const { click_trans_id, service_id, merchant_trans_id, amount, action, sign_time, sign_string } = req.body;

    // Verify signature
    const expectedSign = crypto
        .createHash('md5')
        .update(`${click_trans_id}${service_id}${CLICK_SECRET_KEY}${merchant_trans_id}${amount}${action}${sign_time}`)
        .digest('hex');

    if (sign_string !== expectedSign) {
        return res.json({ error: -1, error_note: 'Invalid sign' });
    }

    const order = await prisma.paymentOrder.findUnique({ where: { id: merchant_trans_id } });

    if (!order) return res.json({ error: -5, error_note: 'Order not found' });
    if (order.status === 'PAID') return res.json({ error: -4, error_note: 'Already paid' });
    if (Math.abs(order.amount - parseFloat(amount)) > 1) {
        return res.json({ error: -2, error_note: 'Amount mismatch' });
    }

    res.json({
        click_trans_id,
        merchant_trans_id,
        merchant_prepare_id: order.id,
        error: 0,
        error_note: 'Success'
    });
});

// COMPLETE — Click confirms payment, we credit the balance
router.post('/click/complete', async (req, res) => {
    const { click_trans_id, service_id, merchant_trans_id, amount, action, error: clickError, sign_time, sign_string, merchant_prepare_id } = req.body;

    // Verify signature
    const expectedSign = crypto
        .createHash('md5')
        .update(`${click_trans_id}${service_id}${CLICK_SECRET_KEY}${merchant_trans_id}${merchant_prepare_id}${amount}${action}${sign_time}`)
        .digest('hex');

    if (sign_string !== expectedSign) {
        return res.json({ error: -1, error_note: 'Invalid sign' });
    }

    const order = await prisma.paymentOrder.findUnique({ where: { id: merchant_trans_id } });
    if (!order) return res.json({ error: -5, error_note: 'Order not found' });
    if (order.status === 'PAID') return res.json({ error: 0, error_note: 'Already paid' });

    if (parseInt(clickError) < 0) {
        // Payment cancelled or failed
        await prisma.paymentOrder.update({ where: { id: order.id }, data: { status: 'FAILED' } });
        return res.json({ error: 0, error_note: 'Payment cancelled' });
    }

    // Credit balance and mark order as paid
    await prisma.$transaction([
        prisma.paymentOrder.update({
            where: { id: order.id },
            data: { status: 'PAID', externalId: click_trans_id }
        }),
        prisma.user.update({
            where: { id: order.userId },
            data: { balance: { increment: order.amount } }
        })
    ]);

    console.log(`✅ Click payment: User ${order.userId} credited ${order.amount} UZS`);
    res.json({ click_trans_id, merchant_trans_id, error: 0, error_note: 'Success' });
});

// ─────────────────────────────────────────────
// Payme JSON-RPC handler
// ─────────────────────────────────────────────
router.post('/payme', async (req, res) => {
    // Verify Basic Auth
    const authHeader = req.headers.authorization || '';
    const base64 = authHeader.replace('Basic ', '');
    const decoded = Buffer.from(base64, 'base64').toString('utf8');
    const [, key] = decoded.split(':');

    if (key !== PAYME_KEY) {
        return res.json({
            error: { code: -32504, message: 'Insufficient privilege' },
            id: req.body.id
        });
    }

    const { method, params, id } = req.body;

    try {
        if (method === 'CheckPerformTransaction') {
            const orderId = params?.account?.order_id;
            const order = await prisma.paymentOrder.findUnique({ where: { id: orderId } });

            if (!order) {
                return res.json({ error: { code: -31050, message: 'Order not found' }, id });
            }
            if (order.status === 'PAID') {
                return res.json({ error: { code: -31051, message: 'Already paid' }, id });
            }

            const expectedAmount = Math.round(order.amount * 100); // tiyins
            if (params.amount !== expectedAmount) {
                return res.json({ error: { code: -31001, message: 'Amount mismatch' }, id });
            }

            return res.json({ result: { allow: true }, id });
        }

        if (method === 'CreateTransaction') {
            const orderId = params?.account?.order_id;
            const order = await prisma.paymentOrder.findUnique({ where: { id: orderId } });

            if (!order) return res.json({ error: { code: -31050, message: 'Order not found' }, id });
            if (order.status === 'PAID') return res.json({ error: { code: -31051, message: 'Already paid' }, id });

            // Update with Payme transaction ID
            await prisma.paymentOrder.update({
                where: { id: orderId },
                data: { externalId: params.id }
            });

            return res.json({
                result: {
                    create_time: Date.now(),
                    transaction: params.id,
                    state: 1
                },
                id
            });
        }

        if (method === 'PerformTransaction') {
            const order = await prisma.paymentOrder.findFirst({
                where: { externalId: params.id }
            });

            if (!order) return res.json({ error: { code: -31003, message: 'Transaction not found' }, id });
            if (order.status === 'PAID') {
                return res.json({ result: { transaction: params.id, perform_time: Date.now(), state: 2 }, id });
            }

            // Credit balance
            await prisma.$transaction([
                prisma.paymentOrder.update({
                    where: { id: order.id },
                    data: { status: 'PAID' }
                }),
                prisma.user.update({
                    where: { id: order.userId },
                    data: { balance: { increment: order.amount } }
                })
            ]);

            console.log(`✅ Payme payment: User ${order.userId} credited ${order.amount} UZS`);
            return res.json({
                result: { transaction: params.id, perform_time: Date.now(), state: 2 },
                id
            });
        }

        if (method === 'CancelTransaction') {
            const order = await prisma.paymentOrder.findFirst({
                where: { externalId: params.id }
            });

            if (order && order.status !== 'PAID') {
                await prisma.paymentOrder.update({
                    where: { id: order.id },
                    data: { status: 'FAILED' }
                });
            }

            return res.json({
                result: { transaction: params.id, cancel_time: Date.now(), state: -1 },
                id
            });
        }

        if (method === 'CheckTransaction') {
            const order = await prisma.paymentOrder.findFirst({
                where: { externalId: params.id }
            });

            const state = !order ? -1 : order.status === 'PAID' ? 2 : 1;
            return res.json({
                result: { create_time: Date.now(), perform_time: 0, cancel_time: 0, transaction: params.id, state, reason: null },
                id
            });
        }

        res.json({ error: { code: -32601, message: 'Method not found' }, id });
    } catch (error) {
        console.error('Payme handler error:', error);
        res.json({ error: { code: -31008, message: 'Internal server error' }, id });
    }
});

module.exports = router;
