import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { ViewTransitions } from 'next-view-transitions';
import { Fraunces, Geist } from 'next/font/google';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ViewTransitionDirection from '@/components/ViewTransitionDirection';
import '../globals.css';

// Variable fonts: the CSS variables are consumed by --font-display / --font-body in tokens.css
const fraunces = Fraunces({
  subsets: ['latin'],
  axes: ['SOFT', 'opsz'],
  variable: '--font-fraunces',
  display: 'swap',
});

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  
  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  const messages = await getMessages({ locale });

  return (
    <ViewTransitions>
      {/* data-scroll-behavior lets Next switch off the smooth scrolling from
          globals.css during navigation, so a new page really starts at the top */}
      <html
        lang={locale}
        className={`${fraunces.variable} ${geist.variable}`}
        data-scroll-behavior="smooth"
      >
        <body className="min-h-screen flex flex-col bg-cream">
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ViewTransitionDirection />
          <Navigation locale={locale} />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </NextIntlClientProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
