import { useTranslations } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { filterRecipes } from '@/lib/recipes';
import RecipeCard from '@/components/RecipeCard';
import RecipeFilter from '@/components/RecipeFilter';

interface RecipesPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; tag?: string }>;
}

export async function generateMetadata({ params }: RecipesPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'recipes' });
  
  return {
    title: t('title'),
  };
}

export default async function RecipesPage({ params, searchParams }: RecipesPageProps) {
  const { locale } = await params;
  const { category, tag } = await searchParams;
  
  // Enable static rendering
  setRequestLocale(locale);
  
  const recipes = filterRecipes(category, tag, locale as 'nl' | 'en');

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 animate-fade-in">
      <RecipesHeader />
      <RecipeFilter locale={locale} />
      <RecipesList locale={locale} recipes={recipes} />
    </div>
  );
}

function RecipesHeader() {
  const t = useTranslations('recipes');
  
  return (
    <h1 className="text-3xl md:text-4xl font-bold text-brown-dark mb-8">
      {t('title')}
    </h1>
  );
}

function RecipesList({ locale, recipes }: { locale: string; recipes: ReturnType<typeof filterRecipes> }) {
  const t = useTranslations('recipes');

  if (recipes.length === 0) {
    return (
      <div className="text-center py-16 bg-cream-dark rounded-2xl">
        <p className="text-brown-light text-lg mb-4">
          {t('noResults')}
        </p>
        <span className="text-4xl">🔍</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.slug} recipe={recipe} locale={locale} />
      ))}
    </div>
  );
}
