'use client';

import { createLocalStore } from './store';

export interface FavoriteList {
  id: string;
  name: string;
  slugs: string[];
}

// Same key as before, so existing favorites carry over
export const favoritesStore = createLocalStore<string[]>('smakelijke-bok-favorites', []);
export const favoriteListsStore = createLocalStore<FavoriteList[]>(
  'smakelijke-bok-favorite-lists',
  [],
);

export function addFavorite(slug: string) {
  favoritesStore.set((prev) => (prev.includes(slug) ? prev : [...prev, slug]));
}

/** Unfavoriting also takes the recipe out of every list. */
export function removeFavorite(slug: string) {
  favoritesStore.set((prev) => prev.filter((s) => s !== slug));
  favoriteListsStore.set((prev) =>
    prev.map((list) => ({ ...list, slugs: list.slugs.filter((s) => s !== slug) })),
  );
}

export function createList(name: string, slug?: string): string {
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  favoriteListsStore.set((prev) => [
    ...prev,
    { id, name: name.trim(), slugs: slug ? [slug] : [] },
  ]);
  if (slug) addFavorite(slug);
  return id;
}

export function renameList(id: string, name: string) {
  favoriteListsStore.set((prev) =>
    prev.map((list) => (list.id === id ? { ...list, name: name.trim() } : list)),
  );
}

export function deleteList(id: string) {
  favoriteListsStore.set((prev) => prev.filter((list) => list.id !== id));
}

/** Putting a recipe in a list also makes it a favorite. */
export function toggleInList(id: string, slug: string) {
  favoriteListsStore.set((prev) =>
    prev.map((list) => {
      if (list.id !== id) return list;
      const has = list.slugs.includes(slug);
      return { ...list, slugs: has ? list.slugs.filter((s) => s !== slug) : [...list.slugs, slug] };
    }),
  );
  addFavorite(slug);
}
