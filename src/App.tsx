/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { LoadingScreen } from './components/LoadingScreen';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SweepTransition } from './components/SweepTransition';
import { AboutSection } from './components/AboutSection';
import { ProductShowcase } from './components/ProductShowcase';
import { WhySamriddhi } from './components/WhySamriddhi';
import { BrandPhilosophy } from './components/BrandPhilosophy';
import { BroomModelsPricing } from './components/BroomModelsPricing';
import { LocationSection } from './components/LocationSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { ScrollProgress } from './components/ScrollProgress';
import { CustomCursor } from './components/CustomCursor';
import { DPDPModal } from './components/DPDPModal';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { AdminPanelModal } from './components/AdminPanelModal';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [heroScrollProgress, setHeroScrollProgress] = useState(0);
  const [sweepScrollProgress, setSweepScrollProgress] = useState(0);
  const [enquiryCategory, setEnquiryCategory] = useState<string>('');

  // DPDP Compliance State
  const [dpdpModalOpen, setDpdpModalOpen] = useState(false);
  const [dpdpInitialTab, setDpdpInitialTab] = useState<'notice' | 'rights' | 'request' | 'grievance'>('notice');
  const [forceShowCookieBanner, setForceShowCookieBanner] = useState(false);

  // Admin Portal Modal State
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  const handleOpenDPDPModal = (tab: 'notice' | 'rights' | 'request' | 'grievance' = 'notice') => {
    setDpdpInitialTab(tab);
    setDpdpModalOpen(true);
  };

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;

          // Hero progress: 0 to 1 over 0 -> 700px
          const heroMax = 700;
          const currentHero = Math.min(1, Math.max(0, scrollY / heroMax));
          setHeroScrollProgress(currentHero);

          // Sweep transition progress
          const sweepEl = document.getElementById('sweep-experience');
          if (sweepEl) {
            const rect = sweepEl.getBoundingClientRect();
            const winHeight = window.innerHeight;
            // When rect.top transitions from winHeight to -rect.height
            const totalTravel = winHeight + rect.height;
            const currentTravel = winHeight - rect.top;
            const sweepNorm = Math.min(1, Math.max(0, currentTravel / totalTravel));
            setSweepScrollProgress(sweepNorm);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavigate = (id: string) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectCategoryForEnquiry = (categoryName: string) => {
    setEnquiryCategory(categoryName);
    handleNavigate('contact');
  };

  return (
    <div className="relative min-h-screen bg-[#FDFBF7] text-[#1A1A1A] overflow-x-hidden selection:bg-[#C5A059]/25 selection:text-[#1A1A1A]">
      {/* Short Luxury Loading Animation */}
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}

      {/* Subtle Custom Desktop Cursor */}
      <CustomCursor />

      {/* Vertical Gold Scroll Progress Indicator */}
      <ScrollProgress />

      {/* Sticky Premium Navbar */}
      <Navbar onNavigate={handleNavigate} onOpenDPDPModal={handleOpenDPDPModal} />

      <main>
        {/* 1. Hero Section with Scroll-Bound Broom Motion */}
        <Hero
          scrollProgress={heroScrollProgress}
          onDiscoverClick={() => handleNavigate('samriddhi')}
          onContactClick={() => handleNavigate('contact')}
        />

        {/* 2. Signature "Sweep into the story" Transition Section */}
        <SweepTransition scrollProgress={sweepScrollProgress} />

        {/* 3. About Adhrit Industries */}
        <AboutSection />

        {/* 4. Samriddhi Broom Product Showcase & Interactive Categories */}
        <ProductShowcase
          onSelectCategoryForEnquiry={handleSelectCategoryForEnquiry}
        />

        {/* 5. Why Samriddhi Feature Blocks */}
        <WhySamriddhi />

        {/* 6. Brand Philosophy & Motto Parallax Plaque */}
        <BrandPhilosophy />

        {/* 7. Broom Types & Transparent Pricing (Classic Gold & Deluxe Pro Jumbo) */}
        <BroomModelsPricing onSelectModelForEnquiry={handleSelectCategoryForEnquiry} />

        {/* 8. Location & Stylized Map */}
        <LocationSection />

        {/* 9. Contact & Enquiries with DPDP Statutory Consent */}
        <ContactSection
          prefilledCategory={enquiryCategory}
          onOpenDPDPModal={handleOpenDPDPModal}
        />
      </main>

      {/* 10. Footer with DPDP Compliance Column & Data Fiduciary Disclosure */}
      <Footer
        onNavigate={handleNavigate}
        onOpenDPDPModal={handleOpenDPDPModal}
        onOpenCookieSettings={() => setForceShowCookieBanner(true)}
        onOpenAdminPanel={() => setAdminModalOpen(true)}
      />

      {/* Admin Operations & Bookings Manager (Only accessible via footer) */}
      {adminModalOpen && (
        <AdminPanelModal
          isOpen={adminModalOpen}
          onClose={() => setAdminModalOpen(false)}
        />
      )}

      {/* DPDP Act 2023 Statutory Privacy & Rights Center Modal */}
      <DPDPModal
        isOpen={dpdpModalOpen}
        onClose={() => setDpdpModalOpen(false)}
        initialTab={dpdpInitialTab}
      />

      {/* DPDP Act Technical Cookie & Storage Consent Banner */}
      <CookieConsentBanner
        onOpenDPDPModal={handleOpenDPDPModal}
        forceShow={forceShowCookieBanner}
        onCloseForceShow={() => setForceShowCookieBanner(false)}
      />
    </div>
  );
}
