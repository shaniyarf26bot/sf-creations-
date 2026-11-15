import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import multer from 'multer';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'node:url';
import type { Request, Response, NextFunction } from 'express';
import { DEFAULT_STUDIO_DATA } from './src/data/defaultStudioData.ts';
import type {
  CreativeVideoItem,
  GraphicDesignCategory,
  GraphicDesignItem,
  InquiryItem,
  InquiryStatus,
  ProjectCategory,
  ProjectItem,
  StudioDatabase,
  TestimonialItem,
} from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'studio.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DESIGNS_DIR = path.join(UPLOADS_DIR, 'designs');
const VIDEOS_DIR = path.join(UPLOADS_DIR, 'videos');
const THUMBNAILS_DIR = path.join(UPLOADS_DIR, 'thumbnails');
const LOGO_DIR = path.join(UPLOADS_DIR, 'logo');

for (const dir of [DATA_DIR, UPLOADS_DIR, DESIGNS_DIR, VIDEOS_DIR, THUMBNAILS_DIR, LOGO_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
}

const STUDIO_PASSCODE = process.env.STUDIO_ADMIN_PASSCODE || 'shaniya1823';
const SESSION_SECRET =
  process.env.STUDIO_SESSION_SECRET ||
  crypto.createHash('sha256').update(`sf-creations:${STUDIO_PASSCODE}`).digest('hex');

function readDatabase(): StudioDatabase {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_STUDIO_DATA, null, 2), 'utf-8');
    return structuredClone(DEFAULT_STUDIO_DATA);
  }
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<StudioDatabase>;
    return {
      settings: { ...DEFAULT_STUDIO_DATA.settings, ...(parsed.settings || {}) },
      services: parsed.services ?? DEFAULT_STUDIO_DATA.services,
      projects: parsed.projects ?? DEFAULT_STUDIO_DATA.projects,
      graphicDesigns: parsed.graphicDesigns ?? [],
      creativeVideos: parsed.creativeVideos ?? [],
      packages: parsed.packages ?? DEFAULT_STUDIO_DATA.packages,
      testimonials: parsed.testimonials ?? [],
      faqs: parsed.faqs ?? DEFAULT_STUDIO_DATA.faqs,
      inquiries: parsed.inquiries ?? [],
    };
  } catch {
    return structuredClone(DEFAULT_STUDIO_DATA);
  }
}

