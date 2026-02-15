const prisma = require('../config/database');

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
                    price: product.price // Snapshot price
                });

                // 2. Decrement stock
                await tx.marketplace.update({
                    where: { id: item.marketplaceId },
                    data: { stock: { decrement: item.quantity } }
                });
            }

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

            // 4. Create Order
            const order = await tx.order.create({
                data: {
                    userId: userId,
                    status: 'PAID', // Escrow Active
                    total: calculatedTotal,
                    subtotal: calculatedTotal,
                    commission: calculatedTotal * 0.05,
                    paymentMethod: 'WALLET',
                    paymentProvider: 'AURA_PAY',
                    shippingAddress: typeof shippingAddress === 'object' ? JSON.stringify(shippingAddress) : shippingAddress,
                    items: {
                        create: orderItemsData
                    }
                },
                include: { items: true }
            });

            // 5. Create Pending Transaction for Seller (Escrow)
            // Group items by Seller to create separate transactions if needed (Multi-vendor support)
            // For now, assuming single seller per order or simplified flow. 
            // Better: Loop through items to find owners.

            // Optimization: Get unique sellers
            const itemIds = items.map(i => i.marketplaceId);
            const products = await tx.marketplace.findMany({
                where: { id: { in: itemIds } },
                select: { id: true, ownerId: true, price: true }
            });

            const sellerMap = {}; // ownerId -> totalAmount
            items.forEach(item => {
                const prod = products.find(p => p.id === item.marketplaceId);
                if (prod && prod.ownerId) {
                    const amount = prod.price * item.quantity;
                    sellerMap[prod.ownerId] = (sellerMap[prod.ownerId] || 0) + amount;
                }
            });

            for (const [ownerId, amount] of Object.entries(sellerMap)) {
                await tx.transaction.create({
                    data: {
                        amount: amount * 0.95, // Deduct 5% commission
                        type: 'SALE',
                        status: 'PENDING', // Escrow: Funds held
                        receiverId: ownerId,
                        description: `Sale proceeds for Order #${order.id} (Pending Receipt)`,
                        metadata: JSON.stringify({ orderId: order.id })
                    }
                });
            }

            return order;
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
