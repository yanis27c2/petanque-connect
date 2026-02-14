import { readDB, writeDB } from '../utils/db.js';

export const getConversations = (req, res) => {
    const userId = req.user.id;
    const allMessages = readDB('messages');

    // Find conversations where user is participant
    const userConversations = allMessages.filter(c => c.participants.includes(userId));

    // Enrich with other participant info (name, avatar)
    const users = readDB('users');

    const enriched = userConversations.map(c => {
        const otherIds = c.participants.filter(pid => pid !== userId);
        // For DM, usually 1 other. For Group, multiple.
        // Let's assume DM for name/avatar if group name not set.

        let name = c.name;
        let avatar = c.avatar;

        if (!name && otherIds.length > 0) {
            const others = users.filter(u => otherIds.includes(u.id));
            name = others.map(u => u.name).join(', ');
            avatar = others[0]?.avatar;
        }

        const lastMsg = c.messages[c.messages.length - 1];

        return {
            id: c.id,
            name,
            avatar,
            participants: c.participants,
            lastMessage: lastMsg ? lastMsg.text : '',
            time: lastMsg ? lastMsg.time : c.updatedAt,
            unread: 0 // Mock unread
        };
    });

    res.json(enriched);
};

export const getMessages = (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const allMessages = readDB('messages');
    const conversation = allMessages.find(c => c.id === id);

    if (!conversation) return res.status(404).json({ message: 'Conversation introuvable' });
    if (!conversation.participants.includes(userId)) return res.status(403).json({ message: 'Accès interdit' });

    res.json(conversation.messages);
};

export const sendMessage = (req, res) => {
    const { conversationId, text } = req.body;
    const userId = req.user.id;

    const allMessages = readDB('messages');
    const conversation = allMessages.find(c => c.id === conversationId);

    if (!conversation) return res.status(404).json({ message: 'Conversation introuvable' });

    const newMessage = {
        from: userId,
        text,
        time: new Date().toISOString()
    };

    conversation.messages.push(newMessage);
    writeDB('messages', allMessages);

    // --- Notify Participant(s) ---
    const users = readDB('users');
    const sender = users.find(u => u.id === userId);
    const notifications = readDB('notifications');
    const io = req.app.get('io');

    conversation.participants.forEach(pid => {
        if (pid !== userId) {
            const newNotif = {
                id: `notif_msg_${Date.now()}`,
                userId: pid,
                type: 'message',
                fromUserId: userId,
                message: `Nouveau message de ${sender?.prenom || sender?.pseudo || 'un utilisateur'}`,
                createdAt: new Date().toISOString(),
                read: false,
                link: `/messages`
            };
            notifications.push(newNotif);
            if (io) {
                io.to(pid).emit('new_notification', newNotif);
            }
        }
    });
    writeDB('notifications', notifications);

    res.json(newMessage);
};

export const createOrGetConversation = (req, res) => {
    const { targetId } = req.body;
    const userId = req.user.id;

    const allMessages = readDB('messages');

    // Check if DM exists
    let conversation = allMessages.find(c =>
        c.participants.length === 2 &&
        c.participants.includes(userId) &&
        c.participants.includes(targetId)
    );

    if (conversation) {
        return res.json(conversation);
    }

    // Create new
    const newConversation = {
        id: `conv-${Date.now()}`, // simple ID generation
        participants: [userId, targetId],
        messages: [],
        updatedAt: new Date().toISOString()
    };

    allMessages.push(newConversation);
    writeDB('messages', allMessages);

    res.json(newConversation);
};
