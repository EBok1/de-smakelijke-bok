'use client';

import { useCallback, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useFavoriteLists, useSingleFavorite } from '@/hooks/useFavorites';
import { createList, toggleInList } from '@/lib/favorites';
import Popover from './Popover';

interface FavoriteButtonProps {
  slug: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
};

export default function FavoriteButton({ slug, size = 'md', className = '' }: FavoriteButtonProps) {
  const t = useTranslations('favorites');
  const { isFavorite, isLoaded, add, remove } = useSingleFavorite(slug);
  const [isAnimating, setIsAnimating] = useState(false);
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);

  // First click saves it; the panel then offers lists (and un-saving)
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isFavorite) {
      add();
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }
    setOpen((o) => !o);
  };

  if (!isLoaded) {
    return (
      <button
        className={`${sizes[size]} rounded-full bg-cream-dark flex items-center justify-center ${className}`}
        disabled
        aria-label={t('addToFavorites')}
      >
        <HeartIcon size={iconSizes[size]} filled={false} />
      </button>
    );
  }

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleClick}
        className={`
          ${sizes[size]}
          rounded-full
          bg-cream-dark
          hover:bg-peach-light
          flex items-center justify-center
          transition-colors duration-200
          ${isAnimating ? 'heart-pop' : ''}
          ${className}
        `}
        aria-label={isFavorite ? t('saved') : t('addToFavorites')}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <HeartIcon
          size={iconSizes[size]}
          filled={isFavorite}
          className={isFavorite ? 'text-peach-dark' : 'text-brown-light'}
        />
      </button>

      <Popover anchorRef={buttonRef} open={open} onClose={close} label={t('saveToList')}>
        <ListPicker
          slug={slug}
          onRemove={() => {
            remove();
            close();
          }}
        />
      </Popover>
    </>
  );
}

function ListPicker({ slug, onRemove }: { slug: string; onRemove: () => void }) {
  const t = useTranslations('favorites');
  const lists = useFavoriteLists();
  const [name, setName] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createList(name, slug);
    setName('');
  };

  return (
    <div className="text-sm">
      <p className="font-heading font-semibold text-brown-dark mb-1">{t('savedTitle')}</p>
      <p className="text-brown-light mb-3">{t('saveToList')}</p>

      {lists.length > 0 && (
        <ul className="flex flex-col gap-1 mb-3 max-h-48 overflow-y-auto">
          {lists.map((list) => {
            const checked = list.slugs.includes(slug);
            return (
              <li key={list.id}>
                <button
                  type="button"
                  aria-pressed={checked}
                  onClick={() => toggleInList(list.id, slug)}
                  className="popover-option"
                >
                  <span className="popover-check" data-checked={checked || undefined} aria-hidden="true">
                    {checked ? '✓' : ''}
                  </span>
                  <span className="truncate">{list.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <form onSubmit={submit} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('newListPlaceholder')}
          aria-label={t('newList')}
          maxLength={40}
          className="popover-input"
        />
        <button type="submit" className="popover-add" disabled={!name.trim()}>
          {t('add')}
        </button>
      </form>

      <button type="button" onClick={onRemove} className="popover-remove">
        {t('removeFromFavorites')}
      </button>
    </div>
  );
}

function HeartIcon({ size, filled, className = '' }: { size: number; filled: boolean; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-colors duration-200 ${className}`}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
