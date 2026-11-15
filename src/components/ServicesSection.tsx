import { motion } from 'motion/react';
import type { ServiceItem } from '../types.ts';
import { ServiceIcon } from './ServiceIcon.tsx';

interface ServicesSectionProps {
  services: ServiceItem[];
  onSelectService?: (serviceTitle: string) => void;
}

export function ServicesSection({ services, onSelectService }: ServicesSectionProps) {
  return (
    <section
      id="services"
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
            CREATIVE DISCIPLINES
          </p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl font-semibold text-[#F4EFE6] tracking-wide text-balance">
            Services Tailored for Brands, Events &amp; Digital Stories
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#888078] leading-relaxed font-light">
            From mobile cinematography and social-first edits to graphic design, assistant
            direction, and narrative scripting across Sri Lanka.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((service, idx) => (
            <motion.article
              key={service.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55, delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => onSelectService?.(service.title)}
              className="group relative bg-[#171717] border border-[#292522] hover:border-[#D5B982]/55 p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-display text-2xl font-medium text-[#D5B982]/80 tabular-nums">
                    {service.number}
                  </span>
                  <div className="w-10 h-10 flex items-center justify-center border border-[#292522] group-hover:border-[#D5B982]/50 text-[#D5B982] transition-colors">
                    <ServiceIcon iconKey={service.iconKey} className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="font-display text-2xl font-semibold text-[#F4EFE6] group-hover:text-[#D5B982] transition-colors">
                  {service.title}
                </h3>
                <p className="mt-3 text-xs sm:text-[13px] text-[#F4EFE6]/70 leading-relaxed font-light">
                  {service.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#292522]/80 flex items-center justify-between text-[11px] tracking-[0.18em] uppercase text-[#888078] group-hover:text-[#D5B982] transition-colors">
                <span>Inquire</span>
                <span aria-hidden="true">→</span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
