import React, { useState, useEffect } from 'react';
import { Search, UserPlus, MapPin, Loader2, MessageCircle } from 'lucide-react';
import useSocialStore from '../store/useSocialStore';
import useAuthStore from '../store/useAuthStore';
import useChatStore from '../store/useChatStore';
import { useNavigate } from 'react-router-dom';

const levelColors = {
    'Expert': 'bg-yellow-50 text-yellow-700',
    'Intermédiaire': 'bg-brand-50 text-brand-700',
    'Débutant': 'bg-gray-100 text-gray-600',
};

const Players = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { searchUsers, searchResults, suggestions, fetchSuggestions, isLoading, addFriend } = useSocialStore();
    const { startConversation, setActiveConversation } = useChatStore();
    const [search, setSearch] = useState('');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search.trim()) {
                searchUsers(search);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Initial fetch
    useEffect(() => {
        fetchSuggestions();
    }, []);

    const displayUsers = search.trim() ? searchResults.filter(u => u.id !== user?.id) : suggestions;
    const isSearching = !!search.trim();



    return (
        <div className="animate-fade-in pb-20">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Joueurs</h1>
            <p className="text-sm text-gray-500 mb-5">
                Trouvez des partenaires pour vos concours
            </p>

            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Rechercher par nom, ville..."
                    className="w-full pl-11 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-card transition-all text-sm"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {isLoading && (
                <div className="flex justify-center my-4">
                    <Loader2 className="animate-spin text-brand-500" />
                </div>
            )}

            {!isSearching && suggestions.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                    <div className="p-1 bg-yellow-50 text-yellow-600 rounded-lg">
                        <UserPlus size={16} />
                    </div>
                    <h2 className="font-bold text-gray-900 text-sm">Suggestions pour vous</h2>
                </div>
            )}

            <div className="space-y-3">
                {displayUsers.length > 0 ? (
                    displayUsers.map(player => (
                        <div key={player.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-card flex items-center gap-4 animate-fade-in">
                            {/* Avatar */}
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-base shrink-0 text-white shadow-inner"
                                style={{ backgroundColor: player.avatarColor || '#9ca3af' }}
                            >
                                {player.prenom?.charAt(0) || player.name?.charAt(0) || '?'}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <h3 className="font-bold text-gray-900 text-sm">{player.prenom} {player.nom} <span className="text-gray-400 font-normal text-xs">@{player.pseudo}</span></h3>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <div className="flex items-center gap-0.5">
                                        <MapPin size={10} />
                                        <span>{player.departement ? `Dept ${player.departement}` : 'Non renseigné'}</span>
                                    </div>
                                    {!isSearching && player.departement === user?.departement && (
                                        <span className="text-[10px] font-bold text-success-600 bg-success-50 px-1.5 py-0.5 rounded-md">Voisin</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
                                        {player.stats?.victoires || 0} Victoires
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={async () => {
                                        const msg = await addFriend(player.id);
                                        alert(msg);
                                    }}
                                    className="p-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-brand-50 hover:text-brand-600 active:scale-90 transition-all"
                                    title="Ajouter en ami"
                                >
                                    <UserPlus size={18} />
                                </button>
                                <button
                                    onClick={async () => {
                                        const convId = await startConversation(player.id);
                                        if (convId) {
                                            setActiveConversation(convId);
                                            navigate('/messages');
                                        }
                                    }}
                                    className="p-2.5 bg-brand-50 text-brand-600 rounded-xl hover:bg-brand-100 active:scale-90 transition-all"
                                    title="Envoyer un message"
                                >
                                    <MessageCircle size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    !isLoading && (
                        <div className="text-center py-10">
                            <p className="text-gray-400 text-sm">{isSearching ? 'Aucun joueur trouvé' : 'Aucune suggestion pour le moment'}</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default Players;
