import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  Info,
  Eye,
} from 'lucide-react';
import { BRAND_DATA, PRODUCT_CATEGORIES } from '../data/brandData';
import { ProductCategory } from '../types';
import { GoldDivider } from './OrnamentalAssets';

interface ProductShowcaseProps {
  onSelectCategoryForEnquiry: (categoryName: string) => void;
}

export const ProductShowcase: React.FC<ProductShowcaseProps> = ({
  onSelectCategoryForEnquiry,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<ProductCategory | null>(null);

  const displayedCategories =
    activeCategory === 'all'
      ? PRODUCT_CATEGORIES
      : PRODUCT_CATEGORIES.filter((c) => c.id === activeCategory);

  return (
    <section
      id="samriddhi"
      className="relative py-28 px-4 sm:px-6 lg:px-12 bg-[#FDFBF7] border-t border-[#1A1A1A10] overflow-hidden"
    >
      {/* Background radial accent */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(197,160,89,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#C5A059] text-[#C5A059] text-[10px] uppercase tracking-widest font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Product Collection</span>
          </div>

          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#1A1A1A] font-light tracking-tight">
            {BRAND_DATA.brandName}
          </h2>

          <div className="space-y-1">
            <p className="text-[11px] sm:text-xs font-semibold text-[#1A1A1A]/70 uppercase tracking-[0.2em] font-sans">
              {BRAND_DATA.brandRelation}
            </p>
            <p className="font-serif italic text-base sm:text-lg text-[#4A5D4E]">
              &ldquo;{BRAND_DATA.tagline}&rdquo;
            </p>
          </div>

          <GoldDivider className="pt-2" />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-5 py-2.5 rounded-full text-[11px] uppercase tracking-widest font-medium transition-all cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-[#1A1A1A] text-white shadow-xs'
                : 'bg-white text-[#1A1A1A]/75 hover:text-[#1A1A1A] border border-[#1A1A1A10]'
            }`}
          >
            All Categories
          </button>
          {PRODUCT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-[11px] uppercase tracking-widest font-medium transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'bg-white text-[#1A1A1A]/75 hover:text-[#1A1A1A] border border-[#1A1A1A10]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Cards Grid / Horizontal Showcase */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedCategories.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="relative group bg-white rounded-2xl p-6 border border-[#1A1A1A10] hover:border-[#C5A059] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              {/* Category Card Header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-widest text-[#C5A059] font-bold">
                    0{index + 1}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider bg-[#FDFBF7] text-[#4A5D4E] px-2 py-0.5 rounded font-bold border border-[#C5A05930]">
                    Category
                  </span>
                </div>

                <div className="pt-2">
                  <h4 className="font-serif text-xl text-[#1A1A1A] group-hover:text-[#C5A059] transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-xs text-[#C5A059] font-medium tracking-wide mt-0.5">
                    {item.subtitle}
                  </p>
                </div>

                <p className="text-xs text-[#1A1A1A]/75 leading-relaxed font-sans pt-1">
                  {item.description}
                </p>

                <div className="pt-3 border-t border-[#1A1A1A10] space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/50 block">
                    Target Application
                  </span>
                  <p className="text-xs text-[#4A5D4E] font-medium">{item.suitableFor}</p>
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="pt-6 mt-4 border-t border-[#1A1A1A10] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(item)}
                  className="text-xs font-semibold text-[#1A1A1A] hover:text-[#C5A059] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>View Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectCategoryForEnquiry(item.name)}
                  className="w-8 h-8 rounded-full bg-[#FDFBF7] group-hover:bg-[#1A1A1A] group-hover:text-white text-[#1A1A1A] flex items-center justify-center transition-colors border border-[#1A1A1A10] cursor-pointer"
                  aria-label={`Enquire about ${item.name}`}
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Honest Business Placeholder Notice */}
        <div className="flex items-center justify-center gap-2 p-3 bg-white rounded-xl text-center text-xs text-[#1A1A1A]/70 max-w-2xl mx-auto border border-[#C5A05930] shadow-xs">
          <Info className="w-4 h-4 text-[#C5A059] shrink-0" />
          <span>
            <strong>Note for Retailers & Consumers:</strong> Categories shown represent proposed product
            segments. Actual specifications and dimensions will be unveiled during the official launch.
          </span>
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-[#FDFBF7] max-w-lg w-full rounded-2xl p-6 sm:p-8 border border-[#C5A05930] shadow-2xl relative space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] tracking-widest uppercase font-bold text-[#C5A059]">
                  Product Category Overview
                </span>
                <h3 className="font-serif text-2xl text-[#1A1A1A] mt-1">
                  {selectedProduct.name}
                </h3>
                <p className="text-xs text-[#4A5D4E] font-medium">{selectedProduct.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 rounded-full hover:bg-white text-[#1A1A1A] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-[#1A1A1A]/80 leading-relaxed font-sans">
              {selectedProduct.description}
            </p>

            <div className="bg-white p-4 rounded-xl border border-[#C5A05930] space-y-2 text-xs">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/50">
                  Ideal Environment
                </span>
                <p className="font-medium text-[#1A1A1A]">{selectedProduct.suitableFor}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/50">
                  Manufacturing Standard
                </span>
                <p className="text-[#1A1A1A]/80">
                  A Unit of Adhrit Industries • Ek Vishwash, Ek Kadam Swachhta ki aur
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const catName = selectedProduct.name;
                  setSelectedProduct(null);
                  onSelectCategoryForEnquiry(catName);
                }}
                className="flex-1 py-3 bg-[#1A1A1A] hover:bg-[#4A5D4E] text-white text-[11px] font-bold tracking-widest uppercase transition-colors cursor-pointer"
              >
                Enquire for this Category
              </button>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="px-5 py-3 border border-[#1A1A1A10] text-[11px] uppercase tracking-wider font-bold text-[#1A1A1A] hover:bg-white cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
