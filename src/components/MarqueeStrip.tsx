const MARQUEE_PHRASES = [
  'MOBILE VIDEOGRAPHY',
  'CREATIVE STORYTELLING',
  'GRAPHIC DESIGN',
  'VIDEO EDITING',
  'CONTENT CREATION',
  'VISUAL EXPERIENCES',
  'DIGITAL CREATIVITY',
];

function MarqueeTrack({ hidden = false }: { hidden?: boolean }) {
  return (
    <div
      aria-hidden={hidden}
      className="flex shrink-0 items-center whitespace-nowrap"
    >
      {MARQUEE_PHRASES.map((phrase, idx) => (
        <span key={`${phrase}-${idx}`} className="inline-flex items-center">
          <span className="px-5 sm:px-7 font-sans text-[11px] sm:text-xs font-medium tracking-[0.26em] text-[#D5B982] uppercase whitespace-nowrap">
            {phrase}
          </span>
          <span
            aria-hidden="true"
            className="text-[#D5B982]/80 text-xs select-none"
          >
            ✦
          </span>
        </span>
      ))}
    </div>
  );
}

export function MarqueeStrip() {
  return (
    <div
      aria-label="Creative specialties marquee"
      className="group relative w-full overflow-hidden bg-[#292522]/75 border-y border-[#D5B982]/25 py-4 sm:py-4.5 select-none"
    >
      <div className="flex w-max flex-nowrap animate-marquee">
        <MarqueeTrack />
        <MarqueeTrack hidden />
        <MarqueeTrack hidden />
        <MarqueeTrack hidden />
      </div>
    </div>
  );
}
