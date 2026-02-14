import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, ChevronRight } from 'lucide-react';

const typeColors = {
    'T': 'bg-brand-50 text-brand-700',
    'D': 'bg-indigo-50 text-indigo-700',
    'TM': 'bg-purple-50 text-purple-700',
    'TT': 'bg-sky-50 text-sky-700',
    'DM': 'bg-pink-50 text-pink-700',
    'DF': 'bg-rose-50 text-rose-700',
    'TF': 'bg-fuchsia-50 text-fuchsia-700',
    'TTF': 'bg-cyan-50 text-cyan-700',
    'TJP': 'bg-teal-50 text-teal-700',
    'DJP': 'bg-emerald-50 text-emerald-700',
    'D+1R': 'bg-amber-50 text-amber-700',
    'DJ': 'bg-lime-50 text-lime-700',
};

const districtColors = {
    'Centre': 'bg-brand-500',
    'Nord': 'bg-success-500',
    'Sud': 'bg-accent-500',
    'Est': 'bg-purple-500',
    'Ouest': 'bg-sky-500',
};

const formatDotation = (dot) => {
    if (!dot || dot === 'X') return null;
    return dot;
};

const CalendarContestCard = ({ contest }) => {
    const dot = formatDotation(contest.dotation);

    return (
        <Link
            to={`/contest/${contest.id}`}
            className="block bg-white rounded-2xl shadow-card hover:shadow-card-hover border border-gray-100 overflow-hidden transition-all duration-300 active:scale-[0.98] animate-fade-in"
        >
            {/* District color bar */}
            <div className={`h-1.5 ${districtColors[contest.district] || 'bg-gray-300'}`} />

            <div className="p-4">
                {/* Club name as title */}
                <h3 className="font-bold text-gray-900 text-[15px] leading-snug mb-2">
                    {contest.club}
                </h3>

                {/* Badges row */}
                <div className="flex items-center gap-1.5 flex-wrap mb-3">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${typeColors[contest.type] || 'bg-gray-100 text-gray-600'}`}>
                        {contest.typeName}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                        {contest.format}
                    </span>
                    {dot && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-accent-50 text-accent-600">
                            🏆 {dot}
                        </span>
                    )}
                </div>

                {/* Info + voir */}
                <div className="flex items-end justify-between">
                    <div className="space-y-1.5 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-brand-500 shrink-0" />
                            <span>District {contest.district}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-brand-500 shrink-0" />
                            <span>{contest.dayName}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-brand-600 shrink-0">
                        <span className="text-xs font-semibold">Voir</span>
                        <ChevronRight size={14} />
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default CalendarContestCard;
