import React, { useState } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CALENDAR_CONTESTS } from '../data/calendarContests';
import ContestCard from '../components/contest/ContestCard';

const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Jours de la semaine
    const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

    // Fonction pour vérifier si un jour a des évènements
    const getEventsForDay = (date) => {
        return CALENDAR_CONTESTS.filter(contest => isSameDay(new Date(contest.date), date));
    };

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const selectedDayEvents = getEventsForDay(selectedDate);

    return (
        <div className="pb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Calendrier</h1>

            {/* Calendar Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-50 rounded-full text-gray-600">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="font-bold text-lg capitalize">
                        {format(currentDate, 'MMMM yyyy', { locale: fr })}
                    </span>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-50 rounded-full text-gray-600">
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 mb-2">
                    {weekDays.map(day => (
                        <div key={day} className="text-center text-xs font-medium text-gray-400 py-1">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1">
                    {/* Padding for start of month - simplified version relying on grid-column-start could be better but let's stick to simple grid mapping if needed, 
              Actually date-fns returns exact days, but we might need offset. 
              Let's accept simple grid for now, or add empty divs. 
              The start of month day index (0-6). 
           */}
                    {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => (
                        <div key={`empty-${i}`} />
                    ))}

                    {daysInMonth.map(date => {
                        const hasEvents = getEventsForDay(date).length > 0;
                        const isSelected = isSameDay(date, selectedDate);
                        const isCurrentMonth = isSameMonth(date, currentDate);
                        const isDayToday = isToday(date);

                        return (
                            <button
                                key={date.toISOString()}
                                onClick={() => setSelectedDate(date)}
                                className={`
                  aspect-square rounded-full flex flex-col items-center justify-center relative text-sm
                  ${isSelected ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-50 text-gray-700'}
                  ${!isCurrentMonth && 'text-gray-300'}
                  ${isDayToday && !isSelected && 'text-blue-600 font-bold bg-blue-50'}
                `}
                            >
                                <span>{format(date, 'd')}</span>
                                {hasEvents && (
                                    <span className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Selected Day Events */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3 capitalize">
                    {isToday(selectedDate) ? "Aujourd'hui" : format(selectedDate, 'EEEE d MMMM', { locale: fr })}
                </h2>

                <div className="space-y-3">
                    {selectedDayEvents.length > 0 ? (
                        selectedDayEvents.map(contest => (
                            <ContestCard key={contest.id} contest={contest} />
                        ))
                    ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500">
                            <p>Aucun concours ce jour-là.</p>
                            <p className="text-xs mt-1">Profitez-en pour vous entraîner !</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Calendar;
