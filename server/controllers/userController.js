import { readDB, writeDB } from '../utils/db.js';

export const getProfile = (req, res) => {
    const userId = req.params.id || req.user.id;
    const users = readDB('users');
    const user = users.find(u => u.id === userId);

    if (!user) {
        return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
};

export const searchUsers = (req, res) => {
    const query = req.query.q?.toLowerCase();
    if (!query) return res.json([]);

    const users = readDB('users');
    const results = users.filter(u =>
        (u.pseudo && u.pseudo.toLowerCase().includes(query)) ||
        (u.prenom && u.prenom.toLowerCase().includes(query)) ||
        (u.nom && u.nom.toLowerCase().includes(query)) ||
        (u.departement && u.departement.includes(query))
    ).map(({ password, ...u }) => u);

    res.json(results);
};

export const getFriends = (req, res) => {
    const userId = req.user.id;
    const users = readDB('users');
    const currentUser = users.find(u => u.id === userId);

    if (!currentUser || !currentUser.amis) return res.json([]);

    const friends = currentUser.amis.map(friendId => {
        const f = users.find(u => u.id === friendId);
        if (!f) return null;
        const { password, ...fData } = f;
        return fData;
    }).filter(Boolean);

    res.json(friends);
};

export const getSuggestions = (req, res) => {
    const userId = req.user.id;
    const users = readDB('users');
    const currentUser = users.find(u => u.id === userId);

    if (!currentUser) return res.json([]);

    const suggestions = users.filter(u => {
        if (u.id === userId) return false;
        if (currentUser.amis && currentUser.amis.includes(u.id)) return false;
        return true;
    }).sort((a, b) => {
        // Boost users in same department
        const aDept = a.departement === currentUser.departement ? 1 : 0;
        const bDept = b.departement === currentUser.departement ? 1 : 0;
        return bDept - aDept;
    }).slice(0, 5)
        .map(({ password, ...u }) => u);

    res.json(suggestions);
};

export const addFriend = (req, res) => {
    const userId = req.user.id;
    const { targetId } = req.body;

    if (userId === targetId) return res.status(400).json({ message: "Impossible de s'ajouter soi-même" });

    const users = readDB('users');
    const currentUser = users.find(u => u.id === userId);

    // 1. Check if already friends
    if (currentUser.amis && currentUser.amis.includes(targetId)) {
        return res.json({ message: 'Déjà amis !' });
    }

    // 2. Check if request already sent (Check notifications)
    const notifications = readDB('notifications');
    const existingNotif = notifications.find(n =>
        n.userId === targetId &&
        n.type === 'friend_request' &&
        n.fromUserId === userId
    );

    if (existingNotif) {
        return res.json({ message: 'Demande déjà envoyée' });
    }

    // 3. Create Notification
    const newNotif = {
        id: `notif_${Date.now()}`,
        userId: targetId,
        type: 'friend_request',
        fromUserId: userId,
        message: `${currentUser.prenom} ${currentUser.nom} souhaite vous ajouter en ami.`,
        createdAt: new Date().toISOString(),
        read: false,
        link: `/user/${userId}`
    };

    notifications.push(newNotif);
    writeDB('notifications', notifications);

    // Signal via Socket
    const io = req.app.get('io');
    if (io) {
        io.to(targetId).emit('new_notification', newNotif);
    }

    res.json({ message: 'Demande envoyée !' });
};

export const toggleFavorite = (req, res) => {
    const userId = req.user.id;
    const { type, id } = req.body; // type: 'contest', 'club', 'team'

    if (!['concours', 'clubs', 'equipes'].includes(type)) {
        return res.status(400).json({ message: 'Type invalide' });
    }

    const users = readDB('users');
    const user = users.find(u => u.id === userId);

    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    if (!user.favoris) user.favoris = { concours: [], clubs: [], equipes: [] };
    if (!user.favoris[type]) user.favoris[type] = [];

    const index = user.favoris[type].indexOf(id);
    if (index === -1) {
        user.favoris[type].push(id);
    } else {
        user.favoris[type].splice(index, 1);
    }

    writeDB('users', users);

    res.json(user.favoris);
};
