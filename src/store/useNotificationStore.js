import { create } from 'zustand';
import { api } from '../api/config';

const useNotificationStore = create((set, get) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,

    fetchNotifications: async () => {
        set({ loading: true });
        try {
            const res = await api.get('/notifications');
            if (res.ok) {
                const data = await res.json();
                set({
                    notifications: data,
                    unreadCount: data.filter(n => !n.read).length,
                    loading: false
                });
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            set({ loading: false });
        }
    },

    markAsRead: async (id) => {
        // Optimistic update
        set(state => {
            const updated = state.notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
            );
            return {
                notifications: updated,
                unreadCount: updated.filter(n => !n.read).length
            };
        });

        try {
            await api.put(`/notifications/${id}/read`);
        } catch (error) {
            console.error('Error marking as read', error);
        }
    },

    acceptFriendRequest: async (notificationId) => {
        try {
            const res = await api.post('/notifications/accept-friend', { notificationId });
            if (res.ok) {
                // Refresh notifications and social data
                await get().fetchNotifications();
                // We might want to refresh friends list in socialStore too
                return true;
            }
        } catch (error) {
            console.error('Error accepting friend', error);
        }
        return false;
    }
}));

export default useNotificationStore;
