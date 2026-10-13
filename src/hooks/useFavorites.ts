'use client';

import { useStore, useHydrated } from '@/lib/store';
import {
  favoritesStore,
  favoriteListsStore,
  addFavorite,
  removeFavorite,
} from '@/lib/favorites';

export function useFavorites() {
  const [favorites] = useStore(favoritesStore);
  const isLoaded = useHydrated();
  return { favorites, isLoaded };
}

export function useFavoriteLists() {
  const [lists] = useStore(favoriteListsStore);
  return lists;
}

export function useSingleFavorite(slug: string) {
  const [favorites] = useStore(favoritesStore);
  const isLoaded = useHydrated();
  const isFavorite = favorites.includes(slug);

  return {
    isFavorite,
    isLoaded,
    add: () => addFavorite(slug),
    remove: () => removeFavorite(slug),
  };
}
