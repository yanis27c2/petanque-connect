import React from 'react';
import { Newspaper } from 'lucide-react';
import NewsFeed from '../components/news/NewsFeed';

const News = () => {
    return (
        <div className="animate-fade-in pb-20">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center text-white shadow-button">
                    <Newspaper size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">Actualités</h1>
                    <p className="text-sm text-gray-500">Les dernières nouvelles de la pétanque</p>
                </div>
            </div>

            {/* News Feed */}
            <NewsFeed />
        </div>
    );
};

export default News;
