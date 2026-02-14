import React, { useState, useRef, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const SWIPE_THRESHOLD = 50; // minimum pixels to register a swipe

const CalendarBoard = ({ selectedDate, onDateSelect, validDates = [] }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [slideDirection, setSlideDirection] = useState(null); // 'left' | 'right' | null
    const [isAnimating, setIsAnimating] = useState(false);

    // Touch tracking refs
    const touchStartX = useRef(null);
    const touchStartY = useRef(null);
    const touchDeltaX = useRef(0);
    const gridRef = useRef(null);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: calStart, end: calEnd });

    // Create Set for O(1) lookup
    const dateSet = new Set(validDates);
    const hasEvents = (date) => dateSet.has(format(date, 'yyyy-MM-dd'));

    // ── Month navigation with animation ──
    const goToMonth = useCallback((direction) => {
        if (isAnimating) return;
        setIsAnimating(true);
        setSlideDirection(direction === 'next' ? 'left' : 'right');

        setTimeout(() => {
            setCurrentMonth(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
            setSlideDirection(null);
            setIsAnimating(false);
        }, 200);
    }, [isAnimating]);

    // ── Touch handlers ──
    const handleTouchStart = useCallback((e) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        touchDeltaX.current = 0;
    }, []);

    const handleTouchMove = useCallback((e) => {
        if (touchStartX.current === null) return;
        const deltaX = e.touches[0].clientX - touchStartX.current;
        const deltaY = Math.abs(e.touches[0].clientY - touchStartY.current);

        // Only track horizontal swipes (prevent conflicts with vertical scroll)
        if (deltaY > Math.abs(deltaX)) return;

        touchDeltaX.current = deltaX;

        // Subtle visual feedback: translate the grid slightly
        if (gridRef.current && Math.abs(deltaX) > 10) {
            const clamped = Math.max(-60, Math.min(60, deltaX * 0.4));
            gridRef.current.style.transform = `translateX(${clamped}px)`;
            gridRef.current.style.opacity = `${1 - Math.abs(clamped) / 150}`;
        }
    }, []);

    const handleTouchEnd = useCallback(() => {
        // Reset visual feedback
        if (gridRef.current) {
            gridRef.current.style.transform = '';
            gridRef.current.style.opacity = '';
        }

        const delta = touchDeltaX.current;
        if (Math.abs(delta) >= SWIPE_THRESHOLD) {
            if (delta < 0) {
                goToMonth('next'); // Swipe left → next month
            } else {
                goToMonth('prev'); // Swipe right → previous month
            }
        }

        touchStartX.current = null;
        touchStartY.current = null;
        touchDeltaX.current = 0;
    }, [goToMonth]);

    // ── Animation class ──
    const getAnimationClass = () => {
        if (!slideDirection) return '';
        return slideDirection === 'left'
            ? 'animate-slide-out-left'
            : 'animate-slide-out-right';
    };

    return (
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden mb-6 animate-fade-in">
            {/* Month header */}
            <div className="bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-4 flex items-center justify-between">
                <button onClick={() => goToMonth('prev')} className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-all active:scale-90">
                    <ChevronLeft size={20} />
                </button>
                <h2 className="text-white font-bold text-lg capitalize tracking-wide select-none">
                    {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                </h2>
                <button onClick={() => goToMonth('next')} className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-all active:scale-90">
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Swipeable calendar area */}
            <div
                className="p-4 touch-pan-y"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Weekday headers */}
                <div className="grid grid-cols-7 mb-2">
                    {WEEKDAYS.map(d => (
                        <div key={d} className="text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{d}</div>
                    ))}
                </div>

                {/* Day grid (animated + touch-translatable) */}
                <div
                    ref={gridRef}
                    className={`grid grid-cols-7 gap-y-1 transition-all duration-200 ease-out ${getAnimationClass()}`}
                >
                    {days.map((date, i) => {
                        const inMonth = isSameMonth(date, currentMonth);
                        const selected = isSameDay(date, selectedDate);
                        const today = isToday(date);
                        const events = hasEvents(date);

                        return (
                            <div key={i} className="flex justify-center py-0.5">
                                <button
                                    onClick={() => { onDateSelect(date); if (!inMonth) setCurrentMonth(date); }}
                                    className={`
                                        relative w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200
                                        ${selected
                                            ? 'bg-brand-600 text-white shadow-lg shadow-brand-200 scale-105'
                                            : today
                                                ? 'bg-brand-50 text-brand-700 font-bold ring-2 ring-brand-200'
                                                : inMonth
                                                    ? 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                                                    : 'text-gray-300'
                                        }
                                    `}
                                >
                                    {format(date, 'd')}
                                    {events && (
                                        <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${selected ? 'bg-white' : 'bg-accent-500'}`} />
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CalendarBoard;
