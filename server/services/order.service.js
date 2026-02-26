const prisma = require('../config/database');
const { sendEscrowEmail } = require('../emailService');

class OrderService {
    async createOrder(userId, data) {
        const { items, shippingAddress, paymentMethod, paymentDetails, total } = data;

        if (!items || items.length === 0) {
            throw new Error("No items in order");
        }

        return prisma.$transaction(async (tx) => {
            // 1. Verify stock for all items
            let calculatedTotal = 0;
            const orderItemsData = [];

            for (const item of items) {
                const product = await tx.marketplace.findUnique({
                    where: { id: item.marketplaceId }
                });

                if (!product) {
                    throw new Error(`Product not found: ${item.marketplaceId}`);
                }

                if (product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for product: ${product.name}`);
                }

                if (!product.isAvailable) {
                    throw new Error(`Product is not available: ${product.name}`);
                }

                // Calculate total (server-side verification)
                const itemTotal = product.price * item.quantity;
                calculatedTotal += itemTotal;

                orderItemsData.push({
                    marketplaceId: item.marketplaceId,
                    quantity: item.quantity,
                    price: product.price,
                    ownerId: product.ownerId // Capture owner
                });

                // 2. Decrement stock
                await tx.marketplace.update({
                    where: { id: item.marketplaceId },
                    data: { stock: { decrement: item.quantity } }
                });
            }

            // Aggregate by Seller for Escrow
            const sellerMap = {};
            orderItemsData.forEach(oi => {
                if (!sellerMap[oi.ownerId]) sellerMap[oi.ownerId] = 0;
                sellerMap[oi.ownerId] += (oi.price * oi.quantity);
            });

            // 3. Check Buyer Balance & Deduct
            const buyer = await tx.user.findUnique({ where: { id: userId } });
            if (buyer.balance < calculatedTotal) {
                throw new Error(`Insufficient balance. Required: ${calculatedTotal}, Available: ${buyer.balance}`);
            }

            // Deduct from Buyer
            await tx.user.update({
                where: { id: userId },
                data: { balance: { decrement: calculatedTotal } }
            });

            // Create Payment Transaction (Buyer -> Platform/Escrow)
            await tx.transaction.create({
                data: {
                    amount: -calculatedTotal,
                    type: 'PAYMENT',
                    status: 'COMPLETED',
                    senderId: userId,
                    description: `Payment for Order`,
                    metadata: JSON.stringify({ items: orderItemsData.map(i => i.marketplaceId) })
                }
            });

            // 4. Create Order with escrow amount
            const primarySellerId = Object.keys(sellerMap)[0] || null;

            // Task 2: Notify escrow held
            sendEscrowEmail({ id: 'NEW_ORDER', total: calculatedTotal, contactEmail: buyer.email }, 'HELD');
            const order = await tx.order.create({
                data: {
                    userId: userId,
                    status: 'PAID',
                    total: calculatedTotal,
                    subtotal: calculatedTotal,
                    commission: calculatedTotal * 0.05,
                    escrowAmount: calculatedTotal,     // 💰 Full amount held in escrow
                    sellerId: primarySellerId,          // 🏪 Primary seller
                    paymentMethod: 'WALLET',
                    paymentProvider: 'AUTOHOUSE_PAY',
                    shippingAddress: typeof shippingAddress === 'object' ? JSON.stringify(shippingAddress) : shippingAddress,
                    items: {
                        create: orderItemsData
                    }
                },
                include: { items: true }
            });

            // 5. Create Pending SALE transactions for sellers (escrow)
            for (const [ownerId, amount] of Object.entries(sellerMap)) {
                await tx.transaction.create({
                    data: {
                        amount: amount * 0.95, // Deduct 5% commission
                        type: 'SALE',
                        status: 'PENDING',     // ⏳ Held until seller confirms
                        receiverId: ownerId,
                        description: `Sale proceeds for Order #${order.id} (Pending Seller Confirmation)`,
                        metadata: JSON.stringify({ orderId: order.id })
                    }
                });
            }

            return order;
        });
    }

    // ─────────────────────────────────────────────
    // SELLER confirms the deal → releases escrow to seller
    // ─────────────────────────────────────────────
    async sellerConfirmOrder(sellerId, orderId) {
        return prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: { items: { include: { marketplace: true } } }
            });

            if (!order) throw new Error('Order not found');
            if (order.status === 'COMPLETED') throw new Error('Order already completed');
            if (!['PAID', 'PROCESSING', 'SHIPPED'].includes(order.status)) {
                throw new Error('Order cannot be confirmed at this stage');
            }

            // Verify the caller is actually a seller for this order
            const isSeller = order.items.some(item => item.marketplace.ownerId === sellerId);
            if (!isSeller) throw new Error('Unauthorized: Not the seller of this order');

            // 1. Update order: CONFIRMED + clear escrow
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: { status: 'COMPLETED', escrowAmount: 0 }
            });

            // 2. Find PENDING SALE transactions for this order and release them
            const pendingTransactions = await tx.transaction.findMany({
                where: {
                    type: 'SALE',
                    status: 'PENDING',
                    description: { contains: orderId }
                }
            });

            for (const txn of pendingTransactions) {
                // Mark transaction as completed
                await tx.transaction.update({
                    where: { id: txn.id },
                    data: { status: 'COMPLETED' }
                });

                // 💸 Credit seller balance
                await tx.user.update({
                    where: { id: txn.receiverId },
                    data: { balance: { increment: txn.amount } }
                });

                console.log(`✅ Escrow released: ${txn.amount} UZS → Seller ${txn.receiverId}`);
            }

            return updatedOrder;
        });
    }

    async updateOrderStatus(userId, orderId, status) {
        // 1. Find Order and verify Seller ownership
        // In a multi-vendor setup, an order might have items from different sellers.
        // For simplicity/MVP: We check if the user is the owner of ANY item in the order.
        // And we update the status of the *Order*. 
        // Refinement: Ideally we should update OrderItem status.
        // Let's stick to Order status for now as per current schema usage, 
        // or update OrderItem status if we want granular tracking.
        // The prompt implies "Order" status. Let's start with Order level for single-vendor orders, 
        // or require all items to be from same seller (typical for simple marketplaces).

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: { include: { marketplace: true } } }
        });

        if (!order) throw new Error("Order not found");

        // Verify User is Seller
        const isSeller = order.items.some(item => item.marketplace.ownerId === userId);
        if (!isSeller) throw new Error("Unauthorized: You are not the seller");

        // Allowed transitions for Seller
        const allowedStatuses = ['PROCESSING', 'SHIPPED'];
        if (!allowedStatuses.includes(status)) {
            throw new Error("Invalid status update");
        }

        // Update Order
        return prisma.order.update({
            where: { id: orderId },
            data: { status }
        });
    }

    async getPartnerOrders(userId) {
        // Find orders containing items owned by this user
        return prisma.order.findMany({
            where: {
                items: {
                    some: {
                        marketplace: {
                            ownerId: userId
                        }
                    }
                }
            },
            include: {
                items: {
                    include: {
                        marketplace: true
                    }
                },
                user: { // Include Buyer info
                    select: { name: true, email: true, phone: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async confirmOrderReceipt(userId, orderId) {
        return prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: { items: { include: { marketplace: true } } }
            });

            if (!order) throw new Error("Order not found");
            if (order.userId !== userId) throw new Error("Unauthorized");
            if (order.status === 'COMPLETED') throw new Error("Order already completed");
            if (order.status !== 'PAID' && order.status !== 'SHIPPED') throw new Error("Order not ready for confirmation");

            // 1. Update Order Status
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: { status: 'COMPLETED' }
            });

            // Task 2: Notify escrow released
            sendEscrowEmail(order, 'RELEASED');

            // 2. Release Funds to Sellers
            // Find pending SALE transactions linked to this order
            // Note: We used metadata to link. 
            // Alternative: Add orderId to Transaction model (cleaner), but using metadata for now to avoid schema change if possible.
            // If schema change needed, we can add it. But let's try metadata search or inferred logic.
            // Inferred: Find PENDING 'SALE' transactions for the sellers with this amount? Risky.
            // Better: We put orderId in metadata.

            // Prisma JSON filter is specific. Let's fetch pending transactions for these sellers and filter in JS if needed, 
            // or rely on a descriptive convention if JSON filtering is tricky without specific DB support enabled.
            // Safe bet: Update schema is best, but "No schema changes strictly required" was in plan.
            // Let's use `contains` for generic JSON string match if supported or fetch and filter.

            const sellers = [...new Set(order.items.map(i => i.marketplace.ownerId).filter(Boolean))];

            for (const sellerId of sellers) {
                // Find the transaction
                const transaction = await tx.transaction.findFirst({
                    where: {
                        receiverId: sellerId,
                        type: 'SALE',
                        status: 'PENDING',
                        description: { contains: order.id } // Reliable enough for now
                    }
                });

                if (transaction) {
                    // Update Transaction
                    await tx.transaction.update({
                        where: { id: transaction.id },
                        data: { status: 'COMPLETED' }
                    });

                    // Update Seller Balance
                    await tx.user.update({
                        where: { id: sellerId },
                        data: { balance: { increment: transaction.amount } }
                    });
                }
            }

            return updatedOrder;
        });
    }

    async getUserOrders(userId) {
        return prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        marketplace: {
                            select: { name: true, image: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getOrderById(userId, orderId) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        marketplace: {
                            select: { name: true, image: true }
                        }
                    }
                }
            }
        });

        if (!order) return null;
        if (order.userId !== userId) throw new Error("Unauthorized");

        return order;
    }
}

module.exports = new OrderService();
