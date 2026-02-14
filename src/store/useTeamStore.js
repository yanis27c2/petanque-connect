import { create } from 'zustand';
import { api } from '../api/config';
import socket from '../api/socket';

const useTeamStore = create((set, get) => ({
    teams: [],
    myTeam: null,
    isLoading: false,
    error: null,

    // ── Fetch all teams for a contest ──
    fetchTeams: async (contestId) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.get(`/teams?contestId=${contestId}`);
            if (res.ok) {
                const teams = await res.json();
                set({ teams, isLoading: false });
                get()._computeMyTeam();
            } else {
                set({ isLoading: false });
            }
        } catch (e) {
            console.error(e);
            set({ isLoading: false });
        }
    },

    // ── Create a new team ──
    createTeam: async (data) => {
        set({ error: null });
        try {
            const res = await api.post('/teams', data);
            if (res.ok) {
                const newTeam = await res.json();
                set(state => ({ teams: [...state.teams, newTeam] }));
                get()._computeMyTeam();
                return newTeam;
            } else {
                const err = await res.json();
                set({ error: err.message });
                return null;
            }
        } catch (e) {
            console.error(e);
            set({ error: 'Erreur réseau' });
            return null;
        }
    },

    // ── Send join request ──
    sendJoinRequest: async (teamId) => {
        set({ error: null });
        try {
            const res = await api.post(`/teams/${teamId}/join-request`);
            if (res.ok) {
                const data = await res.json();
                set(state => ({
                    teams: state.teams.map(t => t.id === teamId ? { ...t, ...data.team } : t)
                }));
                return true;
            } else {
                const err = await res.json();
                set({ error: err.message });
                return false;
            }
        } catch (e) {
            console.error(e);
            return false;
        }
    },

    // ── Cancel join request ──
    cancelJoinRequest: async (teamId) => {
        try {
            const res = await api.post(`/teams/${teamId}/cancel-request`);
            if (res.ok) {
                const data = await res.json();
                set(state => ({
                    teams: state.teams.map(t => t.id === teamId ? { ...t, ...data.team } : t)
                }));
                return true;
            }
        } catch (e) { console.error(e); }
        return false;
    },

    // ── Accept join request (captain) ──
    acceptRequest: async (teamId, userId) => {
        try {
            const res = await api.post(`/teams/${teamId}/accept`, { userId });
            if (res.ok) {
                const data = await res.json();
                set(state => ({
                    teams: state.teams.map(t => t.id === teamId ? { ...t, ...data.team } : t)
                }));
                get()._computeMyTeam();
                return true;
            } else {
                const err = await res.json();
                set({ error: err.message });
            }
        } catch (e) { console.error(e); }
        return false;
    },

    // ── Refuse join request (captain) ──
    refuseRequest: async (teamId, userId) => {
        try {
            const res = await api.post(`/teams/${teamId}/refuse`, { userId });
            if (res.ok) {
                const data = await res.json();
                set(state => ({
                    teams: state.teams.map(t => t.id === teamId ? { ...t, ...data.team } : t)
                }));
                return true;
            }
        } catch (e) { console.error(e); }
        return false;
    },

    // ── Leave team ──
    leaveTeam: async (teamId) => {
        // Save contestId BEFORE the call — the team may get deleted
        const savedContestId = get().teams.find(t => t.id === teamId)?.contestId;
        try {
            const res = await api.post(`/teams/${teamId}/leave`);
            if (res.ok) {
                let contestId = savedContestId;
                try {
                    const data = await res.json();
                    contestId = data.contestId || savedContestId;
                } catch (_) { /* response may not be JSON for delete path */ }
                // Clear myTeam immediately for responsive UI
                set({ myTeam: null });
                if (contestId) await get().fetchTeams(contestId);
                return true;
            } else {
                // Safely try to parse error message
                try {
                    const err = await res.json();
                    set({ error: err.message });
                } catch (_) {
                    console.error('Leave team failed with status', res.status);
                    set({ error: `Erreur ${res.status}` });
                }
            }
        } catch (e) { console.error('leaveTeam error:', e); }
        return false;
    },

    // ── Kick member (captain) ──
    kickMember: async (teamId, userId) => {
        try {
            const res = await api.post(`/teams/${teamId}/kick`, { userId });
            if (res.ok) {
                const data = await res.json();
                set(state => ({
                    teams: state.teams.map(t => t.id === teamId ? { ...t, ...data.team } : t)
                }));
                get()._computeMyTeam();
                return true;
            }
        } catch (e) { console.error(e); }
        return false;
    },

    // ── Validate team (captain) ──
    validateTeam: async (teamId) => {
        try {
            const res = await api.post(`/teams/${teamId}/validate`);
            if (res.ok) {
                const data = await res.json();
                set(state => ({
                    teams: state.teams.map(t => t.id === teamId ? { ...t, ...data.team } : t)
                }));
                get()._computeMyTeam();
                return true;
            } else {
                const err = await res.json();
                set({ error: err.message });
            }
        } catch (e) { console.error(e); }
        return false;
    },

    // ── Rename team (captain) ──
    renameTeam: async (teamId, name) => {
        try {
            const res = await api.put(`/teams/${teamId}`, { name });
            if (res.ok) {
                const data = await res.json();
                set(state => ({
                    teams: state.teams.map(t => t.id === teamId ? { ...t, ...data.team } : t)
                }));
                get()._computeMyTeam();
                return true;
            }
        } catch (e) { console.error(e); }
        return false;
    },

    // ── Toggle visibility (captain) ──
    toggleVisibility: async (teamId, isPublic) => {
        try {
            const res = await api.put(`/teams/${teamId}`, { isPublic });
            if (res.ok) {
                const data = await res.json();
                set(state => ({
                    teams: state.teams.map(t => t.id === teamId ? { ...t, ...data.team } : t)
                }));
                return true;
            }
        } catch (e) { console.error(e); }
        return false;
    },

    // ── Delete team (captain) ──
    deleteTeam: async (teamId) => {
        try {
            const res = await api.delete(`/teams/${teamId}`);
            if (res.ok) {
                set(state => ({
                    teams: state.teams.filter(t => t.id !== teamId),
                    myTeam: state.myTeam?.id === teamId ? null : state.myTeam
                }));
                return true;
            }
        } catch (e) { console.error(e); }
        return false;
    },

    // ── Socket.IO subscription for a contest ──
    subscribeToContest: (contestId) => {
        socket.emit('join_contest', contestId);

        const onCreated = (team) => {
            set(state => {
                if (state.teams.find(t => t.id === team.id)) return state;
                return { teams: [...state.teams, team] };
            });
            get()._computeMyTeam();
        };

        const onUpdated = (team) => {
            set(state => ({
                teams: state.teams.map(t => t.id === team.id ? { ...t, ...team } : t)
            }));
            get()._computeMyTeam();
        };

        const onDeleted = ({ teamId }) => {
            set(state => ({
                teams: state.teams.filter(t => t.id !== teamId),
                myTeam: state.myTeam?.id === teamId ? null : state.myTeam
            }));
        };

        socket.on('team:created', onCreated);
        socket.on('team:updated', onUpdated);
        socket.on('team:deleted', onDeleted);

        // Return cleanup function
        return () => {
            socket.emit('leave_contest', contestId);
            socket.off('team:created', onCreated);
            socket.off('team:updated', onUpdated);
            socket.off('team:deleted', onDeleted);
        };
    },

    // ── Internal: compute myTeam from current user ──
    _computeMyTeam: () => {
        // We need user id - get it from localStorage token or pass it
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const userId = payload.id;
            const myTeam = get().teams.find(t => (t.members || []).includes(userId));
            set({ myTeam: myTeam || null });
        } catch (e) { /* ignore */ }
    },

    // ── Clear state ──
    clear: () => set({ teams: [], myTeam: null, isLoading: false, error: null })
}));

export default useTeamStore;
