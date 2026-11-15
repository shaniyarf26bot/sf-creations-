import { motion } from 'motion/react';
import type { SiteSettings } from '../types.ts';

interface AboutSectionProps {
  settings: SiteSettings;
}

export function AboutSection({ settings }: AboutSectionProps) {
  return (
    <section
      id="about"
      className="relative bg-[#171717] py-24 sm:py-32 px-5 sm:px-8 border-t border-[#292522]"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
          {/* Left Column: Cinematic Studio Atmosphere (NO personal portrait) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 relative min-h-[320px] sm:min-h-[380px] lg:min-h-[440px] overflow-hidden border border-[#D5B982]/20 bg-[#292522]"
          >
            <img
              src={settings.aboutBackdropUrl}
              alt="SF Creations Sri Lanka creative storytelling and production studio"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-[#171717]/40 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-7 sm:p-8">
              <p className="text-[11px] font-medium tracking-[0.26em] text-[#D5B982] uppercase">
                SRI LANKA · CREATIVE STUDIO
              </p>
              <p className="mt-2 font-display text-2xl sm:text-3xl font-medium tracking-[0.06em] text-[#F4EFE6] uppercase">
                {settings.aboutCreativeStatement}
              </p>
            </div>
          </motion.div>

          {/* Right Column: Editorial Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex flex-col justify-center"
          >
            <p className="text-xs font-medium tracking-[0.26em] text-[#D5B982] uppercase">
              ABOUT THE STUDIO
            </p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl font-semibold text-[#F4EFE6] tracking-wide leading-[1.1] text-balance">
              Visual Storytelling Crafted with Purpose &amp; Precision
            </h2>

            <div className="w-16 h-px bg-[#D5B982]/60 my-7" aria-hidden="true" />

            <div className="space-y-5 text-sm sm:text-base text-[#F4EFE6]/85 leading-[1.8] font-light max-w-[65ch]">
              {settings.aboutParagraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-9 pt-6 border-t border-[#292522]">
              <p className="text-xs sm:text-[13px] font-medium tracking-[0.2em] text-[#D5B982] uppercase leading-relaxed">
                {settings.aboutHighlight}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
