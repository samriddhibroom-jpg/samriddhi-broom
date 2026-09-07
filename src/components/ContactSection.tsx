import React, { useState, useEffect } from 'react';
import { Phone, MessageSquare, Send, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import { BRAND_DATA } from '../data/brandData';
import { GoldDivider, BotanicalCorner } from './OrnamentalAssets';

interface ContactSectionProps {
  prefilledCategory?: string;
  onOpenDPDPModal?: (tab?: 'notice' | 'rights' | 'request' | 'grievance') => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  prefilledCategory = '',
  onOpenDPDPModal,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });

  const [dpdpConsent, setDpdpConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (prefilledCategory) {
      setFormData((prev) => ({
        ...prev,
        message: `Hello Adhrit Industries, I would like to enquire about Samriddhi Broom (${prefilledCategory}).`,
      }));
    }
  }, [prefilledCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 8) {
      setError('Please provide a valid contact number.');
      return;
    }
    if (!dpdpConsent) {
      setError('Statutory Requirement: Under the DPDP Act, 2023, please confirm your consent for Adhrit Industries to process your contact details for this enquiry.');
      return;
    }

    setSubmitting(true);
    // Simulate natural clean submission
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  const whatsappLink = `https://wa.me/91${BRAND_DATA.phone}?text=${encodeURIComponent(
    formData.message || 'Hello Adhrit Industries, I am interested in Samriddhi Broom™.'
  )}`;

  return (
    <section
      id="contact"
      className="relative py-28 sm:py-36 px-4 sm:px-6 lg:px-12 bg-[#FDFBF7] border-t border-[#1A1A1A10] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2">
            <span className="h-[1px] w-6 bg-[#C5A059]" />
            <span className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase font-bold text-[#C5A059] font-sans">
              COMMUNICATION & INQUIRIES
            </span>
            <span className="h-[1px] w-6 bg-[#C5A059]" />
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl text-[#1A1A1A] font-light tracking-tight">
            LET&apos;S KEEP THINGS CLEAN.
          </h2>

          <p className="text-sm sm:text-base text-[#1A1A1A]/75 font-sans">
            For enquiries and business conversations, get in touch with ADHRIT INDUSTRIES.
          </p>

          <GoldDivider />
        </div>

        {/* 2-Column Contact Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct Communication Hub */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white p-8 rounded-2xl border border-[#C5A05930] space-y-6 shadow-sm">
              <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold block">
                Direct Channels
              </span>

              <h3 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A] font-light">
                Speak directly with the Adhrit Industries family.
              </h3>

              <p className="text-xs sm:text-sm text-[#1A1A1A]/75 leading-relaxed font-sans">
                Whether you represent a household, a regional distribution partner, or are curious
                about the upcoming Samriddhi Broom™ launch ceremony, our representatives are ready to assist.
              </p>

              {/* Verified Phone Plaque */}
              <div className="p-5 rounded-xl bg-[#FDFBF7] border border-[#C5A05930] space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/50 block font-semibold">
                  Official Phone Line
                </span>
                <a
                  href={`tel:${BRAND_DATA.phone}`}
                  className="font-sans font-semibold text-2xl text-[#1A1A1A] hover:text-[#C5A059] transition-colors tracking-tight block"
                >
                  {BRAND_DATA.displayPhone}
                </a>
                <span className="text-xs text-[#4A5D4E] font-medium">Available during operational hours</span>
              </div>

              {/* Action Buttons: CALL US & WHATSAPP US */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={`tel:${BRAND_DATA.phone}`}
                  id="contact-call-us-btn"
                  className="flex-1 py-3.5 px-5 bg-[#1A1A1A] hover:bg-[#4A5D4E] text-white text-[11px] font-bold tracking-widest uppercase transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>CALL US</span>
                </a>

                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="contact-whatsapp-us-btn"
                  className="flex-1 py-3.5 px-5 bg-[#C5A059] hover:bg-[#A88846] text-white text-[11px] font-bold tracking-widest uppercase transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WHATSAPP US</span>
                </a>
              </div>
            </div>

            {/* Address Summary */}
            <div className="p-6 rounded-2xl bg-white border border-[#1A1A1A10] space-y-2 text-xs text-[#1A1A1A]/80 shadow-xs">
              <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold block">
                Office & Inaugural Address
              </span>
              <p className="font-medium text-[#1A1A1A]">
                {BRAND_DATA.openingCeremony.venueName}, {BRAND_DATA.openingCeremony.street}, {BRAND_DATA.openingCeremony.area}, {BRAND_DATA.openingCeremony.cityState}
              </p>
            </div>
          </div>

          {/* Right Column: Enquiry Form */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-2xl border border-[#C5A05930] shadow-sm">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#4A5D4E]/10 text-[#4A5D4E] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A]">
                  Enquiry Received with Thanks
                </h3>
                <p className="text-sm text-[#1A1A1A]/75 max-w-md mx-auto font-sans leading-relaxed">
                  Thank you for reaching out to <strong>ADHRIT INDUSTRIES</strong>. Our team will
                  review your message and get in touch with you shortly at{' '}
                  <span className="font-semibold text-[#1A1A1A]">{formData.phone}</span>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', phone: '', email: '', message: '' });
                    setDpdpConsent(false);
                  }}
                  className="mt-6 px-6 py-3 border border-[#1A1A1A] text-[11px] font-bold text-[#1A1A1A] uppercase tracking-widest hover:bg-[#1A1A1A] hover:text-white transition-colors cursor-pointer"
                >
                  Send Another Enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-[#C5A059] font-bold block">
                    Direct Inquiry Form
                  </span>
                  <h3 className="font-serif text-2xl text-[#1A1A1A]">Send Us a Message</h3>
                  <p className="text-xs text-[#1A1A1A]/70 font-sans">
                    Share your requirements or questions below.
                  </p>
                </div>

                {error && (
                  <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact-name"
                      className="block text-[11px] font-semibold text-[#1A1A1A]/80 uppercase tracking-wider"
                    >
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="contact-name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ramesh Sharma"
                      className="w-full px-4 py-3 rounded-xl bg-[#FDFBF7] border border-[#1A1A1A10] text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/30 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact-phone"
                      className="block text-[11px] font-semibold text-[#1A1A1A]/80 uppercase tracking-wider"
                    >
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="contact-phone"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 9876543210"
                      className="w-full px-4 py-3 rounded-xl bg-[#FDFBF7] border border-[#1A1A1A10] text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/30 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]"
                    />
                  </div>
                </div>

                {/* Email (Optional) */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-email"
                    className="block text-[11px] font-semibold text-[#1A1A1A]/80 uppercase tracking-wider"
                  >
                    Email Address <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    id="contact-email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. contact@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-[#FDFBF7] border border-[#1A1A1A10] text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/30 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]"
                  />
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-message"
                    className="block text-[11px] font-semibold text-[#1A1A1A]/80 uppercase tracking-wider"
                  >
                    Your Message / Requirement
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your distribution interest, order enquiry, or questions..."
                    className="w-full px-4 py-3 rounded-xl bg-[#FDFBF7] border border-[#1A1A1A10] text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/30 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] resize-none"
                  />
                </div>

                {/* DPDP Act 2023 Explicit Affirmative Consent Block */}
                <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#C5A05930] space-y-2.5">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="dpdp-consent-checkbox"
                      checked={dpdpConsent}
                      onChange={(e) => setDpdpConsent(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-[#1A1A1A30] text-[#C5A059] focus:ring-[#C5A059] cursor-pointer"
                    />
                    <span className="text-xs text-[#1A1A1A]/85 leading-relaxed font-sans">
                      <strong className="text-[#1A1A1A] font-semibold">DPDP Statutory Consent:</strong> I explicitly consent to <strong>Adhrit Industries</strong> processing my provided contact details (Name, Contact Number, Email) solely for responding to this enquiry and coordinating orders under India&apos;s <em>Digital Personal Data Protection (DPDP) Act, 2023</em>. <span className="text-red-500">*</span>
                    </span>
                  </label>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-[#1A1A1A08] text-[11px] text-[#1A1A1A]/70">
                    <div className="flex items-center gap-1.5 text-[#4A5D4E] font-medium">
                      <Lock className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>Zero-Spam Guarantee: No marketing resale or third-party sharing.</span>
                    </div>
                    {onOpenDPDPModal && (
                      <button
                        type="button"
                        onClick={() => onOpenDPDPModal('notice')}
                        className="text-[#C5A059] hover:underline font-semibold uppercase tracking-wider inline-flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>View Section 5 Notice & Rights</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  id="contact-submit-enquiry-btn"
                  className="w-full py-4 px-6 bg-[#1A1A1A] hover:bg-[#4A5D4E] text-white text-[11px] font-bold tracking-widest uppercase transition-all shadow-xs flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-[#C5A059] group-hover:translate-x-0.5 transition-transform" />
                  <span>{submitting ? 'PROCESSING...' : 'SUBMIT ENQUIRY'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
