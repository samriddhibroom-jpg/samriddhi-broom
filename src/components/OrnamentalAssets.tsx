import React from 'react';

export const BotanicalCorner: React.FC<{
  className?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}> = ({ className = '', position = 'top-left' }) => {
  const rotation = {
    'top-left': 'rotate-0',
    'top-right': 'rotate-90',
    'bottom-right': 'rotate-180',
    'bottom-left': '-rotate-90',
  }[position];

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-10 h-10 text-[#C5A059] ${rotation} ${className}`}
      aria-hidden="true"
    >
      {/* Outer corner lines */}
      <path
        d="M2 32V6C2 3.79086 3.79086 2 6 2H32"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeMiterlimit="10"
      />
      <path
        d="M6 24V9C6 7.34315 7.34315 6 9 6H24"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeMiterlimit="10"
        strokeOpacity="0.6"
      />
      {/* Subtle botanical leaf motif */}
      <path
        d="M12 12C16 12 21 16 23 20C21 22 17 21 15 18C13.5 15.75 12.5 13.5 12 12Z"
        fill="currentColor"
        fillOpacity="0.25"
        stroke="currentColor"
        strokeWidth="0.8"
      />
      <path
        d="M12 12C12 16 16 21 20 23C22 21 21 17 18 15C15.75 13.5 13.5 12.5 12 12Z"
        fill="currentColor"
        fillOpacity="0.25"
        stroke="currentColor"
        strokeWidth="0.8"
      />
      <circle cx="8" cy="8" r="1.5" fill="currentColor" />
    </svg>
  );
};

export const GoldDivider: React.FC<{ className?: string; withLeaf?: boolean }> = ({
  className = '',
  withLeaf = true,
}) => {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-r from-transparent via-[#C5A059]/60 to-[#C5A059]" />
      {withLeaf ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-4 h-4 text-[#C5A059]"
          aria-hidden="true"
        >
          <path
            d="M12 3C12 3 6 8 6 14C6 17.3137 8.68629 20 12 20C15.3137 20 18 17.3137 18 14C18 8 12 3 12 3Z"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path d="M12 7V17" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          <path d="M9 13L12 10L15 13" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
        </svg>
      ) : (
        <div className="w-1.5 h-1.5 rotate-45 border border-[#C5A059] bg-[#FBF8F3]" />
      )}
      <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-l from-transparent via-[#C5A059]/60 to-[#C5A059]" />
    </div>
  );
};
