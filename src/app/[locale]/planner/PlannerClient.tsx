'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useHydrated } from '@/lib/store';
import {
  DEFAULT_WEEK,
  PLAN_MODES,
  addDays,
  buildShoppingList,
  isoWeek,
  resolveWeek,
  startOfWeek,
  weekKey,
  type PlannerRecipe,
} from '@/lib/planner';
import { plannerActions, usePlanner } from '@/hooks/usePlanner';
import Popover from '@/components/Popover';

interface PlannerClientProps {
  locale: 'nl' | 'en';
  recipes: PlannerRecipe[];
}

export default function PlannerClient({ locale, recipes }: PlannerClientProps) {
  const t = useTranslations('planner');
  const hydrated = useHydrated();
  const state = usePlanner();
  const [weekOffset, setWeekOffset] = useState(0);

  const dinners = useMemo(() => recipes.filter((r) => r.category === 'main-course'), [recipes]);
  const bySlug = useMemo(() => new Map(recipes.map((r) => [r.slug, r])), [recipes]);

  // "Today" only exists in the browser; the server renders the shell
  const thisMonday = hydrated ? startOfWeek(new Date()) : null;
  const monday = thisMonday ? addDays(thisMonday, weekOffset * 7) : null;
  const key = monday ? weekKey(monday) : '';
  const settings = state.weeks[key] ?? DEFAULT_WEEK;

  const plan = useMemo(() => {
    if (!monday) return [];
    const lastKey = weekKey(addDays(monday, -7));
    const lastSettings = state.weeks[lastKey] ?? DEFAULT_WEEK;
    // Last week only matters for "try something new"; resolving it without
    // its own history keeps this from chaining back through every week
    const lastWeek = resolveWeek(dinners, lastKey, { ...lastSettings, mode: lastSettings.mode === 'new' ? 'mixed' : lastSettings.mode });
    return resolveWeek(dinners, key, settings, lastWeek);
    // monday is derived from key, so key is the stable dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dinners, key, settings, state.weeks]);

  const shopping = useMemo(() => {
    const planned = plan.flatMap((slug) => (slug && bySlug.get(slug) ? [bySlug.get(slug)!] : []));
    return buildShoppingList(planned, state.persons, locale);
  }, [plan, bySlug, state.persons, locale]);

  if (!monday || !thisMonday) {
    return (
      <div className="container mx-auto px-4 pt-12! pb-16! md:pt-16! md:pb-24!">
        <h1 className="text-3xl md:text-4xl font-bold text-brown-dark mb-3">{t('title')}</h1>
        <p className="text-brown-light">{t('loading')}</p>
      </div>
    );
  }

  const dayFormat = new Intl.DateTimeFormat(locale, { weekday: 'long' });
  const dateFormat = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });
  const today = new Date();
  const todayIndex = weekOffset === 0 ? (today.getDay() + 6) % 7 : -1;
  const hasChanges = Object.keys(settings.overrides).length > 0;
  const checked = state.checked[key] ?? [];

  return (
    <div className="container mx-auto px-4 pt-12! pb-16! md:pt-16! md:pb-24! animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-brown-dark mb-3">{t('title')}</h1>
        <p className="text-brown-light max-w-2xl">{t('intro')}</p>
      </header>

      {/* ── Week + options ── */}
      <section className="planner-toolbar" aria-label={t('options')}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="planner-step"
              onClick={() => setWeekOffset((w) => w - 1)}
              aria-label={t('previousWeek')}
            >
              ←
            </button>
            <p className="font-heading font-semibold text-brown-dark text-lg min-w-0" aria-live="polite">
              {t('week', { week: isoWeek(monday).week })}
              <span className="text-brown-light font-body font-normal text-sm ml-2">
                {dateFormat.format(monday)} – {dateFormat.format(addDays(monday, 6))}
              </span>
            </p>
            <button
              type="button"
              className="planner-step"
              onClick={() => setWeekOffset((w) => w + 1)}
              aria-label={t('nextWeek')}
            >
              →
            </button>
            {weekOffset !== 0 && (
              <button type="button" className="text-link text-sm ml-1" onClick={() => setWeekOffset(0)}>
                {t('thisWeek')}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-brown">
            <span id="persons-label">{t('persons')}</span>
            <button
              type="button"
              className="planner-step"
              onClick={() => plannerActions.setPersons(state.persons - 1)}
              disabled={state.persons <= 1}
              aria-label={t('fewerPersons')}
            >
              −
            </button>
            <span className="w-6 text-center font-semibold text-brown-dark tabular-nums" aria-labelledby="persons-label">
              {state.persons}
            </span>
            <button
              type="button"
              className="planner-step"
              onClick={() => plannerActions.setPersons(state.persons + 1)}
              disabled={state.persons >= 12}
              aria-label={t('morePersons')}
            >
              +
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-4" role="group" aria-label={t('modeLabel')}>
          {PLAN_MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              className="chip"
              aria-pressed={settings.mode === mode}
              onClick={() => plannerActions.setMode(key, mode)}
            >
              {t(`modes.${mode}`)}
            </button>
          ))}
          <span className="flex-1" />
          <button type="button" className="text-link text-sm" onClick={() => plannerActions.shuffle(key)}>
            ↻ {t('shuffle')}
          </button>
          {hasChanges && (
            <button type="button" className="text-link text-sm" onClick={() => plannerActions.resetWeek(key)}>
              {t('resetWeek')}
            </button>
          )}
        </div>
        <p className="text-xs text-brown-light mt-3">{t(`modeHints.${settings.mode}`)}</p>
      </section>

      {/* ── The week ── */}
      <ol className="planner-week" aria-label={t('weekLabel')}>
        {plan.map((slug, day) => {
          const recipe = slug ? bySlug.get(slug) : undefined;
          const date = addDays(monday, day);
          return (
            <li key={day} className="planner-day" data-today={day === todayIndex || undefined}>
              <div className="flex items-baseline justify-between gap-2 mb-2">
                <p className="font-heading font-semibold text-brown-dark capitalize">
                  {dayFormat.format(date)}
                </p>
                <p className="text-xs text-brown-light whitespace-nowrap">
                  {day === todayIndex ? t('today') : dateFormat.format(date)}
                </p>
              </div>

              {recipe ? (
                <Link href={`/${locale}/recipes/${recipe.slug}`} className="planner-dish group">
                  <div className="planner-dish-img">
                    {recipe.image && (
                      <Image src={recipe.image} alt="" fill sizes="(min-width: 80rem) 160px, (min-width: 40rem) 45vw, 100vw" className="object-cover" />
                    )}
                  </div>
                  <span className="recipe-title text-sm font-semibold text-brown-dark leading-snug">
                    <span className="marker">{recipe.title}</span>
                  </span>
                  {recipe.minutes !== null && (
                    <span className="text-xs text-brown-light">{t('minutes', { minutes: recipe.minutes })}</span>
                  )}
                </Link>
              ) : (
                <div className="planner-free">
                  <span aria-hidden="true">🌙</span>
                  {t('freeEvening')}
                </div>
              )}

              <DayMenu
                dinners={dinners}
                current={slug}
                changed={day in settings.overrides}
                onPick={(next) => plannerActions.setDay(key, day, next)}
                onReset={() => plannerActions.resetDay(key, day)}
                dayName={dayFormat.format(date)}
              />
            </li>
          );
        })}
      </ol>

      {/* ── Shopping list ── */}
      <ShoppingSection
        items={shopping.items}
        pantry={shopping.pantry}
        checked={checked}
        onToggle={(item) => plannerActions.toggleChecked(key, item)}
        persons={state.persons}
      />
    </div>
  );
}

