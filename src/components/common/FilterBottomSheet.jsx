import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import useFilterStore from '../../store/useFilterStore';

const FilterBottomSheet = () => {
    const {
        isFilterOpen,
        closeFilters,
        discipline,
        setDiscipline,
        departements,
        toggleDepartement,
        resetFilters
    } = useFilterStore();

    if (!isFilterOpen) return null;

    return (
        <AnimatePresence>
            {isFilterOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeFilters}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-[70] max-w-md mx-auto overflow-hidden shadow-2xl"
                    >
                        {/* Handle bar */}
                        <div className="flex justify-center pt-3 pb-1" onClick={closeFilters}>
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
                            <h2 className="text-xl font-black text-gray-900">Filtres</h2>
                            <button
                                onClick={resetFilters}
                                className="text-sm font-bold text-brand-600 hover:text-brand-700"
                            >
                                Réinitialiser
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto pb-28">

                            {/* Section 1: Discipline */}
                            <section>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Discipline</h3>
                                <div className="space-y-2">
                                    {[
                                        { id: 'all', label: 'Tous' },
                                        { id: 'petanque', label: 'Pétanque' },
                                        { id: 'jeu_provencal', label: 'Jeu Provençal' }
                                    ].map((opt) => (
                                        <label
                                            key={opt.id}
                                            className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${discipline === opt.id
                                                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                                                    : 'border-gray-100 bg-white text-gray-700 hover:border-gray-200'
                                                }`}
                                        >
                                            <span className="font-bold">{opt.label}</span>
                                            <input
                                                type="radio"
                                                name="discipline"
                                                className="hidden"
                                                checked={discipline === opt.id}
                                                onChange={() => setDiscipline(opt.id)}
                                            />
                                            {discipline === opt.id && (
                                                <div className="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center text-white">
                                                    <Check size={14} strokeWidth={3} />
                                                </div>
                                            )}
                                        </label>
                                    ))}
                                </div>
                            </section>

                            {/* Section 2: Départements */}
                            <section>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Départements</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { code: '31', label: 'Haute-Garonne' },
                                        { code: '09', label: 'Ariège' }
                                    ].map((dept) => (
                                        <label
                                            key={dept.code}
                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${departements[dept.code]
                                                    ? 'border-brand-500 bg-brand-50 text-brand-900'
                                                    : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${departements[dept.code] ? 'bg-brand-500 border-brand-500 text-white' : 'border-gray-300 bg-white'
                                                }`}>
                                                {departements[dept.code] && <Check size={12} strokeWidth={3} />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={departements[dept.code] || false}
                                                onChange={() => toggleDepartement(dept.code)}
                                            />
                                            <div>
                                                <span className="block font-black text-lg leading-none">{dept.code}</span>
                                                <span className="text-[10px] font-bold uppercase opacity-80">{dept.label}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Footer (Apply) */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
                            <button
                                onClick={closeFilters}
                                className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-bold rounded-xl shadow-button hover:from-brand-700 hover:to-brand-600 active:scale-[0.98] transition-all"
                            >
                                Afficher les résultats
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default FilterBottomSheet;
