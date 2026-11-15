import { useEffect, useState, type FormEvent } from 'react';
import {
  Check,
  Film,
  ImagePlus,
  Inbox,
  KeyRound,
  LogOut,
  Mail,
  MessageCircle,
  MessageSquareQuote,
  Plus,
  Settings,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  GRAPHIC_DESIGN_CATEGORIES,
  type CreativeVideoItem,
  type FaqItem,
  type GraphicDesignCategory,
  type GraphicDesignItem,
  type InquiryStatus,
  type ProjectCategory,
  type ProjectItem,
  type ProjectLink,
  type StudioDatabase,
  type TestimonialItem,
} from '../types.ts';

export type StudioTab =
  | 'inquiries'
  | 'designs'
  | 'videos'
  | 'projects'
  | 'testimonials'
  | 'settings';

interface StudioManagerModalProps {
  isOpen: boolean;
  initialTab: StudioTab;
  onClose: () => void;
  onDataUpdated: () => Promise<void>;
}

interface AdminStudioResponse extends StudioDatabase {
  smtpConfigured: boolean;
}

const STUDIO_TOKEN_KEY = 'sf_studio_token';

export function StudioManagerModal({
  isOpen,
  initialTab,
  onClose,
  onDataUpdated,
}: StudioManagerModalProps) {
  const [activeTab, setActiveTab] = useState<StudioTab>(initialTab);
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authToken, setAuthToken] = useState<string>(() => {
    try {
      return sessionStorage.getItem(STUDIO_TOKEN_KEY) || '';
    } catch {
      return '';
    }
  });
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [adminData, setAdminData] = useState<AdminStudioResponse | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Design Upload State
  const [designTitle, setDesignTitle] = useState('');
  const [designCategory, setDesignCategory] = useState<GraphicDesignCategory>(
    'Social Media Designs'
  );
  const [designDesc, setDesignDesc] = useState('');
  const [designFiles, setDesignFiles] = useState<FileList | null>(null);
  const [uploadingDesign, setUploadingDesign] = useState(false);
  const [editingDesign, setEditingDesign] = useState<GraphicDesignItem | null>(null);

  // Video Upload / Embed State
  const [videoMode, setVideoMode] = useState<'upload' | 'youtube' | 'vimeo'>('upload');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDesc, setVideoDesc] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoThumbFile, setVideoThumbFile] = useState<File | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Inquiries filter
  const [inquiryFilter, setInquiryFilter] = useState<'all' | InquiryStatus>('all');

  // Project editing / creation
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [projCategory, setProjCategory] = useState<ProjectCategory>('brand');
  const [projTitle, setProjTitle] = useState('');
  const [projRole, setProjRole] = useState('');
  const [projDescription, setProjDescription] = useState('');
  const [projLinks, setProjLinks] = useState<ProjectLink[]>([{ label: 'WATCH PROJECT', url: '' }]);
  const [projThumbFile, setProjThumbFile] = useState<File | null>(null);

  // Testimonials
  const [testClientName, setTestClientName] = useState('');
  const [testRole, setTestRole] = useState('');
  const [testProjectType, setTestProjectType] = useState('');
  const [testQuote, setTestQuote] = useState('');

  // FAQs
  const [faqDrafts, setFaqDrafts] = useState<FaqItem[]>([]);

  // Settings
  const [settingsDraft, setSettingsDraft] = useState<StudioDatabase['settings'] | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const showToast = (msg: string) => {
    setErrorMessage('');
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  const showErr = (msg: string) => {
    setStatusMessage('');
    setErrorMessage(msg);
  };

  const adminFetch = (
    url: string,
    init: RequestInit = {},
    tokenOverride?: string
  ): Promise<Response> => {
    const tokenToUse = tokenOverride ?? authToken;
    const headers = new Headers(init.headers || {});
    if (tokenToUse) {
      headers.set('Authorization', `Bearer ${tokenToUse}`);
    }
    return fetch(url, { ...init, headers, credentials: 'include' });
  };

  const loadAdminData = async (tokenOverride?: string) => {
    const res = await adminFetch('/api/admin/data', {}, tokenOverride);
    if (res.status === 401) {
      setAuthenticated(false);
      setAuthToken('');
      try {
        sessionStorage.removeItem(STUDIO_TOKEN_KEY);
      } catch {
        // Ignore storage errors
      }
      return;
    }
    if (res.ok) {
      const data = (await res.json()) as AdminStudioResponse;
      setAdminData(data);
      setSettingsDraft(data.settings);
      setFaqDrafts(data.faqs);
    } else {
      showErr('Could not load studio data. Please try unlocking again.');
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setCheckingAuth(true);
    adminFetch('/api/admin/session')
      .then((r) => r.json())
      .then(async (res: { authenticated: boolean }) => {
        setAuthenticated(res.authenticated);
        if (res.authenticated) {
          await loadAdminData();
        }
      })
      .finally(() => setCheckingAuth(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ passcode }),
    });
    if (!res.ok) {
      const err = (await res.json()) as { error?: string };
      setAuthError(err.error || 'Invalid studio passcode.');
      return;
    }
    const loginPayload = (await res.json()) as { authenticated: boolean; token?: string };
    const newToken = loginPayload.token || '';
    setAuthToken(newToken);
    try {
      if (newToken) sessionStorage.setItem(STUDIO_TOKEN_KEY, newToken);
    } catch {
      // Ignore storage errors
    }
    setPasscode('');
    setAuthenticated(true);
    await loadAdminData(newToken);
  };

  const handleLogout = async () => {
    await adminFetch('/api/admin/logout', { method: 'POST' });
    setAuthToken('');
    try {
      sessionStorage.removeItem(STUDIO_TOKEN_KEY);
    } catch {
      // Ignore storage errors
    }
    setAuthenticated(false);
    setAdminData(null);
  };

  // Graphic Design Handlers
  const handleUploadDesigns = async (e: FormEvent) => {
    e.preventDefault();
    if (!designFiles || designFiles.length === 0) {
      showErr('Please select one or more image files from your laptop.');
      return;
    }
    setUploadingDesign(true);
    setErrorMessage('');
    try {
      const fd = new FormData();
      fd.append('category', designCategory);
      fd.append('title', designTitle);
      fd.append('description', designDesc);
      Array.from(designFiles).forEach((file) => fd.append('images', file));

      const res = await adminFetch('/api/admin/upload/design', { method: 'POST', body: fd });
      const data = (await res.json()) as { error?: string; added?: GraphicDesignItem[] };
      if (!res.ok) {
        showErr(data.error || 'Upload failed.');
        return;
      }
      setDesignTitle('');
      setDesignDesc('');
      setDesignFiles(null);
      await loadAdminData();
      await onDataUpdated();
      showToast(`Uploaded ${data.added?.length ?? 1} graphic design(s) successfully.`);
    } finally {
      setUploadingDesign(false);
    }
  };

  const handleSaveDesignEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingDesign) return;
    const fd = new FormData();
    fd.append('title', editingDesign.title);
    fd.append('category', editingDesign.category);
    fd.append('description', editingDesign.description);
    const res = await adminFetch(`/api/admin/designs/${editingDesign.id}`, {
      method: 'PUT',
      body: fd,
    });
    if (res.ok) {
      setEditingDesign(null);
      await loadAdminData();
      await onDataUpdated();
      showToast('Design details updated.');
    }
  };

  const handleDeleteDesign = async (id: string) => {
    const res = await adminFetch(`/api/admin/designs/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await loadAdminData();
      await onDataUpdated();
      showToast('Design removed from gallery.');
    }
  };

  // Video Handlers
  const handleUploadVideo = async (e: FormEvent) => {
    e.preventDefault();
    setUploadingVideo(true);
    setErrorMessage('');
    try {
      const fd = new FormData();
      fd.append('sourceType', videoMode);
      fd.append('title', videoTitle);
      fd.append('description', videoDesc);
      if (videoMode === 'upload') {
        if (!videoFile) {
          showErr('Please select a video file (MP4, WebM, or MOV) from your laptop.');
          return;
        }
        fd.append('video', videoFile);
        if (videoThumbFile) fd.append('thumbnail', videoThumbFile);
      } else {
        if (!videoUrlInput.trim()) {
          showErr('Please enter a valid YouTube or Vimeo video URL.');
          return;
        }
        fd.append('videoUrl', videoUrlInput.trim());
        if (videoThumbFile) fd.append('thumbnail', videoThumbFile);
      }

      const res = await adminFetch('/api/admin/upload/video', { method: 'POST', body: fd });
      const data = (await res.json()) as { error?: string; item?: CreativeVideoItem };
      if (!res.ok) {
        showErr(data.error || 'Video upload failed.');
        return;
      }
      setVideoTitle('');
      setVideoDesc('');
      setVideoUrlInput('');
      setVideoFile(null);
      setVideoThumbFile(null);
      await loadAdminData();
      await onDataUpdated();
      showToast('Video added to More Creative Work.');
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    const res = await adminFetch(`/api/admin/videos/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await loadAdminData();
      await onDataUpdated();
      showToast('Video removed.');
    }
  };

  // Inquiry Handlers
  const handleUpdateInquiry = async (id: string, status: InquiryStatus, internalNotes: string) => {
    const res = await adminFetch(`/api/admin/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, internalNotes }),
    });
    if (res.ok) {
      await loadAdminData();
      showToast('Inquiry status updated.');
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    const res = await adminFetch(`/api/admin/inquiries/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await loadAdminData();
      showToast('Inquiry deleted.');
    }
  };

  // Project Handlers
  const openEditProject = (project: ProjectItem) => {
    setNewProjectOpen(false);
    setEditingProject(project);
    setProjCategory(project.category);
    setProjTitle(project.title);
    setProjRole(project.role);
    setProjDescription(project.description);
    setProjLinks(project.links.length > 0 ? project.links : [{ label: 'WATCH PROJECT', url: '' }]);
    setProjThumbFile(null);
  };

  const openNewProject = () => {
    setEditingProject(null);
    setNewProjectOpen(true);
    setProjCategory('brand');
    setProjTitle('');
    setProjRole('');
    setProjDescription('');
    setProjLinks([{ label: 'WATCH PROJECT', url: '' }]);
    setProjThumbFile(null);
  };

  const handleSaveProject = async (e: FormEvent) => {
    e.preventDefault();
    const cleanLinks = projLinks.filter((l) => l.label.trim() && l.url.trim());
    const fd = new FormData();
    fd.append('category', projCategory);
    fd.append('title', projTitle);
    fd.append('role', projRole);
    fd.append('description', projDescription);
    fd.append('links', JSON.stringify(cleanLinks));
    if (projThumbFile) fd.append('thumbnail', projThumbFile);

    const url = editingProject ? `/api/admin/projects/${editingProject.id}` : '/api/admin/projects';
    const method = editingProject ? 'PUT' : 'POST';
    const res = await adminFetch(url, { method, body: fd });
    if (res.ok) {
      setEditingProject(null);
      setNewProjectOpen(false);
      await loadAdminData();
      await onDataUpdated();
      showToast(editingProject ? 'Project updated.' : 'New project added.');
    } else {
      showErr('Could not save project.');
    }
  };

  const handleDeleteProject = async (id: string) => {
    const res = await adminFetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await loadAdminData();
      await onDataUpdated();
      showToast('Project deleted.');
    }
  };

  // Testimonial Handlers
  const handleAddTestimonial = async (e: FormEvent) => {
    e.preventDefault();
    const res = await adminFetch('/api/admin/testimonials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientName: testClientName,
        roleOrCompany: testRole,
        projectType: testProjectType,
        quote: testQuote,
      }),
    });
    if (res.ok) {
      setTestClientName('');
      setTestRole('');
      setTestProjectType('');
      setTestQuote('');
      await loadAdminData();
      await onDataUpdated();
      showToast('Client testimonial added.');
    } else {
      showErr('Client name and testimonial quote are required.');
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    const res = await adminFetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await loadAdminData();
      await onDataUpdated();
      showToast('Testimonial removed.');
    }
  };

  // Settings & FAQ Handlers
  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    if (!settingsDraft) return;
    if (logoFile) {
      const logoFd = new FormData();
      logoFd.append('logo', logoFile);
      const logoRes = await adminFetch('/api/admin/upload/logo', { method: 'POST', body: logoFd });
      if (logoRes.ok) {
        const { logoUrl } = (await logoRes.json()) as { logoUrl: string };
        settingsDraft.logoUrl = logoUrl;
      }
      setLogoFile(null);
    }
    const res = await adminFetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsDraft),
    });
    await adminFetch('/api/admin/faqs', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(faqDrafts),
    });
    if (res.ok) {
      await loadAdminData();
      await onDataUpdated();
      showToast('Website copy, contact details & FAQs saved.');
    }
  };

  const handleTestEmail = async () => {
    const res = await adminFetch('/api/admin/test-email', { method: 'POST' });
    const data = (await res.json()) as { message?: string; error?: string };
    if (res.ok) {
      showToast(data.message || 'Test email sent!');
    } else {
      showErr(data.error || 'Could not send test email.');
    }
  };

  const filteredInquiries =
    adminData?.inquiries.filter((inq) =>
      inquiryFilter === 'all' ? true : inq.status === inquiryFilter
    ) ?? [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="SF Creations Studio Manager"
      className="fixed inset-0 z-50 bg-[#171717]/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
    >
      <div className="w-full max-w-[1220px] max-h-[92vh] bg-[#1C1A19] border border-[#D5B982]/35 flex flex-col overflow-hidden">
        {/* Top Modal Header */}
        <div className="px-6 py-4 bg-[#171717] border-b border-[#292522] flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] tracking-[0.24em] text-[#D5B982] uppercase">
              SF CREATIONS · OWNER DASHBOARD
            </p>
            <h2 className="font-display text-2xl sm:text-3xl text-[#F4EFE6]">
              Studio Content &amp; Booking Manager
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {authenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-[#292522] text-xs text-[#888078] hover:text-[#D5B982] hover:border-[#D5B982]/40 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lock Studio</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Studio Manager"
              className="w-10 h-10 flex items-center justify-center border border-[#292522] text-[#F4EFE6] hover:text-[#D5B982] hover:border-[#D5B982] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Auth Gate or Dashboard Body */}
        {checkingAuth ? (
          <div className="p-16 text-center text-sm text-[#888078]">Checking studio session...</div>
        ) : !authenticated ? (
          <div className="p-8 sm:p-16 flex items-center justify-center overflow-y-auto">
            <form
              onSubmit={handleLogin}
              className="w-full max-w-md bg-[#171717] border border-[#292522] p-8"
            >
              <KeyRound className="w-8 h-8 text-[#D5B982] mb-4" strokeWidth={1.4} />
              <h3 className="font-display text-3xl text-[#F4EFE6]">Studio Owner Access</h3>
              <p className="mt-2 text-xs text-[#888078] leading-relaxed">
                Enter your <code className="text-[#D5B982]">STUDIO_ADMIN_PASSCODE</code> to upload
                graphic designs, publish videos, edit projects, and manage client booking inquiries.
              </p>

              {authError && (
                <p className="mt-4 p-3 bg-red-950/40 border border-red-400/40 text-xs text-red-200">
                  {authError}
                </p>
              )}

              <div className="mt-6">
                <label
                  htmlFor="studio-passcode"
                  className="block text-[11px] tracking-[0.18em] uppercase text-[#D5B982] mb-2"
                >
                  Studio Passcode
                </label>
                <input
                  id="studio-passcode"
                  type="password"
                  required
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter studio passcode"
                  className="w-full bg-[#1C1A19] border border-[#292522] focus:border-[#D5B982] px-4 py-3 text-sm text-[#F4EFE6] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="mt-6 w-full py-3.5 bg-[#D5B982] text-[#171717] hover:bg-[#F4EFE6] text-xs font-semibold tracking-[0.2em] uppercase transition-colors cursor-pointer"
              >
                Unlock Studio Manager
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="px-6 bg-[#171717] border-b border-[#292522] flex items-center gap-1 overflow-x-auto">
              {(
                [
                  {
                    id: 'inquiries',
                    label: `Inquiries (${adminData?.inquiries.length ?? 0})`,
                    icon: Inbox,
                  },
                  {
                    id: 'designs',
                    label: `Graphic Designs (${adminData?.graphicDesigns.length ?? 0})`,
                    icon: ImagePlus,
                  },
                  {
                    id: 'videos',
                    label: `Creative Videos (${adminData?.creativeVideos.length ?? 0})`,
                    icon: Film,
                  },
                  {
                    id: 'projects',
                    label: `Projects (${adminData?.projects.length ?? 0})`,
                    icon: Upload,
                  },
                  {
                    id: 'testimonials',
                    label: 'Testimonials',
                    icon: MessageSquareQuote,
                  },
                  {
                    id: 'settings',
                    label: 'Settings & Email',
                    icon: Settings,
                  },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-2 px-4 py-3.5 text-[11px] font-medium tracking-[0.14em] uppercase border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'border-[#D5B982] text-[#D5B982]'
                        : 'border-transparent text-[#888078] hover:text-[#F4EFE6]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Feedback Banner */}
            {(statusMessage || errorMessage) && (
              <div
                className={`px-6 py-3 text-xs border-b ${
                  errorMessage
                    ? 'bg-red-950/40 border-red-400/40 text-red-200'
                    : 'bg-[#292522] border-[#D5B982]/30 text-[#D5B982]'
                }`}
              >
                {errorMessage || statusMessage}
              </div>
            )}

            {/* Tab Panels */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {!adminData && (
                <div className="p-12 text-center text-sm text-[#888078]">
                  Loading studio dashboard...
                </div>
              )}
              {/* TAB 1: BOOKING INQUIRIES */}
              {activeTab === 'inquiries' && adminData && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="font-display text-2xl text-[#F4EFE6]">
                        Client Booking &amp; Project Inquiries
                      </h3>
                      <p className="text-xs text-[#888078]">
                        All inquiries remain Pending until you personally review and confirm them.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(['all', 'pending', 'reviewed', 'confirmed', 'archived'] as const).map(
                        (st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setInquiryFilter(st)}
                            className={`px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] border cursor-pointer ${
                              inquiryFilter === st
                                ? 'bg-[#D5B982] text-[#171717] border-[#D5B982]'
                                : 'border-[#292522] text-[#888078] hover:text-[#F4EFE6]'
                            }`}
                          >
                            {st}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {filteredInquiries.length === 0 ? (
                    <div className="p-10 border border-[#292522] bg-[#171717] text-center text-sm text-[#888078]">
                      No inquiries in this view yet. Submissions from the website form will appear
                      here immediately.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredInquiries.map((inq) => {
                        const cleanDigits = inq.whatsapp.replace(/[^\d+]/g, '');
                        const waNumber = cleanDigits.startsWith('0')
                          ? `94${cleanDigits.slice(1)}`
                          : cleanDigits.replace(/^\+/, '');
                        const waHref = `https://wa.me/${waNumber}?text=${encodeURIComponent(
                          `Hi ${inq.fullName}, thank you for reaching out to SF Creations regarding "${inq.service}". I've reviewed your project inquiry and would love to discuss the details.`
                        )}`;
                        const mailHref = `mailto:${inq.email}?subject=${encodeURIComponent(
                          `Re: SF Creations Inquiry — ${inq.service}`
                        )}&body=${encodeURIComponent(
                          `Hi ${inq.fullName},\n\nThank you for contacting SF Creations regarding ${inq.service} (preferred date: ${inq.preferredDate}).\n\n`
                        )}`;

                        return (
                          <div
                            key={inq.id}
                            className="bg-[#171717] border border-[#292522] p-5 sm:p-6 space-y-4"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#292522]">
                              <div>
                                <p className="text-xs text-[#D5B982] uppercase tracking-[0.16em]">
                                  {inq.service} · Preferred Date: {inq.preferredDate}
                                </p>
                                <h4 className="mt-1 font-display text-2xl text-[#F4EFE6]">
                                  {inq.fullName}
                                </h4>
                                <p className="text-xs text-[#888078]">
                                  {inq.email} · WhatsApp: {inq.whatsapp} · Submitted{' '}
                                  {new Date(inq.createdAt).toLocaleString()}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <select
                                  aria-label="Inquiry status"
                                  value={inq.status}
                                  onChange={(e) =>
                                    handleUpdateInquiry(
                                      inq.id,
                                      e.target.value as InquiryStatus,
                                      inq.internalNotes
                                    )
                                  }
                                  className="bg-[#292522] border border-[#D5B982]/40 px-3 py-2 text-xs text-[#F4EFE6] uppercase tracking-[0.12em]"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="reviewed">Reviewed</option>
                                  <option value="confirmed">Confirmed</option>
                                  <option value="archived">Archived</option>
                                </select>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteInquiry(inq.id)}
                                  aria-label="Delete inquiry"
                                  className="p-2 border border-[#292522] text-[#888078] hover:text-red-400 hover:border-red-400/50 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="text-sm text-[#F4EFE6]/85 space-y-2">
                              <p className="whitespace-pre-line">{inq.description}</p>
                              {inq.additionalInfo && (
                                <p className="text-xs text-[#888078]">
                                  Additional Notes: {inq.additionalInfo}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                              <div className="flex flex-wrap gap-2">
                                <a
                                  href={mailHref}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#D5B982]/50 text-[#D5B982] hover:bg-[#D5B982] hover:text-[#171717] text-xs uppercase tracking-[0.12em] transition-colors"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                  Reply via Email
                                </a>
                                <a
                                  href={waHref}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#D5B982] text-[#171717] hover:bg-[#F4EFE6] text-xs font-medium uppercase tracking-[0.12em] transition-colors"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  Reply on WhatsApp
                                </a>
                              </div>

                              <span className="text-[11px] text-[#888078]">
                                Email alert:{' '}
                                {inq.emailNotificationStatus === 'sent'
                                  ? 'Delivered to sfcreations26@gmail.com'
                                  : 'Saved in dashboard (configure SMTP in Settings for email alerts)'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: GRAPHIC DESIGNS */}
              {activeTab === 'designs' && adminData && (
                <div className="space-y-8">
                  <form
                    onSubmit={handleUploadDesigns}
                    className="bg-[#171717] border border-[#292522] p-6 space-y-5"
                  >
                    <h3 className="font-display text-2xl text-[#F4EFE6]">
                      Upload Original Graphic Designs from Laptop
                    </h3>
                    <p className="text-xs text-[#888078]">
                      Select one or multiple PNG, JPG, or WebP files (up to 20 files per batch,
                      20MB each).
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] tracking-[0.16em] uppercase text-[#D5B982] mb-1.5">
                          Category
                        </label>
                        <select
                          value={designCategory}
                          onChange={(e) =>
                            setDesignCategory(e.target.value as GraphicDesignCategory)
                          }
                          className="w-full bg-[#1C1A19] border border-[#292522] px-3.5 py-2.5 text-sm text-[#F4EFE6]"
                        >
                          {GRAPHIC_DESIGN_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] tracking-[0.16em] uppercase text-[#D5B982] mb-1.5">
                          Title (Optional for batch uploads)
                        </label>
                        <input
                          type="text"
                          value={designTitle}
                          onChange={(e) => setDesignTitle(e.target.value)}
                          placeholder="Leave blank to use file names automatically"
                          className="w-full bg-[#1C1A19] border border-[#292522] px-3.5 py-2.5 text-sm text-[#F4EFE6]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] tracking-[0.16em] uppercase text-[#D5B982] mb-1.5">
                        Short Description (Optional)
                      </label>
                      <input
                        type="text"
                        value={designDesc}
                        onChange={(e) => setDesignDesc(e.target.value)}
                        placeholder="Client, campaign, or design concept..."
                        className="w-full bg-[#1C1A19] border border-[#292522] px-3.5 py-2.5 text-sm text-[#F4EFE6]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] tracking-[0.16em] uppercase text-[#D5B982] mb-1.5">
                        Select Design File(s)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => setDesignFiles(e.target.files)}
                        className="block w-full text-xs text-[#F4EFE6]/80 file:mr-4 file:py-2.5 file:px-4 file:border-0 file:bg-[#292522] file:text-[#D5B982] hover:file:bg-[#D5B982] hover:file:text-[#171717] file:cursor-pointer"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={uploadingDesign}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#D5B982] text-[#171717] hover:bg-[#F4EFE6] text-xs font-semibold tracking-[0.18em] uppercase cursor-pointer"
                    >
                      <ImagePlus className="w-4 h-4" />
                      <span>{uploadingDesign ? 'Uploading...' : 'Upload to Gallery'}</span>
                    </button>
                  </form>

                  {/* Edit Modal Inline */}
                  {editingDesign && (
                    <form
                      onSubmit={handleSaveDesignEdit}
                      className="bg-[#292522]/60 border border-[#D5B982]/50 p-5 space-y-4"
                    >
                      <h4 className="font-display text-xl text-[#F4EFE6]">
                        Edit Design: {editingDesign.title}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={editingDesign.title}
                          onChange={(e) =>
                            setEditingDesign({ ...editingDesign, title: e.target.value })
                          }
                          className="bg-[#171717] border border-[#292522] px-3 py-2 text-sm text-[#F4EFE6]"
                        />
                        <select
                          value={editingDesign.category}
                          onChange={(e) =>
                            setEditingDesign({
                              ...editingDesign,
                              category: e.target.value as GraphicDesignCategory,
                            })
                          }
                          className="bg-[#171717] border border-[#292522] px-3 py-2 text-sm text-[#F4EFE6]"
                        >
                          {GRAPHIC_DESIGN_CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <input
                        type="text"
                        value={editingDesign.description}
                        onChange={(e) =>
                          setEditingDesign({ ...editingDesign, description: e.target.value })
                        }
                        placeholder="Description"
                        className="w-full bg-[#171717] border border-[#292522] px-3 py-2 text-sm text-[#F4EFE6]"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-[#D5B982] text-[#171717] text-xs uppercase font-semibold cursor-pointer"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingDesign(null)}
                          className="px-4 py-2 border border-[#888078] text-xs text-[#F4EFE6] uppercase cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Existing Designs List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {adminData.graphicDesigns.map((item) => (
                      <div
                        key={item.id}
                        className="bg-[#171717] border border-[#292522] overflow-hidden flex flex-col justify-between"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-44 object-cover"
                        />
                        <div className="p-4 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[10px] text-[#D5B982] uppercase truncate">
                              {item.category}
                            </p>
                            <p className="text-sm text-[#F4EFE6] font-medium truncate">
                              {item.title}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => setEditingDesign(item)}
                              className="px-2.5 py-1.5 border border-[#292522] text-[11px] text-[#F4EFE6] hover:border-[#D5B982] cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteDesign(item.id)}
                              aria-label="Delete design"
                              className="p-1.5 border border-[#292522] text-[#888078] hover:text-red-400 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: CREATIVE VIDEOS */}
              {activeTab === 'videos' && adminData && (
                <div className="space-y-8">
                  <form
                    onSubmit={handleUploadVideo}
                    className="bg-[#171717] border border-[#292522] p-6 space-y-5"
                  >
                    <h3 className="font-display text-2xl text-[#F4EFE6]">
                      Add Original Videos (Direct Upload or YouTube / Vimeo)
                    </h3>
                    <p className="text-xs text-[#888078] leading-relaxed">
                      Upload MP4, WebM, or MOV videos directly from your laptop (up to 250MB per
                      file) to showcase unpublished cuts directly on your website, or link an
                      unlisted YouTube/Vimeo video for ultra-large 4K files.
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          { id: 'upload', label: 'Upload Video from Laptop' },
                          { id: 'youtube', label: 'YouTube Embed Link' },
                          { id: 'vimeo', label: 'Vimeo Embed Link' },
                        ] as const
                      ).map((mode) => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setVideoMode(mode.id)}
                          className={`px-4 py-2 text-xs uppercase tracking-[0.12em] border cursor-pointer ${
                            videoMode === mode.id
                              ? 'bg-[#D5B982] text-[#171717] border-[#D5B982] font-semibold'
                              : 'border-[#292522] text-[#888078] hover:text-[#F4EFE6]'
                          }`}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] tracking-[0.16em] uppercase text-[#D5B982] mb-1.5">
                          Video Title
                        </label>
                        <input
                          type="text"
                          required
                          value={videoTitle}
                          onChange={(e) => setVideoTitle(e.target.value)}
                          placeholder="e.g. Behind-the-Scenes Brand Film"
                          className="w-full bg-[#1C1A19] border border-[#292522] px-3.5 py-2.5 text-sm text-[#F4EFE6]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] tracking-[0.16em] uppercase text-[#D5B982] mb-1.5">
                          Custom Poster Thumbnail (Optional)
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setVideoThumbFile(e.target.files?.[0] || null)}
                          className="block w-full text-xs text-[#F4EFE6]/80 file:mr-3 file:py-2 file:px-3 file:border-0 file:bg-[#292522] file:text-[#D5B982]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] tracking-[0.16em] uppercase text-[#D5B982] mb-1.5">
                        Short Description
                      </label>
                      <input
                        type="text"
                        value={videoDesc}
                        onChange={(e) => setVideoDesc(e.target.value)}
                        placeholder="Concept, role, or story behind this video..."
                        className="w-full bg-[#1C1A19] border border-[#292522] px-3.5 py-2.5 text-sm text-[#F4EFE6]"
                      />
                    </div>

                    {videoMode === 'upload' ? (
                      <div>
                        <label className="block text-[11px] tracking-[0.16em] uppercase text-[#D5B982] mb-1.5">
                          Video File (MP4, WebM, MOV — max 250MB)
                        </label>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                          className="block w-full text-xs text-[#F4EFE6]/80 file:mr-4 file:py-2.5 file:px-4 file:border-0 file:bg-[#292522] file:text-[#D5B982] hover:file:bg-[#D5B982] hover:file:text-[#171717] file:cursor-pointer"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] tracking-[0.16em] uppercase text-[#D5B982] mb-1.5">
                          {videoMode === 'youtube' ? 'YouTube URL' : 'Vimeo URL'}
                        </label>
                        <input
                          type="url"
                          value={videoUrlInput}
                          onChange={(e) => setVideoUrlInput(e.target.value)}
                          placeholder={
                            videoMode === 'youtube'
                              ? 'https://www.youtube.com/watch?v=...'
                              : 'https://vimeo.com/...'
                          }
                          className="w-full bg-[#1C1A19] border border-[#292522] px-3.5 py-2.5 text-sm text-[#F4EFE6]"
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={uploadingVideo}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#D5B982] text-[#171717] hover:bg-[#F4EFE6] text-xs font-semibold tracking-[0.18em] uppercase cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{uploadingVideo ? 'Uploading Video...' : 'Publish to More Creative Work'}</span>
                    </button>
                  </form>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {adminData.creativeVideos.map((vid) => (
                      <div
                        key={vid.id}
                        className="bg-[#171717] border border-[#292522] p-4 flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <p className="text-[10px] text-[#D5B982] uppercase">{vid.sourceType}</p>
                          <p className="font-display text-xl text-[#F4EFE6] truncate">
                            {vid.title}
                          </p>
                          {vid.description && (
                            <p className="text-xs text-[#888078] truncate">{vid.description}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteVideo(vid.id)}
                          aria-label="Delete video"
                          className="p-2 border border-[#292522] text-[#888078] hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: PROJECTS & COVERS */}
              {activeTab === 'projects' && adminData && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-2xl text-[#F4EFE6]">
                        Selected Projects &amp; Thumbnails
                      </h3>
                      <p className="text-xs text-[#888078]">
                        Replace studio preview covers with actual project thumbnails or add new
                        projects.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={openNewProject}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#D5B982] text-[#171717] text-xs font-semibold uppercase tracking-[0.14em] cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add Project
                    </button>
                  </div>

                  {(editingProject || newProjectOpen) && (
                    <form
                      onSubmit={handleSaveProject}
                      className="bg-[#171717] border border-[#D5B982]/50 p-6 space-y-4"
                    >
                      <h4 className="font-display text-2xl text-[#F4EFE6]">
                        {editingProject ? `Editing: ${editingProject.title}` : 'New Project'}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <select
                          value={projCategory}
                          onChange={(e) => setProjCategory(e.target.value as ProjectCategory)}
                          className="bg-[#1C1A19] border border-[#292522] px-3 py-2 text-sm text-[#F4EFE6]"
                        >
                          <option value="brand">Category A – Brand &amp; Business</option>
                          <option value="campaigns">Category B – Campaigns &amp; Events</option>
                          <option value="production">Category C – Creative Production</option>
                        </select>
                        <input
                          type="text"
                          required
                          value={projTitle}
                          onChange={(e) => setProjTitle(e.target.value)}
                          placeholder="Project Title"
                          className="bg-[#1C1A19] border border-[#292522] px-3 py-2 text-sm text-[#F4EFE6]"
                        />
                        <input
                          type="text"
                          required
                          value={projRole}
                          onChange={(e) => setProjRole(e.target.value)}
                          placeholder="Role"
                          className="bg-[#1C1A19] border border-[#292522] px-3 py-2 text-sm text-[#F4EFE6]"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={projDescription}
                        onChange={(e) => setProjDescription(e.target.value)}
                        placeholder="Project description"
                        className="w-full bg-[#1C1A19] border border-[#292522] px-3 py-2 text-sm text-[#F4EFE6]"
                      />
                      <div>
                        <label className="block text-[11px] tracking-[0.16em] uppercase text-[#D5B982] mb-1.5">
                          Upload Custom Thumbnail Image (from laptop)
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setProjThumbFile(e.target.files?.[0] || null)}
                          className="block w-full text-xs text-[#F4EFE6]/80 file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-[#292522] file:text-[#D5B982]"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] tracking-[0.16em] uppercase text-[#D5B982]">
                            Project Watch Links
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setProjLinks([
                                ...projLinks,
                                { label: `WATCH PROJECT ${projLinks.length + 1}`, url: '' },
                              ])
                            }
                            className="text-xs text-[#D5B982] hover:underline cursor-pointer"
                          >
                            + Add Link Button
                          </button>
                        </div>
                        {projLinks.map((lnk, idx) => (
                          <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                            <input
                              type="text"
                              value={lnk.label}
                              onChange={(e) => {
                                const copy = [...projLinks];
                                copy[idx] = { ...copy[idx], label: e.target.value };
                                setProjLinks(copy);
                              }}
                              placeholder="Button Label"
                              className="sm:col-span-4 bg-[#1C1A19] border border-[#292522] px-3 py-2 text-xs text-[#F4EFE6]"
                            />
                            <input
                              type="url"
                              value={lnk.url}
                              onChange={(e) => {
                                const copy = [...projLinks];
                                copy[idx] = { ...copy[idx], url: e.target.value };
                                setProjLinks(copy);
                              }}
                              placeholder="https://..."
                              className="sm:col-span-7 bg-[#1C1A19] border border-[#292522] px-3 py-2 text-xs text-[#F4EFE6]"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setProjLinks(projLinks.filter((_, i) => i !== idx))
                              }
                              className="sm:col-span-1 border border-[#292522] text-[#888078] hover:text-red-400 flex items-center justify-center cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-[#D5B982] text-[#171717] text-xs font-semibold uppercase tracking-[0.14em] cursor-pointer"
                        >
                          Save Project
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProject(null);
                            setNewProjectOpen(false);
                          }}
                          className="px-5 py-2.5 border border-[#888078] text-xs text-[#F4EFE6] uppercase cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {adminData.projects.map((p) => (
                      <div
                        key={p.id}
                        className="bg-[#171717] border border-[#292522] p-4 flex items-center gap-4"
                      >
                        <img
                          src={p.thumbnailUrl}
                          alt={p.title}
                          className="w-24 h-16 object-cover shrink-0 border border-[#292522]"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-[#D5B982] uppercase truncate">{p.role}</p>
                          <p className="font-display text-xl text-[#F4EFE6] truncate">{p.title}</p>
                          <p className="text-[11px] text-[#888078]">
                            {p.links.length} link(s) ·{' '}
                            {p.isCustomThumbnail ? 'Custom Cover' : 'Studio Preview'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditProject(p)}
                            className="px-3 py-1.5 border border-[#292522] text-xs text-[#F4EFE6] hover:border-[#D5B982] cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProject(p.id)}
                            aria-label="Delete project"
                            className="p-1.5 border border-[#292522] text-[#888078] hover:text-red-400 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: TESTIMONIALS */}
              {activeTab === 'testimonials' && adminData && (
                <div className="space-y-8">
                  <form
                    onSubmit={handleAddTestimonial}
                    className="bg-[#171717] border border-[#292522] p-6 space-y-4"
                  >
                    <h3 className="font-display text-2xl text-[#F4EFE6]">
                      Add Genuine Client Testimonial
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        required
                        value={testClientName}
                        onChange={(e) => setTestClientName(e.target.value)}
                        placeholder="Client Name"
                        className="bg-[#1C1A19] border border-[#292522] px-3.5 py-2.5 text-sm text-[#F4EFE6]"
                      />
                      <input
                        type="text"
                        value={testRole}
                        onChange={(e) => setTestRole(e.target.value)}
                        placeholder="Company / Role (e.g. Brand Manager)"
                        className="bg-[#1C1A19] border border-[#292522] px-3.5 py-2.5 text-sm text-[#F4EFE6]"
                      />
                      <input
                        type="text"
                        value={testProjectType}
                        onChange={(e) => setTestProjectType(e.target.value)}
                        placeholder="Project Type (e.g. Promotional Reel)"
                        className="bg-[#1C1A19] border border-[#292522] px-3.5 py-2.5 text-sm text-[#F4EFE6]"
                      />
                    </div>
                    <textarea
                      rows={3}
                      required
                      value={testQuote}
                      onChange={(e) => setTestQuote(e.target.value)}
                      placeholder="Client's actual review or feedback..."
                      className="w-full bg-[#1C1A19] border border-[#292522] px-3.5 py-2.5 text-sm text-[#F4EFE6]"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#D5B982] text-[#171717] text-xs font-semibold uppercase tracking-[0.16em] cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add Testimonial
                    </button>
                  </form>

                  <div className="space-y-3">
                    {adminData.testimonials.length === 0 ? (
                      <p className="text-xs text-[#888078]">
                        No testimonials added yet. The website currently displays: &ldquo;Client
                        experiences will be featured here soon.&rdquo;
                      </p>
                    ) : (
                      adminData.testimonials.map((t: TestimonialItem) => (
                        <div
                          key={t.id}
                          className="bg-[#171717] border border-[#292522] p-5 flex items-start justify-between gap-4"
                        >
                          <div>
                            <p className="text-sm text-[#F4EFE6] italic">&ldquo;{t.quote}&rdquo;</p>
                            <p className="mt-2 text-xs text-[#D5B982] uppercase">
                              {t.clientName} {t.roleOrCompany ? `· ${t.roleOrCompany}` : ''}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteTestimonial(t.id)}
                            aria-label="Delete testimonial"
                            className="p-2 border border-[#292522] text-[#888078] hover:text-red-400 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: SETTINGS & EMAIL */}
              {activeTab === 'settings' && adminData && settingsDraft && (
                <div className="space-y-8">
                  {/* Email Notification Status Card */}
                  <div className="bg-[#171717] border border-[#292522] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] tracking-[0.2em] text-[#D5B982] uppercase">
                        EMAIL NOTIFICATIONS TO {settingsDraft.email}
                      </p>
                      <h4 className="mt-1 font-display text-2xl text-[#F4EFE6]">
                        {adminData.smtpConfigured
                          ? 'SMTP Email Delivery Active'
                          : 'Dashboard Active · Optional SMTP Not Configured Yet'}
                      </h4>
                      <p className="mt-1 text-xs text-[#888078] max-w-2xl">
                        {adminData.smtpConfigured
                          ? 'Every new inquiry is saved here and forwarded automatically to sfcreations26@gmail.com.'
                          : 'Inquiries are always saved inside this dashboard. To also receive automatic emails at sfcreations26@gmail.com, set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS (Gmail App Password) in your server environment variables.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleTestEmail}
                      className="px-5 py-3 border border-[#D5B982] text-[#D5B982] hover:bg-[#D5B982] hover:text-[#171717] text-xs uppercase tracking-[0.14em] whitespace-nowrap cursor-pointer"
                    >
                      Send Test Email
                    </button>
                  </div>

                  {/* Brand, Copy & Contact Editor */}
                  <form
                    onSubmit={handleSaveSettings}
                    className="bg-[#171717] border border-[#292522] p-6 space-y-5"
                  >
                    <h3 className="font-display text-2xl text-[#F4EFE6]">
                      Edit Website Text, Logo &amp; Contact Links
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] uppercase tracking-[0.14em] text-[#D5B982] mb-1">
                          Hero Supporting Text
                        </label>
                        <input
                          type="text"
                          value={settingsDraft.heroSupportingText}
                          onChange={(e) =>
                            setSettingsDraft({
                              ...settingsDraft,
                              heroSupportingText: e.target.value,
                            })
                          }
                          className="w-full bg-[#1C1A19] border border-[#292522] px-3 py-2 text-sm text-[#F4EFE6]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] uppercase tracking-[0.14em] text-[#D5B982] mb-1">
                          Replace Logo Image (Optional)
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                          className="block w-full text-xs text-[#F4EFE6]/80 file:mr-3 file:py-2 file:px-3 file:border-0 file:bg-[#292522] file:text-[#D5B982]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] uppercase tracking-[0.14em] text-[#D5B982] mb-1">
                          WhatsApp Display
                        </label>
                        <input
                          type="text"
                          value={settingsDraft.whatsappDisplay}
                          onChange={(e) =>
                            setSettingsDraft({
                              ...settingsDraft,
                              whatsappDisplay: e.target.value,
                            })
                          }
                          className="w-full bg-[#1C1A19] border border-[#292522] px-3 py-2 text-sm text-[#F4EFE6]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] uppercase tracking-[0.14em] text-[#D5B982] mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={settingsDraft.email}
                          onChange={(e) =>
                            setSettingsDraft({ ...settingsDraft, email: e.target.value })
                          }
                          className="w-full bg-[#1C1A19] border border-[#292522] px-3 py-2 text-sm text-[#F4EFE6]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] uppercase tracking-[0.14em] text-[#D5B982] mb-1">
                          Personal Instagram Handle
                        </label>
                        <input
                          type="text"
                          value={settingsDraft.instagramHandle}
                          onChange={(e) =>
                            setSettingsDraft({
                              ...settingsDraft,
                              instagramHandle: e.target.value,
                            })
                          }
                          className="w-full bg-[#1C1A19] border border-[#292522] px-3 py-2 text-sm text-[#F4EFE6]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] uppercase tracking-[0.14em] text-[#D5B982] mb-1">
                          SF Creations Instagram Handle
                        </label>
                        <input
                          type="text"
                          value={settingsDraft.sfInstagramHandle}
                          onChange={(e) =>
                            setSettingsDraft({
                              ...settingsDraft,
                              sfInstagramHandle: e.target.value,
                            })
                          }
                          className="w-full bg-[#1C1A19] border border-[#292522] px-3 py-2 text-sm text-[#F4EFE6]"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] uppercase tracking-[0.14em] text-[#D5B982] mb-1">
                          SF Creations Instagram Page URL
                        </label>
                        <input
                          type="url"
                          value={settingsDraft.sfInstagramUrl}
                          onChange={(e) =>
                            setSettingsDraft({
                              ...settingsDraft,
                              sfInstagramUrl: e.target.value,
                            })
                          }
                          placeholder="https://www.instagram.com/your_sf_creations_handle/"
                          className="w-full bg-[#1C1A19] border border-[#292522] px-3 py-2 text-sm text-[#F4EFE6]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.14em] text-[#D5B982] mb-1">
                        About Paragraphs (separated by blank line)
                      </label>
                      <textarea
                        rows={5}
                        value={settingsDraft.aboutParagraphs.join('\n\n')}
                        onChange={(e) =>
                          setSettingsDraft({
                            ...settingsDraft,
                            aboutParagraphs: e.target.value
                              .split(/\n\s*\n/)
                              .map((p) => p.trim())
                              .filter(Boolean),
                          })
                        }
                        className="w-full bg-[#1C1A19] border border-[#292522] px-3 py-2 text-sm text-[#F4EFE6]"
                      />
                    </div>

                    <div className="pt-2 border-t border-[#292522] space-y-3">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-[#D5B982]">
                        FAQ Entries ({faqDrafts.length})
                      </p>
                      {faqDrafts.map((faq, idx) => (
                        <div key={faq.id} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => {
                              const copy = [...faqDrafts];
                              copy[idx] = { ...copy[idx], question: e.target.value };
                              setFaqDrafts(copy);
                            }}
                            className="bg-[#1C1A19] border border-[#292522] px-3 py-2 text-xs text-[#F4EFE6]"
                          />
                          <input
                            type="text"
                            value={faq.answer}
                            onChange={(e) => {
                              const copy = [...faqDrafts];
                              copy[idx] = { ...copy[idx], answer: e.target.value };
                              setFaqDrafts(copy);
                            }}
                            className="bg-[#1C1A19] border border-[#292522] px-3 py-2 text-xs text-[#F4EFE6]"
                          />
                        </div>
                      ))}
                    </div>

                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#D5B982] text-[#171717] text-xs font-semibold uppercase tracking-[0.18em] cursor-pointer"
                    >
                      <Check className="w-4 h-4" /> Save All Settings
                    </button>
                  </form>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
