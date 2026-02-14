import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import useSocialStore from '../../store/useSocialStore';
import { api } from '../../api/config';
import { CALENDAR_CONTESTS } from '../../data/calendarContests';
import { isPast, parseISO, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Search, UserPlus, Check, Loader2, MapPin, Edit, LogOut, TrendingUp, Award, Calendar } from 'lucide-react';

const Profile = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const { teams, fetchTeams } = useSocialStore();

    // Search state
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState([]);
    const [isSearching, setIsSearching] = React.useState(false);
    const [requestSent, setRequestSent] = React.useState({}); // userId -> sent_status

    useEffect(() => {
        fetchTeams();
    }, []);

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const res = await api.get(`/user/search?q=${query}`);
            if (res.ok) {
                const data = await res.json();
                // Filter out current user and existing friends
                const filtered = data.filter(u => u.id !== user.id && !user.amis?.includes(u.id));
                setSearchResults(filtered);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddFriend = async (targetId) => {
        try {
            const res = await api.post('/user/friends', { targetId });
            if (res.ok) {
                setRequestSent(prev => ({ ...prev, [targetId]: true }));
            }
        } catch (error) {
            console.error('Add friend error:', error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    // History Logic
    const myHistory = teams
        .filter(team => team.members?.includes(user.id))
        .map(team => {
            const contest = CALENDAR_CONTESTS.find(c => c.id === parseInt(team.contestId) || c.id === team.contestId);
            return { team, contest };
        })
        .filter(item => item.contest && isPast(new Date(item.contest.date)))
        .sort((a, b) => new Date(b.contest.date) - new Date(a.contest.date));

    return (
        <div className="pb-20 animate-fade-in">
            {/* Header / Hero */}
            <div className="bg-white pb-6 rounded-b-[32px] shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-brand-600 to-brand-500" />

                <div className="relative px-5 pt-16 flex flex-col items-center">
                    <div className="w-24 h-24 bg-white p-1 rounded-full shadow-lg mb-3">
                        <div
                            className="w-full h-full rounded-full flex items-center justify-center text-4xl font-black text-white overflow-hidden shadow-inner"
                            style={{ backgroundColor: user?.avatarColor || '#3b82f6' }}
                        >
                            {user?.prenom?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </div>
                    </div>

                    <h1 className="text-2xl font-black text-gray-900 mb-1">
                        {user.prenom} {user.nom}
                    </h1>
                    <p className="text-brand-600 font-bold text-sm mb-3">@{user.pseudo}</p>

                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-4">
                        <span className="flex items-center gap-1">
                            <MapPin size={14} /> {user.departement ? `Dept ${user.departement}` : 'Non renseigné'}
                        </span>
                        <span>•</span>
                        <span className="text-gray-900 font-bold">{user.stats?.victoires || user.wins || 0} victoires</span>
                        <span>•</span>
                        <span className="text-gray-900 font-bold">{user.amis?.length || 0} amis</span>
                    </div>

                    <div className="flex gap-3 w-full max-w-xs">
                        <Link to="/settings" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-50 text-gray-700 rounded-xl text-sm font-bold border border-gray-100 hover:bg-gray-100 transition-colors">
                            <Edit size={16} />
                            Éditer
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-danger-50 text-danger-600 rounded-xl text-sm font-bold hover:bg-danger-100 transition-colors"
                        >
                            <LogOut size={16} />
                            Déconnexion
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="px-5 mt-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp size={18} className="text-brand-500" />
                    Statistiques
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Victoires</p>
                        <p className="text-2xl font-black text-brand-600">{user.stats?.wins || user.wins || 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Matchs</p>
                        <p className="text-2xl font-black text-gray-900">{user.stats?.matches || user.matches || 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Réussite</p>
                        <p className="text-2xl font-black text-success-600">
                            {user.stats?.winRate ? `${user.stats.winRate}%` :
                                (user.matches > 0 ? `${Math.round((user.wins / user.matches) * 100)}%` : '0%')}
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Rôle</p>
                        <p className="text-lg font-bold text-gray-900 truncate">{user.role}</p>
                    </div>
                </div>
            </div>

            {/* Find Friends Search */}
            <div className="px-5 mt-8">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <UserPlus size={18} className="text-indigo-500" />
                    Trouver des amis
                </h3>

                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher par pseudo ou ville..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm"
                    />
                    {isSearching && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="animate-spin text-brand-500" size={18} />
                        </div>
                    )}
                </div>

                {searchResults.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden mb-4">
                        {searchResults.map(result => (
                            <div key={result.id} className="flex items-center justify-between p-3">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                        style={{ backgroundColor: result.avatarColor || '#3b82f6' }}
                                    >
                                        {result.prenom?.[0] || result.pseudo?.[0] || result.email?.[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">@{result.pseudo}</p>
                                        <p className="text-[10px] text-gray-500">{result.prenom} {result.nom?.charAt(0)}.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleAddFriend(result.id)}
                                    disabled={requestSent[result.id]}
                                    className={`p-2 rounded-xl transition-all ${requestSent[result.id]
                                        ? 'bg-success-50 text-success-600 cursor-default'
                                        : 'bg-brand-50 text-brand-600 hover:bg-brand-100'
                                        }`}
                                >
                                    {requestSent[result.id] ? <Check size={18} /> : <UserPlus size={18} />}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* History */}
            <div className="px-5 mt-8 pb-10">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Award size={18} className="text-yellow-500" />
                    Historique des concours
                </h3>
                <div className="space-y-3">
                    {myHistory.length > 0 ? (
                        myHistory.map(({ team, contest }) => (
                            <Link to={`/contest/${contest.id}`} key={team.id} className="block bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                <div>
                                    <p className="font-bold text-gray-900 text-sm line-clamp-1">{contest.club}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                        <span className="flex items-center gap-1"><Calendar size={12} /> {format(new Date(contest.date), 'd MMM yyyy', { locale: fr })}</span>
                                        <span>•</span>
                                        <span>{contest.format}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold text-gray-500 mb-1">Équipe</div>
                                    <div className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg truncate max-w-[100px]">
                                        {team.name}
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500 text-sm">
                            Pas encore de participation passée.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
