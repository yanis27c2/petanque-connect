import React, { useState, useRef } from 'react';
import { X, Camera, Plus, Trash2, Trophy, MapPin, Users, Swords, Image as ImageIcon, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { api } from '../../api/config';
import useAuthStore from '../../store/useAuthStore';

const CONTEST_TYPES = ['Triplette', 'Doublette', 'Tête à tête', 'Mixte', 'Jeunes', 'Vétérans', 'Féminine', 'Super 16'];
const STATUS_OPTIONS = ['Gagnant', 'Finaliste', 'Demi-finaliste', 'Quart de finaliste'];

const ResultCreator = ({ onClose, onCreated }) => {
    const { user } = useAuthStore();
    const fileInputRef = useRef(null);

    // Form state
    const [photo, setPhoto] = useState(null);
    const [contestName, setContestName] = useState('');
    const [contestDate, setContestDate] = useState(new Date().toISOString().split('T')[0]);
    const [contestLocation, setContestLocation] = useState('');
    const [contestType, setContestType] = useState('Triplette');
    const [teamName, setTeamName] = useState('');
    const [totalTeams, setTotalTeams] = useState('');
    const [gamesPlayed, setGamesPlayed] = useState('');
    const [ranking, setRanking] = useState('');
    const [caption, setCaption] = useState('');
    const [showScores, setShowScores] = useState(false);
    const [scores, setScores] = useState([]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // ── Photo handling ──
    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError('La photo ne doit pas dépasser 5 Mo');
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => setPhoto(ev.target.result);
        reader.readAsDataURL(file);
    };

    // ── Score management ──
    const addScore = () => {
        setScores([...scores, { round: scores.length + 1, us: '', them: '' }]);
    };

    const updateScore = (index, field, value) => {
        const updated = [...scores];
        updated[index][field] = value;
        setScores(updated);
    };

    const removeScore = (index) => {
        setScores(scores.filter((_, i) => i !== index).map((s, i) => ({ ...s, round: i + 1 })));
    };

    // ── Submit ──
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!photo) { setError('Ajoutez une photo !'); return; }
        if (!contestName.trim()) { setError('Entrez le nom du concours'); return; }

        setIsSubmitting(true);
        setError(null);

        try {
            const payload = {
                contestName: contestName.trim(),
                contestDate,
                contestLocation: contestLocation.trim(),
                contestType,
                teamName: teamName.trim(),
                totalTeams: totalTeams || null,
                gamesWon: parseInt(gamesPlayed) || 0,
                gamesLost: 0,
                ranking,
                scores: scores.filter(s => s.us !== '' && s.them !== '').map(s => ({
                    round: s.round,
                    us: parseInt(s.us) || 0,
                    them: parseInt(s.them) || 0
                })),
                photo,
                caption: caption.trim()
            };

            const res = await api.post('/results', payload);

            if (res.ok) {
                const data = await res.json();
                onCreated?.(data);
                onClose();
            } else {
                const errData = await res.json().catch(() => ({}));
                setError(errData.message || 'Erreur lors de la publication');
            }
        } catch (e) {
            console.error('Submit error:', e);
            setError('Erreur de connexion');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center animate-fade-in">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white w-full max-w-lg max-h-[92vh] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col animate-slide-up shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
                    <h2 className="text-lg font-extrabold text-gray-900">Publier un résultat</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all active:scale-90">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Scrollable form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
                    {/* ── Photo upload ── */}
                    <div>
                        <label className="text-sm font-bold text-gray-700 mb-2 block">📸 Photo du concours *</label>
                        {photo ? (
                            <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
                                <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/20" />
                                <button
                                    type="button"
                                    onClick={() => setPhoto(null)}
                                    className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all"
                                >
                                    <X size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-3 right-3 px-3 py-2 bg-white/90 backdrop-blur text-gray-900 rounded-xl text-xs font-bold hover:bg-white transition-all"
                                >
                                    <Camera size={14} className="inline mr-1" />
                                    Changer
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center gap-3 text-gray-400 hover:border-brand-300 hover:text-brand-500 hover:bg-brand-50/30 transition-all active:scale-[0.99]"
                            >
                                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                                    <ImageIcon size={28} />
                                </div>
                                <span className="text-sm font-medium">Prendre une photo ou choisir dans la galerie</span>
                                <span className="text-[11px]">JPG, PNG — max 5 Mo</span>
                            </button>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                        />
                    </div>

                    {/* ── Contest info ── */}
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
                        <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            <Trophy size={16} className="text-brand-600" />
                            Informations du concours
                        </h3>

                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Nom du concours *</label>
                            <input
                                type="text"
                                value={contestName}
                                onChange={e => setContestName(e.target.value)}
                                placeholder="Ex: Concours de la St-Valentin"
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-300 transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Date</label>
                                <input
                                    type="date"
                                    value={contestDate}
                                    onChange={e => setContestDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Lieu</label>
                                <input
                                    type="text"
                                    value={contestLocation}
                                    onChange={e => setContestLocation(e.target.value)}
                                    placeholder="Toulouse"
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Type</label>
                                <select
                                    value={contestType}
                                    onChange={e => setContestType(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 transition-all appearance-none"
                                >
                                    {CONTEST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Nb d'équipes</label>
                                <input
                                    type="number"
                                    value={totalTeams}
                                    onChange={e => setTotalTeams(e.target.value)}
                                    placeholder="32"
                                    min="2"
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── Results ── */}
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
                        <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            <Swords size={16} className="text-brand-600" />
                            Résultats
                        </h3>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Statut</label>
                                <select
                                    value={ranking}
                                    onChange={e => setRanking(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 transition-all appearance-none"
                                >
                                    <option value="">Sélectionner...</option>
                                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Nom d'équipe</label>
                                <input
                                    type="text"
                                    value={teamName}
                                    onChange={e => setTeamName(e.target.value)}
                                    placeholder="Les Tireurs"
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-brand-600 mb-1 block font-bold">Parties jouées</label>
                            <input
                                type="number"
                                value={gamesPlayed}
                                onChange={e => setGamesPlayed(e.target.value)}
                                placeholder="5"
                                min="0"
                                className="w-full px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl text-sm font-bold text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-300 transition-all"
                            />
                        </div>

                        {/* ── Scores detail (optional) ── */}
                        <button
                            type="button"
                            onClick={() => { setShowScores(!showScores); if (!showScores && scores.length === 0) addScore(); }}
                            className="flex items-center gap-2 text-sm text-brand-600 font-bold hover:bg-brand-50 px-3 py-2 rounded-xl transition-all w-full"
                        >
                            {showScores ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            Détail des scores par manche (optionnel)
                        </button>

                        {showScores && (
                            <div className="space-y-2 animate-slide-down">
                                {scores.map((score, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400 font-bold w-8 shrink-0">M{score.round}</span>
                                        <input
                                            type="number"
                                            value={score.us}
                                            onChange={e => updateScore(i, 'us', e.target.value)}
                                            placeholder="Nous"
                                            min="0"
                                            max="13"
                                            className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-300 transition-all"
                                        />
                                        <span className="text-gray-300 font-bold text-sm">—</span>
                                        <input
                                            type="number"
                                            value={score.them}
                                            onChange={e => updateScore(i, 'them', e.target.value)}
                                            placeholder="Eux"
                                            min="0"
                                            max="13"
                                            className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-300 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeScore(i)}
                                            className="p-1.5 text-gray-300 hover:text-danger-500 rounded-lg transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addScore}
                                    className="flex items-center gap-1 text-xs text-brand-600 font-bold hover:bg-brand-50 px-3 py-2 rounded-lg transition-all"
                                >
                                    <Plus size={14} />
                                    Ajouter une manche
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ── Caption ── */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">💬 Commentaire (optionnel)</label>
                        <textarea
                            value={caption}
                            onChange={e => setCaption(e.target.value)}
                            placeholder="Super journée, belle ambiance !"
                            maxLength={200}
                            rows={2}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 transition-all resize-none"
                        />
                        <p className="text-right text-[10px] text-gray-300 mt-0.5">{caption.length}/200</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-danger-50 text-danger-600 text-sm font-medium px-4 py-3 rounded-xl animate-fade-in">
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting || !photo || !contestName.trim()}
                        className="w-full py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-extrabold text-base rounded-2xl shadow-button hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Publication...
                            </>
                        ) : (
                            <>
                                <Trophy size={20} />
                                Publier mon résultat
                            </>
                        )}
                    </button>

                    {/* Bottom safe area */}
                    <div className="h-4" />
                </form>
            </div>
        </div>
    );
};

export default ResultCreator;
