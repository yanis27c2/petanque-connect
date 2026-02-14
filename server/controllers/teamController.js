import { readDB, writeDB } from '../utils/db.js';

// ── Helper: compute status from team state ──
function computeStatus(team) {
    if (team.members.length >= team.maxMembers) return 'complete';
    return 'pending';
}

function addHistory(team, message) {
    team.history = team.history || [];
    team.history.push({ message, date: new Date().toISOString() });
    team.updatedAt = new Date().toISOString();
}

// Helper: get user display name
function getUserName(userId) {
    const users = readDB('users');
    const u = users.find(x => x.id === userId);
    if (!u) return userId;
    return u.pseudo || `${u.prenom || ''} ${u.nom || ''}`.trim() || userId;
}

// Helper: enrich team with memberDetails (used in all responses)
function enrichTeam(team) {
    const users = readDB('users');
    return {
        ...team,
        memberDetails: (team.members || []).map(mid => {
            const u = users.find(x => x.id === mid);
            return u ? { id: u.id, prenom: u.prenom, nom: u.nom, pseudo: u.pseudo, avatarColor: u.avatarColor }
                : { id: mid, prenom: mid, nom: '', pseudo: mid, avatarColor: '#9ca3af' };
        })
    };
}

// ── GET /api/teams?contestId=XXX ──
export const getTeams = (req, res) => {
    const { contestId } = req.query;
    let teams = readDB('teams');

    if (contestId) {
        teams = teams.filter(t => t.contestId === contestId);
    }

    // Filter: show public teams + teams where user is member or has a pending request
    const userId = req.user?.id;
    if (userId) {
        teams = teams.filter(t =>
            t.isPublic !== false ||
            (t.members || []).includes(userId) ||
            (t.joinRequests || []).some(jr => jr.userId === userId) ||
            t.captainId === userId
        );
    } else {
        teams = teams.filter(t => t.isPublic !== false);
    }

    // Strip passwords/sensitive data, return clean
    const clean = teams.map(t => enrichTeam(t));

    res.json(clean);
};

// ── GET /api/teams/:teamId ──
export const getTeamById = (req, res) => {
    const teams = readDB('teams');
    const team = teams.find(t => t.id === req.params.teamId);
    if (!team) return res.status(404).json({ message: 'Équipe introuvable' });

    res.json(enrichTeam(team));
};

