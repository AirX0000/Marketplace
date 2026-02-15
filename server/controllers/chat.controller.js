const prisma = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

// Get all chat rooms for a user
exports.getRooms = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const rooms = await prisma.chatRoom.findMany({
        where: {
            participants: {
                some: { id: userId }
            }
        },
        include: {
            participants: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                    role: true,
                    storeName: true // For partners
                }
            }
        },
        orderBy: { updatedAt: 'desc' }
    });

    // Format for frontend
    const formattedRooms = rooms.map(room => {
        const otherParticipant = room.participants.find(p => p.id !== userId);
        return {
            id: room.id,
            partner: otherParticipant, // The person we are chatting with
            lastMessage: room.lastMessage,
            lastMessageAt: room.lastMessageAt,
            updatedAt: room.updatedAt
        };
    });

    res.json(formattedRooms);
});

// Get messages for a specific room
exports.getMessages = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const userId = req.user.userId;

    // Verify participation
    const room = await prisma.chatRoom.findUnique({
        where: { id: roomId },
        include: { participants: { select: { id: true } } }
    });

    if (!room || !room.participants.some(p => p.id === userId)) {
        return res.status(403).json({ error: "Access denied" });
    }

    const messages = await prisma.chatMessage.findMany({
        where: { chatRoomId: roomId },
        include: {
            sender: {
                select: { id: true, name: true, avatar: true }
            }
        },
        orderBy: { createdAt: 'asc' }
    });

    res.json(messages);
});

// Create or get a room with a specific user
exports.initiateChat = asyncHandler(async (req, res) => {
    const { targetUserId } = req.body;
    const userId = req.user.userId;

    if (userId === targetUserId) {
        return res.status(400).json({ error: "Cannot chat with yourself" });
    }

    // Check if room exists
    const existingRoom = await prisma.chatRoom.findFirst({
        where: {
            AND: [
                { participants: { some: { id: userId } } },
                { participants: { some: { id: targetUserId } } }
            ]
        }
    });

    if (existingRoom) {
        return res.json({ id: existingRoom.id });
    }

    // Create new room
    const newRoom = await prisma.chatRoom.create({
        data: {
            participants: {
                connect: [{ id: userId }, { id: targetUserId }]
            }
        }
    });

    res.status(201).json({ id: newRoom.id });
});
