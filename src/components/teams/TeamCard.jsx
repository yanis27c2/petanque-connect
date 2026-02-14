import React from 'react';
import { Users, UserPlus, Clock, Check, X, Shield, Eye, EyeOff } from 'lucide-react';

const STATUS_CONFIG = {
    pending: { label: 'En cours', color: 'bg-amber-50 text-amber-600', icon: Clock },
    complete: { label: 'Complète', color: 'bg-blue-50 text-blue-600', icon: Users },
    validated: { label: 'Validée', color: 'bg-success-50 text-success-600', icon: Check },
    modified: { label: 'Modifiée', color: 'bg-orange-50 text-orange-600', icon: Clock },
};

const TeamCard = ({ team, userId, onJoinRequest, onCancelRequest }) => {
    const status = STATUS_CONFIG[team.status] || STATUS_CONFIG.pending;
    const StatusIcon = status.icon;
    const isMember = (team.members || []).includes(userId);
    const hasPendingRequest = (team.joinRequests || []).some(jr => jr.userId === userId);
    const isCaptain = team.captainId === userId;
    const slotsLeft = Math.max(0, (team.maxMembers || 3) - (team.members || []).length);
    const members = team.memberDetails || [];

    return (
        <div className={`bg-white p-4 rounded-2xl border shadow-card transition-all ${isMember ? 'border-brand-200 ring-1 ring-brand-100' : 'border-gray-100'}`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-2.5">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900 text-sm truncate">{team.name}</h4>
                        {!team.isPublic && <EyeOff size={12} className="text-gray-400 shrink-0" title="Privée" />}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <Shield size={11} className="text-gray-400" />
                        <span className="text-[11px] text-gray-500">
                            {members.find(m => m.id === team.captainId)?.prenom || 'Capitaine'}
                        </span>
                    </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 flex items-center gap-1 ${status.color}`}>
                    <StatusIcon size={11} />
                    {status.label}
                </span>
            </div>

            {/* Members row */}
            <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                {members.map((m) => (
                    <div
                        key={m.id}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${m.id === team.captainId ? 'bg-brand-50 text-brand-700' : 'bg-gray-50 text-gray-600'
                            }`}
                    >
                        <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-[10px] shrink-0"
                            style={{ backgroundColor: m.avatarColor || '#9ca3af' }}
                        >
                            {(m.prenom || m.pseudo || '?').charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate max-w-[60px]">
                            {m.id === userId ? 'Vous' : (m.pseudo || m.prenom)}
                        </span>
                        {m.id === team.captainId && <Shield size={10} className="text-brand-500 shrink-0" />}
                    </div>
                ))}
                {/* Empty slots */}
                {Array.from({ length: slotsLeft }).map((_, i) => (
                    <div key={`slot-${i}`} className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg text-xs text-amber-500 border border-dashed border-amber-200">
                        <div className="w-5 h-5 border-2 border-dashed border-amber-300 rounded-full flex items-center justify-center text-[10px]">?</div>
                        Libre
                    </div>
                ))}
            </div>

            {/* Pending requests count (visible to captain or requesters) */}
            {(team.joinRequests || []).length > 0 && (isCaptain || hasPendingRequest) && (
                <div className="text-[11px] text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-lg mb-2.5 font-medium">
                    📩 {team.joinRequests.length} demande{team.joinRequests.length > 1 ? 's' : ''} en attente
                </div>
            )}

            {/* Action buttons */}
            {!isMember && !hasPendingRequest && slotsLeft > 0 && team.status !== 'validated' && (
                <button
                    onClick={() => onJoinRequest?.(team.id)}
                    className="w-full bg-brand-50 text-brand-600 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-100 transition-colors flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                    <UserPlus size={15} />
                    Demander à rejoindre
                </button>
            )}

            {hasPendingRequest && (
                <button
                    onClick={() => onCancelRequest?.(team.id)}
                    className="w-full bg-gray-50 text-gray-500 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                    <X size={15} />
                    Annuler ma demande
                </button>
            )}

            {isMember && !isCaptain && (
                <div className="w-full bg-brand-50 text-brand-600 py-2 rounded-xl text-sm font-bold text-center">
                    ✅ Vous êtes membre
                </div>
            )}

            {isCaptain && (
                <div className="w-full bg-brand-100 text-brand-700 py-2 rounded-xl text-sm font-bold text-center">
                    👑 Vous êtes capitaine
                </div>
            )}
        </div>
    );
};

export default TeamCard;
