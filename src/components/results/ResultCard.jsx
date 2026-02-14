import React, { useRef } from 'react';
import { MapPin, Heart, Download, Share2, Trash2, Zap, Target, Trophy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toPng } from 'html-to-image';

// ── Status config with colors ──
const STATUS_CONFIG = {
    'Gagnant': { emoji: '🏆', color: '#FF7A00' },
    'Finaliste': { emoji: '🥈', color: '#C0C0C0' },
    'Demi-finaliste': { emoji: '🥉', color: '#CD7F32' },
    'Quart de finaliste': { emoji: '🎯', color: '#4A90D9' },
};

const ResultCard = ({ result, currentUserId, onLike, onDelete, compact = false }) => {
    const cardRef = useRef(null);
    const exportRef = useRef(null);

    const isOwner = result.userId === currentUserId;
    const liked = (result.likes || []).includes(currentUserId);
    const totalGames = (parseInt(result.gamesWon) || 0) + (parseInt(result.gamesLost) || 0);

    // ── Export as PNG (1080×1350) ──
    const handleDownload = async () => {
        if (!exportRef.current) return;
        try {
            const dataUrl = await toPng(exportRef.current, {
                quality: 0.95,
                pixelRatio: 3,
                backgroundColor: '#000',
                width: 1080,
                height: 1350,
                style: { width: '1080px', height: '1350px' }
            });
            const link = document.createElement('a');
            link.download = `petanque-${result.contestName.replace(/\s+/g, '-')}.png`;
            link.href = dataUrl;
            link.click();
        } catch (e) {
            console.error('Export error:', e);
        }
    };

    // ── Share via Web Share API ──
    const handleShare = async () => {
        if (navigator.share) {
            try {
                const dataUrl = await toPng(exportRef.current, {
                    quality: 0.9,
                    pixelRatio: 3,
                    backgroundColor: '#000',
                    width: 1080,
                    height: 1350,
                    style: { width: '1080px', height: '1350px' }
                });
                const blob = await (await fetch(dataUrl)).blob();
                const file = new File([blob], 'petanque-result.png', { type: 'image/png' });
                await navigator.share({
                    title: `${result.contestName} — Pétanque Connect`,
                    text: `${result.ranking || ''} — ${totalGames} parties au ${result.contestName}! 🏆`,
                    files: [file]
                });
            } catch (e) {
                if (e.name !== 'AbortError') console.error('Share error:', e);
            }
        } else {
            handleDownload();
        }
    };

    const statusConf = STATUS_CONFIG[result.ranking] || null;

    return (
        <div ref={cardRef} className="animate-fade-in">
            {/* ── User header (outside the card) ── */}
            <div className="flex items-center gap-3 mb-3 px-1">
                <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
                    style={{ backgroundColor: result.userAvatar || '#FF7A00' }}
                >
                    {(result.userPseudo || '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm">{result.userPseudo || 'Joueur'}</p>
                    <p className="text-[11px] text-gray-400">
                        {formatDistanceToNow(new Date(result.createdAt), { addSuffix: true, locale: fr })}
                    </p>
                </div>
                {isOwner && onDelete && (
                    <button
                        onClick={() => onDelete(result.id)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>

            {/* ══════════════════════════════════════
                THE EXPORTABLE CARD — Sport Performance
               ══════════════════════════════════════ */}
            <div
                ref={exportRef}
                className="relative rounded-2xl overflow-hidden shadow-2xl"
                style={{ aspectRatio: '4/5' }}
            >
                {/* ── Photo background (full bleed) ── */}
                <img
                    src={result.photo}
                    alt={result.contestName}
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {/* ── Vertical overlay: black bottom → transparent top ── */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.15) 70%, transparent 100%)'
                    }}
                />

                {/* ═══ TOP BAR ═══ */}
                <div className="absolute top-0 left-0 right-0 p-5 flex items-center justify-between z-10">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.15)' }}
                        >
                            <span className="text-white text-lg">🎯</span>
                        </div>
                        <span className="text-white/90 text-[11px] font-bold tracking-[0.15em] uppercase">
                            Pétanque Connect
                        </span>
                    </div>

                    {/* Contest type badge */}
                    {result.contestType && (
                        <span
                            className="text-white text-[11px] font-bold px-4 py-1.5 rounded-md uppercase tracking-wider"
                            style={{ backgroundColor: '#FF7A00' }}
                        >
                            {result.contestType}
                        </span>
                    )}
                </div>

                {/* ═══ BOTTOM CONTENT ═══ */}
                <div className="absolute bottom-0 left-0 right-0 p-5 z-10">

                    {/* ── RANKING — The hero element ── */}
                    {result.ranking && (
                        <div className="text-center mb-4">
                            <div className="inline-flex items-center gap-3">
                                <span className="text-4xl">{statusConf?.emoji || '🏆'}</span>
                                <span
                                    className="text-4xl font-black uppercase tracking-wide"
                                    style={{ color: statusConf?.color || '#FF7A00' }}
                                >
                                    {result.ranking}
                                </span>
                            </div>
                            {result.totalTeams && (
                                <p className="text-white/60 text-sm font-medium mt-1">
                                    / {result.totalTeams} équipes
                                </p>
                            )}
                        </div>
                    )}

                    {/* ── STATS BLOCKS (glassmorphism) ── */}
                    <div className="flex gap-3 mb-4">
                        {/* Games played */}
                        <div
                            className="flex-1 rounded-xl p-3 text-center"
                            style={{
                                backgroundColor: 'rgba(0,0,0,0.45)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                backdropFilter: 'blur(6px)'
                            }}
                        >
                            <div className="flex items-center justify-center gap-1.5 mb-1">
                                <Zap size={14} style={{ color: '#FF7A00' }} />
                                <span className="text-white/50 text-[10px] font-medium uppercase tracking-wider">Parties</span>
                            </div>
                            <p className="text-white text-2xl font-black">{totalGames || '—'}</p>
                        </div>

                        {/* Teams */}
                        {result.totalTeams && (
                            <div
                                className="flex-1 rounded-xl p-3 text-center"
                                style={{
                                    backgroundColor: 'rgba(0,0,0,0.45)',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    backdropFilter: 'blur(6px)'
                                }}
                            >
                                <div className="flex items-center justify-center gap-1.5 mb-1">
                                    <Target size={14} style={{ color: '#FF7A00' }} />
                                    <span className="text-white/50 text-[10px] font-medium uppercase tracking-wider">Équipes</span>
                                </div>
                                <p className="text-white text-2xl font-black">{result.totalTeams}</p>
                            </div>
                        )}
                    </div>

                    {/* ── Scores detail (glassmorphism block) ── */}
                    {!compact && result.scores && result.scores.length > 0 && (
                        <div
                            className="rounded-xl p-3 mb-4"
                            style={{
                                backgroundColor: 'rgba(0,0,0,0.45)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                backdropFilter: 'blur(6px)'
                            }}
                        >
                            <p className="text-white/50 text-[10px] font-medium uppercase tracking-wider text-center mb-2">
                                Détail des manches
                            </p>
                            <div className="space-y-1.5">
                                {result.scores.map((s, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs px-2">
                                        <span className="text-white/40 font-bold">M{s.round || i + 1}</span>
                                        <div className="flex items-center gap-3">
                                            <span className={`font-black text-sm ${s.us > s.them ? 'text-white' : 'text-white/40'}`}>
                                                {s.us}
                                            </span>
                                            <span className="text-white/20 text-[10px]">—</span>
                                            <span className={`font-black text-sm ${s.them > s.us ? 'text-white' : 'text-white/40'}`}>
                                                {s.them}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Team name ── */}
                    {result.teamName && (
                        <div className="text-center mb-3">
                            <span
                                className="inline-block text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-md"
                                style={{
                                    backgroundColor: 'rgba(255,122,0,0.2)',
                                    color: '#FF7A00',
                                    border: '1px solid rgba(255,122,0,0.3)'
                                }}
                            >
                                {result.teamName}
                            </span>
                        </div>
                    )}

                    {/* ── Location + Date ── */}
                    <div className="flex items-center justify-center gap-3 mb-2 text-white/70 text-xs font-medium">
                        {result.contestLocation && (
                            <span className="flex items-center gap-1">
                                <MapPin size={12} style={{ color: '#FF7A00' }} />
                                {result.contestLocation}
                            </span>
                        )}
                        {result.contestLocation && result.contestDate && (
                            <span className="text-white/30">—</span>
                        )}
                        {result.contestDate && (
                            <span>
                                {new Date(result.contestDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        )}
                    </div>

                    {/* ── Contest name ── */}
                    <h3 className="text-white font-extrabold text-lg leading-tight text-center mb-2 tracking-wide">
                        {result.contestName}
                    </h3>

                    {/* ── Caption ── */}
                    {result.caption && (
                        <p className="text-center text-sm italic mt-1" style={{ color: '#E0E0E0' }}>
                            "{result.caption}"
                        </p>
                    )}
                </div>
            </div>

            {/* ══════════════════════════════════════
                ACTION BUTTONS (outside export area)
               ══════════════════════════════════════ */}
            <div className="flex items-center justify-between mt-3 px-1">
                {/* Like */}
                <button
                    onClick={() => onLike && onLike(result.id)}
                    className={`flex items-center gap-1.5 py-2 px-3 rounded-full text-sm font-bold transition-all active:scale-95 ${liked
                            ? 'text-red-500 bg-red-50'
                            : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                        }`}
                >
                    <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
                    <span>{(result.likes || []).length || ''}</span>
                </button>

                {/* Download + Share */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDownload}
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
                        style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
                        title="Télécharger"
                    >
                        <Download size={18} className="text-gray-500" />
                    </button>
                    <button
                        onClick={handleShare}
                        className="flex items-center gap-1.5 py-2.5 px-5 rounded-full text-sm font-bold shadow-lg transition-all active:scale-95 text-white"
                        style={{ backgroundColor: '#FF7A00' }}
                    >
                        <Share2 size={16} />
                        Partager
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResultCard;
