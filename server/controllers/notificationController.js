import { readDB, writeDB } from '../utils/db.js';

export const getNotifications = (req, res) => {
    const userId = req.user.id;
    const notifications = readDB('notifications');

    // Sort by date desc
    const userNotifs = notifications
        .filter(n => n.userId === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(userNotifs);
};

export const markAsRead = (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    const notifications = readDB('notifications');
    const notifIndex = notifications.findIndex(n => n.id === id && n.userId === userId);

    if (notifIndex !== -1) {
        notifications[notifIndex].read = true;
        writeDB('notifications', notifications);
        res.json({ success: true });
    } else {
        res.status(404).json({ message: 'Notification introuvable' });
    }
};

export const acceptFriendRequest = (req, res) => {
    const userId = req.user.id;
    const { notificationId } = req.body;

    const notifications = readDB('notifications');
    const notif = notifications.find(n => n.id === notificationId && n.userId === userId);

    if (!notif || notif.type !== 'friend_request') {
        return res.status(400).json({ message: 'Demande invalide' });
    }

    const requesterId = notif.fromUserId;
    const users = readDB('users');

    const currentUserIndex = users.findIndex(u => u.id === userId);
    const requesterIndex = users.findIndex(u => u.id === requesterId);

    if (currentUserIndex === -1 || requesterIndex === -1) {
        return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    // Add to friends lists if not already
    if (!users[currentUserIndex].amis.includes(requesterId)) {
        users[currentUserIndex].amis.push(requesterId);
    }
    if (!users[requesterIndex].amis.includes(userId)) {
        users[requesterIndex].amis.push(userId);
    }

    writeDB('users', users);

    // Mark notif as read/handled
    notif.read = true;
    notif.handled = true;
    writeDB('notifications', notifications);

    // Optionally create a "Accepted" notification for the requester
    const acceptNotif = {
        id: `notif_${Date.now()}`,
        userId: requesterId,
        type: 'friend_accept',
        fromUserId: userId,
        message: `${users[currentUserIndex].prenom} a accepté votre demande d'ami.`,
        createdAt: new Date().toISOString(),
        read: false,
        link: `/user/${userId}`
    };
    notifications.push(acceptNotif);
    writeDB('notifications', notifications); // write again... optimization possible but fine for prototype

    res.json({ message: 'Demande acceptée !' });
};
