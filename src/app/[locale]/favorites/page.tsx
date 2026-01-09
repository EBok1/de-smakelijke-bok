import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getAllRecipes } from '@/lib/recipes';
import FavoritesClient from './FavoritesClient';

interface FavoritesPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: FavoritesPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'favorites' });
  
  return {
    title: t('title'),
  };
}

export default async function FavoritesPage({ params }: FavoritesPageProps) {
  const { locale } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);
  
  const allRecipes = getAllRecipes(locale as 'nl' | 'en');

  return <FavoritesClient locale={locale} allRecipes={allRecipes} />;
}
