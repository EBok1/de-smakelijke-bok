'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';

interface NavigationProps {
  locale: string;
}

export default function Navigation({ locale }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = useTranslations('nav');

  const navLinks = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/recipes`, label: t('recipes') },
    { href: `/${locale}/about`, label: t('about') },
    { href: `/${locale}/favorites`, label: t('favorites'), icon: '♥' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-cream-dark transition-colors duration-300">
      <nav className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            href={`/${locale}`} 
            className="flex items-center gap-2 group"
          >
            <Image
              src="/images/logo.png"
              alt="De Smakelijke Bok"
              width={50}
              height={50}
              className="rounded-full"
            />
            <span className="font-heading font-bold text-lg text-brown-dark group-hover:text-sage-dark transition-colors hidden sm:block">
              De Smakelijke Bok
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1 text-brown font-medium hover:text-sage-dark transition-colors"
              >
                {link.icon && <span className="text-peach">{link.icon}</span>}
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-2 ml-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile: Theme Toggle + Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-cream-dark transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <div className="w-6 h-5 relative flex flex-col justify-between">
                <span 
                  className={`w-full h-0.5 bg-brown rounded-full transition-all duration-300 ${
                    isMenuOpen ? 'rotate-45 translate-y-2' : ''
                  }`}
                />
                <span 
                  className={`w-full h-0.5 bg-brown rounded-full transition-all duration-300 ${
                    isMenuOpen ? 'opacity-0' : ''
                  }`}
                />
                <span 
                  className={`w-full h-0.5 bg-brown rounded-full transition-all duration-300 ${
                    isMenuOpen ? '-rotate-45 -translate-y-2' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-80 opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex flex-col gap-2 py-4 border-t border-cream-dark">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-brown font-medium hover:bg-cream-dark hover:text-sage-dark transition-all"
              >
                {link.icon && <span className="text-peach">{link.icon}</span>}
                {link.label}
              </Link>
            ))}
            <div className="px-4 pt-2">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
