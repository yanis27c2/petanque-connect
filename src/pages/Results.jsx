import React, { useState } from 'react';
import { Camera, Plus, Award } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import ResultsFeed from '../components/results/ResultsFeed';
import ResultCreator from '../components/results/ResultCreator';

const Results = () => {
    const { isAuthenticated } = useAuthStore();
    const [showCreator, setShowCreator] = useState(false);
    const [activeTab, setActiveTab] = useState('all'); // 'all' | 'mine'
    const [refreshKey, setRefreshKey] = useState(0);

    const handleCreated = () => {
        setRefreshKey(k => k + 1); // force re-fetch
        setActiveTab('all');
    };

    return (
        <div className="animate-fade-in pb-24">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-button">
                        <Award size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">Résultats</h1>
                        <p className="text-sm text-gray-500">Partagez vos performances</p>
                    </div>
                </div>
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-2 mb-5">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'all'
                            ? 'bg-brand-600 text-white shadow-button'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                >
                    🌍 Tous
                </button>
                {isAuthenticated && (
                    <button
                        onClick={() => setActiveTab('mine')}
                        className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'mine'
                                ? 'bg-brand-600 text-white shadow-button'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                    >
                        👤 Mes résultats
                    </button>
                )}
            </div>

            {/* Feed */}
            <ResultsFeed filter={activeTab} refreshKey={refreshKey} />

            {/* FAB — Create result (auth only) */}
            {isAuthenticated && (
                <button
                    onClick={() => setShowCreator(true)}
                    className="fixed bottom-24 right-5 w-14 h-14 bg-gradient-to-br from-brand-500 to-indigo-500 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all active:scale-90 flex items-center justify-center z-40 group"
                >
                    <Plus size={26} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
            )}

            {/* Creator modal */}
            {showCreator && (
                <ResultCreator
                    onClose={() => setShowCreator(false)}
                    onCreated={handleCreated}
                />
            )}
        </div>
    );
};

export default Results;
