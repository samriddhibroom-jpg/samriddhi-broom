import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Check,
  ArrowUpRight,
  Phone,
  MessageCircle,
  Ruler,
  Weight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { BRAND_DATA, BROOM_MODELS, WAREHOUSE_STOCK_IMAGE, SAMRIDDHI_PREMIUM_UNWRAPPED_IMAGE } from '../data/brandData';
import { BroomModel, BroomImageItem } from '../types';

interface BroomModelsPricingProps {
  onSelectModelForEnquiry?: (modelName: string) => void;
}

const FallbackSlideImage: React.FC<{
  id?: string;
  urls: string[];
  alt: string;
}> = ({ id, urls, alt }) => {
  const [index, setIndex] = useState(0);

  const handleError = () => {
    if (index < urls.length - 1) {
      setIndex((prev) => prev + 1);
    }
  };

  return (
    <img
      id={id}
      src={urls[index]}
      alt={alt}
      onError={handleError}
      referrerPolicy="no-referrer"
      loading="lazy"
      className="w-full h-full object-contain object-center group-hover:scale-103 transition-transform duration-300 drop-shadow-xs pointer-events-none select-none"
    />
  );
};

const ModelCardImage: React.FC<{ model: BroomModel }> = ({ model }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const slides: {
    id: string;
    label: string;
    caption: string;
    tag?: string;
    candidateUrls: string[];
  }[] = React.useMemo(() => {
    if (model.gallery && model.gallery.length > 0) {
      return model.gallery.map((g) => ({
        id: g.id,
        label: g.label,
        caption: g.caption,
        tag: g.tag,
        candidateUrls: [g.url, ...(g.fallbackUrls || []), model.image || ''],
      }));
    }

    if (model.id === 'samriddhi-premium') {
      return [
        {
          id: 'packaged',
          label: 'With Wrapper',
          caption: 'Signature royal blue dust-free protective sleeve',
          tag: 'Retail Packed',
          candidateUrls: [
            '/assets/samriddhi_premium.png.png',
            '/assets/samriddhi_premium.png',
            '/assets/samriddhi_premium.jpg',
            model.image || '',
          ],
        },
        {
          id: 'unwrapped',
          label: 'Unwrapped Grass',
          caption: 'Raw Meghalaya hill grass & fluorescent handle (excluding wrapper)',
          tag: 'Natural Bristles',
          candidateUrls: [
            SAMRIDDHI_PREMIUM_UNWRAPPED_IMAGE,
            '/assets/WhatsApp%20Image%202026-09-10%20at%2010.19.41%20AM.jpeg',
            '/assets/samriddhi_premium_unwrapped.jpg',
            '/assets/samriddhi_premium_unwrapped.png',
            '/assets/samriddhi_premium_unwrapped.jpeg',
          ],
        },
      ];
    }

    return [
      {
        id: 'packaged',
        label: 'With Wrapper',
        caption: 'Luxury black & gold protective sleeve',
        tag: 'Retail Packed',
        candidateUrls: [
          '/assets/samriddhi_gold.png.png',
          '/assets/samriddhi_gold.png',
          '/assets/samriddhi_gold.jpg',
          model.image || '',
        ],
      },
      {
        id: 'unwrapped',
        label: 'Unwrapped Grass',
        caption: 'Royal blue ribbed handle & thick natural grass bristles (excluding wrapper)',
        tag: 'Natural Bristles',
        candidateUrls: [
          '/assets/samridhi gold.jpeg',
          '/assets/samridhi%20gold.jpeg',
          '/assets/samridhi_gold.jpeg',
          '/assets/samriddhi_gold_unwrapped.jpeg',
          '/assets/samriddhi_gold_unwrapped.jpg',
          '/assets/samriddhi_blue_handle_broom_1788630392135.jpg',
        ],
      },
    ];
  }, [model]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    if (clientWidth > 0) {
      const nextIndex = Math.round(scrollLeft / clientWidth);
      if (nextIndex !== activeSlide && nextIndex >= 0 && nextIndex < slides.length) {
        setActiveSlide(nextIndex);
      }
    }
  };

  const scrollToSlide = (index: number) => {
    if (!scrollRef.current) return;
    const target = Math.max(0, Math.min(slides.length - 1, index));
    scrollRef.current.scrollTo({
      left: target * scrollRef.current.clientWidth,
      behavior: 'smooth',
    });
    setActiveSlide(target);
  };

  const hasMultiple = slides.length > 1;

  return (
    <div className="relative mt-3 rounded-lg overflow-hidden border border-[#1A1A1A15] hover:border-[#C5A059]/60 transition-all duration-300 bg-gradient-to-b from-[#F5F2EB]/90 to-[#EFEBE1]/80 group shadow-xs">
      {/* Sliding Scroll Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth w-full aspect-[16/8] no-scrollbar scrollbar-none cursor-grab active:cursor-grabbing"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className="w-full shrink-0 h-full snap-center relative flex items-center justify-center px-4"
          >
            <FallbackSlideImage
              id={idx === 0 ? `pricing-model-photo-${model.id}` : `pricing-model-photo-${model.id}-${slide.id}`}
              urls={slide.candidateUrls}
              alt={`${model.name} - ${slide.label}`}
            />
          </div>
        ))}
      </div>

      {/* Top Bar: View Tag & Slide Counter */}
      <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none z-20">
        <span className="px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-xs text-[10px] font-semibold text-[#FDFBF7] tracking-wider uppercase flex items-center gap-1.5 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse" />
          {slides[activeSlide]?.tag || 'Catalog View'}
        </span>

        {hasMultiple && (
          <span className="px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-xs text-[10px] font-medium text-white/90 shadow-xs">
            {activeSlide + 1} / {slides.length}
          </span>
        )}
      </div>

      {/* Navigation Arrows for Multiple Photos */}
      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              scrollToSlide(activeSlide - 1);
            }}
            disabled={activeSlide === 0}
            title="Previous photo"
            aria-label="Previous photo"
            className={`absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-[#1A1A1A] text-white flex items-center justify-center transition-all duration-200 z-20 backdrop-blur-xs cursor-pointer shadow-md ${
              activeSlide === 0 ? 'opacity-0 pointer-events-none' : 'opacity-85 hover:opacity-100 hover:scale-110'
            }`}
          >
            <ChevronLeft className="w-4 h-4 text-[#FDFBF7]" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              scrollToSlide(activeSlide + 1);
            }}
            disabled={activeSlide === slides.length - 1}
            title="Next photo (unwrapped view)"
            aria-label="Next photo"
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-[#1A1A1A] text-white flex items-center justify-center transition-all duration-200 z-20 backdrop-blur-xs cursor-pointer shadow-md ${
              activeSlide === slides.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-85 hover:opacity-100 hover:scale-110'
            }`}
          >
            <ChevronRight className="w-4 h-4 text-[#FDFBF7]" />
          </button>
        </>
      )}

      {/* Bottom Bar: Slide Switcher Pills & Dot Indicators */}
      {hasMultiple && (
        <div className="absolute bottom-2 inset-x-2 flex flex-col sm:flex-row items-center justify-between gap-1 z-20 pointer-events-none">
          {/* Quick Toggle Pills */}
          <div className="flex items-center gap-1 bg-black/75 backdrop-blur-md p-0.5 rounded-full pointer-events-auto shadow-xs">
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToSlide(idx);
                }}
                className={`px-2 py-0.5 text-[9px] font-semibold rounded-full transition-all duration-200 cursor-pointer ${
                  activeSlide === idx
                    ? 'bg-[#C5A059] text-[#1A1A1A] shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {slide.label}
              </button>
            ))}
          </div>

          {/* Swipe / Scroll Hint */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[9px] text-[#FDFBF7]/80 pointer-events-none">
            <Layers className="w-2.5 h-2.5 text-[#C5A059]" />
            <span>Slide or tap to switch</span>
          </div>
        </div>
      )}
    </div>
  );
};

