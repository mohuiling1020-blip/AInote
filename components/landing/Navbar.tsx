'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import Link from 'next/link';

export default function Navbar() {
  const { locale, toggleLocale, t } = useLanguage();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/60 border-b border-white/40">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-morandi-sage to-morandi-mint flex items-center justify-center">
            <span className="text-white font-serif font-semibold text-sm">M</span>
          </div>
          <span className="font-serif font-semibold text-lg text-morandi-text-primary">
            MindSpark
          </span>
        </div>

        {/* Nav links - hidden on mobile */}
        <div className="hidden md:flex items-center gap-8 text-sm text-morandi-text-secondary">
          <button onClick={() => scrollTo('features')} className="hover:text-morandi-sage transition-colors">
            {t.nav.features[locale]}
          </button>
          <button onClick={() => scrollTo('how-it-works')} className="hover:text-morandi-sage transition-colors">
            {t.nav.howItWorks[locale]}
          </button>
          <button onClick={() => scrollTo('pricing')} className="hover:text-morandi-sage transition-colors">
            {t.nav.pricing[locale]}
          </button>
          <button onClick={() => scrollTo('faq')} className="hover:text-morandi-sage transition-colors">
            {t.nav.faq[locale]}
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLocale}
            className="text-xs px-3 py-1.5 rounded-full border border-morandi-sage/30 text-morandi-text-secondary hover:bg-morandi-sage/10 transition-colors"
          >
            {locale === 'zh' ? 'EN' : '中文'}
          </button>
          <Link
            href="/sign-up"
            className="text-sm px-4 py-2 rounded-full bg-morandi-sage text-white hover:bg-morandi-sage/90 transition-colors"
          >
            {t.nav.getStarted[locale]}
          </Link>
        </div>
      </div>
    </nav>
  );
}
