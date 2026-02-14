import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Bell, Shield, HelpCircle, LogOut, ChevronRight, Moon, Globe } from 'lucide-react';

const SettingItem = ({ icon: Icon, label, desc, to, danger }) => {
    const Wrapper = to ? Link : 'button';
    return (
        <Wrapper
            to={to}
            className={`w-full bg-white p-4 rounded-xl border border-gray-100 shadow-card flex items-center justify-between text-left transition-all hover:bg-gray-50 active:scale-[0.98] ${danger ? 'text-danger-600' : 'text-gray-700'}`}
        >
            <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${danger ? 'bg-danger-50' : 'bg-brand-50'}`}>
                    <Icon size={18} className={danger ? 'text-danger-500' : 'text-brand-500'} />
                </div>
                <div>
                    <p className="font-medium text-sm">{label}</p>
                    {desc && <p className="text-[11px] text-gray-400">{desc}</p>}
                </div>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
        </Wrapper>
    );
};

const Settings = () => {
    const navigate = useNavigate();

    return (
        <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition-all active:scale-90">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-extrabold text-gray-900">Paramètres</h1>
            </div>

            <div className="space-y-2 mb-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-2">Compte</p>
                <SettingItem icon={User} label="Informations personnelles" desc="Nom, email, ville" />
                <SettingItem icon={Bell} label="Notifications" desc="Push, email, alertes" />
                <SettingItem icon={Shield} label="Confidentialité" desc="Visibilité du profil" />
            </div>

            <div className="space-y-2 mb-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-2">Préférences</p>
                <SettingItem icon={Moon} label="Mode sombre" desc="Bientôt disponible" />
                <SettingItem icon={Globe} label="Langue" desc="Français" />
            </div>

            <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-2">Support</p>
                <SettingItem icon={HelpCircle} label="Centre d'aide" desc="FAQ, contact" />
                <SettingItem icon={LogOut} label="Déconnexion" danger />
            </div>

            <p className="text-center text-xs text-gray-300 mt-8">Pétanque Connect v3.0 • Made with ❤️ in Marseille</p>
        </div>
    );
};

export default Settings;
