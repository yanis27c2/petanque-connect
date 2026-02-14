import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Trophy, Users, Shield, MessageCircle, Camera, Newspaper } from 'lucide-react';

const navItems = [
    { to: '/', icon: Home, label: 'Accueil' },
    { to: '/joueurs', icon: Users, label: 'Joueurs' },
    { to: '/equipes', icon: Shield, label: 'Équipes' },
    { to: '/messages', icon: MessageCircle, label: 'Messages' },
    { to: '/resultats', icon: Camera, label: 'Résultats' },
    { to: '/communaute', icon: Newspaper, label: 'Actus' },
];

const BottomNav = () => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 z-50 shadow-nav pb-safe">
            <div className="flex h-[68px] max-w-md mx-auto items-center justify-around px-1">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center gap-0.5 min-w-[52px] py-1.5 rounded-xl transition-all duration-200 ${isActive
                                ? 'text-brand-600'
                                : 'text-gray-400 hover:text-gray-600 active:scale-90'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className={`p-1 rounded-lg transition-all ${isActive ? 'bg-brand-50' : ''}`}>
                                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                <span className={`text-[10px] leading-none ${isActive ? 'font-bold' : 'font-medium'}`}>
                                    {label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default BottomNav;
