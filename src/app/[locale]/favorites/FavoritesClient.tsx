'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useFavoriteLists, useFavorites } from '@/hooks/useFavorites';
import { createList, deleteList, renameList } from '@/lib/favorites';
import type { RecipeMeta } from '@/lib/recipes';
import RecipeCard from '@/components/RecipeCard';

interface FavoritesClientProps {
  locale: string;
  allRecipes: RecipeMeta[];
}

const ALL = 'all';

export default function FavoritesClient({ locale, allRecipes }: FavoritesClientProps) {
  const t = useTranslations('favorites');
  const { favorites, isLoaded } = useFavorites();
  const lists = useFavoriteLists();
  const [selected, setSelected] = useState<string>(ALL);
  const [mode, setMode] = useState<'idle' | 'new' | 'rename' | 'delete'>('idle');
  const [draft, setDraft] = useState('');

  // A deleted list falls back to "all" instead of showing nothing
  const activeList = lists.find((list) => list.id === selected);
  const visibleSlugs = activeList ? activeList.slugs : favorites;
  const visibleRecipes = allRecipes.filter((recipe) => visibleSlugs.includes(recipe.slug));

  const startNew = () => {
    setDraft('');
    setMode('new');
  };

  const submitDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    if (mode === 'new') setSelected(createList(draft));
    if (mode === 'rename' && activeList) renameList(activeList.id, draft);
    setMode('idle');
  };

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 pt-12! pb-16! md:pt-16! md:pb-24! animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold text-brown-dark mb-8">
          {t('title')}
        </h1>
        <div className="text-center py-16">
          <div className="animate-bounce-slow inline-block">
            <Image
              src="/images/logo.png"
              alt=""
              width={120}
              height={120}
              className="rounded-full"
            />
          </div>
          <p className="text-brown-light mt-4">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-12! pb-16! md:pt-16! md:pb-24! animate-fade-in">
      <h1 className="text-3xl md:text-4xl font-bold text-brown-dark mb-8">
        {t('title')}
      </h1>

      {favorites.length === 0 ? (
        <div className="text-center py-16 bg-cream-dark rounded-2xl">
          <div className="mb-6 inline-block">
            <Image
              src="/images/logo.png"
              alt=""
              width={120}
              height={120}
              className="rounded-full opacity-70"
            />
          </div>
          <p className="text-brown-light text-lg max-w-md mx-auto">
            {t('empty')}
          </p>
        </div>
      ) : (
        <>
          {/* List filter */}
          <div className="flex flex-wrap items-center gap-2 mb-4" role="group" aria-label={t('lists')}>
            <ListChip
              active={!activeList}
              onClick={() => setSelected(ALL)}
              label={t('allFavorites')}
              count={favorites.length}
            />
            {lists.map((list) => (
              <ListChip
                key={list.id}
                active={activeList?.id === list.id}
                onClick={() => {
                  setSelected(list.id);
                  setMode('idle');
                }}
                label={list.name}
                count={list.slugs.length}
              />
            ))}
            {mode !== 'new' && (
              <button type="button" onClick={startNew} className="chip chip-ghost">
                + {t('newList')}
              </button>
            )}
          </div>

          {/* New / rename form, or delete confirmation */}
          {(mode === 'new' || mode === 'rename') && (
            <form onSubmit={submitDraft} className="flex flex-wrap gap-2 mb-6 max-w-md">
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t('newListPlaceholder')}
                aria-label={mode === 'new' ? t('newList') : t('renameList')}
                maxLength={40}
                className="field flex-1 min-w-0"
              />
              <button type="submit" className="btn btn-primary py-2!" disabled={!draft.trim()}>
                {mode === 'new' ? t('create') : t('save')}
              </button>
              <button type="button" className="text-link px-2" onClick={() => setMode('idle')}>
                {t('cancel')}
              </button>
            </form>
          )}

          {activeList && mode === 'idle' && (
            <div className="flex flex-wrap gap-4 mb-6 text-sm">
              <button
                type="button"
                className="text-link"
                onClick={() => {
                  setDraft(activeList.name);
                  setMode('rename');
                }}
              >
                {t('renameList')}
              </button>
              <button type="button" className="text-link" onClick={() => setMode('delete')}>
                {t('deleteList')}
              </button>
            </div>
          )}

          {activeList && mode === 'delete' && (
            <div className="flex flex-wrap items-center gap-3 mb-6 text-sm" role="alert">
              <span className="text-brown">{t('deleteConfirm', { name: activeList.name })}</span>
              <button
                type="button"
                className="btn btn-primary py-2!"
                onClick={() => {
                  deleteList(activeList.id);
                  setSelected(ALL);
                  setMode('idle');
                }}
              >
                {t('deleteYes')}
              </button>
              <button type="button" className="text-link" onClick={() => setMode('idle')}>
                {t('cancel')}
              </button>
            </div>
          )}

          {visibleRecipes.length === 0 ? (
            <p className="text-brown-light py-12 text-center bg-cream-dark rounded-2xl">
              {t('emptyList')}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleRecipes.map((recipe) => (
                <RecipeCard key={recipe.slug} recipe={recipe} locale={locale} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ListChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className="chip">
      {label}
      <span className="chip-count">{count}</span>
    </button>
  );
}
