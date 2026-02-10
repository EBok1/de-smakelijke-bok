import { notFound } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getRecipeBySlug, getAllSlugs } from '@/lib/recipes';
import FavoriteButton from '@/components/FavoriteButton';
import CookingModeToggle from '@/components/CookingModeToggle';
import PrintButton from '@/components/PrintButton';

interface RecipeDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: RecipeDetailPageProps) {
  const { locale, slug } = await params;
  const recipe = getRecipeBySlug(slug, locale as 'nl' | 'en');
  
  if (!recipe) {
    return { title: 'Recipe not found' };
  }
  
  return {
    title: recipe.title,
    description: recipe.description,
  };
}

export default async function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  const { locale, slug } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);
  
  const recipe = getRecipeBySlug(slug, locale as 'nl' | 'en');

  if (!recipe) {
    notFound();
  }

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-cream to-cream-dark">
        {/* Image */}
        <div className="relative h-64 md:h-96 w-full">
          {recipe.image ? (
            <Image
              src={recipe.image}
              alt={recipe.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sage-light to-peach-light">
              <span className="text-8xl">🍳</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-cream via-transparent to-transparent" />
        </div>

        {/* Content Overlay */}
        <div className="container mx-auto px-4 -mt-20 relative z-10">
          <div className="bg-cream rounded-2xl p-6 md:p-8 shadow-lg">
            <RecipeHeader locale={locale} recipe={recipe} />
          </div>
        </div>
      </section>

      {/* Recipe Content */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <RecipeContent locale={locale} content={recipe.content} />
      </section>
    </div>
  );
}

function RecipeHeader({ locale, recipe }: { locale: string; recipe: NonNullable<ReturnType<typeof getRecipeBySlug>> }) {
  const t = useTranslations('recipes');
  const tFilter = useTranslations('recipes.filter');
  const tCommon = useTranslations('common');

  const categoryColors: Record<string, string> = {
    'appetizer': 'bg-dusty-blue-light text-brown-dark',
    'main-course': 'bg-sage-light text-brown-dark',
    'dessert': 'bg-peach-light text-brown-dark',
  };

  // Map category to translation key
  const categoryTranslations: Record<string, string> = {
    'appetizer': tFilter('appetizer'),
    'main-course': tFilter('mainCourse'),
    'dessert': tFilter('dessert'),
  };

  // Map tags to translation keys
  const tagTranslations: Record<string, string> = {
    'sweet': tFilter('sweet'),
    'savory': tFilter('savory'),
    'easy': tFilter('easy'),
  };

  return (
    <>
      {/* Back link */}
      <Link
        href={`/${locale}/recipes`}
        className="inline-flex items-center gap-2 text-sage-dark hover:text-sage mb-4 font-medium print:hidden"
      >
        <span>←</span>
        {tCommon('backToRecipes')}
      </Link>

      {/* Title and Favorite */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <h1 className="text-2xl md:text-4xl font-bold text-brown-dark">
          {recipe.title}
        </h1>
        <FavoriteButton slug={recipe.slug} size="lg" className="print:hidden" />
      </div>

      {/* Description */}
      <p className="text-lg text-brown-light mb-6">
        {recipe.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className={`tag ${categoryColors[recipe.category] || 'bg-cream-dark'}`}>
          {categoryTranslations[recipe.category] || recipe.category.replace('-', ' ')}
        </span>
        {recipe.tags.map((tag) => (
          <span key={tag} className="tag bg-cream-dark">
            {tagTranslations[tag] || tag}
          </span>
        ))}
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-6 text-sm text-brown-light border-t border-cream-dark pt-4">
        <div className="flex items-center gap-2">
          <ClockIcon />
          <span>
            <strong>{t('prepTime')}:</strong> {recipe.prepTime}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <FireIcon />
          <span>
            <strong>{t('cookTime')}:</strong> {recipe.cookTime}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <UsersIcon />
          <span>
            <strong>{t('servings')}:</strong> {recipe.servings}
          </span>
        </div>
        <div className="ml-auto flex items-start gap-3 print:hidden">
          <PrintButton />
          <CookingModeToggle />
        </div>
      </div>
    </>
  );
}

function RecipeContent({ locale, content }: { locale: string; content: string }) {
  return (
    <div className="prose prose-lg max-w-none
      prose-headings:font-heading prose-headings:text-brown-dark
      prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
      prose-p:text-brown prose-p:leading-relaxed
      prose-li:text-brown prose-li:marker:text-sage
      prose-strong:text-brown-dark
      prose-ul:my-4 prose-ol:my-4
    ">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sage">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  );
}

function FireIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-peach">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-dusty-blue">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
