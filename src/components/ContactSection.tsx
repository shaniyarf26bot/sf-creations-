import { motion } from 'motion/react';
import {
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  Music2,
  ArrowUpRight,
} from 'lucide-react';
import type { SiteSettings } from '../types.ts';

interface ContactSectionProps {
  settings: SiteSettings;
}

export function ContactSection({ settings }: ContactSectionProps) {
  const contactCards = [
    {
      label: 'WhatsApp',
      value: settings.whatsappDisplay,
      href: settings.whatsappUrl,
      icon: MessageCircle,
      external: true,
    },
    {
      label: 'Email',
      value: settings.email,
      href: `mailto:${settings.email}`,
      icon: Mail,
      external: false,
    },
    {
      label: 'Instagram (Personal)',
      value: settings.instagramHandle,
      href: settings.instagramUrl,
      icon: Instagram,
      external: true,
    },
    {
      label: 'Instagram (SF Creations)',
      value: settings.sfInstagramHandle,
      href: settings.sfInstagramUrl,
      icon: Instagram,
      external: true,
    },
    {
      label: 'TikTok',
      value: settings.tiktokHandle,
      href: settings.tiktokUrl,
      icon: Music2,
      external: true,
    },
    {
      label: 'LinkedIn',
      value: settings.linkedinName,
      href: settings.linkedinUrl,
      icon: Linkedin,
      external: true,
    },
  ];

  return (
    <section
      id="contact"
      className="relative bg-[#1B1918] py-24 sm:py-32 px-5 sm:px-8 border-t border-[#292522]"
    >
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto"
        >
          <p className="text-xs font-medium tracking-[0.26em] text-[#D5B982] uppercase">
            CONNECT WITH SF CREATIONS
          </p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl md:text-6xl font-semibold text-[#F4EFE6] tracking-wide uppercase text-balance">
            {settings.contactHeading}
          </h2>
          <p className="mt-5 text-sm sm:text-base text-[#F4EFE6]/80 leading-relaxed font-light">
            {settings.contactSupportingText}
          </p>

          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={settings.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#D5B982] text-[#171717] hover:bg-[#F4EFE6] text-xs font-semibold tracking-[0.18em] uppercase transition-colors whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4" />
              <span>LET&apos;S WORK TOGETHER</span>
            </a>

            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 border border-[#D5B982]/70 text-[#F4EFE6] hover:border-[#D5B982] hover:text-[#D5B982] text-xs font-medium tracking-[0.18em] uppercase transition-colors whitespace-nowrap"
            >
              <Instagram className="w-4 h-4" />
              <span>FOLLOW MY CREATIVE JOURNEY</span>
            </a>
          </div>
        </motion.div>

        {/* Clickable Contact Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {contactCards.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
                className="group bg-[#171717] border border-[#292522] hover:border-[#D5B982]/60 p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between text-[#D5B982]">
                  <Icon className="w-5 h-5" strokeWidth={1.5} />
                  <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="mt-6">
                  <p className="text-[10px] font-medium tracking-[0.22em] text-[#888078] uppercase">
                    {item.label}
                  </p>
                  <p className="mt-1.5 text-sm font-medium text-[#F4EFE6] group-hover:text-[#D5B982] transition-colors break-words">
                    {item.value}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
