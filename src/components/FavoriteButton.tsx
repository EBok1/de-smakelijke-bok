'use client';

import { useState } from 'react';
import { useSingleFavorite } from '@/hooks/useFavorites';

interface FavoriteButtonProps {
  slug: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
};

export default function FavoriteButton({ slug, size = 'md', className = '' }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, isLoaded } = useSingleFavorite(slug);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAnimating(true);
    toggleFavorite();
    setTimeout(() => setIsAnimating(false), 300);
  };

  if (!isLoaded) {
    return (
      <button
        className={`${sizes[size]} rounded-full bg-cream-dark flex items-center justify-center ${className}`}
        disabled
      >
        <HeartIcon size={iconSizes[size]} filled={false} />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`
        ${sizes[size]} 
        rounded-full 
        bg-cream-dark 
        hover:bg-peach-light 
        flex items-center justify-center 
        transition-all duration-200
        hover:scale-110
        active:scale-95
        ${isAnimating ? 'heart-pop' : ''}
        ${className}
      `}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <HeartIcon 
        size={iconSizes[size]} 
        filled={isFavorite} 
        className={isFavorite ? 'text-peach-dark' : 'text-brown-light'}
      />
    </button>
  );
}

function HeartIcon({ size, filled, className = '' }: { size: number; filled: boolean; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-colors duration-200 ${className}`}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
