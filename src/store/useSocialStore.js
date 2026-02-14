import { create } from 'zustand';
import { api } from '../api/config';
import socket from '../api/socket';

const useSocialStore = create((set, get) => ({
    friends: [],
    teams: [],
    searchResults: [],
    suggestions: [],
    isLoading: false,

    fetchSuggestions: async () => {
        try {
            const res = await api.get('/user/suggestions');
            if (res.ok) set({ suggestions: await res.json() });
        } catch (e) { console.error(e); }
    },

    fetchFriends: async () => {
        try {
            const res = await api.get('/user/friends');
            if (res.ok) set({ friends: await res.json() });
        } catch (e) { console.error(e); }
    },

    searchUsers: async (query) => {
        if (!query) return set({ searchResults: [] });
        try {
            const res = await api.get(`/user/search?q=${query}`);
            if (res.ok) set({ searchResults: await res.json() });
        } catch (e) { console.error(e); }
    },

    fetchTeams: async () => {
        try {
            const res = await api.get('/teams');
            if (res.ok) set({ teams: await res.json() });
        } catch (e) { console.error(e); }
    },

    createTeam: async (name, contestId, lookingFor = 0) => {
        try {
            const res = await api.post('/teams', { name, contestId, lookingFor });
            if (res.ok) {
                const newTeam = await res.json();
                set(state => ({ teams: [...state.teams, newTeam] }));
                return newTeam;
            }
        } catch (e) { console.error(e); }
        return null;
    },

    joinTeam: async (teamId) => {
        try {
            const res = await api.post(`/teams/${teamId}/join`);
            if (res.ok) {
                const updatedTeam = await res.json();
                set(state => ({
                    teams: state.teams.map(t => t.id === teamId ? updatedTeam : t)
                }));
                return updatedTeam;
            } else {
                const data = await res.json();
                return { error: data.message };
            }
        } catch (e) { console.error(e); }
        return null;
    },

    leaveTeam: async (teamId) => {
        try {
            const res = await api.post(`/teams/${teamId}/leave`);
            if (res.ok) {
                // Remove user from team locally
                set(state => ({
                    teams: state.teams.map(t => {
                        if (t.id === teamId) {
                            return { ...t, members: t.members.filter(m => m !== 'self') };
                        }
                        return t;
                    })
                }));
                // Refetch to get clean state
                const { fetchTeams } = useSocialStore.getState();
                await fetchTeams();
                return true;
            }
        } catch (e) { console.error(e); }
        return false;
    },

    addFriend: async (targetId) => {
        try {
            const res = await api.post('/user/friends', { targetId });
            if (res.ok) {
                const data = await res.json();
                // We don't refresh friends here anymore because it's a request
                // But we can return the message
                return data.message;
            }
        } catch (e) { console.error(e); }
        return 'Erreur';
    }
}));

export default useSocialStore;
