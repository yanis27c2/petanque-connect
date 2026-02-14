import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import useChatStore from '../store/useChatStore';
import socket from '../api/socket';
import useAuthStore from '../store/useAuthStore';

const Messages = () => {
    const { user } = useAuthStore();
    const {
        conversations,
        activeConversationId,
        messages,
        fetchConversations,
        fetchMessages,
        setActiveConversation,
        sendMessage,
        onReceiveMessage
    } = useChatStore();

    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchConversations();

        const handleMessage = (msg) => {
            onReceiveMessage(msg);
        };

        socket.on('receive_message', handleMessage);
        return () => socket.off('receive_message', handleMessage);
    }, []);

    useEffect(() => {
        if (activeConversationId) {
            socket.emit('join_conversation', activeConversationId);
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [activeConversationId, messages[activeConversationId]]);

    const handleSend = async () => {
        if (!inputText.trim()) return;
        await sendMessage(inputText);
        setInputText('');
    };

    const activeConvo = conversations.find(c => c.id === activeConversationId);
    const currentMessages = activeConversationId ? (messages[activeConversationId] || []) : [];

    // --- Conversation View ---
    if (activeConversationId && activeConvo) {
        return (
            <div className="animate-fade-in -mx-4 flex flex-col h-[calc(100vh-80px)]">
                {/* Header */}
                <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-gray-100 px-4 py-3 flex items-center gap-3">
                    <button onClick={() => setActiveConversation(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-all active:scale-90">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {activeConvo.avatar || activeConvo.name?.charAt(0)}
                    </div>
                    <span className="font-bold text-gray-900">{activeConvo.name}</span>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
                    {currentMessages.length > 0 ? (
                        currentMessages.map((msg, i) => {
                            const isMe = msg.from === user.id;
                            return (
                                <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${isMe
                                        ? 'bg-brand-600 text-white rounded-br-md'
                                        : 'bg-white border border-gray-100 text-gray-800 rounded-bl-md shadow-card'
                                        }`}>
                                        <p>{msg.text}</p>
                                        <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                                            {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center text-gray-400 mt-10">Commencez la discussion !</div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="bg-white/95 backdrop-blur-lg border-t border-gray-100 px-4 py-3">
                    <div className="flex gap-2 max-w-md mx-auto">
                        <input
                            type="text"
                            placeholder="Votre message..."
                            className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            className="p-3 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-xl shadow-button active:scale-90 transition-all"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- List View ---
    return (
        <div className="animate-fade-in pb-20">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Messages</h1>
            <p className="text-sm text-gray-500 mb-6">
                {conversations.length} conversation{conversations.length > 1 ? 's' : ''}
            </p>

            <div className="space-y-2">
                {conversations.length > 0 ? (
                    conversations.map(conv => (
                        <button
                            key={conv.id}
                            onClick={() => setActiveConversation(conv.id)}
                            className="w-full bg-white p-4 rounded-xl border border-gray-100 shadow-card flex items-center gap-4 text-left active:scale-[0.98] transition-all hover:shadow-card-hover"
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0 bg-gradient-to-br from-brand-500 to-brand-600 text-white`}>
                                {conv.avatar || conv.name?.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <h3 className={`text-sm font-bold text-gray-900`}>
                                        {conv.name}
                                    </h3>
                                    <span className="text-[11px] text-gray-400 shrink-0 ml-2">
                                        {new Date(conv.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className={`text-sm truncate text-gray-500`}>
                                    {conv.lastMessage || 'Nouvelle conversation'}
                                </p>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl">
                        <p className="text-gray-500">Aucune conversation</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
