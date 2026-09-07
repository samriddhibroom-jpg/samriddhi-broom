import React from 'react';
import { motion } from 'motion/react';
import { BRAND_DATA } from '../data/brandData';
import { BotanicalCorner } from './OrnamentalAssets';

export const BrandPhilosophy: React.FC = () => {
  return (
    <section className="relative py-28 sm:py-36 px-4 sm:px-6 lg:px-12 bg-[#1A1A1A] text-[#FDFBF7] overflow-hidden">
      {/* Parallax / Ambient background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(197,160,89,0.1)_0%,transparent_75%)] pointer-events-none" />

      {/* Elegant gold corner accents on dark backdrop */}
      <div className="hidden sm:block absolute top-8 left-8 text-[#C5A059] opacity-40 pointer-events-none">
        <BotanicalCorner position="top-left" />
      </div>
      <div className="hidden sm:block absolute top-8 right-8 text-[#C5A059] opacity-40 pointer-events-none">
        <BotanicalCorner position="top-right" />
      </div>
      <div className="hidden sm:block absolute bottom-8 left-8 text-[#C5A059] opacity-40 pointer-events-none">
        <BotanicalCorner position="bottom-left" />
      </div>
      <div className="hidden sm:block absolute bottom-8 right-8 text-[#C5A059] opacity-40 pointer-events-none">
        <BotanicalCorner position="bottom-right" />
      </div>

      {/* Floating botanical SVG leaf silhouettes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25">
        {[
          { top: '15%', left: '8%', delay: 0, rot: 15 },
          { top: '65%', left: '12%', delay: 1.5, rot: -25 },
          { top: '25%', right: '10%', delay: 0.8, rot: 40 },
          { top: '75%', right: '14%', delay: 2.2, rot: -10 },
        ].map((pos, idx) => (
          <motion.div
            key={idx}
            animate={{
              y: [0, -12, 0],
              rotate: [pos.rot, pos.rot + 8, pos.rot],
            }}
            transition={{
              duration: 5 + idx,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: pos.delay,
            }}
            className="absolute text-[#C5A059]"
            style={{ top: pos.top, left: pos.left, right: pos.right }}
          >
            <svg className="w-10 h-10 sm:w-14 sm:h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75">
              <path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2Z" fill="currentColor" fillOpacity="0.1" />
              <path d="M12 4C8 8 7 14 12 19C17 14 16 8 12 4Z" />
              <path d="M12 7V17" />
            </svg>
          </motion.div>
        ))}
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-3">
          <div className="h-[1px] w-8 bg-[#C5A059]" />
          <span className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-[#C5A059] font-bold font-sans">
            OUR GUIDING MOTTO
          </span>
          <div className="h-[1px] w-8 bg-[#C5A059]" />
        </div>

        {/* Centerpiece Motto in Hindi */}
        <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-wide text-[#FDFBF7] leading-[1.2]">
          &ldquo;EK VISHWASH, <br />
          EK KADAM <br />
          <span className="text-[#C5A059] italic font-normal">
            SWACHHTA KI AUR.
          </span>
          &rdquo;
        </h2>

        {/* Subordinate Brand Plaque */}
        <div className="pt-4 space-y-2">
          <p className="font-serif text-xl sm:text-2xl text-[#FDFBF7] tracking-widest uppercase font-light">
            {BRAND_DATA.brandName}
          </p>
          <p className="text-[11px] sm:text-xs tracking-[0.25em] text-[#C5A059] font-sans uppercase font-bold">
            {BRAND_DATA.brandRelation}
          </p>
        </div>

        {/* Elegant Frame Outline */}
        <div className="pt-6 max-w-xl mx-auto">
          <div className="border border-[#C5A05930] rounded-xl p-6 bg-[#252525]/60 backdrop-blur-sm">
            <p className="text-xs sm:text-sm text-[#FDFBF780] leading-relaxed font-sans">
              Cleanliness is a collective commitment. A step taken with sincerity within one&apos;s home
              ripples out into our neighbourhoods, our workplaces, and our nation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
