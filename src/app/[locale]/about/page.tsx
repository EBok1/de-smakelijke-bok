import { useTranslations } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AboutPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });
  
  return {
    title: t('title'),
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 animate-fade-in">
      <AboutContent />
    </div>
  );
}

function AboutContent() {
  const t = useTranslations('about');

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header with logo */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <Image
            src="/images/logo.png"
            alt="De Smakelijke Bok"
            width={180}
            height={180}
            className="rounded-full shadow-lg"
          />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-brown-dark mb-4">
          {t('title')}
        </h1>
      </div>

      {/* Content Cards */}
      <div className="space-y-8">
        {/* About Card */}
        <div className="card bg-gradient-to-br from-cream-dark to-cream p-8">
          <p className="text-lg text-brown leading-relaxed">
            {t('content')}
          </p>
        </div>

        {/* Why the name Card */}
        <div className="card bg-gradient-to-br from-peach-light/50 to-cream p-8">
          <h2 className="text-2xl font-bold text-brown-dark mb-4 flex items-center gap-3">
            <span className="text-3xl">🐐</span>
            {t('whyName')}
          </h2>
          <p className="text-lg text-brown leading-relaxed">
            {t('whyNameContent')}
          </p>
        </div>

        {/* Fun decorative section */}
        <div className="flex flex-wrap justify-center gap-4 py-8">
          <div className="w-16 h-16 bg-sage-light rounded-full flex items-center justify-center text-2xl shadow-md">
            🍝
          </div>
          <div className="w-16 h-16 bg-peach-light rounded-full flex items-center justify-center text-2xl shadow-md">
            🥗
          </div>
          <div className="w-16 h-16 bg-dusty-blue-light rounded-full flex items-center justify-center text-2xl shadow-md">
            🍰
          </div>
          <div className="w-16 h-16 bg-sage-light rounded-full flex items-center justify-center text-2xl shadow-md">
            🥘
          </div>
          <div className="w-16 h-16 bg-peach-light rounded-full flex items-center justify-center text-2xl shadow-md">
            🍜
          </div>
        </div>
      </div>
    </div>
  );
}
