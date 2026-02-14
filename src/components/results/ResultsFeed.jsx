import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { api } from '../../api/config';
import useAuthStore from '../../store/useAuthStore';
import ResultCard from './ResultCard';

const ResultsFeed = ({ filter = 'all', refreshKey = 0 }) => {
    const { user } = useAuthStore();
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const fetchResults = useCallback(async (pageNum = 1, append = false) => {
        if (pageNum === 1) setIsLoading(true);
        else setIsLoadingMore(true);

        try {
            const endpoint = filter === 'mine'
                ? '/results/mine'
                : `/results?page=${pageNum}&limit=10`;

            const res = await api.get(endpoint);
            if (res.ok) {
                const data = await res.json();
                const items = filter === 'mine' ? data : data.results;
                const more = filter === 'mine' ? false : data.hasMore;

                if (append) {
                    setResults(prev => [...prev, ...items]);
                } else {
                    setResults(items);
                }
                setHasMore(more);
                setPage(pageNum);
            }
        } catch (e) {
            console.error('Feed fetch error:', e);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchResults(1, false);
    }, [fetchResults, refreshKey]);

    // ── Like handler ──
    const handleLike = async (resultId) => {
        try {
            const res = await api.post(`/results/${resultId}/like`);
            if (res.ok) {
                const data = await res.json();
                setResults(prev => prev.map(r =>
                    r.id === resultId
                        ? { ...r, likes: data.liked ? [...(r.likes || []), user?.id] : (r.likes || []).filter(id => id !== user?.id) }
                        : r
                ));
            }
        } catch (e) {
            console.error('Like error:', e);
        }
    };

    // ── Delete handler ──
    const handleDelete = async (resultId) => {
        if (!confirm('Supprimer ce résultat ?')) return;
        try {
            const res = await api.delete(`/results/${resultId}`);
            if (res.ok) {
                setResults(prev => prev.filter(r => r.id !== resultId));
            }
        } catch (e) {
            console.error('Delete error:', e);
        }
    };

    // ── Loading ──
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <Loader2 size={28} className="animate-spin text-brand-500 mb-3" />
                <p className="text-sm text-gray-400">Chargement du flux...</p>
            </div>
        );
    }

    // ── Empty state ──
    if (results.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="text-4xl mb-3">📸</div>
                <p className="text-gray-500 font-medium">
                    {filter === 'mine' ? 'Tu n\'as pas encore publié de résultat' : 'Aucun résultat publié'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    {filter === 'mine' ? 'Appuie sur + pour créer ta première carte !' : 'Sois le premier à partager !'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {results.map(result => (
                <ResultCard
                    key={result.id}
                    result={result}
                    currentUserId={user?.id}
                    onLike={handleLike}
                    onDelete={handleDelete}
                />
            ))}

            {/* Load more */}
            {hasMore && (
                <div className="flex justify-center pt-2">
                    <button
                        onClick={() => fetchResults(page + 1, true)}
                        disabled={isLoadingMore}
                        className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoadingMore ? (
                            <><Loader2 size={16} className="animate-spin" /> Chargement...</>
                        ) : (
                            'Voir plus'
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ResultsFeed;
