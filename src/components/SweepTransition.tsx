import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'motion/react';
import { Sparkles, Play } from 'lucide-react';
import { RealisticBroomVisual } from './RealisticBroomVisual';
import { GoldDivider } from './OrnamentalAssets';

interface SweepTransitionProps {
  scrollProgress: number; // 0 to 1 across this section
  onCompleteSweep?: () => void;
}

export const SweepTransition: React.FC<SweepTransitionProps> = ({
  scrollProgress,
  onCompleteSweep,
}) => {
  const [isInteractiveSweeping, setIsInteractiveSweeping] = useState(false);
  const broomControls = useAnimation();
  const trailControls = useAnimation();

  // Sweep motion calculated from scroll progress: right -> center -> left
  // scrollProgress ranges from 0 (approaching) to 1 (passed)
  const broomX = (1 - scrollProgress) * 320 - 160; // moves from +160px to -160px
  const broomAngle = -15 + Math.sin(scrollProgress * Math.PI) * 30; // natural sweeping arc

  const triggerManualSweep = async () => {
    if (isInteractiveSweeping) return;
    setIsInteractiveSweeping(true);

    // Audio cue via gentle Web Audio API synthesizer for a subtle, clean whisk sound
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, audioCtx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch {
      // Audio context might be restricted before interaction; safe fallback
    }

    await broomControls.start({
      x: ['120%', '-20%', '-140%'],
      rotate: [-15, 25, -20],
      transition: { duration: 1.6, ease: [0.25, 1, 0.5, 1] },
    });

    setIsInteractiveSweeping(false);
    if (onCompleteSweep) onCompleteSweep();
  };

  return (
    <section
      id="sweep-experience"
      className="relative py-28 sm:py-36 px-4 sm:px-6 lg:px-12 bg-gradient-to-b from-[#FBF8F3] via-[#F4EEE4] to-[#FBF8F3] overflow-hidden border-y border-[#E6DDCE]"
    >
      {/* Subtle sweeping lines canvas */}
      <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="absolute h-[1px] bg-gradient-to-r from-transparent via-[#C5A059]/60 to-transparent"
            style={{
              top: `${15 + i * 9}%`,
              left: `${(i % 3) * 10}%`,
              width: '80%',
              transform: `rotate(${-2 + (i % 3) * 2}deg)`,
              opacity: 0.3 + (scrollProgress > 0.3 ? 0.4 : 0.1),
              transition: 'opacity 0.5s ease',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Subtle decorative motif */}
        <GoldDivider className="mb-6" />

        <span className="text-[11px] sm:text-xs tracking-[0.28em] font-semibold text-[#2D382E] uppercase font-sans mb-3">
          The Ritual of Purity
        </span>

        {/* Signature Editorial Statement */}
        <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#161616] font-normal tracking-tight max-w-3xl leading-[1.18] mb-6">
          &ldquo;ONE SWEEP.{' '}
          <span className="italic text-[#C5A059] block sm:inline">
            A CLEANER BEGINNING.
          </span>
          &rdquo;
        </h2>

        <p className="text-sm sm:text-base text-[#161616]/75 max-w-2xl font-sans leading-relaxed mb-10">
          Cleanliness is not merely a task; it is the quiet foundation upon which every fresh day is built.
          With each deliberate motion, SAMRIDHII BROOM™ restores harmony and clarity to your living sanctuary.
        </p>

        {/* Sweeping Broom Visual Container */}
        <div className="relative w-full max-w-xl h-48 sm:h-64 flex items-center justify-center my-4">
          {/* Subtle golden dust / fine particle trails */}
          <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-16 pointer-events-none flex items-center justify-around">
            {Array.from({ length: 12 }).map((_, idx) => (
              <motion.div
                key={idx}
                animate={{
                  y: [0, -6, 0],
                  opacity: [0.2, 0.7, 0.2],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2 + (idx % 3),
                  repeat: Infinity,
                  delay: idx * 0.15,
                }}
                className="w-1.5 h-1.5 rounded-full bg-[#C5A059]"
                style={{
                  filter: 'drop-shadow(0 0 4px rgba(197,160,89,0.5))',
                }}
              />
            ))}
          </div>

          {/* Scrolling or interactive broom actor */}
          <motion.div
            animate={isInteractiveSweeping ? broomControls : {}}
            style={
              !isInteractiveSweeping
                ? {
                    transform: `translateX(${broomX}px) rotate(${broomAngle}deg)`,
                  }
                : {}
            }
            transition={{ type: 'spring', damping: 20, stiffness: 60 }}
            className="relative w-36 sm:w-44 h-56 sm:h-72 will-change-transform z-20 pointer-events-none"
          >
            <RealisticBroomVisual glow={true} className="w-full h-full" />
          </motion.div>
        </div>

        {/* Interactive Signature Sweep Button */}
        <div className="mt-4 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={triggerManualSweep}
            disabled={isInteractiveSweeping}
            id="interactive-sweep-trigger-btn"
            className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-[#FBF8F3] hover:bg-[#F0E8DA] border border-[#C5A059] text-[#161616] text-xs font-semibold tracking-wider uppercase transition-all duration-300 shadow-sm hover:shadow"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>{isInteractiveSweeping ? 'Sweeping space...' : 'Experience The Sweep'}</span>
          </button>
          <span className="text-[10px] text-[#161616]/50 tracking-wide font-sans">
            Scroll or tap to watch the broom sweep the canvas
          </span>
        </div>
      </div>
    </section>
  );
};
