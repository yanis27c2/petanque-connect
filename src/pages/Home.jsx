import React, { useState, useMemo } from 'react';
import { format, isSameDay, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarDays, Trophy, Filter } from 'lucide-react';
import CalendarBoard from '../components/calendar/CalendarBoard';
import CalendarContestCard from '../components/contest/CalendarContestCard';
import { CALENDAR_CONTESTS, CALENDAR_STATS } from '../data/calendarContests';
import useFilterStore from '../store/useFilterStore';

const Home = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const { discipline, departements, openFilters } = useFilterStore();

    // --- Global Filtering Logic ---
    const filteredContests = useMemo(() => {
        return CALENDAR_CONTESTS.filter(c => {
            // Filter by Discipline
            if (discipline === 'petanque' && c.discipline !== 'petanque') return false;
            if (discipline === 'jeu_provencal' && c.discipline !== 'jeu_provencal') return false;

            // Filter by Departement
            if (!departements[c.departement]) return false;

            return true;
        });
    }, [discipline, departements]);

    // Derived data
    const validDates = useMemo(() => {
        return [...new Set(filteredContests.map(c => c.date))];
    }, [filteredContests]);

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const dayContests = filteredContests.filter(c => c.date === dateStr);

    const dateLabel = isToday(selectedDate)
        ? "Aujourd'hui"
        : format(selectedDate, 'EEEE d MMMM', { locale: fr });

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
        <div className="animate-fade-in relative">

            {/* Calendar */}
            <CalendarBoard
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                validDates={validDates}
            />

            {/* Day events */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 capitalize">{dateLabel}</h2>
                    <p className="text-xs text-gray-500">
                        {dayContests.length > 0
                            ? `${dayContests.length} concours programmé${dayContests.length > 1 ? 's' : ''}`
                            : 'Pas de concours ce jour'}
                    </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-full text-xs font-bold">
                    <CalendarDays size={14} />
                    {dayContests.length}
                </div>
            </div>

            <div className="space-y-3">
                {dayContests.length > 0 ? (
                    dayContests.map(c => <CalendarContestCard key={c.id} contest={c} />)
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 animate-fade-in">
                        <div className="text-4xl mb-3">⛱️</div>
                        <p className="text-gray-500 font-medium">Aucun concours ce jour-là</p>
                        <p className="text-xs text-gray-400 mt-1 max-w-[200px] mx-auto">
                            Modifiez vos filtres ou changez de date
                        </p>
                        <button
                            onClick={openFilters}
                            className="mt-4 text-brand-600 font-bold text-xs flex items-center justify-center gap-1 mx-auto hover:bg-brand-50 px-3 py-2 rounded-lg transition-colors"
                        >
                            <Filter size={14} />
                            Modifier les filtres
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
