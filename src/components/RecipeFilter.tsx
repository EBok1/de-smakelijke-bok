'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface RecipeFilterProps {
  locale: string;
}

export default function RecipeFilter({ locale }: RecipeFilterProps) {
  const t = useTranslations('recipes.filter');
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentCategory = searchParams.get('category') || 'all';
  const currentTag = searchParams.get('tag') || 'all';

  const categories = [
    { value: 'all', label: t('all') },
    { value: 'appetizer', label: t('appetizer') },
    { value: 'main-course', label: t('mainCourse') },
    { value: 'dessert', label: t('dessert') },
  ];

  const tags = [
    { value: 'all', label: t('all') },
    { value: 'sweet', label: t('sweet') },
    { value: 'savory', label: t('savory') },
    { value: 'easy', label: t('easy') },
  ];

  const updateFilter = (type: 'category' | 'tag', value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === 'all') {
      params.delete(type);
    } else {
      params.set(type, value);
    }
    
    router.push(`/${locale}/recipes?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => updateFilter('category', cat.value)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${currentCategory === cat.value 
                ? 'bg-sage text-white shadow-md' 
                : 'bg-cream-dark text-brown hover:bg-sage-light'
              }
            `}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag.value}
            onClick={() => updateFilter('tag', tag.value)}
            className={`
              px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200
              ${currentTag === tag.value 
                ? 'bg-peach text-brown-dark shadow-md' 
                : 'bg-cream-dark text-brown-light hover:bg-peach-light'
              }
            `}
          >
            {tag.label}
          </button>
        ))}
      </div>
    </div>
  );
}
