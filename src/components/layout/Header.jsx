import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Bell, SlidersHorizontal } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore'; // Use auth store for current user
import useFilterStore from '../../store/useFilterStore';
import useNotificationStore from '../../store/useNotificationStore';
import socket from '../../api/socket';

const Header = () => {
    const location = useLocation();
    const { user } = useAuthStore();
    const { openFilters } = useFilterStore();
    const showFilters = ['/', '/concours'].includes(location.pathname);

    const { unreadCount, fetchNotifications } = useNotificationStore();

    // Poll notifications on mount + Socket listener
    React.useEffect(() => {
        fetchNotifications();

        const handleNewNotif = () => {
            fetchNotifications();
        };

        socket.on('new_notification', handleNewNotif);
        const interval = setInterval(fetchNotifications, 120000); // 2min fallback polling

        return () => {
            socket.off('new_notification', handleNewNotif);
            clearInterval(interval);
        };
    }, []);

    return (
        <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-b border-gray-100 h-16 z-50">
            <div className="flex items-center justify-between h-full px-4 max-w-md mx-auto">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-button">
                        PC
                    </div>
                    <span className="font-extrabold text-lg tracking-tight">
                        <span className="text-gray-900">Pétanque</span>
                        <span className="text-brand-600">Connect</span>
                    </span>
                </Link>

                {/* Right actions */}
                <div className="flex items-center gap-2">
                    {showFilters && (
                        <button
                            onClick={openFilters}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-brand-50 rounded-xl transition-all border border-transparent hover:border-brand-200 group"
                        >
                            <div className="p-1 bg-white text-gray-500 group-hover:text-brand-600 rounded-lg shadow-sm">
                                <SlidersHorizontal size={16} />
                            </div>
                            <div className="text-left hidden sm:block">
                                <span className="block text-[10px] font-bold text-gray-400 uppercase leading-none mb-0.5">Filtres</span>
                                <span className="block text-xs font-bold text-gray-900 leading-none truncate max-w-[80px]">
                                    {/* Summary Logic */}
                                    {(() => {
                                        const { discipline, departements } = useFilterStore.getState();
                                        const activeDepts = Object.entries(departements).filter(([_, v]) => v).map(([k]) => k).join(', ');
                                        const discLabel = discipline === 'all' ? 'Tous' : (discipline === 'petanque' ? 'Pétanque' : 'Provencal');
                                        return `${discLabel} • ${activeDepts || 'Aucun'}`;
                                    })()}
                                </span>
                            </div>
                        </button>
                    )}

                    <Link to="/notifications" className="relative p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-all">
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-danger-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center px-1 animate-in zoom-in duration-300">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </Link>
                    <Link
                        to="/profile"
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 overflow-hidden border-2 border-white ring-1 ring-gray-100"
                        style={{ backgroundColor: user?.avatarColor || '#3b82f6' }}
                    >
                        {user?.prenom?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;
