import React, { useState, useMemo } from 'react';
import { Search, Filter, MapPin } from 'lucide-react';
import CalendarContestCard from '../components/contest/CalendarContestCard';
import { CALENDAR_CONTESTS, CALENDAR_STATS } from '../data/calendarContests';
import useFilterStore from '../store/useFilterStore';
import useAuthStore from '../store/useAuthStore';
import { isAfter, parseISO } from 'date-fns';

const Contests = () => {
    const [search, setSearch] = useState('');
    const { discipline, departements, openFilters } = useFilterStore();
    const { user } = useAuthStore();

    // Recommendations Logic
    const recommendations = useMemo(() => {
        if (!user || !user.departement) return [];
        return CALENDAR_CONTESTS.filter(c =>
            c.departement === user.departement &&
            isAfter(new Date(c.date), new Date())
        ).slice(0, 5);
    }, [user]);

    // --- Filtering Logic ---
    const filtered = useMemo(() => {
        return CALENDAR_CONTESTS.filter(c => {
            // 1. Global Filters (Store)
            if (discipline === 'petanque' && c.discipline !== 'petanque') return false;
            if (discipline === 'jeu_provencal' && c.discipline !== 'jeu_provencal') return false;
            if (!departements[c.departement]) return false;

            // 2. Local Search
            const searchLower = search.toLowerCase();
            const matchSearch = !search ||
                c.club.toLowerCase().includes(searchLower) ||
                (c.intitule && c.intitule.toLowerCase().includes(searchLower)) ||
                c.typeName.toLowerCase().includes(searchLower) ||
                (c.district && c.district.toLowerCase().includes(searchLower)) ||
                c.city?.toLowerCase().includes(searchLower);

            return matchSearch;
        });
    }, [search, discipline, departements]);

    // Active filters label
    const activeFiltersLabel = useMemo(() => {
        const depts = [];
        if (departements['31']) depts.push('31');
        if (departements['09']) depts.push('09');

        let disc = 'Tous';
        if (discipline === 'petanque') disc = 'Pétanque';
        if (discipline === 'jeu_provencal') disc = 'Jeu Prov.';

        return `${disc} • ${depts.join('+')}`;
    }, [discipline, departements]);

    return (
        <div className="animate-fade-in">
            <div className="flex items-end justify-between mb-5">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Concours</h1>
                    <p className="text-sm text-gray-500">
                        {CALENDAR_STATS.totalContests} concours • Saison 2026
                    </p>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Filtres actifs</span>
                    <p className="text-xs font-bold text-brand-600">{activeFiltersLabel}</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Rechercher un club, une ville..."
                    className="w-full pl-11 pr-4 py-3.5 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-card transition-all text-sm font-medium"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Recommendations */}
            {!search && recommendations.length > 0 && (
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-1 bg-brand-50 text-brand-600 rounded-lg">
                            <MapPin size={16} />
                        </div>
                        <h2 className="font-bold text-gray-900 text-sm">Près de chez vous ({user?.departement})</h2>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 snap-x hide-scrollbar">
                        {recommendations.map(contest => (
                            <div key={contest.id} className="min-w-[280px] snap-center">
                                <CalendarContestCard contest={contest} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Results count */}
            <div className="flex items-center justify-between mb-3 px-1">
                <p className="text-xs text-gray-400 font-medium">
                    {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
                </p>
                {filtered.length === 0 && (
                    <button onClick={openFilters} className="text-brand-600 text-xs font-bold flex items-center gap-1">
                        <Filter size={12} /> Modifier les filtres
                    </button>
                )}
            </div>

            {/* List */}
            <div className="space-y-3">
                {filtered.length > 0 ? (
                    filtered.slice(0, 50).map(c => <CalendarContestCard key={c.id} contest={c} />)
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 animate-fade-in">
                        <div className="text-4xl mb-3">🔍</div>
                        <p className="text-gray-500 font-medium">Aucun concours trouvé</p>
                        <p className="text-xs text-gray-400 mt-1 max-w-[200px] mx-auto">
                            Essayez de modifier votre recherche ou les filtres (départements/discipline)
                        </p>
                        <button
                            onClick={openFilters}
                            className="mt-4 bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
                        >
                            Ouvrir les filtres
                        </button>
                    </div>
                )}

                {filtered.length > 50 && (
                    <p className="text-center text-xs text-gray-400 py-4">
                        Affichage limité à 50 résultats sur {filtered.length}.
                        <br />Utilisez la recherche pour affiner.
                    </p>
                )}
            </div>
        </div>
    );
};

export default Contests;
