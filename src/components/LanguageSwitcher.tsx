'use client';

import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { routing } from '@/i18n/routing';

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] as typeof routing.locales[number];

  // Get the path without the locale prefix
  const getPathWithoutLocale = () => {
    const segments = pathname.split('/');
    segments.splice(1, 1); // Remove locale segment
    return segments.join('/') || '/';
  };

  const pathWithoutLocale = getPathWithoutLocale();

  return (
    <div className="flex items-center gap-1 bg-cream-dark rounded-full p-1">
      {routing.locales.map((locale) => (
        <Link
          key={locale}
          href={pathWithoutLocale}
          locale={locale}
          scroll={false}
          className={`
            px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
            ${currentLocale === locale 
              ? 'bg-sage text-[#ffffff]' 
              : 'text-brown-light hover:text-brown'
            }
          `}
          aria-label={`Switch to ${locale === 'nl' ? 'Dutch' : 'English'}`}
        >
          {locale.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
