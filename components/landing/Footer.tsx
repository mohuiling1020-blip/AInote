'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import Link from 'next/link';

export default function Footer() {
  const { locale, t } = useLanguage();

  return (
    <footer className="py-12 px-6 border-t border-morandi-sage/8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Brand */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-morandi-sage flex items-center justify-center">
              <span className="text-white font-serif text-xs font-semibold">M</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-morandi-text-primary">MindSpark</span>
              <span className="text-morandi-sage/20">|</span>
              <span className="text-morandi-text-muted">{t.footer.tagline[locale]}</span>
            </div>
          </div>

          {/* Center: Links */}
          <div className="flex items-center gap-6 text-sm text-morandi-text-muted">
            <Link href="/terms" className="hover:text-morandi-text-secondary transition-colors">
              {locale === 'zh' ? '条款' : 'Terms'}
            </Link>
            <Link href="/privacy" className="hover:text-morandi-text-secondary transition-colors">
              {locale === 'zh' ? '隐私' : 'Privacy'}
            </Link>
          </div>

          {/* Right: Copyright */}
          <p className="text-sm text-morandi-text-muted">
            {t.footer.builtWith[locale]} · © {new Date().getFullYear()} MindSpark
          </p>
        </div>
      </div>
    </footer>
  );
}
