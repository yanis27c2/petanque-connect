import React, { useState } from 'react';
import { X, Users, Check, Eye, EyeOff } from 'lucide-react';

const TeamCreationModal = ({ isOpen, onClose, contestType, maxMembers, onConfirm }) => {
    const [teamName, setTeamName] = useState('');
    const [isPublic, setIsPublic] = useState(true);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!teamName.trim()) return;
        onConfirm({ name: teamName.trim(), isPublic, maxMembers: maxMembers || 3 });
        setTeamName('');
        setIsPublic(true);
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

            {/* Sheet */}
            <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 pt-4 shadow-2xl animate-slide-up z-10">
                {/* Drag handle */}
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 sm:hidden" />

                <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-full transition-all">
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white shadow-button">
                        <Users size={22} />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold text-gray-900">Créer une équipe</h2>
                        <p className="text-sm text-gray-500">{contestType} • {maxMembers || 3} joueurs</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Team name */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Nom de l'équipe</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all font-medium placeholder:text-gray-400"
                            placeholder="Ex: Les Tireurs du Dimanche"
                            value={teamName}
                            onChange={e => setTeamName(e.target.value)}
                        />
                    </div>

                    {/* Format info */}
                    <div className="bg-brand-50 p-3 rounded-xl">
                        <p className="text-sm text-brand-700 font-medium">
                            📋 Format : <span className="font-bold">{contestType}</span> ({maxMembers || 3} joueurs par équipe)
                        </p>
                        <p className="text-xs text-brand-500 mt-1">
                            Vous serez automatiquement capitaine et premier membre.
                        </p>
                    </div>

                    {/* Visibility */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-3">Visibilité</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setIsPublic(true)}
                                className={`py-3.5 rounded-xl border text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${isPublic
                                        ? 'bg-brand-600 border-brand-600 text-white shadow-button scale-[1.02]'
                                        : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                                    }`}
                            >
                                <Eye size={16} />
                                Publique
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsPublic(false)}
                                className={`py-3.5 rounded-xl border text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${!isPublic
                                        ? 'bg-gray-700 border-gray-700 text-white shadow-button scale-[1.02]'
                                        : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                                    }`}
                            >
                                <EyeOff size={16} />
                                Privée
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            {isPublic ? 'Tous les joueurs du concours pourront voir votre équipe' : 'Seuls les membres pourront voir l\'équipe'}
                        </p>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-brand-600 to-brand-500 text-white py-4 rounded-xl font-bold shadow-button active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-base"
                    >
                        <Check size={20} />
                        Créer l'équipe
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TeamCreationModal;
