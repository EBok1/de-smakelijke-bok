'use client';

import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useHydrated } from '@/lib/store';
import { addDays, startOfWeek, weekKey } from '@/lib/planner';
import { plannerActions } from '@/hooks/usePlanner';
import Popover from './Popover';

/** "Plan in": puts this recipe on a day of the current week's menu. */
export default function PlanButton({ slug }: { slug: string }) {
  const t = useTranslations('planner');
  const locale = useLocale();
  const hydrated = useHydrated();
  const [open, setOpen] = useState(false);
  const [plannedDay, setPlannedDay] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);

  if (!hydrated) return null;

  const monday = startOfWeek(new Date());
  const todayIndex = (new Date().getDay() + 6) % 7;
  const dayFormat = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'short' });

  const plan = (day: number) => {
    plannerActions.setDay(weekKey(monday), day, slug);
    setPlannedDay(dayFormat.format(addDays(monday, day)));
    close();
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors duration-200 bg-cream-dark text-brown hover:bg-sage-light print:hidden"
      >
        <CalendarIcon />
        <span className="text-sm">{t('planIn')}</span>
      </button>

      {plannedDay && (
        <p className="text-sm text-brown-light self-center" role="status">
          {t('plannedOn', { day: plannedDay })}{' '}
          <Link href={`/${locale}/planner`} className="text-link">
            {t('viewPlanner')}
          </Link>
        </p>
      )}

      <Popover anchorRef={buttonRef} open={open} onClose={close} label={t('planIn')}>
        <p className="font-heading font-semibold text-brown-dark mb-2">{t('planWhichDay')}</p>
        <ul className="flex flex-col gap-1 text-sm">
          {Array.from({ length: 7 }, (_, day) => (
            <li key={day}>
              <button
                type="button"
                className="popover-option"
                onClick={() => plan(day)}
                disabled={day < todayIndex}
              >
                <span className="inline-block first-letter:uppercase">
                  {dayFormat.format(addDays(monday, day))}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Popover>
    </>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
