import { motion } from 'motion/react';
import { Quote } from 'lucide-react';
import type { TestimonialItem } from '../types.ts';

interface TestimonialsSectionProps {
  testimonials: TestimonialItem[];
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  return (
    <section
      id="testimonials"
      className="relative bg-[#171717] py-24 sm:py-28 px-5 sm:px-8 border-t border-[#292522]"
    >
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto"
        >
          <p className="text-xs font-medium tracking-[0.26em] text-[#D5B982] uppercase">
            CLIENT EXPERIENCES
          </p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl font-semibold text-[#F4EFE6] tracking-wide uppercase">
            KIND WORDS &amp; CLIENT EXPERIENCES
          </h2>
        </motion.div>

        {testimonials.length === 0 ? (
          <div className="mt-12 max-w-xl mx-auto border border-[#292522] bg-[#1C1A19]/70 px-8 py-10 text-center">
            <Quote className="w-6 h-6 text-[#D5B982]/60 mx-auto mb-3" strokeWidth={1.4} />
            <p className="font-display text-2xl italic text-[#F4EFE6]/80">
              Client experiences will be featured here soon.
            </p>
          </div>
        ) : (
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((item, idx) => (
              <motion.blockquote
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="bg-[#1C1A19] border border-[#292522] p-7 sm:p-8 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-display text-2xl font-medium text-[#D5B982]/85 tabular-nums">
                      {String(idx + 1).padStart(2, '0')}.
                    </span>
                    <Quote className="w-5 h-5 text-[#D5B982]/75" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm text-[#F4EFE6]/85 leading-relaxed font-light italic">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </div>

                <footer className="mt-6 pt-5 border-t border-[#292522]">
                  <p className="font-display text-xl font-semibold text-[#F4EFE6]">
                    {item.clientName}
                  </p>
                  {[item.roleOrCompany, item.projectType].filter(Boolean).length > 0 && (
                    <p className="mt-0.5 text-xs tracking-[0.12em] uppercase text-[#D5B982]">
                      {[item.roleOrCompany, item.projectType].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </footer>
              </motion.blockquote>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
