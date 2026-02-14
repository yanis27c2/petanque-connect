import React, { useState, useEffect } from 'react';
import { ExternalLink, Clock, RefreshCw, Loader2, AlertTriangle, Newspaper, Trophy, Wrench, Globe2, Package } from 'lucide-react';
import { api } from '../../api/config';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const CATEGORY_CONFIG = {
    compétition: { icon: Trophy, color: 'text-amber-600 bg-amber-50', label: 'Compétition' },
    technique: { icon: Wrench, color: 'text-blue-600 bg-blue-50', label: 'Technique' },
    événement: { icon: Globe2, color: 'text-purple-600 bg-purple-50', label: 'Événement' },
    matériel: { icon: Package, color: 'text-green-600 bg-green-50', label: 'Matériel' },
    international: { icon: Globe2, color: 'text-indigo-600 bg-indigo-50', label: 'International' },
    actualité: { icon: Newspaper, color: 'text-gray-600 bg-gray-100', label: 'Actualité' },
};

const NewsFeed = () => {
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchNews = async (showRefresh = false) => {
        if (showRefresh) setIsRefreshing(true);
        else setIsLoading(true);
        setError(null);

        try {
            const res = await api.get('/news/petanque');
            if (res.ok) {
                const data = await res.json();
                setArticles(data);
            } else {
                setError('Impossible de charger les actualités.');
            }
        } catch (e) {
            console.error('News fetch error:', e);
            setError('Erreur de connexion au serveur.');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    // ── Loading skeleton ──
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-card animate-pulse">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-16 h-5 bg-gray-200 rounded-full" />
                            <div className="w-20 h-4 bg-gray-100 rounded" />
                        </div>
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-4 bg-gray-100 rounded w-full mb-1" />
                        <div className="h-4 bg-gray-100 rounded w-2/3 mb-4" />
                        <div className="h-10 bg-gray-100 rounded-xl w-40" />
                    </div>
                ))}
            </div>
        );
    }

    // ── Error state ──
    if (error) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-danger-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle size={28} className="text-danger-500" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Oups !</h3>
                <p className="text-sm text-gray-500 mb-4">{error}</p>
                <button
                    onClick={() => fetchNews()}
                    className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-all active:scale-95"
                >
                    Réessayer
                </button>
            </div>
        );
    }

    // ── Empty state ──
    if (articles.length === 0) {
        return (
            <div className="text-center py-12">
                <Newspaper size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">Aucune actualité pour le moment</p>
                <p className="text-xs text-gray-400 mt-1">Revenez plus tard !</p>
            </div>
        );
    }

    // ── Articles list ──
    return (
        <div className="space-y-4">
            {/* Refresh button */}
            <div className="flex justify-end">
                <button
                    onClick={() => fetchNews(true)}
                    disabled={isRefreshing}
                    className="flex items-center gap-1.5 text-xs text-brand-600 font-bold px-3 py-1.5 bg-brand-50 rounded-full hover:bg-brand-100 transition-all active:scale-95 disabled:opacity-50"
                >
                    <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
                    {isRefreshing ? 'Actualisation...' : 'Actualiser'}
                </button>
            </div>

            {/* Article cards */}
            {articles.map((article, index) => {
                const cat = CATEGORY_CONFIG[article.category] || CATEGORY_CONFIG.actualité;
                const CatIcon = cat.icon;
                const articleDate = article.date ? new Date(article.date) : null;

                return (
                    <article
                        key={index}
                        className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group"
                        style={{ animationDelay: `${index * 80}ms` }}
                    >
                        {/* Colored top bar */}
                        <div className="h-1 bg-gradient-to-r from-brand-400 to-brand-600 opacity-60 group-hover:opacity-100 transition-opacity" />

                        <div className="p-5">
                            {/* Category + Date */}
                            <div className="flex items-center gap-2 mb-3">
                                <span className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${cat.color}`}>
                                    <CatIcon size={12} />
                                    {cat.label}
                                </span>
                                {articleDate && (
                                    <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                        <Clock size={11} />
                                        {formatDistanceToNow(articleDate, { addSuffix: true, locale: fr })}
                                    </span>
                                )}
                            </div>

                            {/* Title */}
                            <h3 className="text-base font-extrabold text-gray-900 mb-2 leading-snug group-hover:text-brand-600 transition-colors">
                                {article.title}
                            </h3>

                            {/* Source */}
                            <p className="text-[11px] text-gray-400 font-medium mb-2">
                                {article.source} {articleDate && `— ${articleDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                            </p>

                            {/* Summary */}
                            <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">
                                {article.summary}
                            </p>

                            {/* CTA button */}
                            <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl text-sm font-bold shadow-button hover:shadow-lg transition-all active:scale-[0.97] group/btn"
                            >
                                Lire l'article
                                <ExternalLink size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                            </a>
                        </div>
                    </article>
                );
            })}
        </div>
    );
};

export default NewsFeed;
