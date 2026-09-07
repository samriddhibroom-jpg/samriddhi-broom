import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<number>(0);

  useEffect(() => {
    // Stage 0: ADHRIT INDUSTRIES
    const t1 = setTimeout(() => {
      setStage(1); // SAMRIDHII BROOM
    }, 450);

    const t2 = setTimeout(() => {
      setStage(2); // Sweep line
    }, 850);

    const t3 = setTimeout(() => {
      setStage(3); // Fade out
      setTimeout(onComplete, 400);
    }, 1400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {stage < 3 && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FDFBF7] px-6 text-center select-none"
        >
          {/* Subtle floral background texture or soft glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(197,160,89,0.08)_0%,transparent_70%)] pointer-events-none" />

          <div className="relative z-10 max-w-md w-full">
            {/* Adhrit Industries */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="tracking-[0.3em] text-[10px] sm:text-[11px] font-bold text-[#C5A059] uppercase font-sans mb-3"
            >
              ADHRIT INDUSTRIES
            </motion.div>

            {/* Samriddhi Broom */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={stage >= 1 ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] tracking-wide mb-5 font-light"
            >
              SAMRIDHII BROOM<span className="text-[#C5A059] text-xl align-top ml-0.5">™</span>
            </motion.div>

            {/* Sweep line animation */}
            <div className="relative w-48 mx-auto h-[1px] bg-[#1A1A1A15] overflow-hidden rounded-full">
              <motion.div
                initial={{ x: '-100%' }}
                animate={stage >= 1 ? { x: '100%' } : {}}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], repeat: 0 }}
                className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-[#C5A059] to-[#1A1A1A]"
              />
            </div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={stage >= 2 ? { opacity: 1 } : {}}
              transition={{ duration: 0.35 }}
              className="mt-4 text-[12px] sm:text-[13px] tracking-wider text-[#4A5D4E] font-serif italic"
            >
              &ldquo;Ek Vishwash, Ek Kadam Swachhta ki aur&rdquo;
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
