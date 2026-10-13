import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getAllRecipes, getRecipeIngredients, type RecipeMeta } from '@/lib/recipes';
import type { PlannerRecipe } from '@/lib/planner';
import PlannerClient from './PlannerClient';

interface PlannerPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PlannerPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'planner' });
  return { title: t('title') };
}

// prepTime/cookTime are free text like "10 min"
function totalMinutes(recipe: RecipeMeta): number | null {
  const toMinutes = (value: string) => {
    const match = value.match(/(\d+)\s*min/i);
    return match ? Number(match[1]) : null;
  };
  const prep = toMinutes(recipe.prepTime);
  const cook = toMinutes(recipe.cookTime);
  if (prep === null && cook === null) return null;
  return (prep ?? 0) + (cook ?? 0);
}

export default async function PlannerPage({ params }: PlannerPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const recipeLocale = locale as 'nl' | 'en';
  const recipes: PlannerRecipe[] = getAllRecipes(recipeLocale).map((recipe) => ({
    slug: recipe.slug,
    title: recipe.title,
    image: recipe.image,
    category: recipe.category,
    tags: recipe.tags,
    minutes: totalMinutes(recipe),
    servings: recipe.servings,
    ingredients: getRecipeIngredients(recipe.slug, recipeLocale),
  }));

  return <PlannerClient locale={recipeLocale} recipes={recipes} />;
}
