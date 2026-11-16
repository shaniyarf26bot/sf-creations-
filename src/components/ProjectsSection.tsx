
import { useState } from 'react';
import { motion } from 'motion/react';
import { ExternalLink, Film } from 'lucide-react';
import type { ProjectCategory, ProjectItem } from '../types.ts';

interface ProjectsSectionProps {
  projects: ProjectItem[];
}

const CATEGORY_META: Record<
  ProjectCategory,
  { heading: string; subtitle?: string }
> = {
  brand: {
    heading: 'CATEGORY A – BRAND & BUSINESS CONTENT',
    subtitle: 'CREATING VISUALS THAT MAKE BRANDS STAND OUT.',
  },
  campaigns: {
    heading: 'CATEGORY B – CAMPAIGNS & EVENTS',
  },
  production: {
    heading: 'CATEGORY C – CREATIVE PRODUCTION',
  },
  events: {
    heading: 'CATEGORY D – EVENTS, ENTERTAINMENT & LIVE EXPERIENCES',
    subtitle: 'CAPTURING THE ENERGY, EMOTION AND MOMENTS BEHIND EVERY EVENT.',
  },
};

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const [filter, setFilter] = useState<'all' | ProjectCategory>('all');

  const categoriesToShow: ProjectCategory[] =
    filter === 'all'
      ? ['brand', 'campaigns', 'production', 'events']
      : [filter];

  return (
    <section
      id="projects"
      className="relative bg-[#171717] py-24 sm:py-32 px-5 sm:px-8 border-t border-[#292522]"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col gap-7">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <p className="text-xs font-medium tracking-[0.26em] text-[#D5B982] uppercase">
              SELECTED PROJECTS
            </p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl font-semibold text-[#F4EFE6] tracking-wide text-balance">
              Commercial Reels, Brand Campaigns &amp; Creative Productions
            </h2>
          </motion.div>

          <div
            role="tablist"
            aria-label="Filter projects by category"
            className="inline-flex flex-nowrap items-center gap-1.5 p-1 bg-[#292522]/70 border border-[#D5B982]/20 self-start max-w-full overflow-x-auto"
          >
            {(
              [
                { id: 'all', label: 'All Projects' },
                { id: 'brand', label: 'Brand & Business' },
                { id: 'campaigns', label: 'Campaigns & Events' },
                { id: 'production', label: 'Creative Production' },
                { id: 'events', label: 'Events & Entertainment' },
              ] as const
            ).map((tab) => {
              const active = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(tab.id)}
                  className={`px-3.5 py-2 text-[11px] font-medium tracking-[0.12em] uppercase transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#D5B982] text-[#171717]'
                      : 'text-[#F4EFE6]/75 hover:text-[#D5B982]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-16 space-y-20">
          {categoriesToShow.map((catKey) => {
            const catProjects = projects.filter((p) => p.category === catKey);
            if (catProjects.length === 0) return null;
            const meta = CATEGORY_META[catKey];

            return (
              <div key={catKey}>
                <div className="pb-5 border-b border-[#292522] flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <h3 className="font-display text-2xl sm:text-3xl font-semibold tracking-[0.06em] text-[#D5B982] uppercase">
                    {meta.heading}
                  </h3>
                  {meta.subtitle && (
                    <p className="text-[11px] font-medium tracking-[0.22em] text-[#888078] uppercase">
                      {meta.subtitle}
                    </p>
                  )}
                </div>

                <div
                  className={`mt-8 grid gap-7 ${
                    catProjects.length === 3
                      ? 'grid-cols-1 md:grid-cols-3'
                      : 'grid-cols-1 md:grid-cols-2'
                  }`}
                >
                  {catProjects.map((project, idx) => (
                    <motion.article
                      key={project.id}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.15 }}
                      transition={{ duration: 0.55, delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
                      className="group bg-[#1C1A19] border border-[#292522] hover:border-[#D5B982]/45 flex flex-col justify-between transition-colors duration-300"
                    >
                      <div>
                        <div className="relative aspect-video overflow-hidden bg-[#292522]">
                          {project.thumbnailUrl ? (
                            <img
                              src={project.thumbnailUrl}
                              alt={`${project.title} — ${project.role}`}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#292522] to-[#171717] text-[#D5B982]/60">
                              <Film className="w-8 h-8 mb-2" />
                              <span className="text-xs tracking-[0.2em] uppercase">
                                {project.title}
                              </span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1A19] via-transparent to-transparent opacity-80" />
                          {!project.isCustomThumbnail && (
                            <span className="absolute bottom-2.5 right-3 text-[10px] tracking-[0.16em] uppercase text-[#F4EFE6]/60 bg-[#171717]/75 px-2 py-0.5">
                              Studio Preview Cover
                            </span>
                          )}
                        </div>

                        <div className="p-6 sm:p-7">
                          <p className="text-[11px] font-medium tracking-[0.16em] text-[#D5B982] uppercase">
                            {project.role}
                          </p>
                          <h4 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-[#F4EFE6]">
                            {project.title}
                          </h4>
                          <p className="mt-3 text-xs sm:text-sm text-[#F4EFE6]/75 leading-relaxed font-light">
                            {project.description}
                          </p>
                        </div>
                      </div>

                      <div className="px-6 sm:px-7 pb-6 sm:pb-7 pt-2">
                        <div
                          className={`grid gap-2.5 ${
                            project.links.length === 1
                              ? 'grid-cols-1'
                              : 'grid-cols-1 sm:grid-cols-2'
                          }`}
                        >
                          {project.links.map((link, linkIdx) => (
                            <a
                              key={linkIdx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-2 px-4 py-3 border border-[#D5B982]/45 text-[#F4EFE6] hover:bg-[#D5B982] hover:text-[#171717] hover:border-[#D5B982] text-[11px] font-medium tracking-[0.16em] uppercase transition-all duration-200 whitespace-nowrap"
                            >
                              <span>{link.label}</span>
                              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