// ── POST /api/teams ──
export const createTeam = (req, res) => {
    const { name, contestId, isPublic, maxMembers } = req.body;
    const userId = req.user.id;

    if (!name || !contestId) {
        return res.status(400).json({ message: 'Nom et concours requis' });
    }

    const teams = readDB('teams');

    // Check: user not already in a team for this contest
    const existing = teams.find(t => t.contestId === contestId && (t.members || []).includes(userId));
    if (existing) {
        return res.status(400).json({ message: 'Vous avez déjà une équipe pour ce concours' });
    }

    const newTeam = {
        id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        name: name.trim(),
        captainId: userId,
        members: [userId],
        contestId,
        maxMembers: maxMembers || 3,
        status: 'pending',
        isPublic: isPublic !== false,
        joinRequests: [],
        history: [{ message: `${getUserName(userId)} a créé l'équipe`, date: new Date().toISOString() }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    teams.push(newTeam);
    writeDB('teams', teams);

    const enriched = enrichTeam(newTeam);

    // Emit socket event
    const io = req.app.get('io');
    if (io) io.to(`contest:${contestId}`).emit('team:created', enriched);

    res.status(201).json(enriched);
};

// ── POST /api/teams/:teamId/join-request ──
export const joinRequest = (req, res) => {
    const { teamId } = req.params;
    const userId = req.user.id;

    const teams = readDB('teams');
    const team = teams.find(t => t.id === teamId);
    if (!team) return res.status(404).json({ message: 'Équipe introuvable' });

    // Check: not already a member
    if ((team.members || []).includes(userId)) {
        return res.status(400).json({ message: 'Vous êtes déjà membre de cette équipe' });
    }

    // Check: not already in another team for same contest
    const existingTeam = teams.find(t => t.contestId === team.contestId && t.id !== teamId && (t.members || []).includes(userId));
    if (existingTeam) {
        return res.status(400).json({ message: 'Vous avez déjà une équipe pour ce concours' });
    }

    // Check: team not full
    if ((team.members || []).length >= (team.maxMembers || 3)) {
        return res.status(400).json({ message: 'Cette équipe est complète' });
    }

    // Check: no duplicate request
    team.joinRequests = team.joinRequests || [];
    if (team.joinRequests.some(jr => jr.userId === userId)) {
        return res.status(400).json({ message: 'Demande déjà envoyée' });
    }

    team.joinRequests.push({ userId, userName: getUserName(userId), createdAt: new Date().toISOString() });
    addHistory(team, `${getUserName(userId)} a demandé à rejoindre`);
    writeDB('teams', teams);

    const enriched = enrichTeam(team);
    // Socket: notify captain
    const io = req.app.get('io');
    if (io) {
        io.to(team.captainId).emit('team:join-request', { teamId, userId, userName: getUserName(userId) });
        io.to(`contest:${team.contestId}`).emit('team:updated', enriched);
    }

    res.json({ message: 'Demande envoyée', team: enriched });
};

// ── POST /api/teams/:teamId/cancel-request ──
export const cancelJoinRequest = (req, res) => {
    const { teamId } = req.params;
    const userId = req.user.id;

    const teams = readDB('teams');
    const team = teams.find(t => t.id === teamId);
    if (!team) return res.status(404).json({ message: 'Équipe introuvable' });

    team.joinRequests = (team.joinRequests || []).filter(jr => jr.userId !== userId);
    addHistory(team, `${getUserName(userId)} a annulé sa demande`);
    writeDB('teams', teams);

    const enriched = enrichTeam(team);
    const io = req.app.get('io');
    if (io) io.to(`contest:${team.contestId}`).emit('team:updated', enriched);

    res.json({ message: 'Demande annulée', team: enriched });
};

// ── POST /api/teams/:teamId/accept ──
export const acceptJoinRequest = (req, res) => {
    const { teamId } = req.params;
    const { userId } = req.body;
    const captainId = req.user.id;

    const teams = readDB('teams');
    const team = teams.find(t => t.id === teamId);
    if (!team) return res.status(404).json({ message: 'Équipe introuvable' });

    // Only captain can accept
    if (team.captainId !== captainId) {
        return res.status(403).json({ message: 'Seul le capitaine peut accepter les demandes' });
    }

    // Check request exists
    const requestIndex = (team.joinRequests || []).findIndex(jr => jr.userId === userId);
    if (requestIndex === -1) {
        return res.status(400).json({ message: 'Demande introuvable' });
    }

    // Check not full
    if ((team.members || []).length >= (team.maxMembers || 3)) {
        return res.status(400).json({ message: 'L\'équipe est déjà complète' });
    }

    // Check user not already in another team for this contest
    const existingTeam = teams.find(t => t.contestId === team.contestId && t.id !== teamId && (t.members || []).includes(userId));
    if (existingTeam) {
        return res.status(400).json({ message: 'Ce joueur a déjà une équipe pour ce concours' });
    }

    // Accept: move from joinRequests to members
    team.joinRequests.splice(requestIndex, 1);
    team.members = team.members || [];
    team.members.push(userId);
    team.status = computeStatus(team);
    addHistory(team, `${getUserName(userId)} a rejoint l'équipe`);
    writeDB('teams', teams);

    const enriched = enrichTeam(team);
    const io = req.app.get('io');
    if (io) {
        io.to(userId).emit('team:join-response', { teamId, accepted: true, teamName: team.name });
        io.to(`contest:${team.contestId}`).emit('team:updated', enriched);
    }

    res.json({ message: 'Joueur accepté', team: enriched });
};

// ── POST /api/teams/:teamId/refuse ──
export const refuseJoinRequest = (req, res) => {
    const { teamId } = req.params;
    const { userId } = req.body;
    const captainId = req.user.id;

    const teams = readDB('teams');
    const team = teams.find(t => t.id === teamId);
    if (!team) return res.status(404).json({ message: 'Équipe introuvable' });

    if (team.captainId !== captainId) {
        return res.status(403).json({ message: 'Seul le capitaine peut refuser les demandes' });
    }

    team.joinRequests = (team.joinRequests || []).filter(jr => jr.userId !== userId);
    addHistory(team, `Demande de ${getUserName(userId)} refusée`);
    writeDB('teams', teams);

    const enriched = enrichTeam(team);
    const io = req.app.get('io');
    if (io) {
        io.to(userId).emit('team:join-response', { teamId, accepted: false, teamName: team.name });
        io.to(`contest:${team.contestId}`).emit('team:updated', enriched);
    }

    res.json({ message: 'Demande refusée', team: enriched });
};

// ── POST /api/teams/:teamId/leave ──
export const leaveTeam = (req, res) => {
    const { teamId } = req.params;
    const userId = req.user.id;

    const teams = readDB('teams');
    const team = teams.find(t => t.id === teamId);
    if (!team) return res.status(404).json({ message: 'Équipe introuvable' });

    if (!(team.members || []).includes(userId)) {
        return res.status(400).json({ message: 'Vous n\'êtes pas dans cette équipe' });
    }

    // If captain leaves
    if (team.captainId === userId) {
        const otherMembers = team.members.filter(m => m !== userId);
        if (otherMembers.length > 0) {
            // Transfer captainship to next member
            team.captainId = otherMembers[0];
            addHistory(team, `${getUserName(userId)} a quitté. ${getUserName(otherMembers[0])} est le nouveau capitaine`);
        } else {
            // Team is now empty → delete it
            const idx = teams.indexOf(team);
            teams.splice(idx, 1);
            writeDB('teams', teams);

            const io = req.app.get('io');
            if (io) io.to(`contest:${team.contestId}`).emit('team:deleted', { teamId });

            return res.json({ message: 'Équipe supprimée (dernier membre)', contestId: team.contestId });
        }
    } else {
        addHistory(team, `${getUserName(userId)} a quitté l'équipe`);
    }

    team.members = team.members.filter(m => m !== userId);

    // Update status
    if (team.status === 'validated') {
        team.status = 'modified';
    } else {
        team.status = computeStatus(team);
    }

    writeDB('teams', teams);

    const enriched = enrichTeam(team);
    const io = req.app.get('io');
    if (io) io.to(`contest:${team.contestId}`).emit('team:updated', enriched);

    res.json({ message: 'Vous avez quitté l\'équipe', contestId: team.contestId });
};

// ── POST /api/teams/:teamId/kick ──
export const kickMember = (req, res) => {
    const { teamId } = req.params;
    const { userId } = req.body;
    const captainId = req.user.id;

    const teams = readDB('teams');
    const team = teams.find(t => t.id === teamId);
    if (!team) return res.status(404).json({ message: 'Équipe introuvable' });

    if (team.captainId !== captainId) {
        return res.status(403).json({ message: 'Seul le capitaine peut retirer un joueur' });
    }

    if (userId === captainId) {
        return res.status(400).json({ message: 'Le capitaine ne peut pas se retirer lui-même' });
    }

    if (!(team.members || []).includes(userId)) {
        return res.status(400).json({ message: 'Ce joueur n\'est pas dans l\'équipe' });
    }

    team.members = team.members.filter(m => m !== userId);

    if (team.status === 'validated') {
        team.status = 'modified';
    } else {
        team.status = computeStatus(team);
    }

    addHistory(team, `${getUserName(userId)} a été retiré de l'équipe`);
    writeDB('teams', teams);

    const enriched = enrichTeam(team);
    const io = req.app.get('io');
    if (io) {
        io.to(userId).emit('team:kicked', { teamId, teamName: team.name });
        io.to(`contest:${team.contestId}`).emit('team:updated', enriched);
    }

    res.json({ message: 'Joueur retiré', team: enriched });
};

// ── POST /api/teams/:teamId/validate ──
export const validateTeam = (req, res) => {
    const { teamId } = req.params;
    const captainId = req.user.id;

    const teams = readDB('teams');
    const team = teams.find(t => t.id === teamId);
    if (!team) return res.status(404).json({ message: 'Équipe introuvable' });

    if (team.captainId !== captainId) {
        return res.status(403).json({ message: 'Seul le capitaine peut valider l\'équipe' });
    }

    if ((team.members || []).length < (team.maxMembers || 3)) {
        return res.status(400).json({ message: 'L\'équipe n\'est pas complète' });
    }

    team.status = 'validated';
    addHistory(team, `L'équipe a été validée par ${getUserName(captainId)}`);
    writeDB('teams', teams);

    const enriched = enrichTeam(team);
    const io = req.app.get('io');
    if (io) io.to(`contest:${team.contestId}`).emit('team:updated', enriched);

    res.json({ message: 'Équipe validée', team: enriched });
};

// ── PUT /api/teams/:teamId ── (rename, toggle visibility)
export const updateTeam = (req, res) => {
    const { teamId } = req.params;
    const captainId = req.user.id;
    const { name, isPublic } = req.body;

    const teams = readDB('teams');
    const team = teams.find(t => t.id === teamId);
    if (!team) return res.status(404).json({ message: 'Équipe introuvable' });

    if (team.captainId !== captainId) {
        return res.status(403).json({ message: 'Seul le capitaine peut modifier l\'équipe' });
    }

    if (name !== undefined) {
        team.name = name.trim();
        addHistory(team, `Équipe renommée en "${team.name}"`);
    }
    if (isPublic !== undefined) {
        team.isPublic = isPublic;
        addHistory(team, `Visibilité changée en ${isPublic ? 'publique' : 'privée'}`);
    }

    writeDB('teams', teams);

    const enriched = enrichTeam(team);
    const io = req.app.get('io');
    if (io) io.to(`contest:${team.contestId}`).emit('team:updated', enriched);

    res.json({ message: 'Équipe mise à jour', team: enriched });
};

// ── DELETE /api/teams/:teamId ──
export const deleteTeam = (req, res) => {
    const { teamId } = req.params;
    const captainId = req.user.id;

    let teams = readDB('teams');
    const team = teams.find(t => t.id === teamId);
    if (!team) return res.status(404).json({ message: 'Équipe introuvable' });

    if (team.captainId !== captainId) {
        return res.status(403).json({ message: 'Seul le capitaine peut supprimer l\'équipe' });
    }

    const contestId = team.contestId;
    teams = teams.filter(t => t.id !== teamId);
    writeDB('teams', teams);

    const io = req.app.get('io');
    if (io) io.to(`contest:${contestId}`).emit('team:deleted', { teamId });

    res.json({ message: 'Équipe supprimée' });
};
