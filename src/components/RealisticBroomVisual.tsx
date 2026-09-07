import React, { useState } from 'react';
import exactBroomImg from '../assets/images/samriddhi_exact_broom.jpg';

const EXACT_IMAGE_CANDIDATES = [
  '/Screenshot 2026-09-05 210308.png',
  '/Screenshot 2026-09-03 220118.png',
  '/samriddhi_broom.png',
  '/samriddhi_broom.jpg',
  '/broom.png',
  '/broom.jpg',
  exactBroomImg,
];

interface RealisticBroomVisualProps {
  className?: string;
  glow?: boolean;
}

export const RealisticBroomVisual: React.FC<RealisticBroomVisualProps> = ({
  className = '',
  glow = false,
}) => {
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [hasExhaustedCandidates, setHasExhaustedCandidates] = useState(false);

  const handleImageError = () => {
    if (candidateIndex < EXACT_IMAGE_CANDIDATES.length - 1) {
      setCandidateIndex((prev) => prev + 1);
    } else {
      setHasExhaustedCandidates(true);
    }
  };

  return (
    <div className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}>
      {/* Ambient subtle glow */}
      {glow && (
        <div className="absolute inset-0 -m-8 bg-gradient-to-b from-[#C5A059]/15 via-[#C5A059]/5 to-transparent rounded-full blur-2xl opacity-70" />
      )}

      {!hasExhaustedCandidates ? (
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={EXACT_IMAGE_CANDIDATES[candidateIndex]}
            alt="SAMRIDHII Broom - Authentic Hill Grass Broom by Adhrit Industries"
            referrerPolicy="no-referrer"
            onError={handleImageError}
            className="w-full h-full object-contain filter drop-shadow-[0_16px_32px_rgba(26,26,26,0.14)] rounded-xl"
          />
        </div>
      ) : (
        /* Highly detailed realistic vector fallback in case image fails */
        <svg
          viewBox="0 0 200 680"
          className="w-full h-full filter drop-shadow-[0_20px_40px_rgba(20,20,20,0.18)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="handleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4A3B2A" />
              <stop offset="35%" stopColor="#7E684C" />
              <stop offset="65%" stopColor="#9C8363" />
              <stop offset="100%" stopColor="#413425" />
            </linearGradient>
            <linearGradient id="goldCollar" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#967431" />
              <stop offset="50%" stopColor="#E5C77A" />
              <stop offset="100%" stopColor="#8C6A28" />
            </linearGradient>
            <linearGradient id="grassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#CBB588" />
              <stop offset="40%" stopColor="#B39962" />
              <stop offset="70%" stopColor="#9C814A" />
              <stop offset="100%" stopColor="#7A6335" />
            </linearGradient>
            <linearGradient id="fineGrass" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#DDD0AF" />
              <stop offset="100%" stopColor="#8B7343" />
            </linearGradient>
          </defs>

          {/* Top handle loop/ring */}
          <circle cx="100" cy="30" r="16" stroke="url(#goldCollar)" strokeWidth="4" />
          <circle cx="100" cy="30" r="8" fill="#FBF8F3" />

          {/* Ergonomic handle stem */}
          <rect x="91" y="44" width="18" height="230" rx="9" fill="url(#handleGrad)" />
          {/* Handle grip texture rings */}
          {[65, 85, 105, 140, 160, 180, 210, 230].map((y) => (
            <line key={y} x1="91" y1={y} x2="109" y2={y} stroke="#2D2319" strokeWidth="1.5" strokeOpacity="0.7" />
          ))}

          {/* Upper brass collar */}
          <rect x="88" y="270" width="24" height="24" rx="4" fill="url(#goldCollar)" />
          <line x1="88" y1="282" x2="112" y2="282" stroke="#604919" strokeWidth="1.5" />

          {/* Bound broom neck / Woven binding bands */}
          <path d="M85 294C75 320 62 360 52 410H148C138 360 125 320 115 294H85Z" fill="url(#goldCollar)" />
          {/* Binding wire lines */}
          {[310, 330, 350, 370, 390].map((y, i) => (
            <path
              key={y}
              d={`M${78 - i * 5} ${y}Q100 ${y + 5} ${122 + i * 5} ${y}`}
              stroke="#5D471C"
              strokeWidth="2"
              fill="none"
            />
          ))}

          {/* Natural Straw/Grass Flares */}
          <path
            d="M52 410C42 460 15 540 8 640C40 655 70 658 100 660C130 658 160 655 192 640C185 540 158 460 148 410H52Z"
            fill="url(#grassGrad)"
          />

          {/* Individual high-density grass straw strands */}
          {Array.from({ length: 42 }).map((_, idx) => {
            const startX = 60 + idx * 2;
            const endX = 14 + idx * 4.1;
            const endY = 630 + (idx % 5) * 5;
            return (
              <path
                key={idx}
                d={`M${startX} 415Q${100 + (idx - 21) * 2} 520 ${endX} ${endY}`}
                stroke="url(#fineGrass)"
                strokeWidth="1.2"
                strokeOpacity={0.6 + (idx % 3) * 0.15}
              />
            );
          })}

          {/* Bottom tips curve & trim */}
          <path
            d="M8 640Q100 665 192 640"
            stroke="url(#goldCollar)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
};
