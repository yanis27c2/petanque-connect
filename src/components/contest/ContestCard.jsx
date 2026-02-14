import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Users, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import FavoriteButton from '../common/FavoriteButton';

const ContestCard = ({ contest }) => {
    const isFull = contest.registeredTeams >= contest.maxTeams;
    const fillPercent = Math.round((contest.registeredTeams / contest.maxTeams) * 100);

    return (
        <Link
            to={`/contest/${contest.id}`}
            className="block bg-white rounded-2xl shadow-card hover:shadow-card-hover border border-gray-100 overflow-hidden transition-all duration-300 active:scale-[0.98] animate-fade-in relative group"
        >
            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <FavoriteButton type="concours" id={contest.id} className="shadow-sm border border-gray-100" />
            </div>

            {/* Top color accent bar */}
            <div className={`h-1.5 ${isFull ? 'bg-danger-500' : 'bg-gradient-to-r from-brand-500 to-brand-400'}`} />

            <div className="p-4">
                {/* Header row */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0 mr-3">
                        <h3 className="font-bold text-gray-900 text-[15px] leading-snug line-clamp-1">{contest.title}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="bg-brand-50 text-brand-700 text-[11px] font-bold px-2 py-0.5 rounded-md">
                                {contest.type}
                            </span>
                            {contest.dotation && (
                                <span className="bg-accent-50 text-accent-600 text-[11px] font-bold px-2 py-0.5 rounded-md">
                                    🏆 {contest.dotation}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${isFull
                        ? 'bg-danger-50 text-danger-600'
                        : 'bg-success-50 text-success-700'
                        }`}>
                        {isFull ? 'Complet' : 'Ouvert'}
                    </div>
                </div>

                {/* Info rows */}
                <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2.5">
                        <MapPin size={15} className="text-brand-500 shrink-0" />
                        <span className="line-clamp-1">{contest.city}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <Clock size={15} className="text-brand-500 shrink-0" />
                            <span>{format(new Date(contest.date), 'd MMM yyyy', { locale: fr })} à {contest.time}</span>
                        </div>
                        <div className="flex items-center gap-1 text-brand-600">
                            <span className="text-xs font-semibold">Voir</span>
                            <ChevronRight size={14} />
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 pt-3 border-t border-gray-50">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                        <div className="flex items-center gap-1.5 text-gray-500">
                            <Users size={13} />
                            <span>{contest.registeredTeams} / {contest.maxTeams} équipes</span>
                        </div>
                        <span className="font-bold text-gray-900">{contest.price > 0 ? `${contest.price}€` : 'Gratuit'}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-danger-500' : 'bg-brand-500'}`}
                            style={{ width: `${fillPercent}%` }}
                        />
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ContestCard;
