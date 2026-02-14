import { create } from 'zustand';
import { api } from '../api/config';
import socket from '../api/socket';

const useChatStore = create((set, get) => ({
    conversations: [],
    activeConversationId: null,
    messages: {}, // { convId: [msgs] }
    isLoading: false,

    fetchConversations: async () => {
        try {
            const res = await api.get('/chat/conversations');
            if (res.ok) set({ conversations: await res.json() });
        } catch (e) { console.error(e); }
    },

    setActiveConversation: async (id) => {
        set({ activeConversationId: id });
        if (id && !get().messages[id]) {
            await get().fetchMessages(id);
        }
    },

    fetchMessages: async (id) => {
        try {
            const res = await api.get(`/chat/${id}/messages`);
            if (res.ok) {
                const msgs = await res.json();
                set(state => ({
                    messages: { ...state.messages, [id]: msgs }
                }));
            }
        } catch (e) { console.error(e); }
    },

    sendMessage: async (text) => {
        const { activeConversationId } = get();
        if (!activeConversationId) return;

        try {
            const res = await api.post('/chat/send', { conversationId: activeConversationId, text });
            if (res.ok) {
                const msg = await res.json();
                const msgs = get().messages[activeConversationId] || [];
                set(state => ({
                    messages: {
                        ...state.messages,
                        [activeConversationId]: [...msgs, msg]
                    }
                }));

                socket.emit('send_message', { ...msg, conversationId: activeConversationId, to: activeConversationId });
            }
        } catch (e) { console.error(e); }
    },

    startConversation: async (targetId) => {
        try {
            const res = await api.post('/chat/conversation', { targetId });
            if (res.ok) {
                const conv = await res.json();
                // Add to conversations if not exists
                const exists = get().conversations.find(c => c.id === conv.id);
                if (!exists) {
                    // We might need to fetch detailed info or just push what we have
                    // The controller returns raw conv object, but getConversations returns enriched object.
                    // For now, let's refresh conversations to get proper name/avatar
                    await get().fetchConversations();
                }
                return conv.id;
            }
        } catch (e) { console.error(e); }
        return null;
    },

    // Socket listener helper
    onReceiveMessage: (msg) => {
        const { conversationId } = msg;
        set(state => {
            const msgs = state.messages[conversationId] || [];
            if (msgs.find(m => m.time === msg.time && m.text === msg.text)) return state;

            // Also update conversation list last message
            const convs = state.conversations.map(c => {
                if (c.id === conversationId) {
                    return { ...c, lastMessage: msg.text, time: msg.time };
                }
                return c;
            });
            // If conversation not in list (new incoming DM), we should fetch conversations
            // But we can't easily do it inside reducer without side effect.
            // Component should listen to 'new_conversation' or we trigger fetch if not found.

            return {
                conversations: convs,
                messages: {
                    ...state.messages,
                    [conversationId]: [...msgs, msg]
                }
            };
        });
    }
}));

export default useChatStore;