function DayMenu({
  dinners,
  current,
  changed,
  onPick,
  onReset,
  dayName,
}: {
  dinners: PlannerRecipe[];
  current: string | null;
  changed: boolean;
  onPick: (slug: string | null) => void;
  onReset: () => void;
  dayName: string;
}) {
  const t = useTranslations('planner');
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);
  const pick = (slug: string | null) => {
    onPick(slug);
    close();
  };

  return (
    <div className="flex items-center justify-between gap-2 mt-auto pt-3">
      <button
        ref={buttonRef}
        type="button"
        className="text-link text-sm"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={t('changeDay', { day: dayName })}
      >
        {current ? t('change') : t('pickRecipe')}
      </button>
      {changed && (
        <button
          type="button"
          className="text-brown-light hover:text-sage-dark px-1"
          onClick={onReset}
          aria-label={t('undo')}
          title={t('undo')}
        >
          ↺
        </button>
      )}

      <Popover anchorRef={buttonRef} open={open} onClose={close} label={t('changeDay', { day: dayName })}>
        <p className="font-heading font-semibold text-brown-dark mb-2 capitalize">{dayName}</p>
        <ul className="flex flex-col gap-1 max-h-72 overflow-y-auto text-sm">
          {dinners.map((recipe) => (
            <li key={recipe.slug}>
              <button
                type="button"
                className="popover-option"
                aria-pressed={recipe.slug === current}
                onClick={() => pick(recipe.slug)}
              >
                <span className="relative w-9 h-9 rounded-md overflow-hidden flex-none bg-cream-dark">
                  {recipe.image && <Image src={recipe.image} alt="" fill sizes="36px" className="object-cover" />}
                </span>
                <span className="min-w-0 truncate">{recipe.title}</span>
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              className="popover-option"
              aria-pressed={current === null}
              onClick={() => pick(null)}
            >
              <span className="w-9 h-9 flex-none grid place-items-center" aria-hidden="true">🌙</span>
              {t('freeEvening')}
            </button>
          </li>
        </ul>
      </Popover>
    </div>
  );
}

function ShoppingSection({
  items,
  pantry,
  checked,
  onToggle,
  persons,
}: {
  items: { key: string; label: string; recipes: string[] }[];
  pantry: { key: string; label: string; recipes: string[] }[];
  checked: string[];
  onToggle: (key: string) => void;
  persons: number;
}) {
  const t = useTranslations('planner');
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const lines = [
      ...items.filter((i) => !checked.includes(i.key)).map((i) => `- ${i.label}`),
      '',
      `${t('pantryTitle')}:`,
      ...pantry.map((i) => `- ${i.label}`),
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the list is still on screen
    }
  };

  return (
    <section className="planner-shopping" aria-labelledby="shopping-title">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-2">
        <h2 id="shopping-title" className="text-2xl md:text-3xl font-bold text-brown-dark">
          {t('shoppingTitle')}
        </h2>
        <button type="button" className="text-link text-sm" onClick={copy} disabled={items.length === 0}>
          {copied ? t('copied') : t('copy')}
        </button>
      </div>
      <p className="text-sm text-brown-light mb-6">{t('shoppingIntro', { persons })}</p>

      {items.length === 0 ? (
        <p className="text-brown-light">{t('shoppingEmpty')}</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <ul className="planner-checklist">
            {items.map((item) => (
              <CheckItem key={item.key} item={item} checked={checked.includes(item.key)} onToggle={onToggle} />
            ))}
          </ul>
          {pantry.length > 0 && (
            <div>
              <h3 className="font-heading font-semibold text-brown-dark mb-1">{t('pantryTitle')}</h3>
              <p className="text-xs text-brown-light mb-3">{t('pantryIntro')}</p>
              <ul className="planner-checklist">
                {pantry.map((item) => (
                  <CheckItem key={item.key} item={item} checked={checked.includes(item.key)} onToggle={onToggle} />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function CheckItem({
  item,
  checked,
  onToggle,
}: {
  item: { key: string; label: string; recipes: string[] };
  checked: boolean;
  onToggle: (key: string) => void;
}) {
  return (
    <li>
      <label className="planner-check" data-checked={checked || undefined}>
        <input type="checkbox" checked={checked} onChange={() => onToggle(item.key)} />
        <span className="min-w-0">
          <span className="planner-check-label">{item.label}</span>
          <span className="block text-xs text-brown-light truncate">{item.recipes.join(' · ')}</span>
        </span>
      </label>
    </li>
  );
}
