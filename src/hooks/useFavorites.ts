'use client';

import { useState, useEffect, useCallback } from 'react';
import { getFavorites, toggleFavorite as toggle, isFavorite as checkFavorite } from '@/lib/favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setFavorites(getFavorites());
    setIsLoaded(true);
  }, []);

  const toggleFavorite = useCallback((slug: string) => {
    const result = toggle(slug);
    setFavorites(result.favorites);
    return result.isFavorite;
  }, []);

  const isFavorite = useCallback((slug: string) => {
    return favorites.includes(slug);
  }, [favorites]);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    isLoaded,
  };
}

export function useSingleFavorite(slug: string) {
  const [isFav, setIsFav] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsFav(checkFavorite(slug));
    setIsLoaded(true);
  }, [slug]);

  const toggleFavorite = useCallback(() => {
    const result = toggle(slug);
    setIsFav(result.isFavorite);
    return result.isFavorite;
  }, [slug]);

  return {
    isFavorite: isFav,
    toggleFavorite,
    isLoaded,
  };
}