export const BroomModelsPricing: React.FC<BroomModelsPricingProps> = ({
  onSelectModelForEnquiry,
}) => {
  const handleOrderWhatsApp = (model: BroomModel) => {
    const text = encodeURIComponent(
      `Hello Adhrit Industries, I am interested in ordering ${model.name} (${model.modelCode}) for bulk supply (500+ units). Please share wholesale catalog, product details, and dispatch schedule.`
    );
    window.open(`https://wa.me/91${BRAND_DATA.phone}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleEnquiryClick = (model: BroomModel) => {
    const enquiryName = `${model.name} (${model.modelCode}) - Bulk Order (500+ Units)`;
    if (onSelectModelForEnquiry) {
      onSelectModelForEnquiry(enquiryName);
    } else {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section
      id="pricing"
      className="relative py-14 sm:py-20 px-4 sm:px-6 lg:px-12 bg-[#FDFBF7] border-t border-[#1A1A1A10] overflow-hidden"
    >
      {/* Anchor for backward compatibility with existing links to #opening */}
      <div id="opening" className="absolute -top-20 left-0 w-1 h-1 pointer-events-none" />

      {/* Subtle ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(197,160,89,0.06)_0%,transparent_65%)] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-10">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2.5">
            <span className="h-[1px] w-6 bg-[#C5A059]" />
            <span className="text-[10px] sm:text-[11px] tracking-[0.28em] uppercase font-bold text-[#C5A059] font-sans">
              MODELS & SPECIFICATIONS
            </span>
            <span className="h-[1px] w-6 bg-[#C5A059]" />
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl text-[#1A1A1A] font-light tracking-tight leading-tight">
            Two Broom Grades. Direct Factory Supply.
          </h2>

          <p className="text-xs sm:text-sm text-[#1A1A1A]/75 font-sans leading-relaxed">
            Manufactured in Ranchi with selected Meghalaya and Assam hill grass. Available for direct factory bulk supply (500+ units packed in 50-piece master cartons) for retailers, wholesalers, and distributors.
          </p>
        </div>

        {/* Side-by-Side Cards: Compact 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-stretch">
          {BROOM_MODELS.map((model, idx) => {
            const isPopular = model.isPopular;

            return (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className={`relative rounded-xl bg-white p-6 sm:p-7 flex flex-col justify-between transition-all ${
                  isPopular
                    ? 'border-2 border-[#C5A059] shadow-sm ring-1 ring-[#C5A059]/15'
                    : 'border border-[#1A1A1A12] shadow-xs hover:border-[#C5A059]/50'
                }`}
              >
                {/* Header & Tag */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[9px] sm:text-[10px] tracking-[0.2em] font-bold uppercase px-2.5 py-0.8 rounded-full font-sans ${
                        isPopular
                          ? 'bg-[#C5A059] text-white'
                          : 'bg-[#1A1A1A]/5 text-[#1A1A1A]/75 border border-[#1A1A1A10]'
                      }`}
                    >
                      {model.badge}
                    </span>
                    <span className="text-[11px] font-mono text-[#1A1A1A]/45">
                      {model.modelCode}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl text-[#1A1A1A] font-light tracking-tight leading-snug">
                    {model.name}
                  </h3>
                  <p className="text-xs text-[#4A5D4E] font-medium mt-0.5">
                    {model.subTitle}
                  </p>

                  {/* Real Product Stock Photo with Exact Photo Upload Support */}
                  {model.image && <ModelCardImage model={model} />}

                  {/* Commercial Supply & Packaging Info (Prices Removed) */}
                  <div className="mt-3.5 p-3.5 rounded-lg bg-[#FDFBF7] border border-[#C5A05925] flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#C5A059] block font-sans">
                        Packaging & Supply
                      </span>
                      <span className="font-serif text-lg text-[#1A1A1A] font-normal block leading-tight mt-0.5">
                        Bulk Supply: 500+ Units
                      </span>
                      <span className="text-[11px] text-[#1A1A1A]/65 font-sans block mt-0.5">
                        Factory sealed • 50-pc master cartons • Direct dispatch
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-block text-[9px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-[#1A1A1A] text-white font-sans">
                        Ready Stock
                      </span>
                    </div>
                  </div>

                  {/* Key Quick Specs */}
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    <div className="flex items-center gap-1.5 p-2 rounded bg-[#F5F2EB]/50 border border-[#1A1A1A06]">
                      <Ruler className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                      <span className="text-[#1A1A1A] font-medium truncate">{model.length}</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 rounded bg-[#F5F2EB]/50 border border-[#1A1A1A06]">
                      <Weight className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                      <span className="text-[#1A1A1A] font-medium truncate">{model.weight}</span>
                    </div>
                  </div>

                  {/* Core Features list */}
                  <ul className="mt-3.5 space-y-1.5 text-xs text-[#1A1A1A]/75 font-sans">
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C5A059] shrink-0 mt-0.5" />
                      <span>{model.features[0]}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C5A059] shrink-0 mt-0.5" />
                      <span>{model.features[1]}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C5A059] shrink-0 mt-0.5" />
                      <span className="font-medium text-[#1A1A1A]">Best for: {model.bestFor}</span>
                    </li>
                  </ul>
                </div>

                {/* Direct Action */}
                <div className="mt-5 pt-3.5 border-t border-[#1A1A1A08] space-y-2">
                  <button
                    type="button"
                    onClick={() => handleOrderWhatsApp(model)}
                    id={`order-whatsapp-${model.id}-btn`}
                    className="w-full py-2.5 px-4 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold tracking-wider uppercase transition-all shadow-xs flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-white text-transparent" />
                    <span>Inquire on WhatsApp</span>
                    <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEnquiryClick(model)}
                    id={`inquire-direct-${model.id}-btn`}
                    className="w-full text-center text-[11px] text-[#1A1A1A]/65 hover:text-[#C5A059] font-medium transition-colors cursor-pointer py-0.5"
                  >
                    Send Direct Inquiry / Request Wholesale Quote →
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Wholesale Inventory & Warehouse Stock Display */}
        <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#1A1A1A10] shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-24 h-20 shrink-0 rounded-lg overflow-hidden border border-[#1A1A1A12] relative group">
              <img
                src={WAREHOUSE_STOCK_IMAGE}
                alt="Adhrit Industries Samriddhi Broom Warehouse Stock in Ranchi"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded bg-black/75 text-[8px] text-white font-mono">
                Godown Stock
              </span>
            </div>
            <div className="space-y-1 text-left">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#C5A059] block font-sans">
                Wholesale & Factory Dispatch
              </span>
              <h4 className="font-serif text-lg sm:text-xl text-[#1A1A1A] font-light">
                Ready Stock for Retailers, Wholesalers & Distributors
              </h4>
              <p className="text-xs text-[#1A1A1A]/70 font-sans">
                Bulk supply of 500+ units packed in standard 50-piece master cartons. Daily transport available across Jharkhand, Bihar, Bengal, Odisha & pan-India.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <a
              href={`tel:${BRAND_DATA.phone}`}
              className="flex-1 sm:flex-none py-2.5 px-4 rounded-full border border-[#1A1A1A20] hover:border-[#C5A059] hover:bg-[#C5A059]/5 text-[#1A1A1A] text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Call {BRAND_DATA.displayPhone}</span>
            </a>
            <a
              href={`https://wa.me/91${BRAND_DATA.phone}?text=${encodeURIComponent(
                'Hello Adhrit Industries, I am interested in bulk wholesale order (500+ units) of Samriddhi Broom. Please share distributor terms.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none py-2.5 px-4 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-1.5 shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white text-transparent" />
              <span>Wholesale WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