function writeDatabase(db: StudioDatabase): void {
  const tempPath = `${DB_PATH}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(db, null, 2), 'utf-8');
  fs.renameSync(tempPath, DB_PATH);
}

function removeUploadedFileIfLocal(fileUrl: string | undefined): void {
  if (!fileUrl || !fileUrl.startsWith('/uploads/')) return;
  const safeRelative = fileUrl.replace(/^\/uploads\//, '');
  const fullPath = path.resolve(UPLOADS_DIR, safeRelative);
  if (fullPath.startsWith(UPLOADS_DIR) && fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
    } catch {
      // Ignore cleanup failures
    }
  }
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = decodeURIComponent(part.slice(idx + 1).trim());
    cookies[key] = val;
  }
  return cookies;
}

function createSessionToken(): string {
  const payload = `${Date.now()}:${crypto.randomBytes(16).toString('hex')}`;
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const lastDot = token.lastIndexOf('.');
  if (lastDot === -1) return false;
  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

function isAuthenticated(req: Request): boolean {
  const cookies = parseCookies(req.headers.cookie);
  if (verifySessionToken(cookies['sf_studio_session'])) return true;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return verifySessionToken(authHeader.slice(7));
  }
  return false;
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!isAuthenticated(req)) {
    res.status(401).json({ error: 'Studio authentication required.' });
    return;
  }
  next();
}

function isSmtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

async function sendInquiryEmail(inquiry: InquiryItem): Promise<'sent' | 'smtp_not_configured' | 'failed'> {
  if (!isSmtpConfigured()) {
    return 'smtp_not_configured';
  }
  try {
    const port = Number(process.env.SMTP_PORT || 465);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    const recipient = process.env.INQUIRY_RECIPIENT_EMAIL || 'sfcreations26@gmail.com';
    const fromAddress = process.env.SMTP_FROM || `SF Creations Website <${process.env.SMTP_USER}>`;

    await transporter.sendMail({
      from: fromAddress,
      to: recipient,
      replyTo: inquiry.email,
      subject: `New Project Inquiry: ${inquiry.service} — ${inquiry.fullName}`,
      text: [
        `New Booking & Project Inquiry for SF Creations`,
        ``,
        `Status: PENDING REVIEW`,
        `Full Name: ${inquiry.fullName}`,
        `Email: ${inquiry.email}`,
        `WhatsApp Number: ${inquiry.whatsapp}`,
        `Service Requested: ${inquiry.service}`,
        `Preferred Project Date: ${inquiry.preferredDate}`,
        ``,
        `Project Description / Requirements:`,
        `${inquiry.description}`,
        ``,
        inquiry.additionalInfo ? `Additional Information:\n${inquiry.additionalInfo}\n` : '',
        `Submitted At: ${inquiry.createdAt}`,
      ].join('\n'),
    });
    return 'sent';
  } catch (err) {
    console.error('Failed to send inquiry email notification:', err);
    return 'failed';
  }
}

function sanitizeFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase().replace(/[^a-z0-9.]/g, '') || '.bin';
  const base = path
    .basename(originalName, path.extname(originalName))
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40);
  return `${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${base || 'media'}${ext}`;
}

const designUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, DESIGNS_DIR),
    filename: (_req, file, cb) => cb(null, sanitizeFilename(file.originalname)),
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for graphic designs.'));
    }
  },
});

const thumbnailUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, THUMBNAILS_DIR),
    filename: (_req, file, cb) => cb(null, sanitizeFilename(file.originalname)),
  }),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for thumbnails.'));
    }
  },
});

const logoUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, LOGO_DIR),
    filename: (_req, file, cb) => cb(null, sanitizeFilename(file.originalname)),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for the logo.'));
    }
  },
});

const videoAndThumbUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, file, cb) => {
      if (file.fieldname === 'thumbnail') {
        cb(null, THUMBNAILS_DIR);
      } else {
        cb(null, VIDEOS_DIR);
      }
    },
    filename: (_req, file, cb) => cb(null, sanitizeFilename(file.originalname)),
  }),
  limits: { fileSize: 250 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.fieldname === 'thumbnail') {
      if (file.mimetype.startsWith('image/')) cb(null, true);
      else cb(new Error('Thumbnail must be an image file.'));
      return;
    }
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files (MP4, WebM, MOV) are supported for direct upload.'));
    }
  },
});

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  // Ensure initial DB exists
  readDatabase();

  // Serve uploaded creative assets
  app.use('/uploads', express.static(UPLOADS_DIR));

  // Public Studio Data
  app.get('/api/studio', (_req, res) => {
    const db = readDatabase();
    res.json({
      settings: db.settings,
      services: db.services,
      projects: db.projects,
      graphicDesigns: db.graphicDesigns,
      creativeVideos: db.creativeVideos,
      packages: db.packages,
      testimonials: db.testimonials,
      faqs: db.faqs,
    });
  });

  // Public Booking & Project Inquiry Submission
  app.post('/api/inquiries', async (req, res) => {
    const body = req.body as Record<string, unknown>;
    const fullName = String(body.fullName || '').trim();
    const email = String(body.email || '').trim();
    const whatsapp = String(body.whatsapp || '').trim();
    const service = String(body.service || '').trim();
    const preferredDate = String(body.preferredDate || '').trim();
    const description = String(body.description || '').trim();
    const additionalInfo = String(body.additionalInfo || '').trim();

    if (!fullName || !email || !whatsapp || !service || !preferredDate || !description) {
      res.status(400).json({ error: 'Please complete all required inquiry fields.' });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }

    const inquiry: InquiryItem = {
      id: `inq-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      fullName,
      email,
      whatsapp,
      service,
      preferredDate,
      description,
      additionalInfo,
      status: 'pending',
      internalNotes: '',
      emailNotificationStatus: 'smtp_not_configured',
      createdAt: new Date().toISOString(),
    };

    const emailStatus = await sendInquiryEmail(inquiry);
    inquiry.emailNotificationStatus = emailStatus;

    const db = readDatabase();
    db.inquiries.unshift(inquiry);
    writeDatabase(db);

    res.status(201).json({
      success: true,
      inquiryId: inquiry.id,
      status: inquiry.status,
      emailNotificationStatus: emailStatus,
    });
  });

  // Studio Owner Authentication
  app.post('/api/admin/login', (req, res) => {
    const passcode = String((req.body as { passcode?: string })?.passcode || '');
    if (!passcode || passcode !== STUDIO_PASSCODE) {
      res.status(401).json({ error: 'Incorrect studio passcode.' });
      return;
    }
    const token = createSessionToken();
    const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
    const cookieAttrs = isHttps
      ? `Path=/; HttpOnly; SameSite=None; Secure; Max-Age=${60 * 60 * 24 * 7}`
      : `Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`;
    res.setHeader('Set-Cookie', `sf_studio_session=${encodeURIComponent(token)}; ${cookieAttrs}`);
    res.json({ authenticated: true, token });
  });

  app.post('/api/admin/logout', (req, res) => {
    const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
    const cookieAttrs = isHttps
      ? 'Path=/; HttpOnly; SameSite=None; Secure; Max-Age=0'
      : 'Path=/; HttpOnly; SameSite=Lax; Max-Age=0';
    res.setHeader('Set-Cookie', `sf_studio_session=; ${cookieAttrs}`);
    res.json({ authenticated: false });
  });

  app.get('/api/admin/session', (req, res) => {
    res.json({ authenticated: isAuthenticated(req) });
  });

  // Admin: Full Data
  app.get('/api/admin/data', requireAdmin, (_req, res) => {
    const db = readDatabase();
    res.json({
      ...db,
      smtpConfigured: isSmtpConfigured(),
    });
  });

  // Admin: Upload Graphic Design(s)
  app.post('/api/admin/upload/design', requireAdmin, designUpload.array('images', 20), (req, res) => {
    const files = (req.files as Express.Multer.File[]) || [];
    if (files.length === 0) {
      res.status(400).json({ error: 'Please select at least one image file to upload.' });
      return;
    }

    const body = req.body as Record<string, string>;
    const category = (body.category || 'Social Media Designs') as GraphicDesignCategory;
    const baseTitle = (body.title || '').trim();
    const description = (body.description || '').trim();

    const db = readDatabase();
    const added: GraphicDesignItem[] = files.map((file, index) => {
      const cleanOrig = path.basename(file.originalname, path.extname(file.originalname)).replace(/[-_]+/g, ' ');
      const title =
        files.length === 1 && baseTitle
          ? baseTitle
          : baseTitle
            ? `${baseTitle} (${index + 1})`
            : cleanOrig || 'Untitled Design';

      return {
        id: `des-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
        title,
        category,
        description,
        imageUrl: `/uploads/designs/${file.filename}`,
        createdAt: new Date().toISOString(),
      };
    });

    db.graphicDesigns.unshift(...added);
    writeDatabase(db);
    res.status(201).json({ added });
  });

  app.put('/api/admin/designs/:id', requireAdmin, designUpload.single('image'), (req, res) => {
    const db = readDatabase();
    const item = db.graphicDesigns.find((d) => d.id === req.params.id);
    if (!item) {
      res.status(404).json({ error: 'Design not found.' });
      return;
    }
    const body = req.body as Record<string, string>;
    if (body.title !== undefined) item.title = body.title.trim() || item.title;
    if (body.category !== undefined) item.category = body.category as GraphicDesignCategory;
    if (body.description !== undefined) item.description = body.description.trim();
    if (req.file) {
      removeUploadedFileIfLocal(item.imageUrl);
      item.imageUrl = `/uploads/designs/${req.file.filename}`;
    }
    writeDatabase(db);
    res.json({ item });
  });

  app.delete('/api/admin/designs/:id', requireAdmin, (req, res) => {
    const db = readDatabase();
    const idx = db.graphicDesigns.findIndex((d) => d.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Design not found.' });
      return;
    }
    const [removed] = db.graphicDesigns.splice(idx, 1);
    removeUploadedFileIfLocal(removed.imageUrl);
    writeDatabase(db);
    res.json({ success: true });
  });

  // Admin: Upload Creative Video or Add Embed
  app.post(
    '/api/admin/upload/video',
    requireAdmin,
    videoAndThumbUpload.fields([
      { name: 'video', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
    ]),
    (req, res) => {
      const files = req.files as Record<string, Express.Multer.File[]> | undefined;
      const videoFile = files?.video?.[0];
      const thumbFile = files?.thumbnail?.[0];
      const body = req.body as Record<string, string>;

      const title = (body.title || '').trim();
      const description = (body.description || '').trim();
      const sourceType = (body.sourceType || (videoFile ? 'upload' : 'youtube')) as
        | 'upload'
        | 'youtube'
        | 'vimeo';
      const embedUrl = (body.videoUrl || '').trim();

      if (sourceType === 'upload' && !videoFile) {
        res.status(400).json({ error: 'Please select a video file to upload.' });
        return;
      }
      if ((sourceType === 'youtube' || sourceType === 'vimeo') && !embedUrl) {
        res.status(400).json({ error: 'Please enter a valid YouTube or Vimeo link.' });
        return;
      }

      const db = readDatabase();
      const videoItem: CreativeVideoItem = {
        id: `vid-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
        title:
          title ||
          (videoFile
            ? path.basename(videoFile.originalname, path.extname(videoFile.originalname)).replace(/[-_]+/g, ' ')
            : 'Creative Video'),
        description,
        sourceType,
        videoUrl: videoFile ? `/uploads/videos/${videoFile.filename}` : embedUrl,
        thumbnailUrl: thumbFile ? `/uploads/thumbnails/${thumbFile.filename}` : undefined,
        createdAt: new Date().toISOString(),
      };

      db.creativeVideos.unshift(videoItem);
      writeDatabase(db);
      res.status(201).json({ item: videoItem });
    }
  );

  app.put(
    '/api/admin/videos/:id',
    requireAdmin,
    videoAndThumbUpload.fields([
      { name: 'video', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
    ]),
    (req, res) => {
      const db = readDatabase();
      const item = db.creativeVideos.find((v) => v.id === req.params.id);
      if (!item) {
        res.status(404).json({ error: 'Video not found.' });
        return;
      }
      const files = req.files as Record<string, Express.Multer.File[]> | undefined;
      const videoFile = files?.video?.[0];
      const thumbFile = files?.thumbnail?.[0];
      const body = req.body as Record<string, string>;

      if (body.title !== undefined) item.title = body.title.trim() || item.title;
      if (body.description !== undefined) item.description = body.description.trim();
      if (body.sourceType) item.sourceType = body.sourceType as 'upload' | 'youtube' | 'vimeo';
      if (body.videoUrl && item.sourceType !== 'upload') item.videoUrl = body.videoUrl.trim();
      if (videoFile) {
        removeUploadedFileIfLocal(item.videoUrl);
        item.sourceType = 'upload';
        item.videoUrl = `/uploads/videos/${videoFile.filename}`;
      }
      if (thumbFile) {
        removeUploadedFileIfLocal(item.thumbnailUrl);
        item.thumbnailUrl = `/uploads/thumbnails/${thumbFile.filename}`;
      }
      writeDatabase(db);
      res.json({ item });
    }
  );

  app.delete('/api/admin/videos/:id', requireAdmin, (req, res) => {
    const db = readDatabase();
    const idx = db.creativeVideos.findIndex((v) => v.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Video not found.' });
      return;
    }
    const [removed] = db.creativeVideos.splice(idx, 1);
    removeUploadedFileIfLocal(removed.videoUrl);
    removeUploadedFileIfLocal(removed.thumbnailUrl);
    writeDatabase(db);
    res.json({ success: true });
  });

  // Admin: Projects CRUD + Thumbnail Upload
  app.post('/api/admin/projects', requireAdmin, thumbnailUpload.single('thumbnail'), (req, res) => {
    const body = req.body as Record<string, string>;
    const db = readDatabase();
    let links = [];
    try {
      links = body.links ? JSON.parse(body.links) : [];
    } catch {
      links = [];
    }

    const newProject: ProjectItem = {
      id: `proj-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      category: (body.category || 'brand') as ProjectCategory,
      title: (body.title || 'New Project').trim(),
      role: (body.role || '').trim(),
      description: (body.description || '').trim(),
      thumbnailUrl: req.file
        ? `/uploads/thumbnails/${req.file.filename}`
        : '/src/assets/images/thumb_brand_luxury_1794776109137.jpg',
      isCustomThumbnail: Boolean(req.file),
      links,
    };
    db.projects.push(newProject);
    writeDatabase(db);
    res.status(201).json({ item: newProject });
  });

  app.put('/api/admin/projects/:id', requireAdmin, thumbnailUpload.single('thumbnail'), (req, res) => {
    const db = readDatabase();
    const item = db.projects.find((p) => p.id === req.params.id);
    if (!item) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }
    const body = req.body as Record<string, string>;
    if (body.category) item.category = body.category as ProjectCategory;
    if (body.title !== undefined) item.title = body.title.trim() || item.title;
    if (body.role !== undefined) item.role = body.role.trim();
    if (body.description !== undefined) item.description = body.description.trim();
    if (body.links !== undefined) {
      try {
        item.links = JSON.parse(body.links);
      } catch {
        // Ignore invalid JSON
      }
    }
    if (req.file) {
      if (item.isCustomThumbnail) {
        removeUploadedFileIfLocal(item.thumbnailUrl);
      }
      item.thumbnailUrl = `/uploads/thumbnails/${req.file.filename}`;
      item.isCustomThumbnail = true;
    }
    writeDatabase(db);
    res.json({ item });
  });

  app.delete('/api/admin/projects/:id', requireAdmin, (req, res) => {
    const db = readDatabase();
    const idx = db.projects.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }
    const [removed] = db.projects.splice(idx, 1);
    if (removed.isCustomThumbnail) {
      removeUploadedFileIfLocal(removed.thumbnailUrl);
    }
    writeDatabase(db);
    res.json({ success: true });
  });

  // Admin: Testimonials CRUD
  app.post('/api/admin/testimonials', requireAdmin, (req, res) => {
    const body = req.body as Partial<TestimonialItem>;
    if (!body.clientName?.trim() || !body.quote?.trim()) {
      res.status(400).json({ error: 'Client name and quote are required.' });
      return;
    }
    const db = readDatabase();
    const item: TestimonialItem = {
      id: `test-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      clientName: body.clientName.trim(),
      roleOrCompany: (body.roleOrCompany || '').trim(),
      quote: body.quote.trim(),
      projectType: (body.projectType || '').trim(),
      createdAt: new Date().toISOString(),
    };
    db.testimonials.unshift(item);
    writeDatabase(db);
    res.status(201).json({ item });
  });

  app.put('/api/admin/testimonials/:id', requireAdmin, (req, res) => {
    const db = readDatabase();
    const item = db.testimonials.find((t) => t.id === req.params.id);
    if (!item) {
      res.status(404).json({ error: 'Testimonial not found.' });
      return;
    }
    const body = req.body as Partial<TestimonialItem>;
    if (body.clientName !== undefined) item.clientName = body.clientName.trim();
    if (body.roleOrCompany !== undefined) item.roleOrCompany = body.roleOrCompany.trim();
    if (body.quote !== undefined) item.quote = body.quote.trim();
    if (body.projectType !== undefined) item.projectType = body.projectType.trim();
    writeDatabase(db);
    res.json({ item });
  });

  app.delete('/api/admin/testimonials/:id', requireAdmin, (req, res) => {
    const db = readDatabase();
    const idx = db.testimonials.findIndex((t) => t.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Testimonial not found.' });
      return;
    }
    db.testimonials.splice(idx, 1);
    writeDatabase(db);
    res.json({ success: true });
  });

  // Admin: Update Inquiries
  app.patch('/api/admin/inquiries/:id', requireAdmin, (req, res) => {
    const db = readDatabase();
    const item = db.inquiries.find((i) => i.id === req.params.id);
    if (!item) {
      res.status(404).json({ error: 'Inquiry not found.' });
      return;
    }
    const body = req.body as { status?: InquiryStatus; internalNotes?: string };
    if (body.status) item.status = body.status;
    if (body.internalNotes !== undefined) item.internalNotes = body.internalNotes;
    writeDatabase(db);
    res.json({ item });
  });

  app.delete('/api/admin/inquiries/:id', requireAdmin, (req, res) => {
    const db = readDatabase();
    const idx = db.inquiries.findIndex((i) => i.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Inquiry not found.' });
      return;
    }
    db.inquiries.splice(idx, 1);
    writeDatabase(db);
    res.json({ success: true });
  });

  // Admin: Update Site Settings, Services, Packages, FAQs
  app.put('/api/admin/settings', requireAdmin, (req, res) => {
    const db = readDatabase();
    db.settings = { ...db.settings, ...(req.body as Partial<StudioDatabase['settings']>) };
    writeDatabase(db);
    res.json({ settings: db.settings });
  });

  app.post('/api/admin/upload/logo', requireAdmin, logoUpload.single('logo'), (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: 'Please choose a logo image file.' });
      return;
    }
    const db = readDatabase();
    removeUploadedFileIfLocal(db.settings.logoUrl);
    db.settings.logoUrl = `/uploads/logo/${req.file.filename}`;
    writeDatabase(db);
    res.json({ logoUrl: db.settings.logoUrl });
  });

  app.put('/api/admin/services', requireAdmin, (req, res) => {
    const db = readDatabase();
    if (Array.isArray(req.body)) {
      db.services = req.body;
      writeDatabase(db);
    }
    res.json({ services: db.services });
  });

  app.put('/api/admin/packages', requireAdmin, (req, res) => {
    const db = readDatabase();
    if (Array.isArray(req.body)) {
      db.packages = req.body;
      writeDatabase(db);
    }
    res.json({ packages: db.packages });
  });

  app.put('/api/admin/faqs', requireAdmin, (req, res) => {
    const db = readDatabase();
    if (Array.isArray(req.body)) {
      db.faqs = req.body;
      writeDatabase(db);
    }
    res.json({ faqs: db.faqs });
  });

  // Admin: Test Email Notification
  app.post('/api/admin/test-email', requireAdmin, async (_req, res) => {
    if (!isSmtpConfigured()) {
      res.status(400).json({
        error:
          'SMTP is not configured yet. Add SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS to your environment variables.',
      });
      return;
    }
    const status = await sendInquiryEmail({
      id: 'test-email',
      fullName: 'SF Creations Studio Test',
      email: 'sfcreations26@gmail.com',
      whatsapp: '072 3260085',
      service: 'System Notification Check',
      preferredDate: new Date().toISOString().slice(0, 10),
      description: 'This is a test notification verifying that booking inquiries reach sfcreations26@gmail.com.',
      status: 'pending',
      internalNotes: '',
      emailNotificationStatus: 'smtp_not_configured',
      createdAt: new Date().toISOString(),
    });
    if (status === 'sent') {
      res.json({ success: true, message: 'Test email delivered to sfcreations26@gmail.com.' });
    } else {
      res.status(500).json({ error: 'SMTP connection failed. Check your SMTP credentials and app password.' });
    }
  });

  // Multer / API error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    res.status(400).json({ error: err.message || 'Upload or request error.' });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SF Creations Studio running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
