
import { useCallback, useEffect, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { DEFAULT_STUDIO_DATA } from './data/defaultStudioData.ts';
import type { PublicStudioData, ServiceOption } from './types.ts';
import { Navbar } from './components/Navbar.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { MarqueeStrip } from './components/MarqueeStrip.tsx';
import { AboutSection } from './components/AboutSection.tsx';
import { ServicesSection } from './components/ServicesSection.tsx';
import { ProjectsSection } from './components/ProjectsSection.tsx';
import { GraphicDesignSection } from './components/GraphicDesignSection.tsx';
import { MoreCreativeWorkSection } from './components/MoreCreativeWorkSection.tsx';
import { PackagesSection } from './components/PackagesSection.tsx';
import { TestimonialsSection } from './components/TestimonialsSection.tsx';
import { FaqSection } from './components/FaqSection.tsx';
import { InquirySection } from './components/InquirySection.tsx';
import { ContactSection } from './components/ContactSection.tsx';
import { RatingsSection } from './components/RatingsSection.tsx';
import { Footer } from './components/Footer.tsx';
import { StudioManagerModal, type StudioTab } from './components/StudioManagerModal.tsx';

const TRACKED_SECTIONS = [
  'home',
  'about',
  'services',
  'projects',
  'graphic-design',
  'more-creative-work',
  'packages',
  'testimonials',
  'faq',
  'inquiry',
  'contact',
  'ratings',
];

function mapServiceTitleToOption(title: string): ServiceOption {
  const lower = title.toLowerCase();
  if (lower.includes('social media')) return 'Social Media Content Creation';
  if (lower.includes('mobile')) return 'Mobile Videography';
  if (lower.includes('editing')) return 'Video Editing';
  if (lower.includes('graphic')) return 'Graphic Design';
  if (lower.includes('photo')) return 'Photography';
  return 'Custom Creative Projects';
}

export default function App() {
  const [studioData, setStudioData] = useState<PublicStudioData>({
    settings: DEFAULT_STUDIO_DATA.settings,
    services: DEFAULT_STUDIO_DATA.services,
    projects: DEFAULT_STUDIO_DATA.projects,
    graphicDesigns: DEFAULT_STUDIO_DATA.graphicDesigns,
    creativeVideos: DEFAULT_STUDIO_DATA.creativeVideos,
    packages: DEFAULT_STUDIO_DATA.packages,
    testimonials: DEFAULT_STUDIO_DATA.testimonials,
    faqs: DEFAULT_STUDIO_DATA.faqs,
  });
  const [activeSection, setActiveSection] = useState('home');
  const [selectedInquiryService, setSelectedInquiryService] = useState<ServiceOption | ''>('');
  const [studioOpen, setStudioOpen] = useState(false);
  const [studioInitialTab, setStudioInitialTab] = useState<StudioTab>('inquiries');

  const fetchStudioData = useCallback(async () => {
    try {
      const res = await fetch('/api/studio');
      if (res.ok) {
        const data = (await res.json()) as PublicStudioData;
        setStudioData(data);
      }
    } catch {
      // Fall back cleanly to default static data if offline
    }
  }, []);

  useEffect(() => {
    void fetchStudioData();
    const params = new URLSearchParams(window.location.search);
    if (window.location.hash === '#studio-manager' || params.get('studio') === '1') {
      setStudioOpen(true);
    }
  }, [fetchStudioData]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-35% 0px -50% 0px', threshold: 0.05 }
    );

    for (const id of TRACKED_SECTIONS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  const navigateToSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleRequestPackage = useCallback(
    (service: ServiceOption) => {
      setSelectedInquiryService(service);
      navigateToSection('inquiry');
    },
    [navigateToSection]
  );

  const handleSelectServiceCard = useCallback(
    (serviceTitle: string) => {
      setSelectedInquiryService(mapServiceTitleToOption(serviceTitle));
      navigateToSection('inquiry');
    },
    [navigateToSection]
  );

  const openStudioManager = useCallback((tab: StudioTab = 'inquiries') => {
    setStudioInitialTab(tab);
    setStudioOpen(true);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen w-full overflow-x-hidden bg-[#171717] text-[#F4EFE6] selection:bg-[#D5B982] selection:text-[#171717]">
        <Navbar activeSection={activeSection} onNavigate={navigateToSection} />
        <main>
          <HeroSection settings={studioData.settings} onNavigate={navigateToSection} />
          <MarqueeStrip />
          <AboutSection settings={studioData.settings} />
          <ServicesSection
            services={studioData.services}
            onSelectService={handleSelectServiceCard}
          />
          <ProjectsSection projects={studioData.projects} />
          <GraphicDesignSection designs={studioData.graphicDesigns} />
          <MoreCreativeWorkSection videos={studioData.creativeVideos} />
          <PackagesSection
            packages={studioData.packages}
            onRequestPackage={handleRequestPackage}
          />
          <TestimonialsSection testimonials={studioData.testimonials} />
          <FaqSection faqs={studioData.faqs} />
          <InquirySection
            selectedService={selectedInquiryService}
            settings={studioData.settings}
          />
          <ContactSection settings={studioData.settings} />
          <RatingsSection />
        </main>
        <Footer
          settings={studioData.settings}
          onNavigate={navigateToSection}
          onOpenStudioManager={() => openStudioManager('inquiries')}
        />

        <StudioManagerModal
          isOpen={studioOpen}
          initialTab={studioInitialTab}
          onClose={() => setStudioOpen(false)}
          onDataUpdated={fetchStudioData}
        />
      </div>
    </MotionConfig>
  );
}
