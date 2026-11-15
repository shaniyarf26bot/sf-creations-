import { useEffect, useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Mail, MessageCircle, Send } from 'lucide-react';
import { INQUIRY_SERVICE_OPTIONS, type ServiceOption, type SiteSettings } from '../types.ts';

interface InquirySectionProps {
  selectedService: ServiceOption | '';
  settings: SiteSettings;
}

export function InquirySection({ selectedService, settings }: InquirySectionProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [service, setService] = useState<string>(selectedService || '');
  const [preferredDate, setPreferredDate] = useState('');
  const [description, setDescription] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedRecord, setSubmittedRecord] = useState<{
    fullName: string;
    email: string;
    whatsapp: string;
    service: string;
    preferredDate: string;
    description: string;
    additionalInfo: string;
    savedToServer: boolean;
  } | null>(null);

  useEffect(() => {
    if (selectedService) {
      setService(selectedService);
      setSubmittedRecord(null);
    }
  }, [selectedService]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim() || !whatsapp.trim() || !service || !preferredDate || !description.trim()) {
      setError('Please complete all required fields before submitting your inquiry.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    const trimmedRecord = {
      fullName: fullName.trim(),
      email: email.trim(),
      whatsapp: whatsapp.trim(),
      service,
      preferredDate,
      description: description.trim(),
      additionalInfo: additionalInfo.trim(),
    };

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trimmedRecord),
      });

      if (response.status === 400) {
        const payload = (await response.json()) as { error?: string };
        setError(payload.error || 'Please check your details and try again.');
        return;
      }

      const savedToServer = response.ok;
      setSubmittedRecord({ ...trimmedRecord, savedToServer });
      setFullName('');
      setEmail('');
      setWhatsapp('');
      setPreferredDate('');
      setDescription('');
      setAdditionalInfo('');
    } catch {
      // Static-host fallback: proceed smoothly to direct WhatsApp / Email handoff
      setSubmittedRecord({ ...trimmedRecord, savedToServer: false });
      setFullName('');
      setEmail('');
      setWhatsapp('');
      setPreferredDate('');
      setDescription('');
      setAdditionalInfo('');
    } finally {
      setSubmitting(false);
    }
  };

  const inquirySummaryText = submittedRecord
    ? [
        'Hi Shaniya, I would like to submit a project inquiry for SF Creations.',
        `Name: ${submittedRecord.fullName}`,
        `Email: ${submittedRecord.email}`,
        `WhatsApp: ${submittedRecord.whatsapp}`,
        `Service: ${submittedRecord.service}`,
        `Preferred Date: ${submittedRecord.preferredDate}`,
        `Details: ${submittedRecord.description}`,
        submittedRecord.additionalInfo ? `Additional Info: ${submittedRecord.additionalInfo}` : '',
      ]
        .filter(Boolean)
        .join('\n')
    : '';

  const whatsappDirectLink = submittedRecord
    ? `${settings.whatsappUrl}?text=${encodeURIComponent(inquirySummaryText)}`
    : settings.whatsappUrl;

  const mailtoDirectLink = submittedRecord
    ? `mailto:${settings.email}?subject=${encodeURIComponent(
        `Project Inquiry: ${submittedRecord.service} — ${submittedRecord.fullName}`
      )}&body=${encodeURIComponent(inquirySummaryText)}`
    : `mailto:${settings.email}`;

  return (
    <section
      id="inquiry"
      className="relative bg-[#171717] py-24 sm:py-32 px-5 sm:px-8 border-t border-[#292522]"
    >
      <div className="max-w-[920px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto"
        >
          <p className="text-xs font-medium tracking-[0.26em] text-[#D5B982] uppercase">
            REQUEST A CUSTOM QUOTE
          </p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl font-semibold text-[#F4EFE6] tracking-wide uppercase">
            BOOKING &amp; PROJECT INQUIRY
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#F4EFE6]/80 leading-relaxed font-light">
            Have a project in mind? Tell me about your idea, and let&apos;s discuss how we can
            bring it to life.
          </p>
        </motion.div>

        <div className="mt-12 bg-[#1C1A19] border border-[#292522] p-6 sm:p-10 md:p-12">
          {submittedRecord ? (
            <div className="py-8 text-center max-w-xl mx-auto">
              <CheckCircle2 className="w-12 h-12 text-[#D5B982] mx-auto mb-5" strokeWidth={1.4} />
              <h3 className="font-display text-3xl text-[#F4EFE6]">
                {submittedRecord.savedToServer ? 'Inquiry Received' : 'Inquiry Ready to Send'}
              </h3>
              <p className="mt-4 text-sm sm:text-base text-[#F4EFE6]/85 leading-relaxed font-light">
                {submittedRecord.savedToServer
                  ? "Thank you for choosing SF Creations! Your inquiry has been successfully submitted. I'll review your request and contact you soon to discuss the project, availability and pricing."
                  : 'Thank you for choosing SF Creations! Tap WhatsApp or Email below to send your pre-filled inquiry directly to Shaniya so she can confirm availability and pricing.'}
              </p>
              <p className="mt-4 text-xs tracking-[0.14em] uppercase text-[#888078]">
                Status: Pending Personal Review · No automatic charges or confirmations
              </p>

              <div className="mt-8 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4">
                <a
                  href={whatsappDirectLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#D5B982] text-[#171717] hover:bg-[#F4EFE6] text-xs font-semibold tracking-[0.18em] uppercase transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send on WhatsApp</span>
                </a>
                <a
                  href={mailtoDirectLink}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-[#D5B982] text-[#D5B982] hover:bg-[#D5B982] hover:text-[#171717] text-xs font-semibold tracking-[0.18em] uppercase transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send via Email</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSubmittedRecord(null)}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 border border-[#D5B982]/50 text-[#F4EFE6] hover:border-[#D5B982] hover:text-[#D5B982] text-xs font-medium tracking-[0.18em] uppercase transition-colors cursor-pointer"
                >
                  Submit Another Inquiry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {error && (
                <div
                  role="alert"
                  className="p-4 border border-red-400/50 bg-red-950/30 text-red-200 text-xs sm:text-sm"
                >
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="inq-fullName"
                    className="block text-[11px] font-medium tracking-[0.18em] uppercase text-[#D5B982] mb-2"
                  >
                    Full Name <span className="text-[#F4EFE6]/60">*</span>
                  </label>
                  <input
                    id="inq-fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full bg-[#171717] border border-[#292522] focus:border-[#D5B982] px-4 py-3.5 text-sm text-[#F4EFE6] placeholder:text-[#888078]/70 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="inq-email"
                    className="block text-[11px] font-medium tracking-[0.18em] uppercase text-[#D5B982] mb-2"
                  >
                    Email Address <span className="text-[#F4EFE6]/60">*</span>
                  </label>
                  <input
                    id="inq-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#171717] border border-[#292522] focus:border-[#D5B982] px-4 py-3.5 text-sm text-[#F4EFE6] placeholder:text-[#888078]/70 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label
                    htmlFor="inq-whatsapp"
                    className="block text-[11px] font-medium tracking-[0.18em] uppercase text-[#D5B982] mb-2"
                  >
                    WhatsApp Number <span className="text-[#F4EFE6]/60">*</span>
                  </label>
                  <input
                    id="inq-whatsapp"
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="e.g. 072 3260085"
                    className="w-full bg-[#171717] border border-[#292522] focus:border-[#D5B982] px-4 py-3.5 text-sm text-[#F4EFE6] placeholder:text-[#888078]/70 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="inq-service"
                    className="block text-[11px] font-medium tracking-[0.18em] uppercase text-[#D5B982] mb-2"
                  >
                    Select a Service <span className="text-[#F4EFE6]/60">*</span>
                  </label>
                  <select
                    id="inq-service"
                    required
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full bg-[#171717] border border-[#292522] focus:border-[#D5B982] px-4 py-3.5 text-sm text-[#F4EFE6] focus:outline-none transition-colors"
                  >
                    <option value="" disabled>
                      Choose a service...
                    </option>
                    {INQUIRY_SERVICE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="inq-date"
                    className="block text-[11px] font-medium tracking-[0.18em] uppercase text-[#D5B982] mb-2"
                  >
                    Preferred Project Date <span className="text-[#F4EFE6]/60">*</span>
                  </label>
                  <input
                    id="inq-date"
                    type="date"
                    required
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full bg-[#171717] border border-[#292522] focus:border-[#D5B982] px-4 py-3.5 text-sm text-[#F4EFE6] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="inq-description"
                  className="block text-[11px] font-medium tracking-[0.18em] uppercase text-[#D5B982] mb-2"
                >
                  Project Description / Requirements <span className="text-[#F4EFE6]/60">*</span>
                </label>
                <textarea
                  id="inq-description"
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share your creative vision, shoot location, deliverables, or event details..."
                  className="w-full bg-[#171717] border border-[#292522] focus:border-[#D5B982] px-4 py-3.5 text-sm text-[#F4EFE6] placeholder:text-[#888078]/70 focus:outline-none transition-colors resize-y"
                />
              </div>

              <div>
                <label
                  htmlFor="inq-additional"
                  className="block text-[11px] font-medium tracking-[0.18em] uppercase text-[#D5B982] mb-2"
                >
                  Additional Information <span className="text-[#888078]">(Optional)</span>
                </label>
                <textarea
                  id="inq-additional"
                  rows={2}
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="Links to reference reels, brand guidelines, or special notes..."
                  className="w-full bg-[#171717] border border-[#292522] focus:border-[#D5B982] px-4 py-3.5 text-sm text-[#F4EFE6] placeholder:text-[#888078]/70 focus:outline-none transition-colors resize-y"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-xs text-[#888078] font-light">
                  Pricing is discussed directly based on your project requirements. All bookings
                  remain pending until personally confirmed.
                </p>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#D5B982] text-[#171717] hover:bg-[#F4EFE6] disabled:opacity-60 text-xs font-semibold tracking-[0.2em] uppercase transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'SUBMITTING...' : 'SUBMIT INQUIRY'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
