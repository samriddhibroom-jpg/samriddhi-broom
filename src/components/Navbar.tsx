import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, ArrowUpRight } from 'lucide-react';
import { BRAND_DATA } from '../data/brandData';

interface NavbarProps {
  onNavigate?: (id: string) => void;
  onOpenDPDPModal?: (tab?: 'notice' | 'rights' | 'request' | 'grievance') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, onOpenDPDPModal }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', shortLabel: 'Home', href: '#home' },
    { label: 'About', shortLabel: 'About', href: '#about' },
    { label: 'Samriddhi Broom', shortLabel: 'Brooms', href: '#samriddhi' },
    { label: 'Why Us', shortLabel: 'Why Us', href: '#why-us' },
    { label: 'Models & Pricing', shortLabel: 'Pricing', href: '#pricing' },
    { label: 'Contact', shortLabel: 'Contact', href: '#contact' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetId = href.replace('#', '');
    if (onNavigate) {
      onNavigate(targetId);
    } else {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'py-2.5 md:py-3 lg:py-3.5 bg-[#FDFBF7]/95 backdrop-blur-md shadow-xs border-b border-[#1A1A1A10]'
            : 'py-4 md:py-4.5 lg:py-6 bg-transparent border-b border-[#1A1A1A10]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-5 lg:px-12 flex items-center justify-between gap-2 md:gap-3 lg:gap-6">
          {/* Brand Wordmark in Editorial Style */}
          <a
            href="#home"
            onClick={(e) => handleLinkClick(e, '#home')}
            className="flex flex-col group cursor-pointer shrink-0"
            id="brand-header-link"
          >
            <span className="font-serif text-base sm:text-lg md:text-lg lg:text-xl tracking-tight font-bold uppercase text-[#1A1A1A] whitespace-nowrap">
              Adhrit Industries
            </span>
            <span className="text-[9px] md:text-[9.5px] lg:text-[10px] uppercase tracking-[0.14em] md:tracking-[0.16em] lg:tracking-[0.2em] -mt-0.5 opacity-60 text-[#1A1A1A] whitespace-nowrap">
              A Unit of Trust • Samridhii Broom™
            </span>
          </a>

          {/* Desktop & Tablet Navigation */}
          <nav
            className="hidden md:flex items-center gap-3.5 md:gap-3.5 lg:gap-6 xl:gap-8 text-[10px] md:text-[10.5px] lg:text-[11px] uppercase tracking-[0.08em] md:tracking-[0.1em] lg:tracking-[0.15em] font-medium text-[#1A1A1A] shrink"
            aria-label="Main Navigation"
          >
            {navItems.map((item, index) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleLinkClick(e, item.href)}
                className={`opacity-80 hover:opacity-100 transition-opacity relative py-1 hover:text-[#1A1A1A] after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#1A1A1A] hover:after:w-full after:transition-all after:duration-300 whitespace-nowrap ${
                  index === navItems.length - 1 ? 'mr-1 md:mr-1.5 lg:mr-5' : ''
                }`}
              >
                <span className="hidden lg:inline">{item.label}</span>
                <span className="inline lg:hidden">{item.shortLabel}</span>
              </a>
            ))}
          </nav>

          {/* Right Action Button */}
          <div className="hidden md:flex items-center ml-3 md:ml-4 lg:ml-6 xl:ml-8 pl-3 md:pl-4 lg:pl-6 border-l border-[#1A1A1A15] shrink-0">
            <a
              href="#contact"
              onClick={(e) => handleLinkClick(e, '#contact')}
              id="nav-get-in-touch-btn"
              className="bg-[#C5A059] text-white hover:bg-[#B38F48] active:bg-[#9E7D3B] px-4 lg:px-5 py-2 lg:py-2.5 rounded-full text-[11px] lg:text-xs uppercase tracking-[0.12em] lg:tracking-[0.14em] font-semibold transition-all duration-200 shadow-xs hover:shadow-sm group inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0"
            >
              <span>Get in Touch</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-[#1A1A1A] hover:text-[#C5A059] focus:outline-none"
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            id="mobile-menu-toggle-btn"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-30 md:hidden bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div
          className={`absolute top-0 right-0 w-4/5 max-w-sm h-full bg-[#FDFBF7] shadow-2xl p-6 flex flex-col justify-between transition-transform duration-300 ease-out border-l border-[#1A1A1A10] ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            <div className="flex items-center justify-between pb-6 border-b border-[#1A1A1A10]">
              <div>
                <p className="font-serif text-lg font-bold text-[#1A1A1A] uppercase tracking-tight">
                  Adhrit Industries
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059]">SAMRIDHII BROOM™</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-[#1A1A1A]"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-4 mt-8">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleLinkClick(e, item.href)}
                  className="font-serif text-xl text-[#1A1A1A] hover:text-[#C5A059] transition-colors py-1.5"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="pt-6 border-t border-[#1A1A1A10] space-y-4">
            <a
              href={`tel:${BRAND_DATA.phone}`}
              className="flex items-center gap-2 text-xs text-[#1A1A1A]/80 hover:text-[#C5A059]"
            >
              <Phone className="w-4 h-4 text-[#C5A059]" />
              <span>{BRAND_DATA.displayPhone}</span>
            </a>
            <a
              href="#contact"
              onClick={(e) => handleLinkClick(e, '#contact')}
              className="block w-full text-center py-3 bg-[#1A1A1A] text-white text-[11px] font-bold tracking-widest uppercase rounded-full hover:bg-[#A88846] transition-colors"
            >
              Contact Us
            </a>

            {onOpenDPDPModal && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenDPDPModal('notice');
                  }}
                  className="text-[10px] text-[#C5A059] uppercase tracking-wider font-semibold hover:underline cursor-pointer"
                >
                  DPDP Act, 2023 Privacy Notice
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
