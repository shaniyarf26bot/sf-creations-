export type GraphicDesignCategory =
  | 'Social Media Designs'
  | 'Promotional Posters'
  | 'Event Graphics'
  | 'Branding & Logos'
  | 'Advertisements'
  | 'Invitations'
  | 'Digital Designs';

export const GRAPHIC_DESIGN_CATEGORIES: GraphicDesignCategory[] = [
  'Social Media Designs',
  'Promotional Posters',
  'Event Graphics',
  'Branding & Logos',
  'Advertisements',
  'Invitations',
  'Digital Designs',
];

export type ProjectCategory =
  | 'brand'
  | 'campaigns'
  | 'production'
  | 'events';

export type InquiryStatus = 'pending' | 'reviewed' | 'confirmed' | 'archived';

export type ServiceOption =
  | 'Social Media Content Creation'
  | 'Mobile Videography'
  | 'Video Editing'
  | 'Graphic Design'
  | 'Custom Creative Projects'
  | 'Photography'
  | 'Other';

export const INQUIRY_SERVICE_OPTIONS: ServiceOption[] = [
  'Social Media Content Creation',
  'Mobile Videography',
  'Video Editing',
  'Graphic Design',
  'Custom Creative Projects',
  'Photography',
  'Other',
];

export interface SiteSettings {
  brandTitle: string;
  brandSubtitle: string;
  tagline: string;
  heroSupportingText: string;
  heroBackdropUrl: string;
  aboutBackdropUrl: string;
  logoUrl: string;
  aboutParagraphs: string[];
  aboutHighlight: string;
  aboutCreativeStatement: string;
  contactHeading: string;
  contactSupportingText: string;
  whatsappDisplay: string;
  whatsappUrl: string;
  email: string;
  instagramHandle: string;
  instagramUrl: string;
  sfInstagramHandle: string;
  sfInstagramUrl: string;
  tiktokHandle: string;
  tiktokUrl: string;
  linkedinName: string;
  linkedinUrl: string;
  copyrightText: string;
}

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  description: string;
  iconKey: string;
}

export interface ProjectLink {
  label: string;
  url: string;
}

export interface ProjectItem {
  id: string;
  category: ProjectCategory;
  title: string;
  role: string;
  description: string;
  thumbnailUrl: string;
  isCustomThumbnail: boolean;
  links: ProjectLink[];
}

export interface GraphicDesignItem {
  id: string;
  title: string;
  category: GraphicDesignCategory;
  description: string;
  imageUrl: string;
  createdAt: string;
}

export interface CreativeVideoItem {
  id: string;
  title: string;
  description: string;
  sourceType: 'upload' | 'youtube' | 'vimeo';
  videoUrl: string;
  thumbnailUrl?: string;
  createdAt: string;
}

export interface PackageItem {
  id: string;
  name: string;
  inquiryServiceMatch: ServiceOption;
  description: string;
  deliverables: string[];
  iconKey: string;
  priceNote: string;
}

export interface TestimonialItem {
  id: string;
  clientName: string;
  roleOrCompany: string;
  quote: string;
  projectType?: string;
  createdAt: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface InquiryItem {
  id: string;
  fullName: string;
  email: string;
  whatsapp: string;
  service: string;
  preferredDate: string;
  description: string;
  additionalInfo?: string;
  status: InquiryStatus;
  internalNotes: string;
  emailNotificationStatus: 'sent' | 'smtp_not_configured' | 'failed';
  createdAt: string;
}

export interface PublicStudioData {
  settings: SiteSettings;
  services: ServiceItem[];
  projects: ProjectItem[];
  graphicDesigns: GraphicDesignItem[];
  creativeVideos: CreativeVideoItem[];
  packages: PackageItem[];
  testimonials: TestimonialItem[];
  faqs: FaqItem[];
}

export interface StudioDatabase extends PublicStudioData {
  inquiries: InquiryItem[];
}
