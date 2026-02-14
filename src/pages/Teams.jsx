import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Users, ChevronRight, UserPlus, Loader2, Clock, Check, AlertCircle } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { api } from '../api/config';
import { CALENDAR_CONTESTS } from '../data/calendarContests';

const STATUS_CONFIG = {
    pending: { label: 'En cours', color: 'bg-amber-50 text-amber-600', icon: Clock },
    complete: { label: 'Complète', color: 'bg-blue-50 text-blue-600', icon: Users },
    validated: { label: 'Validée', color: 'bg-success-50 text-success-600', icon: Check },
    modified: { label: 'Modifiée', color: 'bg-orange-50 text-orange-600', icon: AlertCircle },
};

const Teams = () => {
    const { user } = useAuthStore();
    const [teams, setTeams] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const load = async () => {
            setIsLoading(true);
            try {
                const res = await api.get('/teams');
                if (res.ok) {
                    const allTeams = await res.json();
                    // Filter to only user's teams
                    setTeams(allTeams.filter(t => (t.members || []).includes(user.id)));
                }
            } catch (e) {
                console.error('Error fetching teams:', e);
            }
            setIsLoading(false);
        };
        load();
    }, [user?.id]);

    // Find next contest
    const nextTeam = teams[0];
    const nextContest = nextTeam ? CALENDAR_CONTESTS.find(c => String(c.id) === String(nextTeam.contestId)) : null;

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-brand-600" /></div>;

    return (
        <div className="animate-fade-in pb-20">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Mes Équipes</h1>
            <p className="text-sm text-gray-500 mb-6">
                {teams.length} inscription{teams.length > 1 ? 's' : ''} active{teams.length > 1 ? 's' : ''}
            </p>

            {/* Quick stat - Next Contest */}
            {nextTeam && (
                <Link to={`/contest/${nextTeam.contestId}`} className="block bg-gradient-to-br from-brand-600 to-brand-500 rounded-2xl p-5 text-white mb-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -mr-10 -mt-10" />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <Trophy size={28} />
                        </div>
                        <div>
                            <p className="text-white/80 text-sm font-medium">Prochain concours</p>
                            <h3 className="font-extrabold text-lg line-clamp-1">{nextContest ? nextContest.club : 'Concours'}</h3>
                            <p className="text-white/70 text-xs mt-0.5">Équipe: {nextTeam.name}</p>
                        </div>
                    </div>
                </Link>
            )}

            {/* Teams list */}
            <div className="space-y-3">
                {teams.length > 0 ? (
                    teams.map(team => {
                        const contest = CALENDAR_CONTESTS.find(c => String(c.id) === String(team.contestId));
                        const status = STATUS_CONFIG[team.status] || STATUS_CONFIG.pending;
                        const StatusIcon = status.icon;
                        return (
                            <Link
                                key={team.id}
                                to={`/contest/${team.contestId}`}
                                className="block bg-white p-4 rounded-xl border border-gray-100 shadow-card hover:shadow-card-hover active:scale-[0.98] transition-all"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-gray-900">{team.name}</h3>
                                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${status.color}`}>
                                        <StatusIcon size={12} />
                                        {status.label}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mb-3 line-clamp-1">
                                    {contest ? `${contest.club} — ${contest.typeName}` : 'Concours'}
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {/* Member avatars */}
                                        <div className="flex -space-x-2">
                                            {(team.memberDetails || []).slice(0, 3).map(m => (
                                                <div
                                                    key={m.id}
                                                    className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-[10px] border-2 border-white"
                                                    style={{ backgroundColor: m.avatarColor || '#9ca3af' }}
                                                >
                                                    {(m.prenom || m.pseudo || '?').charAt(0).toUpperCase()}
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-500 font-medium">{(team.members || []).length}/{team.maxMembers || 3}</span>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-400" />
                                </div>
                            </Link>
                        );
                    })
                ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <Users size={36} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">Aucune équipe</p>
                        <p className="text-xs text-gray-400 mt-1">Inscrivez-vous à un concours pour créer une équipe</p>
                    </div>
                )}
            </div>

            {/* Add team CTA */}
            <Link
                to="/concours"
                className="mt-6 w-full py-4 border-2 border-dashed border-brand-200 rounded-xl text-brand-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-brand-50 hover:border-brand-300 transition-all"
            >
                <UserPlus size={18} />
                S'inscrire à un concours
            </Link>
        </div>
    );
};

export default Teams;
