'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import Link from 'next/link';

export default function CTASection() {
  const { locale, t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-24 px-6" ref={ref}>
      <div className={`max-w-3xl mx-auto text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="rounded-2xl bg-gradient-to-br from-morandi-sage/20 via-morandi-mint/15 to-morandi-cream/20 backdrop-blur-sm border border-white/50 p-12 md:p-16">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-morandi-text-primary mb-4">
            {t.cta.title[locale]}
          </h2>
          <p className="text-morandi-text-secondary text-lg mb-8">
            {t.cta.subtitle[locale]}
          </p>
          <Link
            href="/sign-up"
            className="inline-block px-10 py-4 rounded-full bg-morandi-sage text-white text-lg font-medium hover:bg-morandi-sage/90 transition-all hover:shadow-lg hover:shadow-morandi-sage/25"
          >
            {t.cta.button[locale]}
          </Link>
        </div>
      </div>
    </section>
  );
}
