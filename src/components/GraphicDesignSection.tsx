import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Layers, Maximize2, X } from 'lucide-react';
import { GRAPHIC_DESIGN_CATEGORIES, type GraphicDesignCategory, type GraphicDesignItem } from '../types.ts';

interface GraphicDesignSectionProps {
  designs: GraphicDesignItem[];
}

export function GraphicDesignSection({ designs }: GraphicDesignSectionProps) {
  const [activeCategory, setActiveCategory] = useState<'All' | GraphicDesignCategory>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered =
    activeCategory === 'All'
      ? designs
      : designs.filter((item) => item.category === activeCategory);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev + 1) % filtered.length
        );
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev - 1 + filtered.length) % filtered.length
        );
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxIndex, filtered.length]);

  const activeItem = lightboxIndex !== null ? filtered[lightboxIndex] : null;

  return (
    <section
      id="graphic-design"
      className="relative bg-[#1B1918] py-24 sm:py-32 px-5 sm:px-8 border-t border-[#292522]"
    >
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <p className="text-xs font-medium tracking-[0.26em] text-[#D5B982] uppercase">
            GRAPHIC DESIGN PORTFOLIO
          </p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl font-semibold text-[#F4EFE6] tracking-wide text-balance">
            Visual Ideas. Creative Designs. Distinctive Identities.
          </h2>
        </motion.div>

        {/* Category Filter Tabs */}
        <div
          role="tablist"
          aria-label="Filter graphic designs by category"
          className="mt-10 flex flex-wrap gap-2 pb-4 border-b border-[#292522]"
        >
          {(['All', ...GRAPHIC_DESIGN_CATEGORIES] as const).map((category) => {
            const count =
              category === 'All'
                ? designs.length
                : designs.filter((d) => d.category === category).length;
            const active = activeCategory === category;

            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setActiveCategory(category);
                  setLightboxIndex(null);
                }}
                className={`px-3.5 py-2 text-[11px] font-medium tracking-[0.12em] uppercase border transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-[#D5B982] text-[#171717] border-[#D5B982]'
                    : 'bg-[#171717] text-[#F4EFE6]/75 border-[#292522] hover:border-[#D5B982]/45 hover:text-[#D5B982]'
                }`}
              >
                {category}
                <span className="ml-1.5 opacity-70 tabular-nums">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Gallery Grid or Curated Empty State (Never Fake Designs) */}
        {filtered.length === 0 ? (
          <div className="mt-12 border border-[#292522] bg-[#171717] p-10 sm:p-14 text-center max-w-3xl mx-auto">
            <Layers className="w-7 h-7 text-[#D5B982]/70 mx-auto mb-4" strokeWidth={1.3} />
            <p className="text-xs font-medium tracking-[0.24em] text-[#D5B982] uppercase">
              CURATED DESIGN COLLECTION
            </p>
            <h3 className="mt-3 font-display text-3xl text-[#F4EFE6]">
              {designs.length === 0
                ? 'Graphic Design Showcase Coming Soon'
                : `No designs featured under "${activeCategory}" yet`}
            </h3>
            <p className="mt-4 text-sm text-[#888078] leading-relaxed max-w-xl mx-auto font-light">
              {designs.length === 0
                ? 'Original social media creatives, promotional posters, event graphics, branding concepts, and bespoke invitations by Shaniya Fonseka will be featured here soon.'
                : 'Select another category above to explore available graphic design work.'}
            </p>
          </div>
        ) : (
          <div className="mt-10 columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {filtered.map((item, idx) => (
              <motion.figure
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.45, delay: Math.min(idx * 0.04, 0.25) }}
                className="break-inside-avoid group relative bg-[#171717] border border-[#292522] hover:border-[#D5B982]/55 overflow-hidden transition-colors cursor-pointer"
                onClick={() => setLightboxIndex(idx)}
              >
                <div className="relative overflow-hidden bg-[#171717]">
                  <img
                    src={item.imageUrl}
                    alt={`${item.title} — ${item.category} by SF Creations Sri Lanka`}
                    referrerPolicy="no-referrer"
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-[#171717]/0 group-hover:bg-[#171717]/40 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1.5 px-4 py-2 bg-[#171717]/90 border border-[#D5B982]/60 text-[#D5B982] text-[11px] tracking-[0.16em] uppercase">
                      <Maximize2 className="w-3.5 h-3.5" />
                      View Larger
                    </span>
                  </div>
                </div>
                <figcaption className="p-4 sm:p-5 border-t border-[#292522]">
                  <p className="text-[10px] font-medium tracking-[0.18em] text-[#D5B982] uppercase">
                    {item.category}
                  </p>
                  <h3 className="mt-1 font-display text-xl font-semibold text-[#F4EFE6]">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="mt-1.5 text-xs text-[#888078] font-light leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </figcaption>
              </motion.figure>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Viewer */}
      {activeItem && lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.title}
          className="fixed inset-0 z-50 bg-[#171717]/96 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            aria-label="Close lightbox"
            className="absolute top-5 right-5 w-11 h-11 flex items-center justify-center border border-[#D5B982]/40 text-[#F4EFE6] hover:text-[#D5B982] hover:border-[#D5B982] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {filtered.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((lightboxIndex - 1 + filtered.length) % filtered.length);
                }}
                aria-label="Previous design"
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center bg-[#171717]/80 border border-[#D5B982]/40 text-[#F4EFE6] hover:text-[#D5B982] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((lightboxIndex + 1) % filtered.length);
                }}
                aria-label="Next design"
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center bg-[#171717]/80 border border-[#D5B982]/40 text-[#F4EFE6] hover:text-[#D5B982] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <div
            className="max-w-5xl w-full max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeItem.imageUrl}
              alt={activeItem.title}
              referrerPolicy="no-referrer"
              className="max-h-[75vh] w-auto max-w-full object-contain border border-[#292522]"
            />
            <div className="mt-4 text-center max-w-2xl">
              <p className="text-[11px] tracking-[0.2em] text-[#D5B982] uppercase">
                {activeItem.category} · {lightboxIndex + 1} / {filtered.length}
              </p>
              <h3 className="mt-1 font-display text-2xl sm:text-3xl text-[#F4EFE6]">
                {activeItem.title}
              </h3>
              {activeItem.description && (
                <p className="mt-1.5 text-xs sm:text-sm text-[#F4EFE6]/75 font-light">
                  {activeItem.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
