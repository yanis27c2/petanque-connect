import React from 'react';
import { Heart } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const FavoriteButton = ({ type, id, className = '' }) => {
    const { user, toggleFavorite } = useAuthStore();

    if (!user) return null;

    const isFavorite = user.favoris?.[type]?.includes(id);

    const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(type, id);
    };

    return (
        <button
            onClick={handleClick}
            className={`p-2 rounded-full transition-all active:scale-90 ${isFavorite
                    ? 'bg-rose-50 text-rose-500 hover:bg-rose-100'
                    : 'bg-white/80 text-gray-400 hover:bg-white hover:text-rose-400'
                } ${className}`}
        >
            <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} className={isFavorite ? 'animate-heart-beat' : ''} />
        </button>
    );
};

export default FavoriteButton;
