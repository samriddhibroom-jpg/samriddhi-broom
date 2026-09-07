import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowRight, Settings } from 'lucide-react';

interface CookieConsentBannerProps {
  onOpenDPDPModal: (tab?: 'notice' | 'rights' | 'request' | 'grievance') => void;
  forceShow?: boolean;
  onCloseForceShow?: () => void;
}

const STORAGE_KEY = 'adhrit_dpdp_consent_2026';

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  onOpenDPDPModal,
  forceShow = false,
  onCloseForceShow,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (forceShow) {
      setIsVisible(true);
      return;
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Gentle initial delay for smooth entrance
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [forceShow]);

  const handleAcceptAll = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ type: 'all', timestamp: new Date().toISOString() }));
    setIsVisible(false);
    if (onCloseForceShow) onCloseForceShow();
  };

  const handleEssentialOnly = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ type: 'essential', timestamp: new Date().toISOString() }));
    setIsVisible(false);
    if (onCloseForceShow) onCloseForceShow();
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-6 md:left-auto md:right-8 md:max-w-xl z-50 animate-slideUp"
      role="region"
      aria-label="DPDP Act Privacy & Consent Notice"
    >
      <div className="bg-[#1A1A1A]/95 text-white p-5 sm:p-6 rounded-2xl shadow-2xl border border-[#C5A05940] backdrop-blur-md space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#C5A059]">
                DPDP Act, 2023 (India)
              </span>
              <span className="text-[9px] uppercase px-2 py-0.2 rounded-full bg-[#C5A059]/20 text-[#C5A059] font-medium">
                Statutory Consent
              </span>
            </div>
            <h3 className="font-serif text-sm sm:text-base font-normal text-[#FDFBF7]">
              Transparent Privacy & Cookie Governance
            </h3>
            <p className="text-xs text-stone-300 font-sans leading-relaxed pt-0.5">
              Adhrit Industries respects your rights as a Data Principal under India&apos;s Digital Personal Data Protection Act, 2023. We utilize necessary technical cookies and local state storage to deliver a seamless, secure experience. We never monetize or sell personal data.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => onOpenDPDPModal('notice')}
            className="text-[11px] text-[#C5A059] hover:underline flex items-center gap-1 font-semibold uppercase tracking-wider cursor-pointer"
          >
            <span>View Statutory Notice & Rights</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleEssentialOnly}
              className="flex-1 sm:flex-none px-4 py-2 rounded-full border border-white/20 hover:border-white/40 text-stone-200 text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer"
            >
              Essential Only
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="flex-1 sm:flex-none px-5 py-2 rounded-full bg-[#C5A059] hover:bg-[#A88846] text-white text-[10px] uppercase font-bold tracking-wider transition-colors shadow-xs cursor-pointer"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
