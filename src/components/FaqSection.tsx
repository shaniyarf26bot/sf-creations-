import { useState } from 'react';
import { motion } from 'motion/react';
import { Minus, Plus } from 'lucide-react';
import type { FaqItem } from '../types.ts';

interface FaqSectionProps {
  faqs: FaqItem[];
}

export function FaqSection({ faqs }: FaqSectionProps) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  return (
    <section
      id="faq"
      className="relative bg-[#1B1918] py-24 sm:py-32 px-5 sm:px-8 border-t border-[#292522]"
    >
      <div className="max-w-[960px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto"
        >
          <p className="text-xs font-medium tracking-[0.26em] text-[#D5B982] uppercase">
            ANSWERS &amp; CLARITY
          </p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl font-semibold text-[#F4EFE6] tracking-wide">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <div className="mt-12 divide-y divide-[#292522] border-y border-[#292522]">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div key={faq.id} className="bg-[#171717]/40">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  aria-expanded={isOpen}
                  className="w-full py-5 sm:py-6 px-4 sm:px-6 flex items-center justify-between gap-6 text-left hover:bg-[#292522]/30 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D5B982]"
                >
                  <span className="font-display text-xl sm:text-2xl font-medium text-[#F4EFE6]">
                    {faq.question}
                  </span>
                  <span className="w-8 h-8 shrink-0 flex items-center justify-center border border-[#D5B982]/40 text-[#D5B982]">
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-6 pb-6 pt-1 text-sm text-[#F4EFE6]/80 leading-relaxed font-light max-w-[70ch]">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
