import React from 'react';
import { ArrowUp, Phone, MapPin, Sparkles, ShieldCheck, Lock, UserCheck, AlertTriangle } from 'lucide-react';
import { BRAND_DATA } from '../data/brandData';
import { BotanicalCorner, GoldDivider } from './OrnamentalAssets';

interface FooterProps {
  onNavigate?: (id: string) => void;
  onOpenDPDPModal?: (tab?: 'notice' | 'rights' | 'request' | 'grievance') => void;
  onOpenCookieSettings?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenDPDPModal,
  onOpenCookieSettings,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Samriddhi Broom', href: '#samriddhi' },
    { label: 'Models & Pricing', href: '#pricing' },
    { label: 'Contact', href: '#contact' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.replace('#', '');
    if (onNavigate) {
      onNavigate(id);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative bg-[#1A1A1A] text-[#FDFBF7] pt-20 pb-12 px-4 sm:px-6 lg:px-12 overflow-hidden border-t border-[#C5A05930]">
      {/* Background soft botanical watermark */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_center,rgba(197,160,89,0.06)_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-16">
        {/* Top Tier: Brand Statement & Scroll to Top */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-12 border-b border-[#FDFBF715]">
          <div className="space-y-2">
            <span className="tracking-[0.3em] text-[10px] sm:text-[11px] font-bold text-[#C5A059] uppercase font-sans">
              {BRAND_DATA.companyName}
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl text-[#FDFBF7] font-light">
              {BRAND_DATA.brandName}
            </h3>
            <p className="font-serif italic text-sm text-[#FDFBF780]">
              &ldquo;{BRAND_DATA.tagline}&rdquo;
            </p>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            id="footer-back-to-top-btn"
            className="group flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#C5A05930] hover:border-[#C5A059] text-[10px] uppercase tracking-widest font-bold text-[#FDFBF7] transition-all cursor-pointer"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5 text-[#C5A059] group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* Middle Tier: Links & Contact Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 text-sm">
          {/* Brand Mission summary */}
          <div className="md:col-span-4 space-y-4">
            <p className="text-xs sm:text-sm text-[#FDFBF780] font-sans leading-relaxed max-w-sm">
              Dedicated to manufacturing honest, durable, and balanced cleaning instruments for
              households and commercial establishments across India.
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-[#C5A059] font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>A Unit of Adhrit Industries</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-2 space-y-3">
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#C5A059] uppercase block font-sans">
              Navigation
            </span>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="text-[#FDFBF780] hover:text-[#C5A059] transition-colors font-medium"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* DPDP Act, 2023 Statutory Compliance Column */}
          <div className="md:col-span-3 space-y-3">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#C5A059] uppercase block font-sans">
                DPDP Privacy (India)
              </span>
            </div>
            <ul className="space-y-2 text-xs text-[#FDFBF780]">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenDPDPModal?.('notice')}
                  className="hover:text-[#C5A059] transition-colors text-left cursor-pointer"
                >
                  Section 5 Privacy Notice
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenDPDPModal?.('rights')}
                  className="hover:text-[#C5A059] transition-colors text-left cursor-pointer"
                >
                  Data Principal Rights (Sec 11–14)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenDPDPModal?.('request')}
                  className="hover:text-[#C5A059] transition-colors text-left cursor-pointer"
                >
                  Exercise Rights / Data Erasure
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenDPDPModal?.('grievance')}
                  className="hover:text-[#C5A059] transition-colors text-left cursor-pointer"
                >
                  Grievance Redressal Officer
                </button>
              </li>
              {onOpenCookieSettings && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenCookieSettings}
                    className="text-[#C5A059] hover:underline text-[11px] font-medium transition-colors text-left cursor-pointer"
                  >
                    Cookie & Consent Preferences
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Contact and Headquarters info */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#C5A059] uppercase block font-sans">
              Headquarters & Enquiries
            </span>
            <div className="space-y-2.5 text-xs sm:text-sm text-[#FDFBF780]">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C5A059] shrink-0" />
                <a
                  href={`tel:${BRAND_DATA.phone}`}
                  className="hover:text-[#C5A059] transition-colors"
                >
                  {BRAND_DATA.displayPhone}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                <span>Ranchi, Jharkhand — 834001</span>
              </div>
            </div>
          </div>
        </div>

        {/* DPDP Regulatory Data Fiduciary Declaration Bar */}
        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#FDFBF770]">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <ShieldCheck className="w-4 h-4 text-[#C5A059] shrink-0" />
            <span>
              <strong>Data Fiduciary:</strong> Adhrit Industries • Compliant with Digital Personal Data Protection (DPDP) Act, 2023 (Act No. 22 of 2023, India).
            </span>
          </div>
          <button
            type="button"
            onClick={() => onOpenDPDPModal?.('notice')}
            className="text-[#C5A059] hover:underline font-semibold uppercase tracking-wider shrink-0 cursor-pointer"
          >
            Learn More
          </button>
        </div>

        {/* Bottom Tier: Copyright & Brand Sign-off */}
        <div className="pt-8 border-t border-[#FDFBF715] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FDFBF750]">
          <p>© 2026 {BRAND_DATA.companyName}. All Rights Reserved.</p>
          <p className="font-serif italic text-xs text-[#C5A059]">
            {BRAND_DATA.openingCeremony.regards}
          </p>
        </div>
      </div>
    </footer>
  );
};
