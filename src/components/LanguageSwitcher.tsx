'use client';

import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { routing } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const t = useTranslations('nav');
  const currentLocale = pathname.split('/')[1] as typeof routing.locales[number];

  // Get the path without the locale prefix
  const getPathWithoutLocale = () => {
    const segments = pathname.split('/');
    segments.splice(1, 1); // Remove locale segment
    return segments.join('/') || '/';
  };

  const pathWithoutLocale = getPathWithoutLocale();

  return (
    <nav aria-label={t('language')} className="flex items-center gap-1 bg-cream-dark rounded-full p-1">
      {routing.locales.map((locale) => (
        <Link
          key={locale}
          href={pathWithoutLocale}
          locale={locale}
          scroll={false}
          className={`
            px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
            ${currentLocale === locale
              ? 'bg-cream text-brown-dark shadow-sm'
              : 'text-brown hover:text-brown-dark'
            }
          `}
          aria-current={currentLocale === locale ? 'true' : undefined}
          lang={locale}
        >
          {/* Each language named in itself, so a screen reader says "Nederlands", not "N L" */}
          <span aria-hidden="true">{locale.toUpperCase()}</span>
          <span className="sr-only">{locale === 'nl' ? 'Nederlands' : 'English'}</span>
        </Link>
      ))}
    </nav>
  );
}
