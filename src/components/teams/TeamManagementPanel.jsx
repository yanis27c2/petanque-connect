import React, { useState } from 'react';
import { Check, X, UserMinus, Shield, Trash2, Edit3, Eye, EyeOff, CheckCircle2, Clock, LogOut, History } from 'lucide-react';
import useTeamStore from '../../store/useTeamStore';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const TeamManagementPanel = ({ team, userId }) => {
    const {
        acceptRequest, refuseRequest, kickMember, validateTeam,
        renameTeam, toggleVisibility, deleteTeam, leaveTeam
    } = useTeamStore();

    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState(team.name);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const isCaptain = team.captainId === userId;
    const members = team.memberDetails || [];
    const joinRequests = team.joinRequests || [];
    const slotsLeft = Math.max(0, (team.maxMembers || 3) - (team.members || []).length);

    const STATUS_LABELS = {
        pending: { label: 'En cours de constitution', color: 'text-amber-600 bg-amber-50', icon: Clock },
        complete: { label: 'Complète — En attente de validation', color: 'text-blue-600 bg-blue-50', icon: CheckCircle2 },
        validated: { label: 'Validée pour le concours ✅', color: 'text-success-600 bg-success-50', icon: Check },
        modified: { label: 'Modifiée — Re-validation nécessaire', color: 'text-orange-600 bg-orange-50', icon: Clock },
    };

    const statusInfo = STATUS_LABELS[team.status] || STATUS_LABELS.pending;

    const handleRename = async () => {
        if (newName.trim() && newName !== team.name) {
            await renameTeam(team.id, newName.trim());
        }
        setIsRenaming(false);
    };

    const handleDelete = async () => {
        await deleteTeam(team.id);
        setShowDeleteConfirm(false);
    };

    const handleLeave = async () => {
        await leaveTeam(team.id);
        setShowLeaveConfirm(false);
    };

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Status banner */}
            <div className={`${statusInfo.color} rounded-2xl p-4 flex items-center gap-3`}>
                <statusInfo.icon size={20} />
                <div>
                    <p className="font-bold text-sm">{statusInfo.label}</p>
                    <p className="text-[11px] opacity-70">{team.members?.length || 0}/{team.maxMembers || 3} joueurs</p>
                </div>
            </div>

            {/* Team name (editable for captain) */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-card">
                <div className="flex items-center justify-between mb-1">
                    {isRenaming ? (
                        <div className="flex items-center gap-2 flex-1">
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                            />
                            <button onClick={handleRename} className="p-1.5 bg-success-50 text-success-600 rounded-lg"><Check size={16} /></button>
                            <button onClick={() => setIsRenaming(false)} className="p-1.5 bg-gray-50 text-gray-400 rounded-lg"><X size={16} /></button>
                        </div>
                    ) : (
                        <>
                            <h3 className="text-lg font-extrabold text-gray-900">{team.name}</h3>
                            {isCaptain && (
                                <button onClick={() => { setNewName(team.name); setIsRenaming(true); }} className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 transition-all">
                                    <Edit3 size={14} />
                                </button>
                            )}
                        </>
                    )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                        {team.isPublic ? <Eye size={12} /> : <EyeOff size={12} />}
                        {team.isPublic ? 'Publique' : 'Privée'}
                    </span>
                    {isCaptain && (
                        <button
                            onClick={() => toggleVisibility(team.id, !team.isPublic)}
                            className="text-brand-500 font-medium hover:underline"
                        >
                            Changer
                        </button>
                    )}
                </div>
            </div>

            {/* Join Requests (captain only) */}
            {isCaptain && joinRequests.length > 0 && (
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                    <h4 className="font-bold text-amber-700 text-sm mb-3 flex items-center gap-2">
                        📩 Demandes en attente ({joinRequests.length})
                    </h4>
                    <div className="space-y-2">
                        {joinRequests.map(jr => (
                            <div key={jr.userId} className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-xs">
                                    {(jr.userName || jr.userId).charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate">{jr.userName || jr.userId}</p>
                                    <p className="text-[10px] text-gray-400">
                                        {formatDistanceToNow(new Date(jr.createdAt), { addSuffix: true, locale: fr })}
                                    </p>
                                </div>
                                <div className="flex gap-1.5">
                                    <button
                                        onClick={() => acceptRequest(team.id, jr.userId)}
                                        className="p-2 bg-success-50 text-success-600 rounded-lg hover:bg-success-100 transition-all active:scale-95"
                                        title="Accepter"
                                    >
                                        <Check size={16} />
                                    </button>
                                    <button
                                        onClick={() => refuseRequest(team.id, jr.userId)}
                                        className="p-2 bg-danger-50 text-danger-500 rounded-lg hover:bg-danger-100 transition-all active:scale-95"
                                        title="Refuser"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Members list */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-card">
                <h4 className="font-bold text-gray-900 text-sm mb-3">
                    Membres ({members.length}/{team.maxMembers || 3})
                </h4>
                <div className="space-y-2">
                    {members.map(m => (
                        <div key={m.id} className="flex items-center gap-3 py-2">
                            <div
                                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0"
                                style={{ backgroundColor: m.avatarColor || '#9ca3af' }}
                            >
                                {(m.prenom || m.pseudo || '?').charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 text-sm truncate">
                                    {m.id === userId ? `${m.prenom || m.pseudo} (Vous)` : (m.pseudo || `${m.prenom} ${m.nom}`)}
                                </p>
                                <p className="text-[11px] text-gray-400">
                                    {m.id === team.captainId ? '👑 Capitaine' : 'Joueur'}
                                </p>
                            </div>
                            {isCaptain && m.id !== userId && (
                                <button
                                    onClick={() => kickMember(team.id, m.id)}
                                    className="p-1.5 text-gray-300 hover:text-danger-500 hover:bg-danger-50 rounded-lg transition-all"
                                    title="Retirer"
                                >
                                    <UserMinus size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                    {/* Empty slots */}
                    {Array.from({ length: slotsLeft }).map((_, i) => (
                        <div key={`empty-${i}`} className="flex items-center gap-3 py-2 opacity-50">
                            <div className="w-9 h-9 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center text-gray-400 text-sm">?</div>
                            <p className="text-sm text-gray-400">Place disponible</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* History */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
                <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="w-full p-4 flex items-center justify-between text-sm font-bold text-gray-900 hover:bg-gray-50 transition-all"
                >
                    <span className="flex items-center gap-2"><History size={16} className="text-gray-400" /> Historique</span>
                    <span className="text-gray-400 text-xs">{showHistory ? '▲' : '▼'}</span>
                </button>
                {showHistory && (
                    <div className="px-4 pb-4 space-y-2 max-h-48 overflow-y-auto">
                        {(team.history || []).slice().reverse().map((h, i) => (
                            <div key={i} className="flex gap-2 text-xs">
                                <span className="text-gray-300 shrink-0">•</span>
                                <div>
                                    <p className="text-gray-600">{h.message}</p>
                                    <p className="text-gray-300 text-[10px]">
                                        {formatDistanceToNow(new Date(h.date), { addSuffix: true, locale: fr })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
                {/* Validate (captain, when complete) */}
                {isCaptain && (team.status === 'complete' || team.status === 'modified') && (
                    <button
                        onClick={() => validateTeam(team.id)}
                        className="w-full bg-gradient-to-r from-success-500 to-success-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 size={18} />
                        Valider l'équipe pour le concours
                    </button>
                )}

                {/* Leave (any member) */}
                {!showLeaveConfirm ? (
                    <button
                        onClick={() => setShowLeaveConfirm(true)}
                        className="w-full bg-gray-50 text-gray-500 py-3 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                    >
                        <LogOut size={16} />
                        Quitter l'équipe
                    </button>
                ) : (
                    <div className="bg-danger-50 p-4 rounded-xl border border-danger-100">
                        <p className="text-sm text-danger-700 font-medium mb-3">
                            {isCaptain ? "En tant que capitaine, le rôle sera transféré au prochain membre." : "Voulez-vous vraiment quitter ?"}
                        </p>
                        <div className="flex gap-2">
                            <button onClick={() => setShowLeaveConfirm(false)} className="flex-1 bg-white text-gray-600 py-2.5 rounded-lg text-sm font-bold border border-gray-200">Annuler</button>
                            <button onClick={handleLeave} className="flex-1 bg-danger-500 text-white py-2.5 rounded-lg text-sm font-bold">Confirmer</button>
                        </div>
                    </div>
                )}

                {/* Delete (captain only) */}
                {isCaptain && (
                    <>
                        {!showDeleteConfirm ? (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="w-full bg-white text-danger-500 py-3 rounded-xl font-bold text-sm border border-danger-100 hover:bg-danger-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 size={16} />
                                Supprimer l'équipe
                            </button>
                        ) : (
                            <div className="bg-danger-50 p-4 rounded-xl border border-danger-200">
                                <p className="text-sm text-danger-700 font-bold mb-3">⚠️ Cette action est irréversible</p>
                                <div className="flex gap-2">
                                    <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-white text-gray-600 py-2.5 rounded-lg text-sm font-bold border border-gray-200">Annuler</button>
                                    <button onClick={handleDelete} className="flex-1 bg-danger-500 text-white py-2.5 rounded-lg text-sm font-bold">Supprimer</button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default TeamManagementPanel;
