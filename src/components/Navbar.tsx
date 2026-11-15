import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

const NAV_ITEMS = [
  { id: 'home', label: 'HOME' },
  { id: 'about', label: 'ABOUT' },
  { id: 'services', label: 'SERVICES' },
  { id: 'projects', label: 'PROJECTS' },
  { id: 'graphic-design', label: 'GRAPHIC DESIGN' },
  { id: 'more-creative-work', label: 'MORE CREATIVE WORK' },
  { id: 'contact', label: 'CONTACT' },
];

export function Navbar({ activeSection, onNavigate }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLinkClick = (id: string) => {
    setMobileOpen(false);
    onNavigate(id);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#171717]/95 backdrop-blur-md border-b border-[#D5B982]/20 py-3.5'
          : 'bg-gradient-to-b from-[#171717]/90 via-[#171717]/55 to-transparent py-4'
      }`}
    >
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8 flex items-center justify-end xl:justify-between gap-6">
        {/* Zone 2: Desktop Navigation Links */}
        <nav aria-label="Primary navigation" className="hidden xl:flex items-center gap-6">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(item.id);
                }}
                className={`champagne-underline text-[11px] font-medium tracking-[0.18em] transition-colors whitespace-nowrap shrink-0 py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D5B982] ${
                  isActive
                    ? 'text-[#D5B982] champagne-underline-active'
                    : 'text-[#F4EFE6]/85 hover:text-[#D5B982]'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action & Mobile Drawer Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#inquiry"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('inquiry');
            }}
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-[11px] font-medium tracking-[0.18em] uppercase border border-[#D5B982] text-[#D5B982] hover:bg-[#D5B982] hover:text-[#171717] transition-all duration-200 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D5B982]"
          >
            BOOK NOW
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="xl:hidden inline-flex items-center justify-center w-11 h-11 text-[#F4EFE6] hover:text-[#D5B982] border border-[#D5B982]/30 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D5B982]"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile / Tablet Menu Drawer */}
      {mobileOpen && (
        <div className="xl:hidden bg-[#171717]/98 border-b border-[#D5B982]/25 backdrop-blur-lg">
          <nav
            aria-label="Mobile navigation"
            className="max-w-[1360px] mx-auto px-5 py-6 flex flex-col gap-1"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(item.id);
                  }}
                  className={`py-3 px-2 text-xs font-medium tracking-[0.2em] border-b border-[#292522] transition-colors ${
                    isActive ? 'text-[#D5B982]' : 'text-[#F4EFE6]/85 hover:text-[#D5B982]'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
            <a
              href="#inquiry"
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick('inquiry');
              }}
              className="mt-4 inline-flex items-center justify-center px-5 py-3.5 text-xs font-medium tracking-[0.2em] uppercase bg-[#D5B982] text-[#171717] hover:bg-[#F4EFE6] transition-colors"
            >
              BOOK &amp; INQUIRE
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
