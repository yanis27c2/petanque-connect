import { create } from 'zustand';
import { API_URL, authHeader } from '../api/config';
import socket from '../api/socket';

const useAuthStore = create((set, get) => ({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    isLoading: true,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Erreur de connexion');

            localStorage.setItem('token', data.token);
            set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });

            // Connect socket
            socket.connect();
            socket.emit('join_user', data.user.id);

            return true;
        } catch (err) {
            set({ error: err.message, isLoading: false });
            return false;
        }
    },

    register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Erreur d\'inscription');

            localStorage.setItem('token', data.token);
            set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });

            // Connect socket
            socket.connect();
            socket.emit('join_user', data.user.id);

            return true;
        } catch (err) {
            set({ error: err.message, isLoading: false });
            return false;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        socket.disconnect();
        set({ user: null, token: null, isAuthenticated: false });
    },

    checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            set({ isLoading: false });
            return;
        }

        try {
            const res = await fetch(`${API_URL}/user/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const user = await res.json();
                set({ user, isAuthenticated: true, isLoading: false });
                socket.connect();
                socket.emit('join_user', user.id);
            } else {
                // Invalid token
                get().logout();
                set({ isLoading: false });
            }
        } catch (err) {
            set({ isLoading: false });
        }
    },

    toggleFavorite: async (type, id) => {
        // Optimistic update
        const user = get().user;
        if (!user) return;

        const oldFavorites = { ...user.favoris };
        const newFavorites = { ...user.favoris };
        if (!newFavorites[type]) newFavorites[type] = [];

        const index = newFavorites[type].indexOf(id);
        if (index === -1) newFavorites[type].push(id);
        else newFavorites[type].splice(index, 1);

        set({ user: { ...user, favoris: newFavorites } });

        try {
            const res = await fetch(`${API_URL}/user/favorites`, {
                method: 'POST',
                headers: { ...authHeader(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, id })
            });

            if (res.ok) {
                const updatedFavorites = await res.json();
                set({ user: { ...get().user, favoris: updatedFavorites } });
            } else {
                // Revert
                set({ user: { ...get().user, favoris: oldFavorites } });
            }
        } catch (e) {
            console.error(e);
            set({ user: { ...get().user, favoris: oldFavorites } });
        }
    }
}));

export default useAuthStore;
