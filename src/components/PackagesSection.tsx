import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import type { PackageItem, ServiceOption } from '../types.ts';
import { ServiceIcon } from './ServiceIcon.tsx';

interface PackagesSectionProps {
  packages: PackageItem[];
  onRequestPackage: (service: ServiceOption) => void;
}

export function PackagesSection({ packages, onRequestPackage }: PackagesSectionProps) {
  return (
    <section
      id="packages"
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
            SERVICES &amp; PACKAGES
          </p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl font-semibold text-[#F4EFE6] tracking-wide text-balance">
            Bespoke Creative Packages Built Around Your Vision
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#888078] leading-relaxed font-light">
            Every project is tailored to your scope, schedule, and creative goals. Select a package
            below to request a personalised custom quote.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg, idx) => (
            <motion.article
              key={pkg.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              className={`bg-[#171717] border border-[#292522] hover:border-[#D5B982]/55 p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                idx === packages.length - 1 && packages.length % 3 === 2
                  ? 'md:col-span-2 lg:col-span-1'
                  : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-4">
                  <div className="w-11 h-11 flex items-center justify-center border border-[#D5B982]/40 text-[#D5B982]">
                    <ServiceIcon iconKey={pkg.iconKey} className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-medium tracking-[0.14em] text-[#D5B982] uppercase text-right">
                    {pkg.priceNote}
                  </span>
                </div>

                <h3 className="mt-6 font-display text-2xl sm:text-3xl font-semibold text-[#F4EFE6]">
                  {pkg.name}
                </h3>
                <p className="mt-3 text-xs sm:text-sm text-[#F4EFE6]/75 leading-relaxed font-light">
                  {pkg.description}
                </p>

                <div className="w-full h-px bg-[#292522] my-6" aria-hidden="true" />

                <ul className="space-y-3">
                  {pkg.deliverables.map((item, itemIdx) => (
                    <li
                      key={itemIdx}
                      className="flex items-start gap-2.5 text-xs sm:text-[13px] text-[#F4EFE6]/80 font-light"
                    >
                      <Check className="w-4 h-4 text-[#D5B982] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => onRequestPackage(pkg.inquiryServiceMatch)}
                className="mt-8 w-full inline-flex items-center justify-center px-5 py-3.5 border border-[#D5B982] text-[#D5B982] hover:bg-[#D5B982] hover:text-[#171717] text-[11px] font-semibold tracking-[0.18em] uppercase transition-colors cursor-pointer"
              >
                REQUEST THIS PACKAGE
              </button>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
