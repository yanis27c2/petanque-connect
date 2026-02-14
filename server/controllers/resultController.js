import { readDB, writeDB, findUserById } from '../utils/db.js';

// ── Create a result ──
export const createResult = (req, res) => {
    const userId = req.user.id;
    const userObj = findUserById(userId);
    const {
        contestId, contestName, contestDate, contestLocation, contestType,
        teamName, totalTeams, gamesWon, gamesLost, scores,
        ranking, photo, caption
    } = req.body;

    if (!contestName || !photo) {
        return res.status(400).json({ message: 'Le nom du concours et la photo sont requis.' });
    }

    const results = readDB('results');

    const newResult = {
        id: `r_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        userId,
        userName: userObj?.pseudo || userObj?.prenom || 'Joueur',
        contestId: contestId || null,
        contestName: contestName.trim(),
        contestDate: contestDate || new Date().toISOString().split('T')[0],
        contestLocation: contestLocation || '',
        contestType: contestType || 'Triplette',
        teamName: teamName || '',
        totalTeams: totalTeams ? parseInt(totalTeams) : null,
        gamesWon: parseInt(gamesWon) || 0,
        gamesLost: parseInt(gamesLost) || 0,
        scores: scores || [],
        ranking: ranking || '',
        photo,
        caption: caption?.trim() || '',
        likes: [],
        createdAt: new Date().toISOString()
    };

    results.unshift(newResult); // newest first
    writeDB('results', results);

    // Enrich with user data before returning
    const users = readDB('users');
    const user = users.find(u => u.id === userId);
    newResult.userAvatar = user?.avatarColor || '#6366f1';
    newResult.userPseudo = user?.pseudo || user?.prenom || 'Joueur';

    res.status(201).json(newResult);
};

// ── Get all results (public feed) ──
export const getResults = (req, res) => {
    const results = readDB('results');
    const users = readDB('users');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Enrich with user details
    const enriched = results.map(r => {
        const user = users.find(u => u.id === r.userId);
        return {
            ...r,
            userAvatar: user?.avatarColor || '#6366f1',
            userPseudo: user?.pseudo || user?.prenom || 'Joueur'
        };
    });

    // Paginate
    const start = (page - 1) * limit;
    const paginated = enriched.slice(start, start + limit);

    res.json({
        results: paginated,
        total: results.length,
        hasMore: start + limit < results.length
    });
};

// ── Get my results ──
export const getMyResults = (req, res) => {
    const userId = req.user.id;
    const results = readDB('results');
    const users = readDB('users');
    const user = users.find(u => u.id === userId);

    const mine = results
        .filter(r => r.userId === userId)
        .map(r => ({
            ...r,
            userAvatar: user?.avatarColor || '#6366f1',
            userPseudo: user?.pseudo || user?.prenom || 'Joueur'
        }));

    res.json(mine);
};

// ── Delete a result ──
export const deleteResult = (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const results = readDB('results');

    const index = results.findIndex(r => r.id === id);
    if (index === -1) return res.status(404).json({ message: 'Résultat introuvable' });
    if (results[index].userId !== userId) return res.status(403).json({ message: 'Non autorisé' });

    results.splice(index, 1);
    writeDB('results', results);

    res.json({ message: 'Résultat supprimé' });
};

// ── Like / Unlike a result ──
export const toggleLike = (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const results = readDB('results');

    const result = results.find(r => r.id === id);
    if (!result) return res.status(404).json({ message: 'Résultat introuvable' });

    if (!result.likes) result.likes = [];
    const likeIndex = result.likes.indexOf(userId);

    if (likeIndex === -1) {
        result.likes.push(userId);

        // --- Create Notification for Owner ---
        if (result.userId !== userId) {
            const notifications = readDB('notifications');
            const currentUser = findUserById(userId);
            const newNotif = {
                id: `notif_${Date.now()}`,
                userId: result.userId,
                type: 'like',
                fromUserId: userId,
                message: `${currentUser?.pseudo || currentUser?.prenom || 'Un utilisateur'} a aimé votre résultat : ${result.contestName}`,
                createdAt: new Date().toISOString(),
                read: false,
                link: `/resultats`
            };
            notifications.push(newNotif);
            writeDB('notifications', notifications);

            // Signal via Socket
            const io = req.app.get('io');
            if (io) {
                io.to(result.userId).emit('new_notification', newNotif);
            }
        }
    } else {
        result.likes.splice(likeIndex, 1);
    }

    writeDB('results', results);
    res.json({ likes: result.likes.length, liked: likeIndex === -1 });
};
