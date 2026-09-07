import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';

export const ScrollProgress: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollAction = () => {
    if (progress >= 88) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const sectionIds = [
      'sweep-experience',
      'about',
      'samriddhi',
      'why-us',
      'pricing',
      'location',
      'contact',
    ];

    const currentScroll = window.scrollY + 100;
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el && el.offsetTop > currentScroll) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    // Fallback: advance down by 80% viewport height
    window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
  };

  const isNearEnd = progress >= 88;
  const circumference = 59.69; // 2 * PI * 9.5
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <button
      type="button"
      onClick={handleScrollAction}
      id="floating-scroll-explore-btn"
      aria-label={isNearEnd ? 'Scroll back to top' : 'Scroll to explore the next section'}
      className="group fixed right-3 sm:right-6 bottom-5 sm:bottom-7 z-40 flex flex-col items-center justify-center gap-1.5 w-9 sm:w-10 py-2.5 px-1 rounded-full bg-[#FDFBF7]/95 hover:bg-white backdrop-blur-md border border-[#C5A059]/40 hover:border-[#C5A059] shadow-[0_6px_20px_rgba(26,26,26,0.08)] hover:shadow-[0_8px_24px_rgba(197,160,89,0.25)] transition-all duration-300 cursor-pointer select-none active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
    >
      {/* Small Circular Progress Gauge with Center Arrow */}
      <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 24 24">
          <circle
            cx="12"
            cy="12"
            r="9.5"
            stroke="#EFE6D5"
            strokeWidth="2"
            fill="transparent"
          />
          <circle
            cx="12"
            cy="12"
            r="9.5"
            stroke="#C5A059"
            strokeWidth="2"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-150 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {isNearEnd ? (
            <ArrowUp className="w-3 h-3 text-[#C5A059] group-hover:-translate-y-0.5 transition-transform duration-200" />
          ) : (
            <ArrowDown className="w-3 h-3 text-[#C5A059] group-hover:translate-y-0.5 transition-transform duration-200" />
          )}
        </div>
      </div>

      {/* Numerical Progress Indicator */}
      <span className="text-[8.5px] font-mono text-[#C5A059] font-semibold leading-none tracking-tight">
        {Math.round(progress)}%
      </span>

      {/* Slender Vertical Typography */}
      <span className="[writing-mode:vertical-rl] rotate-180 text-[7px] uppercase tracking-[0.24em] font-bold text-[#1A1A1A]/70 group-hover:text-[#1A1A1A] transition-colors leading-none my-0.5 font-sans select-none">
        {isNearEnd ? 'Top' : 'Explore'}
      </span>
    </button>
  );
};
