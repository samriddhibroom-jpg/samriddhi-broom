import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  FileText,
  UserCheck,
  AlertTriangle,
  Send,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Languages,
  ArrowUpRight,
  Lock,
} from 'lucide-react';
import { DPDP_COMPLIANCE_DATA } from '../data/dpdpData';

interface DPDPModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'notice' | 'rights' | 'request' | 'grievance';
}

export const DPDPModal: React.FC<DPDPModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'notice',
}) => {
  const [activeTab, setActiveTab] = useState<'notice' | 'rights' | 'request' | 'grievance'>(initialTab);
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  // Interactive DSR (Data Subject Request) Form State
  const [requestType, setRequestType] = useState<string>('access');
  const [requesterName, setRequesterName] = useState<string>('');
  const [requesterContact, setRequesterContact] = useState<string>('');
  const [requestDetails, setRequestDetails] = useState<string>('');
  const [requestSubmitted, setRequestSubmitted] = useState<boolean>(false);
  const [ticketId, setTicketId] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!requesterName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!requesterContact.trim() || requesterContact.length < 8) {
      setFormError('Please provide a valid contact number or email address.');
      return;
    }

    // Generate statutory reference ticket ID
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const generatedTicket = `DPDP-ADH-${new Date().getFullYear()}-${randomSuffix}`;
    setTicketId(generatedTicket);
    setRequestSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Modal Container */}
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-[#FDFBF7] rounded-2xl shadow-2xl border border-[#C5A05940] flex flex-col overflow-hidden text-[#1A1A1A]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dpdp-modal-title"
      >
        {/* Top Bar / Header */}
        <div className="px-6 py-4 bg-[#1A1A1A] text-white flex items-center justify-between border-b border-[#C5A05940]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#C5A059]">
                  DPDP Act, 2023 Compliance
                </span>
                <span className="hidden sm:inline-block text-[9px] uppercase px-2 py-0.5 rounded-full bg-[#C5A059]/20 text-[#C5A059] font-medium">
                  India
                </span>
              </div>
              <h2 id="dpdp-modal-title" className="font-serif text-base sm:text-lg font-normal tracking-tight text-[#FDFBF7]">
                Digital Personal Data Protection & Privacy Center
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Toggle for Notice */}
            {activeTab === 'notice' && (
              <button
                type="button"
                onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#C5A05940] hover:border-[#C5A059] text-[10px] font-bold uppercase tracking-wider text-[#C5A059] transition-colors"
                title="Toggle English / Hindi Notice"
              >
                <Languages className="w-3 h-3" />
                <span>{lang === 'en' ? 'हिन्दी में पढ़ें' : 'Read in English'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              aria-label="Close DPDP Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 sm:px-6 bg-[#FAF7F0] border-b border-[#1A1A1A10] flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('notice')}
            className={`px-3 sm:px-4 py-3 text-xs uppercase tracking-wider font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'notice'
                ? 'border-[#C5A059] text-[#1A1A1A] bg-white/40'
                : 'border-transparent text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Section 5 Notice</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rights')}
            className={`px-3 sm:px-4 py-3 text-xs uppercase tracking-wider font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'rights'
                ? 'border-[#C5A059] text-[#1A1A1A] bg-white/40'
                : 'border-transparent text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Your Rights (अधिकार)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('request')}
            className={`px-3 sm:px-4 py-3 text-xs uppercase tracking-wider font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'request'
                ? 'border-[#C5A059] text-[#1A1A1A] bg-white/40'
                : 'border-transparent text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Exercise Rights (Access/Erasure)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('grievance')}
            className={`px-3 sm:px-4 py-3 text-xs uppercase tracking-wider font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'grievance'
                ? 'border-[#C5A059] text-[#1A1A1A] bg-white/40'
                : 'border-transparent text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Grievance Officer & Board</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-xs sm:text-sm text-[#1A1A1A]/85">
          {/* TAB 1: SECTION 5 STATUTORY NOTICE */}
          {activeTab === 'notice' && (
            <div className="space-y-6">
              {/* Header Badge */}
              <div className="p-4 rounded-xl bg-[#C5A059]/10 border border-[#C5A05930] flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-serif text-sm sm:text-base font-bold text-[#1A1A1A]">
                    {DPDP_COMPLIANCE_DATA.bilingualNotice[lang].heading}
                  </h3>
                  <p className="text-xs text-[#1A1A1A]/80 leading-relaxed font-sans">
                    {DPDP_COMPLIANCE_DATA.bilingualNotice[lang].summary}
                  </p>
                </div>
              </div>

              {/* Data Fiduciary Plaque */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-xl bg-white border border-[#1A1A1A10] space-y-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-[#C5A059] font-bold block">
                    Data Fiduciary Identity
                  </span>
                  <p className="font-semibold text-sm text-[#1A1A1A]">
                    {DPDP_COMPLIANCE_DATA.dataFiduciary.name}
                  </p>
                  <p className="text-xs text-[#1A1A1A]/70">
                    {DPDP_COMPLIANCE_DATA.dataFiduciary.status}
                  </p>
                  <p className="text-xs text-[#1A1A1A]/80 pt-1">
                    {DPDP_COMPLIANCE_DATA.dataFiduciary.registeredAddress}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#1A1A1A10] space-y-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-[#C5A059] font-bold block">
                    Core Principles & Pledge
                  </span>
                  <p className="font-semibold text-xs text-[#4A5D4E] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>No Third-Party Data Sharing or Commercial Reselling</span>
                  </p>
                  <p className="text-xs text-[#1A1A1A]/70 leading-relaxed pt-1">
                    {DPDP_COMPLIANCE_DATA.bilingualNotice[lang].noSalePledge}
                  </p>
                </div>
              </div>

              {/* Specified Purposes of Data Processing */}
              <div className="space-y-3">
                <h4 className="font-serif text-sm sm:text-base text-[#1A1A1A] font-semibold border-b border-[#1A1A1A10] pb-2">
                  1. Specified Purposes of Personal Data Processing (Section 4 & 5)
                </h4>
                <p className="text-xs text-[#1A1A1A]/75">
                  In compliance with Section 5 of the DPDP Act, 2023, we collect only the minimal personal data required for:
                </p>

                <div className="space-y-2.5">
                  {DPDP_COMPLIANCE_DATA.purposesOfProcessing.map((purpose, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white border border-[#1A1A1A10] space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-xs text-[#1A1A1A]">
                          {idx + 1}. {purpose.title}
                        </span>
                        <span className="text-[9.5px] uppercase font-bold text-[#C5A059] bg-[#C5A059]/10 px-2 py-0.5 rounded-full">
                          Lawful Basis
                        </span>
                      </div>
                      <p className="text-xs text-[#1A1A1A]/70 leading-relaxed font-sans">
                        {purpose.details}
                      </p>
                      <p className="text-[10px] text-[#4A5D4E] font-medium font-sans">
                        {purpose.lawfulBasis}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Retention & Storage */}
              <div className="p-4 rounded-xl bg-white border border-[#1A1A1A10] space-y-2">
                <h4 className="font-serif text-sm text-[#1A1A1A] font-semibold">
                  2. Retention & Security of Personal Data
                </h4>
                <p className="text-xs text-[#1A1A1A]/75 leading-relaxed">
                  {DPDP_COMPLIANCE_DATA.bilingualNotice[lang].retentionPolicy}
                </p>
                <p className="text-xs text-[#1A1A1A]/75 leading-relaxed">
                  We employ technical security measures to prevent unauthorized disclosure, alteration, or loss of enquiry submissions.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: DATA PRINCIPAL RIGHTS */}
          {activeTab === 'rights' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-serif text-base sm:text-lg text-[#1A1A1A] font-semibold">
                  Statutory Rights of the Data Principal (Section 11, 12, 13 & 14)
                </h3>
                <p className="text-xs text-[#1A1A1A]/75 leading-relaxed">
                  As an individual interacting with Adhrit Industries, the DPDP Act guarantees you the following legal rights regarding your personal information:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DPDP_COMPLIANCE_DATA.rights.map((right) => (
                  <div
                    key={right.id}
                    className="p-4 rounded-xl bg-white border border-[#1A1A1A10] hover:border-[#C5A059] transition-all space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#C5A059] bg-[#C5A059]/10 px-2.5 py-0.5 rounded-full">
                        {right.section}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setRequestType(right.id);
                          setActiveTab('request');
                        }}
                        className="text-[10px] text-[#1A1A1A] font-bold uppercase tracking-wider hover:text-[#C5A059] inline-flex items-center gap-0.5"
                      >
                        <span>Apply Right</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>

                    <h4 className="font-serif text-sm font-semibold text-[#1A1A1A]">
                      {right.title}
                    </h4>
                    <p className="text-[10px] text-[#1A1A1A]/60 italic">
                      {right.hindiTitle}
                    </p>

                    <p className="text-xs text-[#1A1A1A]/75 leading-relaxed font-sans">
                      {right.description}
                    </p>

                    <div className="pt-2 border-t border-[#1A1A1A08] text-[11px] text-[#4A5D4E] font-medium">
                      💡 {right.actionHint}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Callout */}
              <div className="p-4 rounded-xl bg-[#FAF7F0] border border-[#C5A05930] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <p className="font-semibold text-xs text-[#1A1A1A]">
                    Wish to exercise any of your rights immediately?
                  </p>
                  <p className="text-xs text-[#1A1A1A]/70">
                    Submit an official Data Principal Request online, or email our Grievance Officer directly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('request')}
                  className="px-5 py-2.5 bg-[#C5A059] hover:bg-[#A88846] text-white text-[11px] font-bold uppercase tracking-wider rounded-full transition-colors whitespace-nowrap shadow-xs cursor-pointer"
                >
                  Submit Request Online
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DSR REQUEST FORM */}
          {activeTab === 'request' && (
            <div className="space-y-6">
              {requestSubmitted ? (
                <div className="p-8 rounded-2xl bg-white border border-[#4A5D4E30] text-center space-y-4 max-w-lg mx-auto shadow-sm">
                  <div className="w-14 h-14 rounded-full bg-[#4A5D4E]/10 text-[#4A5D4E] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl text-[#1A1A1A]">
                    Data Principal Request Logged
                  </h3>
                  <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#C5A05930] inline-block">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#C5A059] block">
                      Official Reference Ticket ID
                    </span>
                    <span className="font-mono text-sm sm:text-base font-bold text-[#1A1A1A]">
                      {ticketId}
                    </span>
                  </div>
                  <p className="text-xs text-[#1A1A1A]/75 leading-relaxed font-sans">
                    Thank you, <strong>{requesterName}</strong>. Your request has been officially recorded under Section 11–13 of the DPDP Act, 2023. Our Grievance Redressal Officer will review your request, provide initial acknowledgment within <strong>48 hours</strong>, and complete the action within <strong>30 days</strong>.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRequestSubmitted(false);
                        setRequesterName('');
                        setRequesterContact('');
                        setRequestDetails('');
                      }}
                      className="px-5 py-2 border border-[#1A1A1A] text-[11px] font-bold uppercase tracking-wider hover:bg-[#1A1A1A] hover:text-white transition-colors cursor-pointer"
                    >
                      Submit Another Request
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitRequest} className="space-y-5">
                  <div className="space-y-1">
                    <h3 className="font-serif text-base sm:text-lg text-[#1A1A1A] font-semibold">
                      Exercise Your DPDP Rights (DSR Portal)
                    </h3>
                    <p className="text-xs text-[#1A1A1A]/70 font-sans leading-relaxed">
                      Use this form to submit an official request to access, correct, update, or erase your contact data, or withdraw prior consent from Adhrit Industries.
                    </p>
                  </div>

                  {formError && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Request Type Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-[#1A1A1A]/80 uppercase tracking-wider">
                      Select Right to Exercise <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={requestType}
                      onChange={(e) => setRequestType(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#1A1A1A15] text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C5A059]"
                    >
                      <option value="access">Section 11: Request Summary / Access to My Data</option>
                      <option value="correction">Section 12: Correction / Updating of Inaccurate Data</option>
                      <option value="erasure">Section 12: Permanent Erasure / Deletion of My Data</option>
                      <option value="withdraw">Section 6(4): Withdrawal of Consent for Enquiries</option>
                      <option value="nomination">Section 14: Register a Data Nominee Representative</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-semibold text-[#1A1A1A]/80 uppercase tracking-wider">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={requesterName}
                        onChange={(e) => setRequesterName(e.target.value)}
                        placeholder="As previously shared with us"
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#1A1A1A15] text-xs sm:text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/30 focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>

                    {/* Contact (Phone/Email) */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-semibold text-[#1A1A1A]/80 uppercase tracking-wider">
                        Phone Number or Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={requesterContact}
                        onChange={(e) => setRequesterContact(e.target.value)}
                        placeholder="Registered phone or email"
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#1A1A1A15] text-xs sm:text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/30 focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>
                  </div>

                  {/* Details / Notes */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-[#1A1A1A]/80 uppercase tracking-wider">
                      Specific Details or Instructions (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={requestDetails}
                      onChange={(e) => setRequestDetails(e.target.value)}
                      placeholder="e.g. Please delete my previous wholesale enquiry number from your records, or update my address..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#1A1A1A15] text-xs sm:text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/30 focus:outline-none focus:border-[#C5A059] resize-none"
                    />
                  </div>

                  <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#1A1A1A10] text-[11px] text-[#1A1A1A]/70 flex items-start gap-2">
                    <Lock className="w-3.5 h-3.5 text-[#C5A059] shrink-0 mt-0.5" />
                    <span>
                      Notice: To protect your privacy and prevent fraud, our Grievance Officer may verify your phone number or email before executing irreversible actions such as permanent data erasure.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-6 bg-[#1A1A1A] hover:bg-[#4A5D4E] text-white text-[11px] font-bold tracking-widest uppercase transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Submit Official DPDP Request</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 4: GRIEVANCE REDRESSAL OFFICER & BOARD */}
          {activeTab === 'grievance' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-serif text-base sm:text-lg text-[#1A1A1A] font-semibold">
                  Mandatory Grievance Redressal Mechanism (Section 13)
                </h3>
                <p className="text-xs text-[#1A1A1A]/75 leading-relaxed">
                  In accordance with Section 8(10) and Section 13 of the DPDP Act, 2023, Adhrit Industries has appointed a designated Grievance Redressal Officer to address all queries, grievances, and rights requests.
                </p>
              </div>

              {/* Officer Card */}
              <div className="p-5 rounded-2xl bg-white border border-[#C5A05940] space-y-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A059] block">
                      Designated Authority
                    </span>
                    <h4 className="font-serif text-lg font-bold text-[#1A1A1A]">
                      {DPDP_COMPLIANCE_DATA.grievanceOfficer.name}
                    </h4>
                    <p className="text-xs text-[#4A5D4E] font-medium">
                      {DPDP_COMPLIANCE_DATA.grievanceOfficer.designation}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-3 py-1 rounded-full bg-[#4A5D4E]/10 text-[#4A5D4E]">
                    DPDP Act Compliance
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="flex items-start gap-2 text-[#1A1A1A]/80">
                    <Mail className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-semibold text-[#1A1A1A]">Grievance Email</span>
                      <a
                        href={`mailto:${DPDP_COMPLIANCE_DATA.grievanceOfficer.email}`}
                        className="text-[#C5A059] hover:underline"
                      >
                        {DPDP_COMPLIANCE_DATA.grievanceOfficer.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-[#1A1A1A]/80">
                    <Phone className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-semibold text-[#1A1A1A]">Office Phone</span>
                      <a
                        href={`tel:${DPDP_COMPLIANCE_DATA.grievanceOfficer.phone}`}
                        className="hover:underline"
                      >
                        {DPDP_COMPLIANCE_DATA.grievanceOfficer.phone}
                      </a>
                    </div>
                  </div>

                  <div className="sm:col-span-2 flex items-start gap-2 text-[#1A1A1A]/80 pt-1">
                    <MapPin className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-semibold text-[#1A1A1A]">Postal Address for Legal Correspondence</span>
                      <span>{DPDP_COMPLIANCE_DATA.grievanceOfficer.address}</span>
                    </div>
                  </div>
                </div>

                {/* Turnaround SLAs */}
                <div className="pt-3 border-t border-[#1A1A1A10] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-[#4A5D4E] font-medium">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>Statutory SLA: Acknowledgment in 48 Hours • Resolution within 30 Days</span>
                  </div>
                  <a
                    href={`mailto:${DPDP_COMPLIANCE_DATA.grievanceOfficer.email}?subject=DPDP%20Grievance%20Notice%20-%20Adhrit%20Industries`}
                    className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#4A5D4E] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Email Grievance Officer</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Data Protection Board of India (DPBI) Escalation Box */}
              <div className="p-4 rounded-xl bg-[#FAF7F0] border border-[#1A1A1A15] space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#C5A059]" />
                  <h4 className="font-serif text-sm font-semibold text-[#1A1A1A]">
                    Appeal to the {DPDP_COMPLIANCE_DATA.boardEscalation.authorityName}
                  </h4>
                </div>
                <p className="text-xs text-[#1A1A1A]/75 leading-relaxed font-sans">
                  {DPDP_COMPLIANCE_DATA.boardEscalation.note}
                </p>
                <p className="text-[11px] text-[#1A1A1A]/60 font-sans">
                  Authority: {DPDP_COMPLIANCE_DATA.boardEscalation.ministry}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Status Bar */}
        <div className="px-6 py-3 bg-[#FAF7F0] border-t border-[#1A1A1A10] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#1A1A1A]/70">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4A5D4E]" />
            <span>Adhrit Industries Compliance Framework • Act 22 of 2023</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#4A5D4E] transition-colors"
          >
            Close Center
          </button>
        </div>
      </div>
    </div>
  );
};
