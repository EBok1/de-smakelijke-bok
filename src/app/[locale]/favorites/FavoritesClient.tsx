'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useFavorites } from '@/hooks/useFavorites';
import type { RecipeMeta } from '@/lib/recipes';
import RecipeCard from '@/components/RecipeCard';

interface FavoritesClientProps {
  locale: string;
  allRecipes: RecipeMeta[];
}

export default function FavoritesClient({ locale, allRecipes }: FavoritesClientProps) {
  const t = useTranslations('favorites');
  const { favorites, isLoaded } = useFavorites();

  const favoriteRecipes = allRecipes.filter((recipe) => 
    favorites.includes(recipe.slug)
  );

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold text-brown-dark mb-8">
          {t('title')}
        </h1>
        <div className="text-center py-16">
          <div className="animate-bounce-slow inline-block">
            <Image
              src="/images/logo.png"
              alt="Loading..."
              width={120}
              height={120}
              className="rounded-full"
            />
          </div>
          <p className="text-brown-light mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 animate-fade-in">
      <h1 className="text-3xl md:text-4xl font-bold text-brown-dark mb-8">
        {t('title')}
      </h1>

      {favoriteRecipes.length === 0 ? (
        <div className="text-center py-16 bg-cream-dark rounded-2xl">
          <div className="mb-6 inline-block">
            <Image
              src="/images/logo.png"
              alt="No favorites yet"
              width={120}
              height={120}
              className="rounded-full opacity-70"
            />
          </div>
          <p className="text-brown-light text-lg max-w-md mx-auto">
            {t('empty')}
          </p>
          <div className="mt-6 text-4xl">💔</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteRecipes.map((recipe) => (
            <RecipeCard key={recipe.slug} recipe={recipe} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
