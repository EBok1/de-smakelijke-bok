'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import FavoriteButton from './FavoriteButton';
import type { RecipeMeta } from '@/lib/recipes';

interface RecipeCardProps {
  recipe: RecipeMeta;
  locale: string;
}

export default function RecipeCard({ recipe, locale }: RecipeCardProps) {
  const t = useTranslations('recipes.filter');
  
  const categoryColors: Record<string, string> = {
    'appetizer': 'bg-dusty-blue-light text-brown-dark',
    'main-course': 'bg-sage-light text-brown-dark',
    'dessert': 'bg-peach-light text-brown-dark',
  };

  // Map category to translation key
  const categoryTranslations: Record<string, string> = {
    'appetizer': t('appetizer'),
    'main-course': t('mainCourse'),
    'dessert': t('dessert'),
  };

  // Map tags to translation keys
  const tagTranslations: Record<string, string> = {
    'sweet': t('sweet'),
    'savory': t('savory'),
    'easy': t('easy'),
    'vegan': t('vegan'),
    'airfryer': t('airfryer'),
  };

  // Calculate total time from prepTime and cookTime
  const getTotalTime = () => {
    const parseMinutes = (timeStr: string): number => {
      const match = timeStr.match(/(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    };
    
    const prepMinutes = parseMinutes(recipe.prepTime || '');
    const cookMinutes = parseMinutes(recipe.cookTime || '');
    const total = prepMinutes + cookMinutes;
    
    return total > 0 ? `${total} min` : recipe.prepTime;
  };

  return (
    <Link 
      href={`/${locale}/recipes/${recipe.slug}`}
      className="group block"
    >
      <article className="card h-full flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300">
        {/* Image */}
        <div className="relative h-48 -mx-6 -mt-6 mb-4 overflow-hidden bg-cream">
          {recipe.image ? (
            <Image
              src={recipe.image}
              alt={recipe.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sage-light to-peach-light">
              <span className="text-4xl">🍳</span>
            </div>
          )}
          
          {/* Favorite button */}
          <div className="absolute top-3 right-3">
            <FavoriteButton slug={recipe.slug} size="sm" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {/* Category and tags */}
          <div className="mb-2 flex flex-wrap gap-1.5">
            <span className={`tag text-xs ${categoryColors[recipe.category] || 'bg-cream-dark'}`}>
              {categoryTranslations[recipe.category] || recipe.category.replace('-', ' ')}
            </span>
            {recipe.tags.slice(0, 2).map((tag) => (
              <span 
                key={tag} 
                className="tag text-xs bg-cream-dark text-brown-light"
              >
                {tagTranslations[tag] || tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-brown-dark mb-2 group-hover:text-sage-dark transition-colors">
            {recipe.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-brown-light flex-1 line-clamp-2 mb-4">
            {recipe.description}
          </p>

          {/* Meta info */}
          <div className="flex items-center gap-4 text-xs text-brown-light mt-auto pt-3 border-t border-cream">
            <span className="flex items-center gap-1">
              <ClockIcon />
              {getTotalTime()}
            </span>
            <span className="flex items-center gap-1">
              <UsersIcon />
              {recipe.servings}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
