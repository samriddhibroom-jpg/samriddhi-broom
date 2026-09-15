import React from 'react';
import { MapPin, Navigation, Compass, Phone } from 'lucide-react';
import { BRAND_DATA } from '../data/brandData';
import { BotanicalCorner, GoldDivider } from './OrnamentalAssets';

export const LocationSection: React.FC = () => {
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    BRAND_DATA.openingCeremony.fullAddress
  )}`;

  return (
    <section
      id="location"
      className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-12 bg-[#FDFBF7] border-t border-[#1A1A1A10] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2">
            <span className="h-[1px] w-6 bg-[#C5A059]" />
            <span className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase font-bold text-[#C5A059] font-sans">
              VISIT OUR LOCATION
            </span>
            <span className="h-[1px] w-6 bg-[#C5A059]" />
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl text-[#1A1A1A] font-light tracking-tight">
            COME SAY HELLO.
          </h2>

          <p className="text-sm sm:text-base text-[#1A1A1A]/75 font-sans">
            Find the venue of our official opening ceremony and local operations in Ranchi.
          </p>

          <GoldDivider />
        </div>

        {/* 2-Column Grid: Location Details + Stylized Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Venue Plaque */}
          <div className="lg:col-span-5 bg-white p-8 sm:p-10 rounded-2xl border border-[#C5A05930] shadow-sm flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div className="p-3 w-fit rounded-full bg-[#FDFBF7] text-[#C5A059] border border-[#C5A05930]">
                <MapPin className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#C5A059] uppercase block font-sans">
                  Manufacturing Unit & Registered Office
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A] mt-1 font-light">
                  {BRAND_DATA.openingCeremony.venueName}
                </h3>
              </div>

              <div className="space-y-2 text-sm sm:text-base text-[#1A1A1A]/80 font-sans border-l-2 border-[#C5A059] pl-4">
                <p className="font-medium text-[#1A1A1A]">71, DG Road, Ghulmohar Parks</p>
                <p>Lalpur</p>
                <p className="font-medium text-[#1A1A1A]">Ranchi, Jharkhand</p>
              </div>

              <div className="pt-2 border-t border-[#1A1A1A10] space-y-1.5 text-xs text-[#1A1A1A]/80 font-sans">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/60 font-semibold">
                    Mobile:
                  </span>
                  <a href={`tel:${BRAND_DATA.phone}`} className="font-medium text-[#1A1A1A] hover:text-[#C5A059] transition-colors">
                    +91 {BRAND_DATA.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/60 font-semibold">
                    Website:
                  </span>
                  <a href="https://www.samriddhibroom.com" target="_blank" rel="noopener noreferrer" className="font-medium text-[#C5A059] hover:underline">
                    www.samriddhibroom.com
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="get-directions-google-maps-btn"
                className="w-full py-3.5 px-6 bg-[#1A1A1A] hover:bg-[#4A5D4E] text-white text-[11px] font-bold tracking-widest uppercase transition-all shadow-xs flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>GET DIRECTIONS</span>
                <Navigation className="w-4 h-4 text-[#C5A059] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <a
                href={`tel:${BRAND_DATA.phone}`}
                className="w-full py-3 px-6 border border-[#C5A059] hover:bg-[#C5A059]/10 text-[#1A1A1A] text-[11px] font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Call: {BRAND_DATA.displayPhone}</span>
              </a>
            </div>
          </div>

          {/* Right Column: Stylized Minimalist Map Display */}
          <div className="lg:col-span-7 relative min-h-[340px] sm:min-h-[420px] rounded-2xl bg-[#F5F2EB] border border-[#C5A05930] p-4 sm:p-6 overflow-hidden flex flex-col justify-between">
            {/* Stylized vector map graphics */}
            <svg
              className="absolute inset-0 w-full h-full opacity-60 pointer-events-none"
              preserveAspectRatio="none"
              viewBox="0 0 600 400"
            >
              {/* Soft terrain / block patches */}
              <rect x="20" y="30" width="160" height="140" fill="#E8DFD0" rx="12" />
              <rect x="220" y="50" width="220" height="100" fill="#E4D9C7" rx="12" />
              <rect x="60" y="220" width="240" height="130" fill="#E8DFD0" rx="12" />
              <rect x="340" y="200" width="220" height="160" fill="#E2D7C3" rx="12" />

              {/* Road lines */}
              <path
                d="M-20 180 Q200 190 320 160 T620 170"
                stroke="#D6C7AE"
                strokeWidth="20"
                fill="none"
              />
              <path
                d="M-20 180 Q200 190 320 160 T620 170"
                stroke="#FAF6EE"
                strokeWidth="14"
                fill="none"
              />

              <path
                d="M320 -20 V420"
                stroke="#D6C7AE"
                strokeWidth="18"
                fill="none"
              />
              <path
                d="M320 -20 V420"
                stroke="#FAF6EE"
                strokeWidth="12"
                fill="none"
              />

              {/* Secondary avenues */}
              <line x1="160" y1="180" x2="160" y2="400" stroke="#FAF6EE" strokeWidth="8" />
              <line x1="450" y1="0" x2="450" y2="200" stroke="#FAF6EE" strokeWidth="8" />
            </svg>

            {/* Map Top Bar */}
            <div className="relative z-10 flex items-center justify-between bg-[#FDFBF7]/95 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-[#C5A05930] shadow-xs">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#C5A059]" />
                <span className="text-xs font-semibold text-[#1A1A1A]">
                  Lalpur, Ranchi • Jharkhand 834001
                </span>
              </div>
              <span className="text-[10px] tracking-wider uppercase text-[#4A5D4E] font-bold bg-[#4A5D4E]/10 px-2 py-0.5 rounded">
                Verified Venue
              </span>
            </div>

            {/* Central Animated Location Pin */}
            <div className="relative z-10 my-auto self-center flex flex-col items-center">
              {/* Pulse ripple */}
              <div className="w-16 h-16 rounded-full bg-[#C5A059]/20 animate-ping absolute -top-3" />

              <div className="relative px-4 py-2.5 rounded-xl bg-[#1A1A1A] text-white shadow-xl border border-[#C5A059] flex items-center gap-2.5 animate-bounce">
                <div className="w-2.5 h-2.5 rounded-full bg-[#C5A059]" />
                <div className="text-left">
                  <p className="font-serif text-xs sm:text-sm font-medium text-white">
                    {BRAND_DATA.openingCeremony.venueName}
                  </p>
                  <p className="text-[10px] text-[#C5A059] font-bold">SAMRIDDHI BROOM™ Launch</p>
                </div>
              </div>
              <div className="w-3 h-3 bg-[#1A1A1A] rotate-45 -mt-1.5 border-r border-b border-[#C5A059]" />
            </div>

            {/* Map Footer Bar */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FDFBF7]/95 backdrop-blur-sm p-3 rounded-xl border border-[#C5A05930] text-xs">
              <span className="text-[#1A1A1A]/80 text-center sm:text-left">
                71, DG Road, Ghulmohar Parks, Lalpur, Ranchi
              </span>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C5A059] hover:underline font-bold flex items-center gap-1 shrink-0"
              >
                <span>Open in Maps</span>
                <Navigation className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
