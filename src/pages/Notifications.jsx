import React, { useEffect } from 'react';
import { ArrowLeft, UserPlus, Check, X, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useNotificationStore from '../store/useNotificationStore';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const Notifications = () => {
    const navigate = useNavigate();
    const { notifications, fetchNotifications, acceptFriendRequest, markAsRead, loading } = useNotificationStore();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleAccept = async (e, notifId) => {
        e.stopPropagation();
        await acceptFriendRequest(notifId);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 animate-fade-in">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 bg-gray-900 z-50 px-4 h-16 flex items-center gap-4 shadow-lg">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-lg font-black text-white uppercase tracking-tight">Notifications</h1>
                <div className="ml-auto flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Live</span>
                </div>
            </header>

            <div className="pt-20 px-4 max-w-md mx-auto space-y-3">
                {loading && notifications.length === 0 && (
                    <div className="text-center py-10 text-gray-400">Chargement...</div>
                )}

                {!loading && notifications.length === 0 && (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <Bell size={24} />
                        </div>
                        <p className="text-gray-500 font-medium">Aucune notification</p>
                    </div>
                )}

                {notifications.map((notif) => (
                    <div
                        key={notif.id}
                        className={`bg-white p-4 rounded-xl border shadow-sm transition-all ${notif.read ? 'border-gray-100 opacity-60' : 'border-brand-100 bg-brand-50/10'}`}
                        onClick={() => markAsRead(notif.id)}
                    >
                        <div className="flex gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'friend_request' ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-500'
                                }`}>
                                {notif.type === 'friend_request' ? <UserPlus size={18} /> : <Bell size={18} />}
                            </div>

                            <div className="flex-1">
                                <p className="text-sm text-gray-900 leading-snug">
                                    {notif.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: fr })}
                                </p>

                                {/* Actions for Friend Request */}
                                {notif.type === 'friend_request' && !notif.handled && (
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={(e) => handleAccept(e, notif.id)}
                                            className="flex-1 py-2 bg-brand-500 text-white text-xs font-black rounded-xl hover:bg-brand-600 transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                                        >
                                            <Check size={14} strokeWidth={3} /> ACCEPTER
                                        </button>
                                        <button className="flex-1 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1">
                                            <X size={14} /> Refuser
                                        </button>
                                    </div>
                                )}
                            </div>

                            {!notif.read && (
                                <div className="w-2 h-2 bg-brand-500 rounded-full mt-1.5" />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Notifications;
