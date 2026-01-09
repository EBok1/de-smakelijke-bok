'use client';

const FAVORITES_KEY = 'smakelijke-bok-favorites';

export function getFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addFavorite(slug: string): string[] {
  const favorites = getFavorites();
  if (!favorites.includes(slug)) {
    favorites.push(slug);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
  return favorites;
}

export function removeFavorite(slug: string): string[] {
  const favorites = getFavorites().filter((f) => f !== slug);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  return favorites;
}

export function toggleFavorite(slug: string): { favorites: string[]; isFavorite: boolean } {
  const favorites = getFavorites();
  const isFavorite = favorites.includes(slug);
  
  if (isFavorite) {
    return { favorites: removeFavorite(slug), isFavorite: false };
  } else {
    return { favorites: addFavorite(slug), isFavorite: true };
  }
}

export function isFavorite(slug: string): boolean {
  return getFavorites().includes(slug);
}
