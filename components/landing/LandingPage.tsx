'use client';

import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import LandingBackground from './LandingBackground';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import HowItWorks from './HowItWorks';
import ValueProposition from './ValueProposition';
import FAQSection from './FAQSection';
import CTASection from './CTASection';
import Footer from './Footer';

export default function LandingPage() {
  return (
    <LanguageProvider>
      <div className="fixed inset-0 overflow-y-auto">
        <LandingBackground />
        <Navbar />
        <HeroSection />
        <FeaturesSection />
        <HowItWorks />
        <ValueProposition />
        <FAQSection />
        <CTASection />
        <Footer />
      </div>
    </LanguageProvider>
  );
}
