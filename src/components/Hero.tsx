import React from 'react';
import { ArrowDown, Sparkles, ShieldCheck, Package, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { BRAND_DATA } from '../data/brandData';
import { RealisticBroomVisual } from './RealisticBroomVisual';
import { BotanicalCorner } from './OrnamentalAssets';

interface HeroProps {
  scrollProgress: number; // 0 to 1 in hero range
  onDiscoverClick: () => void;
  onContactClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  scrollProgress,
  onDiscoverClick,
  onContactClick,
}) => {
  // Compute continuous smooth transform values based on scroll
  const broomRotation = -10 + scrollProgress * 32; // -10deg to +22deg
  const broomX = -scrollProgress * 90; // moves leftwards diagonally
  const broomY = scrollProgress * 120; // moves downwards into transition
  const broomScale = 1 - scrollProgress * 0.12;

  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    BRAND_DATA.openingCeremony.fullAddress
  )}`;

  return (
    <section
      id="home"
      className="relative min-h-[96vh] sm:min-h-screen flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-12 overflow-hidden bg-[#FDFBF7] border-b border-[#1A1A1A10]"
    >
      {/* Subtle paper-like grain & soft radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(197,160,89,0.06)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(74,93,78,0.03)_0%,transparent_50%)] pointer-events-none" />

      {/* Decorative corner ornaments from editorial invitation */}
      <div className="hidden lg:block absolute top-28 left-8 pointer-events-none opacity-40">
        <BotanicalCorner position="top-left" />
      </div>
      <div className="hidden lg:block absolute top-28 right-8 pointer-events-none opacity-40">
        <BotanicalCorner position="top-right" />
      </div>

      <div className="relative z-10 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10 items-center">
        {/* Column 1 (lg:col-span-6 xl:col-span-5): Editorial Typography & Actions */}
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center text-left space-y-6">
          {/* Editorial Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2"
          >
            <span className="inline-block px-3 py-1 border border-[#C5A059] text-[#C5A059] text-[10px] uppercase tracking-widest rounded-full font-bold">
              Premium Cleanliness • Adhrit Industries
            </span>
          </motion.div>

          {/* Main Editorial Large Display Headline */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="space-y-2"
          >
            <h1 className="font-serif text-5xl sm:text-7xl xl:text-[86px] leading-[0.88] font-light text-[#1A1A1A] tracking-tight">
              SWEEP<br />
              <span className="italic font-light">WITH</span><br />
              CONFIDENCE.
            </h1>
          </motion.div>

          {/* Subheading Lead */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-base sm:text-lg leading-relaxed text-[#1A1A1A]/80 max-w-md font-sans"
          >
            One belief. One step towards a cleaner tomorrow. Experience the fusion of traditional
            reliability and modern quality.
          </motion.p>

          {/* Action Row: Editorial Button + Tagline Block */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="flex flex-wrap items-center gap-6 pt-1"
          >
            <button
              type="button"
              onClick={onDiscoverClick}
              id="hero-discover-samriddhi-btn"
              className="px-8 py-4 bg-[#1A1A1A] text-white text-[12px] uppercase tracking-widest font-bold hover:bg-[#4A5D4E] transition-all shadow-sm flex items-center gap-2 group cursor-pointer"
            >
              <span>Discover Samriddhi</span>
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059] group-hover:rotate-12 transition-transform" />
            </button>

            <div className="flex flex-col border-l border-[#C5A059] pl-4 py-0.5">
              <span className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/50 italic">
                Tagline
              </span>
              <span className="text-[13px] font-serif font-bold text-[#1A1A1A]">
                &ldquo;{BRAND_DATA.tagline}&rdquo;
              </span>
            </div>
          </motion.div>

          {/* Subtle Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="pt-4 flex items-center gap-6 text-[11px] text-[#1A1A1A]/60 border-t border-[#1A1A1A10] max-w-md"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
              <span>Reliable Everyday Utility</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-[#C5A059]" />
            <div className="flex items-center gap-2">
              <span>Ranchi, Jharkhand</span>
            </div>
          </motion.div>
        </div>

        {/* Column 2 (lg:col-span-6 xl:col-span-4): Broom Showcase with Vertical Axis */}
        <div className="lg:col-span-6 xl:col-span-4 relative flex flex-col items-center justify-center min-h-[460px] sm:min-h-[560px] lg:min-h-[640px] pb-4">
          {/* Vertical Editorial Hairpin Line in Background - stops before text */}
          <div className="absolute top-0 h-[65%] w-[1px] bg-gradient-to-b from-transparent via-[#C5A05940] to-transparent left-1/2 pointer-events-none" />

          {/* Subtle circular background stage with golden rim */}
          <div className="absolute top-1/2 -translate-y-[55%] w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] rounded-full border border-[#C5A059]/25 bg-gradient-to-tr from-[#F5E6CA]/30 to-transparent pointer-events-none" />

          {/* Animated Broom Container */}
          <motion.div
            style={{
              transform: `translate3d(${broomX}px, ${broomY}px, 0px) rotate(${broomRotation}deg) scale(${broomScale})`,
              transformOrigin: '50% 50%',
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 80 }}
            className="relative w-[190px] sm:w-[230px] lg:w-[260px] h-[360px] sm:h-[420px] will-change-transform z-20 flex items-center justify-center"
          >
            <RealisticBroomVisual
              glow={true}
              customSrc="/assets/ChatGPT%20Image%20Sep%2010,%202026,%2010_31_13%20PM.png"
              className="w-full h-full"
            />
          </motion.div>

          {/* Product Label in Editorial Styling with distinct separation */}
          <div className="relative z-20 mt-6 text-center px-6 py-2.5 rounded-xl bg-[#FDFBF7]/95 border border-[#C5A05930] shadow-xs backdrop-blur-xs">
            <span className="block font-serif font-light text-2xl sm:text-3xl tracking-[0.14em] text-[#1A1A1A] leading-tight mb-1">
              {BRAND_DATA.brandName}
            </span>
            <span className="block text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#C5A059] font-sans font-semibold">
              Signature Collection • By Adhrit
            </span>
          </div>

          {/* Scroll to Explore Interactive Button */}
          <button
            type="button"
            id="hero-scroll-explore-btn"
            onClick={() => {
              const target = document.getElementById('sweep-experience') || document.getElementById('about');
              target?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="relative z-20 mt-6 flex flex-col items-center gap-2 group cursor-pointer text-[#1A1A1A] hover:opacity-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] rounded-lg p-1"
            aria-label="Scroll down to explore sweep transition and brand story"
          >
            <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-[#1A1A1A]/75 group-hover:text-[#C5A059] transition-colors font-sans">
              Scroll to Explore
            </span>
            <div className="w-5 h-8 rounded-full border border-[#C5A059]/60 flex items-start justify-center p-1 bg-[#FDFBF7]/90 backdrop-blur-xs shadow-xs group-hover:border-[#C5A059] group-hover:shadow-[0_4px_12px_rgba(197,160,89,0.25)] transition-all">
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                className="w-1 h-1 rounded-full bg-[#C5A059]"
              />
            </div>
          </button>
        </div>

        {/* Column 3 (hidden xl:flex xl:col-span-3): Factory Direct Models & Quick Wholesale Plaque */}
        <div className="hidden xl:flex xl:col-span-3 flex-col justify-center space-y-7 pl-4">
          {/* Factory Direct Plaque */}
          <div className="p-6 bg-white border border-[#C5A05935] shadow-xs relative overflow-hidden text-left rounded-xl">
            <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none text-[#C5A059]">
              <Package className="w-16 h-16" />
            </div>

            <span className="text-[10px] uppercase tracking-[0.28em] text-[#C5A059] font-bold block mb-2 font-sans">
              FACTORY DIRECT SUPPLY
            </span>

            <h3 className="font-serif text-2xl text-[#1A1A1A] font-light leading-snug mb-2">
              Genuine Hill Grass Brooms
            </h3>

            <p className="text-xs text-[#1A1A1A]/70 leading-relaxed mb-4 font-sans">
              Manufactured at Ranchi using selected Meghalaya & Assam hill grass. Pre-combed for dust-free sweeping.
            </p>

            {/* 2 Flagship Models Quick Spec */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F5F2EB]/80 border border-[#1A1A1A08] text-xs">
                <div>
                  <span className="font-semibold block text-[#1A1A1A]">Samriddhi Premium</span>
                  <span className="text-[10px] text-[#1A1A1A]/55">Fluorescent Ribbed Grip</span>
                </div>
                <div className="text-right">
                  <span className="inline-block text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#4A5D4E]/10 text-[#4A5D4E]">
                    Standard Grade
                  </span>
                  <span className="block text-[9px] text-[#1A1A1A]/60 mt-0.5">45 inches (114 cm) • 400g</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F5F2EB]/80 border border-[#1A1A1A08] text-xs">
                <div>
                  <span className="font-semibold block text-[#1A1A1A]">Samriddhi Gold</span>
                  <span className="text-[10px] text-[#1A1A1A]/55">Zero-Bend Long Reach</span>
                </div>
                <div className="text-right">
                  <span className="inline-block text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#C5A059]/15 text-[#C5A059]">
                    Flagship Grade
                  </span>
                  <span className="block text-[9px] text-[#1A1A1A]/60 mt-0.5">50 inches (127 cm) • 500g</span>
                </div>
              </div>
            </div>

            {/* Link to Models Section */}
            <a
              href="#pricing"
              className="mt-4 w-full bg-[#1A1A1A] hover:bg-[#C5A059] text-white py-2.5 px-4 text-[11px] uppercase tracking-widest font-bold transition-colors text-center flex items-center justify-center gap-1.5 cursor-pointer rounded-full"
            >
              <span>View Broom Models</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Wholesale & Dealer Desk */}
          <div className="space-y-1.5 border-l-2 border-[#C5A059] pl-5 text-left">
            <h4 className="text-[11px] uppercase tracking-widest font-bold text-[#1A1A1A]/70 font-sans">
              Direct Wholesale Desk
            </h4>
            <a
              href={`tel:${BRAND_DATA.phone}`}
              className="text-2xl font-sans font-semibold tracking-tight text-[#1A1A1A] hover:text-[#C5A059] transition-colors block"
            >
              {BRAND_DATA.displayPhone}
            </a>
            <p className="text-[11px] text-[#1A1A1A]/60 font-sans">
              50-Pc Master Cartons • GST Billing • Fast Dispatch
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
