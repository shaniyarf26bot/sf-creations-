import { motion } from 'motion/react';
import { ArrowDownRight, ChevronDown } from 'lucide-react';
import type { SiteSettings } from '../types.ts';

interface HeroSectionProps {
  settings: SiteSettings;
  onNavigate: (sectionId: string) => void;
}

export function HeroSection({ settings, onNavigate }: HeroSectionProps) {
  return (
    <section
      id="home"
      className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden bg-[#171717] pt-24 pb-16 px-5 sm:px-8"
    >
      {/* Cinematic Dark Filmmaking Background with Slow Pan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <img
          src={settings.heroBackdropUrl}
          alt=""
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-55 animate-cinema-pan"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#171717]/85 via-[#171717]/60 to-[#171717]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(41,37,34,0.25)_0%,rgba(23,23,23,0.92)_85%)]" />
      </div>

      {/* Subtle architectural hairline frame */}
      <div
        className="pointer-events-none absolute inset-x-6 inset-y-20 sm:inset-x-12 sm:inset-y-24 border border-[#D5B982]/15 hidden md:block"
        aria-hidden="true"
      />

      {/* Centered Brand Showcase */}
      <div className="relative z-10 w-full max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Official SF Creations Logo Reveal (preserved without distortion or cropping) */}
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mb-7"
        >
          <img
            src={settings.logoUrl}
            alt="SF Creations official logo"
            referrerPolicy="no-referrer"
            className="h-20 sm:h-24 md:h-28 w-auto object-contain mx-auto drop-shadow-[0_12px_32px_rgba(0,0,0,0.65)]"
          />
        </motion.div>

        {/* Strict Brand Typography Hierarchy */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex flex-col items-center text-center"
        >
          <h1 className="font-display text-[38px] sm:text-[52px] md:text-[64px] font-semibold tracking-[0.1em] sm:tracking-[0.14em] text-[#af8f4a] drop-shadow-[0_4px_24px_rgba(213,185,130,0.18)] leading-[1.05] uppercase text-center">
            {settings.brandTitle}
          </h1>
          <p className="mt-2.5 sm:mt-3 font-sans text-[11px] sm:text-sm md:text-base font-medium tracking-[0.26em] sm:tracking-[0.42em] text-[#D5B982] uppercase text-center">
            {settings.brandSubtitle}
          </p>
        </motion.div>

        {/* Subtle Champagne Hairline Divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-24 h-px bg-[#D5B982]/60 my-7"
          aria-hidden="true"
        />

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[300.927px] sm:w-[300.927px] font-display text-xl sm:text-2xl md:text-3xl italic tracking-[0.12em] text-[#F4EFE6] uppercase text-center"
        >
          {settings.tagline}
        </motion.p>

        {/* Supporting Text */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.48, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5 max-w-2xl font-sans text-sm sm:text-base text-[#F4EFE6]/80 leading-relaxed tracking-wide font-light"
        >
          {settings.heroSupportingText}
        </motion.p>

        {/* Functional Hero CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.58, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
        >
          <button
            type="button"
            onClick={() => onNavigate('projects')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#fcca5a] text-[#171717] text-xs font-semibold tracking-[0.2em] uppercase hover:bg-[#F4EFE6] transition-colors duration-200 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4EFE6]"
          >
            <span>EXPLORE MY WORK</span>
            <ArrowDownRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('inquiry')}
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-[#D5B982]/70 text-[#F4EFE6] text-xs font-medium tracking-[0.2em] uppercase hover:border-[#D5B982] hover:bg-[#D5B982]/10 hover:text-[#D5B982] transition-all duration-200 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D5B982]"
          >
            LET&apos;S WORK TOGETHER
          </button>
        </motion.div>
      </div>

      {/* Scroll Affordance */}
      <button
        type="button"
        onClick={() => onNavigate('about')}
        aria-label="Scroll to About section"
        className="relative z-10 mt-14 sm:mt-16 inline-flex flex-col items-center gap-2 text-[#888078] hover:text-[#D5B982] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D5B982]"
      >
        <span className="text-[10px] tracking-[0.28em] uppercase">SCROLL</span>
        <ChevronDown className="w-4 h-4" />
      </button>
    </section>
  );
}
