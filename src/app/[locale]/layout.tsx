import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { ViewTransitions } from 'next-view-transitions';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ViewTransitionDirection from '@/components/ViewTransitionDirection';
import '../globals.css';

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
      <html lang={locale}>
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
