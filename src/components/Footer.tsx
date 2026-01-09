import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-cream-dark border-t border-sage-light/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Name */}
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="De Smakelijke Bok"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <p className="font-heading font-bold text-brown-dark">
                De Smakelijke Bok
              </p>
              <p className="text-sm text-brown-light">
                {t('madeWith')} ♥
              </p>
            </div>
          </div>

          {/* Copyright */}
          <p className="text-sm text-brown-light">
            © {currentYear} {t('byName')}
          </p>
        </div>
      </div>
    </footer>
  );
}
