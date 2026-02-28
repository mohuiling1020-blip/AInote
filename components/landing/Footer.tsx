'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function Footer() {
  const { locale, t } = useLanguage();

  return (
    <footer className="py-12 px-6 border-t border-morandi-sage/10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-morandi-text-secondary">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-morandi-sage to-morandi-mint flex items-center justify-center">
            <span className="text-white font-serif text-xs font-semibold">M</span>
          </div>
          <span className="font-serif font-medium text-morandi-text-primary">MindSpark</span>
          <span className="mx-2">·</span>
          <span>{t.footer.tagline[locale]}</span>
        </div>
        <div>
          {t.footer.builtWith[locale]} · © {new Date().getFullYear()} MindSpark
        </div>
      </div>
    </footer>
  );
}
