import React from 'react';
import { motion } from 'motion/react';
import { BRAND_DATA } from '../data/brandData';
import { BotanicalCorner, GoldDivider } from './OrnamentalAssets';
import cleanHomeImg from '../assets/images/adhrit_office_desk_1788453287901.jpg';

export const AboutSection: React.FC = () => {
  return (
    <section
      id="about"
      className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-12 bg-[#FDFBF7] border-t border-[#1A1A1A10] overflow-hidden"
    >
      {/* Background floral accents */}
      <div className="absolute top-12 right-12 pointer-events-none opacity-30">
        <BotanicalCorner position="top-right" />
      </div>
      <div className="absolute bottom-12 left-12 pointer-events-none opacity-30">
        <BotanicalCorner position="bottom-left" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Section Header Tag */}
        <div className="flex items-center gap-3 mb-4">
          <span className="h-[1px] w-6 bg-[#C5A059]" />
          <span className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase font-bold text-[#C5A059] font-sans">
            HERITAGE & VISION • {BRAND_DATA.companyName}
          </span>
        </div>

        {/* 2-Column Editorial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Big Editorial Typography */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#1A1A1A] font-light leading-[1.12] tracking-tight">
              BUILT ON BELIEF. <br />
              <span className="italic text-[#C5A059]">DRIVEN BY</span> <br />
              CLEANLINESS.
            </h2>

            {/* Editorial blockquote / statement */}
            <div className="p-6 bg-white border-l-2 border-[#C5A059] border-t border-r border-b border-[#1A1A1A10] space-y-2 shadow-xs">
              <p className="font-serif text-lg sm:text-xl text-[#4A5D4E] italic">
                &ldquo;Ek Vishwash, Ek Kadam Swachhta ki aur&rdquo;
              </p>
              <p className="text-[11px] text-[#1A1A1A]/70 uppercase tracking-widest font-sans font-medium">
                Founding Philosophy — {BRAND_DATA.brandName}
              </p>
            </div>

            {/* Aesthetic photography component */}
            <div className="relative rounded-2xl overflow-hidden border border-[#1A1A1A10] shadow-sm group">
              <img
                src={cleanHomeImg}
                alt="Adhrit Industries administrative desk and operations office in Ranchi"
                referrerPolicy="no-referrer"
                className="w-full h-64 sm:h-72 object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 text-white">
                <p className="text-[10px] tracking-widest uppercase text-[#C5A059] font-bold">
                  Operations & Administration
                </p>
                <p className="font-serif text-sm sm:text-base text-stone-100">
                  Headquarters & order dispatch desk • Ranchi, Jharkhand
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Company Narrative & Value Pillars */}
          <div className="lg:col-span-6 space-y-8 lg:pt-4">
            <div className="space-y-5 text-base sm:text-lg text-[#1A1A1A]/80 leading-relaxed font-sans">
              <p className="font-medium text-[#1A1A1A]">
                <strong>{BRAND_DATA.companyName}</strong> is the enterprise behind{' '}
                <strong className="text-[#C5A059]">{BRAND_DATA.brandName}</strong>, bringing its
                vision of dependable everyday cleanliness to homes and spaces.
              </p>

              <p>
                Rooted in the fundamental Indian principle that true prosperity and well-being
                reside in a spotless, harmonious environment, our endeavor focuses on providing
                practical, dependable sweeping solutions for every household.
              </p>

              <p>
                From living quarters to corridors, every home deserves an instrument that makes daily
                maintenance effortless, balanced, and dignified. We introduce our flagship product
                line with sincerity, precision, and heartfelt commitment to the craft of cleanliness.
              </p>
            </div>

            <GoldDivider withLeaf={true} className="my-6 justify-start" />

            {/* Editorial Business Information Plaque */}
            <div className="bg-white border border-[#C5A05930] p-6 rounded-xl space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-dashed border-[#C5A05940] pb-3">
                <span className="text-xs font-bold tracking-wider text-[#1A1A1A] uppercase">
                  Enterprise Framework
                </span>
                <span className="text-[10px] text-[#4A5D4E] bg-[#4A5D4E]/10 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  Verified Brand
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#1A1A1A]/80">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-[#1A1A1A]/50">
                    Parent Entity
                  </span>
                  <strong className="font-serif text-sm text-[#1A1A1A]">
                    {BRAND_DATA.companyName}
                  </strong>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-[#1A1A1A]/50">
                    Product Brand
                  </span>
                  <strong className="font-serif text-sm text-[#C5A059]">
                    {BRAND_DATA.brandName}
                  </strong>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-[#1A1A1A]/50">
                    Headquarters
                  </span>
                  <span>Ranchi, Jharkhand</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-[#1A1A1A]/50">
                    Customer Enquiries
                  </span>
                  <span className="font-medium text-[#1A1A1A]">{BRAND_DATA.displayPhone}</span>
                </div>
              </div>

              <p className="text-[11px] text-[#1A1A1A]/50 italic pt-1">
                * Note: Official business details strictly adhered to verified brand materials.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
