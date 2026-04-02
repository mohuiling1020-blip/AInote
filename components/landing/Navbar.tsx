'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import Link from 'next/link';

export default function Navbar() {
  const { locale, toggleLocale, t } = useLanguage();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-6xl mx-auto px-6 pt-4">
        <div className="flex items-center justify-between h-14 px-6 rounded-2xl bg-white/70 backdrop-blur-xl border border-morandi-sage/8 shadow-sm shadow-morandi-sage/5">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-morandi-sage flex items-center justify-center">
              <span className="text-white font-serif font-semibold text-sm">M</span>
            </div>
            <span className="font-serif font-semibold text-lg text-morandi-text-primary tracking-tight">
              MindSpark
            </span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { key: 'features', label: t.nav.features[locale] },
              { key: 'how-it-works', label: t.nav.howItWorks[locale] },
              { key: 'pricing', label: t.nav.pricing[locale] },
              { key: 'faq', label: t.nav.faq[locale] },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => scrollTo(key)}
                className="px-3.5 py-1.5 rounded-lg text-sm text-morandi-text-secondary hover:text-morandi-text-primary hover:bg-morandi-sage/8 transition-all duration-200"
              >
                {label}
              </button>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLocale}
              className="text-xs px-3 py-1.5 rounded-lg border border-morandi-sage/15 text-morandi-text-secondary hover:bg-morandi-sage/8 transition-all duration-200"
            >
              {locale === 'zh' ? 'EN' : '中文'}
            </button>
            <Link
              href="/sign-up"
              className="text-sm px-5 py-2 rounded-lg bg-morandi-sage text-white font-medium hover:bg-morandi-sage/90 transition-all duration-200 hover:shadow-md hover:shadow-morandi-sage/20"
            >
              {t.nav.getStarted[locale]}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
