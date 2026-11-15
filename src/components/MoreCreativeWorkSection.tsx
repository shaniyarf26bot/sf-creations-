import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Film, Play, X } from 'lucide-react';
import type { CreativeVideoItem } from '../types.ts';

interface MoreCreativeWorkSectionProps {
  videos: CreativeVideoItem[];
}

function getEmbedUrl(sourceType: CreativeVideoItem['sourceType'], rawUrl: string): string {
  if (sourceType === 'youtube') {
    const ytMatch = rawUrl.match(
      /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/
    );
    if (ytMatch?.[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
    }
  }
  if (sourceType === 'vimeo') {
    const vimeoMatch = rawUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeoMatch?.[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }
  }
  return rawUrl;
}

export function MoreCreativeWorkSection({
  videos,
}: MoreCreativeWorkSectionProps) {
  const [activeVideo, setActiveVideo] = useState<CreativeVideoItem | null>(null);

  useEffect(() => {
    if (!activeVideo) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveVideo(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeVideo]);

  return (
    <section
      id="more-creative-work"
      className="relative bg-[#171717] py-24 sm:py-32 px-5 sm:px-8 border-t border-[#292522]"
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
            MORE CREATIVE WORK
          </p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl font-semibold text-[#F4EFE6] tracking-wide text-balance">
            Behind Every Frame Is a Creative Idea.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#888078] leading-relaxed font-light">
            Original films, concept edits, and unreleased reels hosted directly for seamless
            viewing without external social platform redirects.
          </p>
        </motion.div>

        {videos.length === 0 ? (
          <div className="mt-12 border border-[#292522] bg-[#1C1A19] p-10 sm:p-14 text-center max-w-3xl mx-auto">
            <Film className="w-8 h-8 text-[#D5B982]/70 mx-auto mb-4" strokeWidth={1.3} />
            <p className="text-xs font-medium tracking-[0.24em] text-[#D5B982] uppercase">
              ORIGINAL VIDEO VAULT
            </p>
            <h3 className="mt-3 font-display text-3xl text-[#F4EFE6]">
              Original Video Cuts Coming Soon
            </h3>
            <p className="mt-4 text-sm text-[#888078] leading-relaxed max-w-xl mx-auto font-light">
              Unreleased concepts, behind-the-scenes edits, and original visual storytelling pieces
              by Shaniya Fonseka will be showcased directly in this player soon.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {videos.map((video, idx) => (
              <motion.article
                key={video.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="group bg-[#1C1A19] border border-[#292522] hover:border-[#D5B982]/55 overflow-hidden flex flex-col transition-colors cursor-pointer"
                onClick={() => setActiveVideo(video)}
              >
                <div className="relative aspect-video bg-[#171717] overflow-hidden">
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : video.sourceType === 'upload' ? (
                    <video
                      src={`${video.videoUrl}#t=0.5`}
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#292522] to-[#171717] text-[#D5B982]/70">
                      <Film className="w-8 h-8 mb-2" strokeWidth={1.3} />
                      <span className="text-[11px] tracking-[0.2em] uppercase">
                        {video.sourceType}
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-[#171717]/35 group-hover:bg-[#171717]/20 transition-colors flex items-center justify-center">
                    <span className="w-14 h-14 rounded-full bg-[#171717]/85 border border-[#D5B982]/80 text-[#D5B982] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 ml-0.5 fill-current" />
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-medium tracking-[0.2em] text-[#D5B982] uppercase">
                      {video.sourceType === 'upload' ? 'DIRECT STUDIO CUT' : video.sourceType}
                    </p>
                    <h3 className="mt-1.5 font-display text-2xl font-semibold text-[#F4EFE6] group-hover:text-[#D5B982] transition-colors">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="mt-2.5 text-xs sm:text-sm text-[#F4EFE6]/70 leading-relaxed font-light">
                        {video.description}
                      </p>
                    )}
                  </div>

                  <span className="mt-5 inline-flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-[#D5B982]">
                    Watch Video <span aria-hidden="true">→</span>
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      {/* Cinematic Direct Video Player Modal */}
      {activeVideo && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeVideo.title}
          className="fixed inset-0 z-50 bg-[#171717]/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="max-w-5xl w-full bg-[#1C1A19] border border-[#D5B982]/35 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#292522]">
              <div>
                <p className="text-[10px] tracking-[0.2em] text-[#D5B982] uppercase">
                  MORE CREATIVE WORK
                </p>
                <h3 className="font-display text-2xl text-[#F4EFE6]">{activeVideo.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                aria-label="Close video player"
                className="w-10 h-10 flex items-center justify-center border border-[#292522] text-[#F4EFE6] hover:text-[#D5B982] hover:border-[#D5B982] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video w-full bg-black">
              {activeVideo.sourceType === 'upload' ? (
                <video
                  src={activeVideo.videoUrl}
                  poster={activeVideo.thumbnailUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <iframe
                  src={getEmbedUrl(activeVideo.sourceType, activeVideo.videoUrl)}
                  title={activeVideo.title}
                  className="w-full h-full border-0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

            {activeVideo.description && (
              <div className="px-6 py-4 border-t border-[#292522]">
                <p className="text-xs sm:text-sm text-[#F4EFE6]/80 font-light">
                  {activeVideo.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
