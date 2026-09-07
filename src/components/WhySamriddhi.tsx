import React from 'react';
import { Sparkles, Feather, ShieldCheck, Footprints } from 'lucide-react';
import { motion } from 'motion/react';
import { WHY_FEATURES, BRAND_DATA } from '../data/brandData';
import { GoldDivider, BotanicalCorner } from './OrnamentalAssets';

export const WhySamriddhi: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'sparkles':
        return <Sparkles className="w-5 h-5 text-[#C5A059]" strokeWidth={1.4} />;
      case 'feather':
        return <Feather className="w-5 h-5 text-[#C5A059]" strokeWidth={1.4} />;
      case 'shield':
        return <ShieldCheck className="w-5 h-5 text-[#C5A059]" strokeWidth={1.4} />;
      case 'footprints':
        return <Footprints className="w-5 h-5 text-[#C5A059]" strokeWidth={1.4} />;
      default:
        return <Sparkles className="w-5 h-5 text-[#C5A059]" strokeWidth={1.4} />;
    }
  };

  return (
    <section
      id="why-us"
      className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-12 bg-[#FDFBF7] border-t border-[#1A1A1A10] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-3">
            <span className="h-[1px] w-6 bg-[#C5A059]" />
            <span className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase font-bold text-[#C5A059] font-sans">
              CORE FOUNDATIONS
            </span>
            <span className="h-[1px] w-6 bg-[#C5A059]" />
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl text-[#1A1A1A] font-light tracking-tight">
            WHY SAMRIDDHI?
          </h2>

          <p className="text-sm sm:text-base text-[#1A1A1A]/75 font-sans leading-relaxed">
            Every home needs tools that perform without complication. Here are the core values
            that define our approach to household hygiene and product reliability.
          </p>

          <GoldDivider />
        </div>

        {/* 4 Feature Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {WHY_FEATURES.map((item, index) => (
            <motion.div
              key={item.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative p-6 sm:p-7 rounded-2xl bg-white border border-[#1A1A1A10] hover:border-[#C5A059] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Top Row: Index and Icon */}
                <div className="flex items-center justify-between">
                  <span className="font-serif text-2xl text-[#C5A059] font-light">
                    {item.number}
                  </span>
                  <div className="p-2.5 rounded-full bg-[#FDFBF7] border border-[#C5A05930]">
                    {getIcon(item.iconName)}
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-serif text-lg sm:text-xl text-[#1A1A1A] leading-snug tracking-tight">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-[#1A1A1A]/75 font-sans leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Bottom Subtle Accent */}
              <div className="pt-6 mt-4 border-t border-[#1A1A1A10] flex items-center justify-between text-[11px] text-[#4A5D4E] font-medium">
                <span>{BRAND_DATA.brandName}</span>
                <span className="text-[#C5A059] text-xs">✦</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
