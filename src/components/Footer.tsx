import { Instagram, Linkedin, Mail, MessageCircle, Music2, Settings2 } from 'lucide-react';
import type { SiteSettings } from '../types.ts';

interface FooterProps {
  settings: SiteSettings;
  onNavigate: (sectionId: string) => void;
  onOpenStudioManager: () => void;
}

export function Footer({ settings, onNavigate, onOpenStudioManager }: FooterProps) {
  return (
    <footer className="bg-[#171717] border-t border-[#D5B982]/25 pt-16 pb-10 px-5 sm:px-8">
      <div className="max-w-[1200px] mx-auto flex flex-col items-center text-center">
        {/* Official Logo */}
        <img
          src={settings.logoUrl}
          alt="SF Creations logo"
          referrerPolicy="no-referrer"
          className="w-[104px] h-[105px] object-contain mb-5"
        />

        {/* Repeated Brand Lockup */}
        <p className="h-[30px] font-display text-3xl sm:text-4xl font-semibold tracking-[0.16em] text-[#F4EFE6] uppercase">
          {settings.brandTitle}
        </p>
        <p className="mt-1.5 font-sans text-[11px] font-medium tracking-[0.38em] text-[#D5B982] uppercase">
          {settings.brandSubtitle}
        </p>

        {/* Social Links */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <a
            href={settings.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="w-11 h-11 flex items-center justify-center border border-[#292522] text-[#F4EFE6]/80 hover:border-[#D5B982] hover:text-[#D5B982] transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
          <a
            href={`mailto:${settings.email}`}
            aria-label="Email SF Creations"
            className="w-11 h-11 flex items-center justify-center border border-[#292522] text-[#F4EFE6]/80 hover:border-[#D5B982] hover:text-[#D5B982] transition-colors"
          >
            <Mail className="w-4 h-4" />
          </a>
          <a
            href={settings.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram (Personal)"
            title="Instagram — Shaniya Fonseka"
            className="w-11 h-11 flex items-center justify-center border border-[#292522] text-[#F4EFE6]/80 hover:border-[#D5B982] hover:text-[#D5B982] transition-colors"
          >
            <Instagram className="w-4 h-4" />
          </a>
          <a
            href={settings.sfInstagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram (SF Creations)"
            title="Instagram — SF Creations"
            className="w-11 h-11 flex items-center justify-center border border-[#292522] text-[#F4EFE6]/80 hover:border-[#D5B982] hover:text-[#D5B982] transition-colors"
          >
            <Instagram className="w-4 h-4" />
          </a>
          <a
            href={settings.tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="w-11 h-11 flex items-center justify-center border border-[#292522] text-[#F4EFE6]/80 hover:border-[#D5B982] hover:text-[#D5B982] transition-colors"
          >
            <Music2 className="w-4 h-4" />
          </a>
          <a
            href={settings.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="w-11 h-11 flex items-center justify-center border border-[#292522] text-[#F4EFE6]/80 hover:border-[#D5B982] hover:text-[#D5B982] transition-colors"
          >
            <Linkedin className="w-4 h-4" />
          </a>
        </div>

        {/* Footer Section Navigation */}
        <nav
          aria-label="Footer navigation"
          className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] tracking-[0.18em] uppercase text-[#888078]"
        >
          {[
            ['home', 'Home'],
            ['about', 'About'],
            ['services', 'Services'],
            ['projects', 'Projects'],
            ['graphic-design', 'Graphic Design'],
            ['more-creative-work', 'More Creative Work'],
            ['packages', 'Packages'],
            ['inquiry', 'Inquiry'],
            ['contact', 'Contact'],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              className="hover:text-[#D5B982] transition-colors cursor-pointer"
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-10 pt-6 w-full border-t border-[#292522] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#888078]">
          <p>{settings.copyrightText}</p>
          <button
            type="button"
            onClick={onOpenStudioManager}
            className="inline-flex items-center gap-2 text-[11px] tracking-[0.16em] uppercase text-[#888078] hover:text-[#D5B982] transition-colors cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Studio Manager</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
