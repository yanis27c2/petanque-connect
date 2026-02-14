import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, Trophy, Info, Share2, UserPlus, Check, Clock, Shield, AlertCircle, Plus, Loader } from 'lucide-react';
import FavoriteButton from '../components/common/FavoriteButton';
import { CALENDAR_CONTESTS } from '../data/calendarContests';
import useAuthStore from '../store/useAuthStore';
import useTeamStore from '../store/useTeamStore';
import TeamCard from '../components/teams/TeamCard';
import TeamManagementPanel from '../components/teams/TeamManagementPanel';
import TeamCreationModal from '../components/teams/TeamCreationModal';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// --- District colors ---
const districtColors = {
    'Centre': 'from-brand-600 to-brand-500',
    'Nord': 'from-success-600 to-success-500',
    'Sud': 'from-accent-600 to-accent-500',
    'Est': 'from-purple-600 to-purple-500',
    'Ouest': 'from-sky-600 to-sky-500',
};

// --- Compute maxMembers from contest type ---
function getMaxMembers(contest) {
    if (!contest) return 3;
    const tn = (contest.typeName || '').toLowerCase();
    // Tête-à-tête = 1 joueur (solo)
    if (tn.includes('tête') || tn.includes('tete') || ['TT', 'TTF'].includes(contest.type)) return 1;
    // Doublette = 2 joueurs
    if (tn.includes('doublette') || ['D', 'DM', 'DF', 'DJP', 'D+1R'].includes(contest.type)) return 2;
    // Triplette = 3 joueurs (default)
    return 3;
}

const ContestDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const {
        teams, myTeam, isLoading, error,
        fetchTeams, createTeam, sendJoinRequest, cancelJoinRequest,
        subscribeToContest, clear
    } = useTeamStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('infos');

    const contest = CALENDAR_CONTESTS.find(c => c.id === parseInt(id) || c.id === id);
    const maxMembers = getMaxMembers(contest);

    // Fetch teams and subscribe to socket events for this contest
    useEffect(() => {
        if (!contest || !user) return;
        const contestId = String(contest.id);
        fetchTeams(contestId);
        const unsub = subscribeToContest(contestId);
        return () => {
            unsub();
            clear();
        };
    }, [contest?.id, user?.id]);

    // Auto-switch to "mon équipe" tab if user has a team
    useEffect(() => {
        if (myTeam && activeTab === 'infos') {
            setActiveTab('mon équipe');
        }
    }, [myTeam]);

    if (!contest) {
        return (
            <div className="text-center py-20 animate-fade-in">
                <div className="text-4xl mb-3">😕</div>
                <p className="font-bold text-gray-900">Concours introuvable</p>
                <button onClick={() => navigate('/')} className="mt-4 text-brand-600 font-bold text-sm">Retour à l'accueil</button>
            </div>
        );
    }

    const gradient = districtColors[contest.district] || 'from-brand-600 to-brand-500';
    const contestId = String(contest.id);

    // Categorize teams
    const pendingTeams = teams.filter(t => t.status === 'pending' || t.status === 'modified');
    const completeTeams = teams.filter(t => t.status === 'complete');
    const validatedTeams = teams.filter(t => t.status === 'validated');
    const otherTeams = teams.filter(t => t.id !== myTeam?.id);

    const tabs = ['infos', 'équipes', 'mon équipe'];

    const handleJoinRequest = async (teamId) => {
        await sendJoinRequest(teamId);
    };

    const handleCancelRequest = async (teamId) => {
        await cancelJoinRequest(teamId);
    };

    const handleCreateTeam = async (data) => {
        const result = await createTeam({
            name: data.name,
            contestId,
            isPublic: data.isPublic,
            maxMembers: data.maxMembers || maxMembers
        });
        if (result) {
            setIsModalOpen(false);
            setActiveTab('mon équipe');
        }
    };

    return (
        <div className="animate-fade-in -mx-4">
            {/* Sticky header */}
            <div className="sticky top-16 z-30 bg-white/90 backdrop-blur-lg border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition-all active:scale-90">
                        <ArrowLeft size={20} />
                    </button>
                    <span className="font-bold text-gray-900 text-sm line-clamp-1">{contest.club}</span>
                </div>
                <div className="flex items-center gap-2">
                    <FavoriteButton type="concours" id={contest.id} />
                    <button className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-all">
                        <Share2 size={18} />
                    </button>
                </div>
            </div>

            {/* Hero card */}
            <div className="mx-4 mt-4 mb-6">
                <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 text-white shadow-xl relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-16 -mt-16" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-10 -mb-10" />

                    <div className="relative z-10">
                        <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-lg backdrop-blur-sm">
                            {contest.typeName}
                        </span>
                        <h1 className="text-2xl font-extrabold mt-3 mb-4 leading-tight">{contest.club}</h1>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-white/90">
                                <Calendar size={15} />
                                <span className="capitalize">{format(new Date(contest.date), 'EEE d MMM yyyy', { locale: fr })}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/90">
                                <MapPin size={15} />
                                <span className="line-clamp-1">District {contest.district}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/90">
                                <Trophy size={15} />
                                <span>{contest.dotation || 'Non précisé'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/90">
                                <Shield size={15} />
                                <span>{contest.format}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="mx-4 flex bg-gray-100 rounded-xl p-1 mb-6">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2.5 text-xs font-bold capitalize rounded-lg transition-all relative ${activeTab === tab
                            ? 'bg-white text-brand-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab}
                        {tab === 'mon équipe' && myTeam && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-success-500 rounded-full border-2 border-gray-100" />
                        )}
                        {tab === 'équipes' && teams.length > 0 && (
                            <span className="ml-1 text-[10px] font-bold bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full">
                                {teams.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Error banner */}
            {error && (
                <div className="mx-4 mb-4 bg-danger-50 text-danger-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {/* Tab content */}
            <div className="mx-4 min-h-[200px] mb-28">
                {/* ═══════════ INFOS TAB ═══════════ */}
                {activeTab === 'infos' && (
                    <div className="space-y-5 animate-fade-in">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-card">
                                <p className="text-xs text-gray-500 mb-1">Format</p>
                                <p className="font-bold text-gray-900 text-sm">{contest.format}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-card">
                                <p className="text-xs text-gray-500 mb-1">Type</p>
                                <p className="font-bold text-gray-900 text-sm">{contest.typeName}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-card">
                                <p className="text-xs text-gray-500 mb-1">Dotation</p>
                                <p className="font-bold text-gray-900 text-sm">{contest.dotation || '—'}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-card">
                                <p className="text-xs text-gray-500 mb-1">Joueurs / équipe</p>
                                <p className="font-bold text-gray-900 text-sm">{maxMembers}</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-brand-600 shadow-sm border border-gray-100 font-bold text-sm">
                                    {contest.club.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">{contest.club}</p>
                                    <p className="text-xs text-gray-500">Club organisateur • District {contest.district}</p>
                                </div>
                            </div>
                        </div>

                        {/* Teams summary stats */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-card">
                            <h3 className="font-bold text-gray-900 text-sm mb-3">Équipes inscrites</h3>
                            {isLoading ? (
                                <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
                                    <Loader size={16} className="animate-spin" /> Chargement...
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl font-extrabold text-brand-600">{teams.length}</div>
                                    <div>
                                        <p className="text-sm text-gray-900 font-medium">
                                            {pendingTeams.length} en constitution
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {validatedTeams.length} validée{validatedTeams.length > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══════════ ÉQUIPES TAB ═══════════ */}
                {activeTab === 'équipes' && (
                    <div className="space-y-3 animate-fade-in">
                        {isLoading ? (
                            <div className="text-center py-12 text-gray-400">
                                <Loader size={32} className="animate-spin mx-auto mb-3" />
                                <p className="text-sm font-medium">Chargement des équipes...</p>
                            </div>
                        ) : (
                            <>
                                {/* Pending/Modified teams */}
                                {pendingTeams.length > 0 && (
                                    <div className="mb-2">
                                        <div className="flex items-center gap-2 mb-3">
                                            <AlertCircle size={16} className="text-amber-500" />
                                            <p className="text-sm font-bold text-gray-900">Cherchent des joueurs</p>
                                        </div>
                                        <div className="space-y-3">
                                            {pendingTeams.map(team => (
                                                <TeamCard
                                                    key={team.id}
                                                    team={team}
                                                    userId={user?.id}
                                                    onJoinRequest={handleJoinRequest}
                                                    onCancelRequest={handleCancelRequest}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Complete teams waiting for validation */}
                                {completeTeams.length > 0 && (
                                    <div className="mb-2">
                                        <p className="text-sm font-bold text-gray-900 mb-3">En attente de validation</p>
                                        <div className="space-y-3">
                                            {completeTeams.map(team => (
                                                <TeamCard
                                                    key={team.id}
                                                    team={team}
                                                    userId={user?.id}
                                                    onJoinRequest={handleJoinRequest}
                                                    onCancelRequest={handleCancelRequest}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Validated teams */}
                                {validatedTeams.length > 0 && (
                                    <div className="mb-2">
                                        <p className="text-sm font-bold text-gray-900 mb-3">Équipes validées</p>
                                        <div className="space-y-3">
                                            {validatedTeams.map(team => (
                                                <TeamCard
                                                    key={team.id}
                                                    team={team}
                                                    userId={user?.id}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Empty state */}
                                {teams.length === 0 && (
                                    <div className="text-center py-12 text-gray-500 animate-fade-in">
                                        <Users size={40} className="mx-auto text-gray-300 mb-3" />
                                        <p className="font-medium">Aucune équipe pour le moment</p>
                                        <p className="text-xs text-gray-400 mt-1">Soyez le premier à créer la vôtre !</p>
                                        {!myTeam && (
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="mt-4 bg-brand-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-button active:scale-[0.98] transition-all"
                                            >
                                                Créer une équipe
                                            </button>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* ═══════════ MON ÉQUIPE TAB ═══════════ */}
                {activeTab === 'mon équipe' && (
                    <div className="animate-fade-in">
                        {myTeam ? (
                            <TeamManagementPanel team={myTeam} userId={user?.id} />
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Users size={28} className="text-brand-400" />
                                </div>
                                <p className="font-medium text-gray-900">Pas encore inscrit</p>
                                <p className="text-xs text-gray-400 mt-1 mb-5">Créez votre équipe ou rejoignez-en une existante</p>
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={() => setActiveTab('équipes')}
                                        className="bg-white border-2 border-brand-200 text-brand-700 px-5 py-3 rounded-xl font-bold text-sm active:scale-[0.98] transition-all hover:bg-brand-50"
                                    >
                                        Voir les équipes
                                    </button>
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="bg-brand-600 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-button active:scale-[0.98] transition-all"
                                    >
                                        Créer une équipe
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom sticky CTA */}
            {!myTeam && (
                <div className="fixed bottom-[72px] left-0 right-0 p-4 bg-white/95 backdrop-blur-lg border-t border-gray-100 z-40">
                    <div className="max-w-md mx-auto flex gap-3">
                        <button
                            onClick={() => setActiveTab('équipes')}
                            className="flex-1 bg-white border-2 border-brand-200 text-brand-700 py-3.5 rounded-xl font-bold text-sm active:scale-[0.98] transition-all hover:bg-brand-50 flex items-center justify-center gap-1.5"
                        >
                            <UserPlus size={16} />
                            Rejoindre
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex-[2] bg-gradient-to-r from-brand-600 to-brand-500 text-white py-3.5 rounded-xl font-bold text-sm shadow-button active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            <Plus size={16} />
                            Créer mon équipe
                        </button>
                    </div>
                </div>
            )}

            <TeamCreationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                contestType={contest.typeName}
                maxMembers={maxMembers}
                onConfirm={handleCreateTeam}
            />
        </div>
    );
};

export default ContestDetail;
