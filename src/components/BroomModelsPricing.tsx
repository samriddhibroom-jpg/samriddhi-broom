import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Check,
  ArrowUpRight,
  Phone,
  MessageCircle,
  Ruler,
  Weight,
  Sparkles,
  Upload,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { BRAND_DATA, BROOM_MODELS, WAREHOUSE_STOCK_IMAGE } from '../data/brandData';
import { BroomModel } from '../types';
import { persistBroomImage, loadBroomImage, resetBroomImage } from '../utils/imageStorage';

interface BroomModelsPricingProps {
  onSelectModelForEnquiry?: (modelName: string) => void;
}

const ModelCardImage: React.FC<{ model: BroomModel }> = ({ model }) => {
  const [customSrc, setCustomSrc] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from durable storage (localStorage, IndexedDB, or server disk)
  useEffect(() => {
    let isMounted = true;
    loadBroomImage(model.id).then((src) => {
      if (isMounted && src) {
        setCustomSrc(src);
      }
    });

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ modelId: string; dataUrl: string | null }>;
      if (customEvent.detail && customEvent.detail.modelId === model.id) {
        setCustomSrc(customEvent.detail.dataUrl);
        setCandidateIdx(0);
      }
    };

    window.addEventListener('samriddhi_broom_image_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('samriddhi_broom_image_updated', handleUpdate);
    };
  }, [model.id]);

  const candidates = useMemo(() => {
    const list: string[] = [];
    if (customSrc) list.push(customSrc);
    if (model.image) list.push(model.image);
    return list;
  }, [customSrc, model.image]);

  const [candidateIdx, setCandidateIdx] = useState(0);

  const saveAndSetImage = async (file: File) => {
    setIsSaving(true);
    try {
      const savedDataUrl = await persistBroomImage(model.id, file);
      setCustomSrc(savedDataUrl);
      setCandidateIdx(0);
    } catch (err) {
      console.error('Failed to persist photo', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await resetBroomImage(model.id);
    } catch (err) {
      console.warn('Could not remove custom image', err);
    }
    setCustomSrc(null);
    setCandidateIdx(0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      saveAndSetImage(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      saveAndSetImage(file);
    }
  };

  const currentImgSrc = candidates[candidateIdx] || model.image;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      title="Click or drag and drop to upload an image"
      className={`relative mt-3 rounded-lg overflow-hidden border transition-all duration-200 bg-[#F5F2EB]/60 aspect-[16/8] group cursor-pointer ${
        isDragging ? 'border-[#C5A059] ring-2 ring-[#C5A059]/30 bg-[#C5A059]/10' : 'border-[#1A1A1A10] hover:border-[#C5A059]/50'
      }`}
    >
      <img
        id={`pricing-model-photo-${model.id}`}
        src={currentImgSrc}
        alt={model.name}
        referrerPolicy="no-referrer"
        loading="eager"
        onError={() => {
          if (candidateIdx < candidates.length - 1) {
            setCandidateIdx((prev) => prev + 1);
          }
        }}
        className="w-full h-full object-contain object-center group-hover:scale-102 transition-transform duration-300"
      />

      {/* Saving / Processing Spinner */}
      {isSaving && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#C5A059] mb-1" />
          <span className="text-[11px] font-medium tracking-wide">Saving & optimizing photo...</span>
        </div>
      )}

      {/* Drag & drop overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-[#C5A059]/20 backdrop-blur-xs flex flex-col items-center justify-center border-2 border-dashed border-[#C5A059] rounded-lg z-20 pointer-events-none">
          <Upload className="w-8 h-8 text-[#C5A059] animate-bounce mb-1" />
          <span className="text-xs font-semibold text-[#1A1A1A] bg-white/95 px-2.5 py-1 rounded shadow-xs">
            Drop image file here
          </span>
        </div>
      )}

      {/* Status Badge */}
      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-xs text-[10px] text-white font-medium flex items-center gap-1.5 shadow-xs pointer-events-none">
        <span className={`w-1.5 h-1.5 rounded-full ${customSrc ? 'bg-[#25D366]' : 'bg-[#C5A059]'}`} />
        <span>{customSrc ? 'Custom Uploaded Photo' : 'Factory Stock'}</span>
      </div>

      {/* Prominent Upload & Replace Controls */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
        {customSrc && (
          <button
            type="button"
            onClick={handleReset}
            title="Reset to default factory photo"
            className="px-2 py-1 bg-white/95 hover:bg-white text-rose-700 hover:text-rose-800 text-[10px] font-medium tracking-tight rounded border border-rose-200 shadow-xs backdrop-blur-xs flex items-center gap-1 cursor-pointer transition-all hover:scale-105"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          title="Browse file to upload"
          className="px-2.5 py-1 bg-[#1A1A1A]/95 hover:bg-[#1A1A1A] text-[#FDFBF7] text-[10px] font-semibold tracking-tight rounded border border-[#C5A059]/40 shadow-xs backdrop-blur-xs flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
        >
          <Upload className="w-3 h-3 text-[#C5A059]" />
          <span>Upload Image</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Hover prompt hint */}
      <div className="absolute inset-x-0 bottom-0 py-1 bg-gradient-to-t from-black/50 to-transparent text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <span className="text-[9px] text-white/90 font-medium">Click or drag & drop image to replace</span>
      </div>
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
