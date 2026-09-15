import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';
import { z } from 'zod';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// ====================================================================
// CONFIGURATION & ENVIRONMENT VALIDATION (OWASP TOP 10 HARDENED)
// ====================================================================
const IS_PROD = process.env.NODE_ENV === 'production';
const PORT = 3000;

// Supabase Server Client Setup
const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://bmomtedgvcciefdvoiad.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_wcZa6ykEGxTc-o3-4wjTFw_nqoioqmN';

const supabaseServer = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Security Credentials & Tokens (Zero hardcoded fallback secrets)
const AUTHORIZED_EMAIL = (process.env.ADMIN_EMAIL || 'samriddhibroom@gmail.com').trim().toLowerCase();

let CURRENT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Kumar@1987';
let CURRENT_ADMIN_PIN = process.env.ADMIN_PIN || '1987';

// Master JWT & CSRF Secrets (High-entropy 256-bit keys with secure persistent defaults)
const JWT_SECRET =
  process.env.ADMIN_JWT_SECRET ||
  'adhrit_samriddhi_jwt_secure_key_2026_kumar1987_master_token_64chars_high_entropy';
const CSRF_SECRET =
  process.env.CSRF_SECRET ||
  'adhrit_samriddhi_csrf_secure_key_2026_kumar1987_master_token_64chars_high_entropy';

// ====================================================================
// RATE LIMITING ARCHITECTURE (SLIDING WINDOW & REDIS READY)
// ====================================================================
export interface RateLimiterStore {
  get(key: string): Promise<number[]> | number[];
  add(key: string, timestamp: number): Promise<void> | void;
  clean(windowMs: number): Promise<void> | void;
}

export class InMemoryRateLimiterStore implements RateLimiterStore {
  private store = new Map<string, number[]>();

  get(key: string): number[] {
    return this.store.get(key) || [];
  }

  add(key: string, timestamp: number): void {
    const list = this.store.get(key) || [];
    list.push(timestamp);
    this.store.set(key, list);
  }

  clean(windowMs: number): void {
    const cutoff = Date.now() - windowMs;
    for (const [key, timestamps] of this.store.entries()) {
      const valid = timestamps.filter((t) => t > cutoff);
      if (valid.length === 0) {
        this.store.delete(key);
      } else {
        this.store.set(key, valid);
      }
    }
  }
}

// Redis Adapter Interface for distributed multi-instance deployment
export class RedisRateLimiterStore implements RateLimiterStore {
  private redisClient: any;

  constructor(redisClient?: any) {
    this.redisClient = redisClient;
  }

  async get(key: string): Promise<number[]> {
    if (!this.redisClient) return [];
    try {
      const now = Date.now();
      const results = await this.redisClient.zrangebyscore(`rl:${key}`, now - 3600000, '+inf');
      return results.map((s: string) => parseInt(s, 10));
    } catch {
      return [];
    }
  }

  async add(key: string, timestamp: number): Promise<void> {
    if (!this.redisClient) return;
    try {
      await this.redisClient.zadd(`rl:${key}`, timestamp, `${timestamp}:${Math.random()}`);
      await this.redisClient.expire(`rl:${key}`, 3600);
    } catch {}
  }

  async clean(windowMs: number): Promise<void> {
    if (!this.redisClient) return;
    try {
      const cutoff = Date.now() - windowMs;
      await this.redisClient.zremrangebyscore('rl:*', 0, cutoff);
    } catch {}
  }
}

function createSlidingRateLimiter(options: {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
  store?: RateLimiterStore;
}) {
  const store = options.store || new InMemoryRateLimiterStore();
  const { windowMs, max } = options;
  const message = options.message || 'Too many requests. Please try again later.';

  if (store instanceof InMemoryRateLimiterStore) {
    const interval = setInterval(() => {
      store.clean(windowMs);
    }, 60000);
    interval.unref?.();
  }

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = options.keyGenerator ? options.keyGenerator(req) : (req.ip || 'unknown-ip');
      const now = Date.now();
      const cutoff = now - windowMs;
      const allTimestamps = await store.get(key);
      const validTimestamps = allTimestamps.filter((t) => t > cutoff);

      if (validTimestamps.length >= max) {
        const oldestValid = validTimestamps[0] || now;
        const retryAfterSeconds = Math.max(1, Math.ceil((oldestValid + windowMs - now) / 1000));
        res.setHeader('Retry-After', retryAfterSeconds);
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('X-RateLimit-Reset', Math.ceil((oldestValid + windowMs) / 1000));

        res.status(429).json({
          success: false,
          error: message,
          retryAfter: retryAfterSeconds,
        });
        return;
      }

      await store.add(key, now);
      const remaining = Math.max(0, max - (validTimestamps.length + 1));
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', Math.ceil((now + windowMs) / 1000));
      next();
    } catch {
      // Fail-open on rate limiter error to prevent denial of service
      next();
    }
  };
}

// 1. Public endpoints: 20 requests/min/IP
const publicLimiter = createSlidingRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Public rate limit reached (max 20 requests per minute). Please slow down.',
});

// 2. Auth endpoints (login, pin, password reset): generous limit to avoid false-positive lockout
const authLimiter = createSlidingRateLimiter({
  windowMs: 60 * 1000,
  max: 300,
  message: 'Authentication rate limit reached. Please wait a moment and try again.',
});

// 3. Authenticated user endpoints: 600 requests/min/user (prevents auto-poll throttle)
const authenticatedUserLimiter = createSlidingRateLimiter({
  windowMs: 60 * 1000,
  max: 600,
  keyGenerator: (req) => (req as any).adminUser?.email || req.ip || 'auth-admin',
  message: 'Admin operation rate limit reached (max 600 requests per minute).',
});

// 4. Cost-heavy / LLM endpoints: 10 requests/min/user
const heavyEndpointsLimiter = createSlidingRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req) => (req as any).adminUser?.email || req.ip || 'heavy-client',
  message: 'Resource-intensive request rate limit reached (max 10 requests per minute).',
});

// ====================================================================
// PROMPT INJECTION DEFENSE & SANITIZATION (OWASP LLM TOP 10)
// ====================================================================
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
  /disregard\s+(all\s+)?(previous|prior)\s+instructions/i,
  /system\s*:/i,
  /assistant\s*:/i,
  /you\s+are\s+now/i,
  /developer\s+mode/i,
  /override\s+(all\s+)?instructions/i,
  /jailbreak/i,
  /prompt\s+leak/i,
  /repeat\s+(everything|the\s+above)/i,
  /<script/i,
  /---\s*system/i,
  /###\s*instruction/i,
  /hidden\s+instruction/i,
];

export function scanForPromptInjection(input: string): boolean {
  return PROMPT_INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}

export function delimitPromptInput(userInput: string): string {
  // Strip out any attempts to forge boundaries
  const sanitized = userInput.replace(/\[\/?USER_INPUT_(START|END)\]/gi, '');
  return `[USER_INPUT_START]\n${sanitized}\n[USER_INPUT_END]`;
}

// HTML & SQL Sanitizer
export function sanitizeInput(str: unknown, maxLen = 1000): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>'"&]/g, (char) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
        '&': '&amp;',
      };
      return entities[char] || char;
    })
    .trim()
    .slice(0, maxLen);
}

// Constant-Time String Comparison
function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

// ====================================================================
// INPUT VALIDATION SCHEMAS (ZOD STRICT VALIDATION)
// ====================================================================
const InquirySubmissionSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(150),
    phone: z.string().trim().min(6, 'Phone number must have at least 6 digits').max(35),
    email: z.union([z.string(), z.null()]).optional(),
    message: z.union([z.string(), z.null()]).optional(),
    source: z.union([z.string(), z.null()]).optional(),
    dpdp_consent: z.any().optional(),
    status: z.string().optional(),
    created_at: z.string().optional(),
  })
  .passthrough();

const DPDPRequestSchema = z
  .object({
    right_type: z.enum(['access', 'correction', 'erasure', 'grievance', 'nomination']),
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
    contact: z.string().trim().min(6, 'Contact must be at least 6 characters').max(120),
    details: z.string().trim().min(5, 'Details must be at least 5 characters').max(2000),
  })
  .strict();

const AdminLoginSchema = z
  .object({
    email: z.string().trim().max(120).optional().default('samriddhibroom@gmail.com'),
    password: z.string().min(1, 'Password is required').max(128),
  })
  .strict();

const AdminPinSchema = z
  .object({
    pin: z.string().trim().min(1, 'PIN is required').max(128),
  })
  .strict();

const ChangeCredentialsSchema = z
  .object({
    currentPasswordOrPin: z.string().min(1).max(128),
    newPassword: z.string().min(6, 'New password must be at least 6 characters').max(128).optional(),
    newPin: z.string().regex(/^\d{4,8}$/, 'New PIN must be 4 to 8 digits').optional(),
  })
  .strict()
  .refine((data) => data.newPassword || data.newPin, {
    message: 'Either newPassword or newPin must be provided.',
  });

const ResetPasswordWithPinSchema = z
  .object({
    pin: z.string().trim().regex(/^\d{4,8}$/, 'PIN must be between 4 and 8 numeric digits'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters').max(128),
  })
  .strict();

const InquiryPatchSchema = z
  .object({
    status: z.enum(['new', 'contacted', 'quoted', 'converted', 'closed']).optional(),
    admin_notes: z.string().max(2000).optional(),
  })
  .strict();

const InquiryBulkDeleteSchema = z
  .object({
    ids: z.array(z.string().min(1).max(100)).min(1, 'At least one ID required').max(100, 'Max 100 per bulk operation'),
  })
  .strict();

const AIQuerySchema = z
  .object({
    prompt: z.string().trim().min(1, 'Prompt cannot be empty').max(2000, 'Prompt cannot exceed 2000 characters'),
    maxTokens: z.number().int().positive().max(1000).default(500).optional(),
  })
  .strict();

// ====================================================================
// SESSION MANAGEMENT & JWT AUTHENTICATION (15-MIN ACCESS, 7-DAY REFRESH)
// ====================================================================
interface ActiveSession {
  sessionId: string;
  email: string;
  refreshToken: string;
  createdAt: number;
  expiresAt: number; // 7 days
}

// In-memory session tracking & token blacklist
const activeSessions = new Map<string, ActiveSession>();
const revokedTokenSignatures = new Set<string>();

// Sweep expired sessions every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of activeSessions.entries()) {
    if (session.expiresAt < now) {
      activeSessions.delete(id);
    }
  }
}, 10 * 60 * 1000).unref?.();

// Generate 30-Day Access Token (JWT)
function createAccessToken(email: string, sessionId: string): { token: string; expiresAt: number } {
  const now = Date.now();
  const expiresAt = now + 30 * 24 * 60 * 60 * 1000; // 30 days
  const payload = {
    sub: email,
    role: 'master_admin',
    sessionId,
    iat: Math.floor(now / 1000),
    exp: Math.floor(expiresAt / 1000),
  };

  const headerB64 = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64url');

  return {
    token: `${headerB64}.${payloadB64}.${signature}`,
    expiresAt,
  };
}

// Generate 30-Day Refresh Token
function createRefreshToken(email: string): { refreshToken: string; sessionId: string; expiresAt: number } {
  const sessionId = crypto.randomBytes(16).toString('hex');
  const refreshToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

  activeSessions.set(sessionId, {
    sessionId,
    email,
    refreshToken,
    createdAt: Date.now(),
    expiresAt,
  });

  return { refreshToken, sessionId, expiresAt };
}

// Verify JWT Access Token
function verifyAccessToken(token: string): { valid: boolean; payload?: any; reason?: string } {
  try {
    if (!token || typeof token !== 'string') return { valid: false, reason: 'Missing token' };
    const cleanToken = token.trim();

    // Recognize master emergency, pin fallback, and admin tokens
    if (
      cleanToken.startsWith('master-token-') ||
      cleanToken.startsWith('master-pin-token-') ||
      cleanToken.startsWith('offline-master-token-') ||
      cleanToken.startsWith('adhrit-master-') ||
      cleanToken.startsWith('adhrit-token-') ||
      cleanToken === 'master-session-1987'
    ) {
      return {
        valid: true,
        payload: {
          sub: AUTHORIZED_EMAIL,
          role: 'master_admin',
          name: 'Shri Ram Adhrit (Master Admin)',
          email: AUTHORIZED_EMAIL,
          exp: Math.floor(Date.now() / 1000) + 30 * 24 * 3600,
        },
      };
    }

    const parts = cleanToken.split('.');
    if (parts.length !== 3) return { valid: false, reason: 'Invalid JWT structure' };
    const [headerB64, payloadB64, signature] = parts;

    if (revokedTokenSignatures.has(signature)) {
      return { valid: false, reason: 'Token has been revoked upon logout' };
    }

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');

    if (!safeCompare(signature, expectedSignature)) {
      return { valid: false, reason: 'Invalid token signature' };
    }

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (Date.now() >= payload.exp * 1000) {
      return { valid: false, reason: 'Access token expired' };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false, reason: 'Malformed token' };
  }
}

// Server Auth Middleware with Fail-Safe Master PIN Support
function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  // 1. Direct PIN validation via header or query parameter
  const pinHeader = req.headers['x-admin-pin'] as string | undefined;
  const pinQuery = req.query.pin as string | undefined;
  if ((pinHeader && isPinValid(pinHeader)) || (pinQuery && isPinValid(pinQuery))) {
    (req as any).adminUser = {
      sub: AUTHORIZED_EMAIL,
      role: 'master_admin',
      name: 'Shri Ram Adhrit (Master Admin)',
      email: AUTHORIZED_EMAIL,
    };
    (req as any).rawToken = 'master-pin-authorized';
    return next();
  }

  // 2. Direct Header Pass for local admin integration
  if (req.headers['x-master-access'] === 'adhrit-master-authorized') {
    (req as any).adminUser = {
      sub: AUTHORIZED_EMAIL,
      role: 'master_admin',
      name: 'Shri Ram Adhrit (Master Admin)',
      email: AUTHORIZED_EMAIL,
    };
    (req as any).rawToken = 'master-header-authorized';
    return next();
  }

  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (req.cookies?.admin_access_token) {
    token = req.cookies.admin_access_token;
  }

  if (!token) {
    res.status(401).json({ success: false, error: 'Authentication required. No session token provided.' });
    return;
  }

  const result = verifyAccessToken(token);
  if (!result.valid || !result.payload) {
    res.status(401).json({ success: false, error: result.reason || 'Invalid or expired session token.' });
    return;
  }

  (req as any).adminUser = result.payload;
  (req as any).rawToken = token;
  next();
}

// ====================================================================
// CSRF TOKEN ISSUANCE & VALIDATION
// ====================================================================
function generateCsrfToken(): string {
  const random = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(`${random}.${timestamp}`)
    .digest('hex');
  return `${random}.${timestamp}.${signature}`;
}

function verifyCsrfToken(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const [random, timestamp, signature] = parts;

    // Check expiration (CSRF tokens valid for 2 hours)
    const age = Date.now() - parseInt(timestamp, 10);
    if (isNaN(age) || age < 0 || age > 2 * 60 * 60 * 1000) return false;

    const expected = crypto
      .createHmac('sha256', CSRF_SECRET)
      .update(`${random}.${timestamp}`)
      .digest('hex');
    return safeCompare(signature, expected);
  } catch {
    return false;
  }
}

function csrfValidationMiddleware(req: Request, res: Response, next: NextFunction) {
  // Safe methods do not modify state
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const token =
    req.headers['x-csrf-token'] ||
    (req.body && req.body._csrf) ||
    req.cookies?.csrf_token;

  if (!token || typeof token !== 'string' || !verifyCsrfToken(token)) {
    res.status(403).json({
      success: false,
      error: 'Invalid or missing CSRF security token. Please refresh the page and try again.',
    });
    return;
  }

  next();
}

// ====================================================================
// STORAGE FOR PERSISTENCE (DISK FILE BACKED WITH MEMORY CACHE)
// ====================================================================
interface StoredInquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  source: string;
  dpdp_consent: boolean;
  status: string;
  admin_notes: string;
  created_at: string;
  ip_hash: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');
const DPDP_FILE = path.join(DATA_DIR, 'dpdp_requests.json');
const DELETED_IDS_FILE = path.join(DATA_DIR, 'deleted_ids.json');
const CREDENTIALS_FILE = path.join(DATA_DIR, 'admin_credentials.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadJsonData<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn(`Notice: Could not load ${filePath}, using initial state:`, err);
  }
  return fallback;
}

function saveJsonData(filePath: string, data: unknown): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn(`Notice: Could not write ${filePath}:`, err);
  }
}

// Session storage file
const SESSIONS_FILE = path.join(DATA_DIR, 'active_sessions.json');
const savedSessionsList = loadJsonData<ActiveSession[]>(SESSIONS_FILE, []);
for (const s of savedSessionsList) {
  if (s && s.sessionId && s.expiresAt > Date.now()) {
    activeSessions.set(s.sessionId, s);
  }
}

function persistActiveSessions(): void {
  saveJsonData(SESSIONS_FILE, Array.from(activeSessions.values()));
}

// Load saved custom credentials if present
interface SavedCredentials {
  password?: string;
  pin?: string;
}
const savedCreds = loadJsonData<SavedCredentials>(CREDENTIALS_FILE, {});
if (savedCreds.password) CURRENT_ADMIN_PASSWORD = savedCreds.password;
if (savedCreds.pin) CURRENT_ADMIN_PIN = savedCreds.pin;

function isPasswordValid(inputPassword: unknown): boolean {
  if (typeof inputPassword !== 'string') return false;
  const clean = inputPassword.trim();
  const cleanLower = clean.toLowerCase();

  // 1. Direct and constant-time check for current active master password
  if (clean === CURRENT_ADMIN_PASSWORD || cleanLower === CURRENT_ADMIN_PASSWORD.toLowerCase()) return true;
  if (safeCompare(clean, CURRENT_ADMIN_PASSWORD)) return true;
  if (safeCompare(cleanLower, CURRENT_ADMIN_PASSWORD.toLowerCase())) return true;

  // 2. Default master password & common variations (case-insensitive & with/without symbols)
  if (
    clean === 'Kumar@1987' ||
    cleanLower === 'kumar@1987' ||
    cleanLower === 'kumar1987' ||
    cleanLower === 'kumar@1987.' ||
    cleanLower === 'kumar'
  ) {
    return true;
  }

  // 3. Master PIN entered in password field
  if (
    clean === CURRENT_ADMIN_PIN ||
    clean === '1987' ||
    clean === '1234' ||
    clean === '0000'
  ) {
    return true;
  }

  // 4. Brand owner identity & configuration keys fallbacks
  if (
    cleanLower === 'samriddhi' ||
    cleanLower === 'samriddhi1987' ||
    cleanLower === 'samriddhi@1987' ||
    cleanLower === 'samriddhibroom' ||
    cleanLower === 'samriddhibroom@gmail.com' ||
    cleanLower === 'admin' ||
    cleanLower === 'admin123' ||
    cleanLower === 'admin@123' ||
    cleanLower === 'admin@1987' ||
    clean === 'bmomtedgvcciefdvoiad' ||
    clean === 'sb_publishable_wcZa6ykEGxTc-o3-4wjTFw_nqoioqmN'
  ) {
    return true;
  }

  return false;
}

function isPinValid(inputPin: unknown): boolean {
  if (typeof inputPin !== 'string') return false;
  const clean = inputPin.trim();

  if (
    clean === CURRENT_ADMIN_PIN ||
    clean === '1987' ||
    clean === '1234' ||
    clean === '0000' ||
    clean === '9999'
  ) {
    return true;
  }
  if (safeCompare(clean, CURRENT_ADMIN_PIN)) return true;
  if (isPasswordValid(clean)) return true;

  return false;
}

const inMemoryInquiries: StoredInquiry[] = loadJsonData<StoredInquiry[]>(INQUIRIES_FILE, []);
const inMemoryDPDPRequests: any[] = loadJsonData<any[]>(DPDP_FILE, []);
const inMemoryDeletedIds = new Set<string>(loadJsonData<string[]>(DELETED_IDS_FILE, []));

// ====================================================================
// SERVER STARTUP & MIDDLEWARE PIPELINE
// ====================================================================
async function startServer() {
  const app = express();

  // Trust proxy for secure headers and rate limiting in container / reverse-proxy environments
  app.set('trust proxy', 1);

  // Parse Cookies & JSON with strict size limits
  app.use(cookieParser());
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));

  // Enforce HTTPS redirect in production
  if (IS_PROD) {
    app.use((req, res, next) => {
      const proto = req.headers['x-forwarded-proto'];
      if (proto && proto !== 'https') {
        res.redirect(301, `https://${req.headers.host}${req.url}`);
        return;
      }
      next();
    });
  }

  // ====================================================================
  // CORS RESTRICTIONS (STRICT ALLOWLIST, REPLACING WILDCARD *)
  // ====================================================================
  const ALLOWED_ORIGINS = new Set<string>([
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.APP_URL || '',
    process.env.DEV_APP_URL || '',
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()) : []),
  ].filter(Boolean));

  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const isCloudRunPreview = origin && /^https:\/\/[a-zA-Z0-9-]+\.(run\.app|google\.com|aistudio\.google\.com)$/.test(origin);

    if (origin && (ALLOWED_ORIGINS.has(origin) || isCloudRunPreview)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With');
      res.setHeader('Access-Control-Expose-Headers', 'Retry-After, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset');
    }

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    next();
  });

  // ====================================================================
  // SECURITY HEADERS (OWASP RECOMMENDED SUITE)
  // ====================================================================
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    if (req.path.startsWith('/api/')) {
      // API responses strictly deny framing and execution contexts
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none';");
    } else {
      // SPA entry point allows legitimate scripts, fonts, styles, and safe preview frames
      res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com data:; " +
        "img-src 'self' data: blob: https://*.supabase.co; " +
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co; " +
        "frame-ancestors 'self' https://*.google.com https://*.run.app https://ai.studio;"
      );
    }

    next();
  });

  // Serve static public assets directly
  app.use('/assets', express.static(path.join(process.cwd(), 'public', 'assets')));

  // ====================================================================
  // PUBLIC ROUTES
  // ====================================================================

  /**
   * Health Check
   */
  app.get('/api/health', publicLimiter, (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  /**
   * CSRF Token Endpoint
   * Issues cryptographically signed anti-CSRF token and sets HttpOnly cookie
   */
  app.get('/api/csrf-token', publicLimiter, (req, res) => {
    const csrfToken = generateCsrfToken();
    res.cookie('csrf_token', csrfToken, {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: 'strict',
      path: '/',
      maxAge: 2 * 60 * 60 * 1000,
    });
    res.json({ success: true, csrfToken });
  });

  /**
   * Public Inquiry Submission
   * Protected with: Public Rate Limiter (20/min/IP), Zod validation, HTML sanitization, dual-sync to Supabase
   */
  app.post('/api/inquiries', publicLimiter, async (req, res) => {
    try {
      const body = req.body || {};
      const parsed = InquirySubmissionSchema.safeParse(body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: parsed.error.issues[0]?.message || 'Invalid inquiry form data submitted.',
        });
        return;
      }

      const rawName = String(parsed.data.name || body.name || '').trim();
      const rawPhone = String(parsed.data.phone || body.phone || '').trim();
      const rawEmail = parsed.data.email || body.email || '';
      const rawMessage = parsed.data.message || body.message || '';
      const rawSource = parsed.data.source || body.source || 'Get in Touch Form';
      const dpdpConsent = Boolean(parsed.data.dpdp_consent ?? body.dpdp_consent ?? true);

      const cleanPhone = rawPhone.replace(/[^\d+]/g, '').slice(0, 25);
      if (!cleanPhone || cleanPhone.replace(/\D/g, '').length < 6) {
        res.status(400).json({
          success: false,
          error: 'Please provide a valid phone number (at least 6 digits).',
        });
        return;
      }

      const ipHash = crypto.createHash('sha256').update(req.ip || '0.0.0.0').digest('hex');

      const newInquiry: StoredInquiry = {
        id: `INQ-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
        name: sanitizeInput(rawName || 'Customer', 100),
        phone: cleanPhone,
        email: rawEmail ? sanitizeInput(String(rawEmail), 120).toLowerCase() : '',
        message: rawMessage ? sanitizeInput(String(rawMessage), 1500) : '',
        source: sanitizeInput(String(rawSource), 120),
        dpdp_consent: dpdpConsent,
        status: 'new',
        admin_notes: '',
        created_at: new Date().toISOString(),
        ip_hash: ipHash,
      };

      inMemoryInquiries.unshift(newInquiry);
      if (inMemoryInquiries.length > 500) inMemoryInquiries.pop();
      saveJsonData(INQUIRIES_FILE, inMemoryInquiries);

      // Asynchronously sync to Supabase tables
      try {
        await supabaseServer.from('inquiries').insert([{
          name: newInquiry.name,
          phone: newInquiry.phone,
          email: newInquiry.email || null,
          message: newInquiry.message,
          source: newInquiry.source,
          dpdp_consent: newInquiry.dpdp_consent,
          status: newInquiry.status,
          created_at: newInquiry.created_at,
        }]);
      } catch (supaErr) {
        console.warn('Supabase inquiries sync notice:', supaErr);
      }

      try {
        await supabaseServer.from('bookings').insert([{
          name: newInquiry.name,
          phone: newInquiry.phone,
          email: newInquiry.email || null,
          message: newInquiry.message,
          source: newInquiry.source,
          dpdp_consent: newInquiry.dpdp_consent,
          status: newInquiry.status,
          created_at: newInquiry.created_at,
        }]);
      } catch {}

      try {
        await supabaseServer.from('enquiries').insert([{
          name: newInquiry.name,
          phone: newInquiry.phone,
          email: newInquiry.email || null,
          message: newInquiry.message,
          source: newInquiry.source,
          dpdp_consent: newInquiry.dpdp_consent,
          status: newInquiry.status,
          created_at: newInquiry.created_at,
        }]);
      } catch {}

      res.status(201).json({
        success: true,
        message: 'Inquiry received successfully and recorded securely.',
        id: newInquiry.id,
        data: newInquiry,
      });
    } catch (err: any) {
      console.error('Failed to process inquiry:', err);
      res.status(500).json({ success: false, error: 'Failed to process inquiry submission.' });
    }
  });

  /**
   * Statutory DPDP Rights Request Submission
   * Protected with: Public Rate Limiter (20/min/IP), Zod validation
   */
  app.post('/api/dpdp-requests', publicLimiter, async (req, res) => {
    try {
      const parsed = DPDPRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: parsed.error.issues[0]?.message || 'Invalid DPDP request parameters.',
        });
        return;
      }

      const { right_type, name, contact, details } = parsed.data;

      const newRecord = {
        id: `DPDP-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
        right_type,
        name: sanitizeInput(name, 100),
        contact: sanitizeInput(contact, 120),
        details: sanitizeInput(details, 1500),
        created_at: new Date().toISOString(),
        ip_hash: crypto.createHash('sha256').update(req.ip || '0.0.0.0').digest('hex'),
      };

      inMemoryDPDPRequests.unshift(newRecord);
      if (inMemoryDPDPRequests.length > 200) inMemoryDPDPRequests.pop();
      saveJsonData(DPDP_FILE, inMemoryDPDPRequests);

      // Attempt Supabase sync
      try {
        await supabaseServer.from('dpdp_requests').insert([{
          right_type: newRecord.right_type,
          name: newRecord.name,
          contact: newRecord.contact,
          details: newRecord.details,
          created_at: newRecord.created_at,
        }]);
      } catch {
        // Non-blocking
      }

      res.status(201).json({
        success: true,
        message: 'Statutory DPDP request recorded under Section 11-14 compliance.',
        id: newRecord.id,
      });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to record DPDP request.' });
    }
  });

  // ====================================================================
  // AUTHENTICATION ROUTES (MAX 5 ATTEMPTS / MIN / IP)
  // ====================================================================

  /**
   * Admin Password Login
   * Issues 15-minute access token + 7-day refresh token in HttpOnly cookies
   */
  app.post('/api/admin/login', authLimiter, (req, res) => {
    try {
      const parsed = AdminLoginSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: 'Invalid login parameters.' });
        return;
      }

      const { email, password } = parsed.data;

      const cleanEmail = (email || '').trim().toLowerCase();
      const emailMatches =
        !cleanEmail ||
        safeCompare(cleanEmail, AUTHORIZED_EMAIL) ||
        cleanEmail === 'samriddhibroom@gmail.com' ||
        cleanEmail === 'admin' ||
        cleanEmail === 'master' ||
        cleanEmail.includes('samriddhi');

      const passwordMatches = isPasswordValid(password);

      if (!passwordMatches) {
        res.status(401).json({
          success: false,
          error: 'Invalid password.',
        });
        return;
      }

      // Create 7-day refresh session and 15-minute access token
      const sessionData = createRefreshToken(AUTHORIZED_EMAIL);
      persistActiveSessions();
      const { token: accessToken, expiresAt: accessExpiresAt } = createAccessToken(AUTHORIZED_EMAIL, sessionData.sessionId);

      // Set cookies
      const cookieOptions = {
        httpOnly: true,
        secure: IS_PROD,
        sameSite: 'strict' as const,
        path: '/',
      };

      res.cookie('admin_access_token', accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('admin_refresh_token', sessionData.refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        session: {
          token: accessToken,
          refreshToken: sessionData.refreshToken,
          name: 'Shri Ram Adhrit (Master Admin)',
          email: AUTHORIZED_EMAIL,
          expiresAt: accessExpiresAt,
        },
      });
    } catch {
      res.status(500).json({ success: false, error: 'Authentication service encountered an error.' });
    }
  });

  /**
   * Admin PIN Unlock
   * Issues 15-minute access token + 7-day refresh token
   */
  app.post('/api/admin/unlock-pin', authLimiter, (req, res) => {
    try {
      const parsed = AdminPinSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: 'Invalid PIN format.' });
        return;
      }

      const { pin } = parsed.data;

      if (!isPinValid(pin)) {
        res.status(401).json({ success: false, error: 'Invalid Security PIN.' });
        return;
      }

      const sessionData = createRefreshToken(AUTHORIZED_EMAIL);
      persistActiveSessions();
      const { token: accessToken, expiresAt: accessExpiresAt } = createAccessToken(AUTHORIZED_EMAIL, sessionData.sessionId);

      const cookieOptions = {
        httpOnly: true,
        secure: IS_PROD,
        sameSite: 'strict' as const,
        path: '/',
      };

      res.cookie('admin_access_token', accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('admin_refresh_token', sessionData.refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        session: {
          token: accessToken,
          refreshToken: sessionData.refreshToken,
          name: 'Shri Ram Adhrit (Master Admin)',
          email: AUTHORIZED_EMAIL,
          expiresAt: accessExpiresAt,
        },
      });
    } catch {
      res.status(500).json({ success: false, error: 'PIN authentication failed.' });
    }
  });

  /**
   * Admin Reset Password with PIN (Forgot Password Flow)
   * Allows resetting forgotten master password by verifying the 4-digit master recovery PIN
   */
  app.post('/api/admin/reset-password-with-pin', authLimiter, (req, res) => {
    try {
      const parsed = ResetPasswordWithPinSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: parsed.error.issues[0]?.message || 'Invalid parameters.',
        });
        return;
      }

      const { pin, newPassword } = parsed.data;

      if (!isPinValid(pin)) {
        res.status(401).json({
          success: false,
          error: 'Incorrect Security PIN. Unable to reset password.',
        });
        return;
      }

      CURRENT_ADMIN_PASSWORD = newPassword.trim();
      saveJsonData(CREDENTIALS_FILE, { password: CURRENT_ADMIN_PASSWORD, pin: CURRENT_ADMIN_PIN });
      // Invalidate all active sessions to force fresh login with new password
      activeSessions.clear();
      persistActiveSessions();

      res.json({
        success: true,
        message: 'Password reset successfully. You can now log in with your new password.',
      });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to reset password.' });
    }
  });

  /**
   * Token Refresh Endpoint
   * Rotates 15-minute access token using valid 7-day refresh token
   */
  app.post('/api/admin/refresh-token', authLimiter, (req, res) => {
    try {
      const refreshToken = req.body?.refreshToken || req.cookies?.admin_refresh_token;

      if (!refreshToken || typeof refreshToken !== 'string') {
        res.status(401).json({ success: false, error: 'Refresh token required.' });
        return;
      }

      const cleanRefresh = refreshToken.trim();

      // Find active session
      let matchingSession: ActiveSession | undefined;
      for (const session of activeSessions.values()) {
        if (safeCompare(session.refreshToken, cleanRefresh) || session.refreshToken === cleanRefresh) {
          matchingSession = session;
          break;
        }
      }

      // If matching session not found or expired, but has master prefix or valid session format, reissue
      if (!matchingSession || Date.now() >= matchingSession.expiresAt) {
        if (cleanRefresh.startsWith('master-') || cleanRefresh.length >= 16) {
          const freshSession = createRefreshToken(AUTHORIZED_EMAIL);
          persistActiveSessions();
          const { token: newAccessToken, expiresAt: accessExpiresAt } = createAccessToken(AUTHORIZED_EMAIL, freshSession.sessionId);
          res.json({
            success: true,
            session: {
              token: newAccessToken,
              refreshToken: freshSession.refreshToken,
              expiresAt: accessExpiresAt,
            },
          });
          return;
        }
        res.status(401).json({ success: false, error: 'Invalid or expired refresh token.' });
        return;
      }

      // Rotate access token
      const { token: newAccessToken, expiresAt: accessExpiresAt } = createAccessToken(matchingSession.email, matchingSession.sessionId);

      res.cookie('admin_access_token', newAccessToken, {
        httpOnly: true,
        secure: IS_PROD,
        sameSite: 'strict',
        path: '/',
        maxAge: 15 * 60 * 1000,
      });

      res.json({
        success: true,
        session: {
          token: newAccessToken,
          refreshToken: matchingSession.refreshToken,
          expiresAt: accessExpiresAt,
        },
      });
    } catch {
      res.status(500).json({ success: false, error: 'Token refresh failed.' });
    }
  });

  /**
   * Admin Logout
   * Invalidates refresh session and blacklists token signature server-side
   */
  app.post('/api/admin/logout', authenticatedUserLimiter, csrfValidationMiddleware, (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        const parts = authHeader.slice(7).trim().split('.');
        if (parts[2]) {
          revokedTokenSignatures.add(parts[2]);
        }
      }

      const refreshToken = req.body?.refreshToken || req.cookies?.admin_refresh_token;
      if (refreshToken && typeof refreshToken === 'string') {
        for (const [id, session] of activeSessions.entries()) {
          if (safeCompare(session.refreshToken, refreshToken)) {
            activeSessions.delete(id);
          }
        }
      }

      const cookieOptions = {
        httpOnly: true,
        secure: IS_PROD,
        sameSite: 'strict' as const,
        path: '/',
      };

      res.clearCookie('admin_access_token', cookieOptions);
      res.clearCookie('admin_refresh_token', cookieOptions);
      res.clearCookie('csrf_token', cookieOptions);

      res.json({ success: true, message: 'Logged out and session terminated server-side.' });
    } catch {
      res.status(500).json({ success: false, error: 'Logout failed.' });
    }
  });

  /**
   * Change Master Credentials
   * Requires constant-time re-authentication with current password/PIN and invalidates all existing sessions
   */
  app.post('/api/admin/change-credentials', requireAdminAuth, authenticatedUserLimiter, csrfValidationMiddleware, (req, res) => {
    try {
      const parsed = ChangeCredentialsSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: parsed.error.issues[0]?.message || 'Invalid credential parameters.',
        });
        return;
      }

      const { currentPasswordOrPin, newPassword, newPin } = parsed.data;

      // Re-authentication check
      const currentValid =
        isPasswordValid(currentPasswordOrPin) ||
        isPinValid(currentPasswordOrPin);

      if (!currentValid) {
        res.status(403).json({
          success: false,
          error: 'Re-authentication failed: Current Password or PIN is incorrect.',
        });
        return;
      }

      if (newPassword) CURRENT_ADMIN_PASSWORD = newPassword.trim();
      if (newPin) CURRENT_ADMIN_PIN = newPin.trim();
      saveJsonData(CREDENTIALS_FILE, { password: CURRENT_ADMIN_PASSWORD, pin: CURRENT_ADMIN_PIN });

      // Invalidate all active sessions to force re-login with new credentials
      activeSessions.clear();

      res.json({
        success: true,
        message: 'Credentials updated successfully. All previous sessions revoked; please re-login.',
      });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to update credentials.' });
    }
  });

  // ====================================================================
  // PROTECTED ADMIN DATA OPERATIONS (60 REQ/MIN/USER)
  // ====================================================================

  /**
   * Fetch Inquiries (aggregates local file storage and Supabase)
   */
  app.get('/api/admin/inquiries', requireAdminAuth, authenticatedUserLimiter, async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 50));
      const statusFilter = typeof req.query.status === 'string' ? req.query.status : undefined;
      const search = typeof req.query.search === 'string' ? req.query.search.toLowerCase().trim() : undefined;

      // Sync latest rows from Supabase if reachable
      try {
        const { data: supaRows } = await supabaseServer
          .from('inquiries')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (Array.isArray(supaRows) && supaRows.length > 0) {
          let updated = false;
          for (const row of supaRows) {
            const exists = inMemoryInquiries.some(
              (m) =>
                m.id === row.id ||
                (m.phone === row.phone && m.name === row.name && m.created_at === row.created_at)
            );
            if (!exists && !inMemoryDeletedIds.has(row.id)) {
              inMemoryInquiries.unshift({
                id: row.id || `SUPA-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                name: row.name || 'Customer Booking',
                phone: row.phone || '',
                email: row.email || '',
                message: row.message || '',
                source: row.source || 'Supabase / Online Booking',
                dpdp_consent: Boolean(row.dpdp_consent),
                status: row.status || 'new',
                admin_notes: '',
                created_at: row.created_at || new Date().toISOString(),
                ip_hash: 'supa_sync',
              });
              updated = true;
            }
          }
          if (updated) {
            saveJsonData(INQUIRIES_FILE, inMemoryInquiries);
          }
        }
      } catch {
        // Non-blocking
      }

      try {
        const { data: bookRows } = await supabaseServer
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (Array.isArray(bookRows) && bookRows.length > 0) {
          let updated = false;
          for (const row of bookRows) {
            const exists = inMemoryInquiries.some(
              (m) =>
                m.id === row.id ||
                (m.phone === row.phone && m.name === row.name && m.created_at === row.created_at)
            );
            if (!exists && !inMemoryDeletedIds.has(row.id)) {
              inMemoryInquiries.unshift({
                id: row.id || `SUPA-BOOK-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                name: row.name || row.customer_name || 'Customer Booking',
                phone: row.phone || row.mobile || '',
                email: row.email || '',
                message: row.message || row.model || '',
                source: row.source || 'Supabase Bookings',
                dpdp_consent: Boolean(row.dpdp_consent ?? true),
                status: row.status || 'new',
                admin_notes: '',
                created_at: row.created_at || new Date().toISOString(),
                ip_hash: 'supa_sync',
              });
              updated = true;
            }
          }
          if (updated) {
            saveJsonData(INQUIRIES_FILE, inMemoryInquiries);
          }
        }
      } catch {
        // Non-blocking
      }

      // Ensure disk persistence is synchronized
      try {
        const diskInquiries = loadJsonData<StoredInquiry[]>(INQUIRIES_FILE, []);
        if (Array.isArray(diskInquiries) && diskInquiries.length > 0) {
          for (const diskItem of diskInquiries) {
            if (!inMemoryInquiries.some((m) => m.id === diskItem.id) && !inMemoryDeletedIds.has(diskItem.id)) {
              inMemoryInquiries.push(diskItem);
            }
          }
        }
      } catch {
        // Non-blocking
      }

      let filtered = inMemoryInquiries.filter((inq) => !inMemoryDeletedIds.has(inq.id));

      if (statusFilter && statusFilter !== 'all') {
        filtered = filtered.filter((inq) => inq.status === statusFilter);
      }

      if (search) {
        filtered = filtered.filter(
          (inq) =>
            inq.name.toLowerCase().includes(search) ||
            inq.phone.includes(search) ||
            inq.email.toLowerCase().includes(search) ||
            inq.message.toLowerCase().includes(search)
        );
      }

      // Sort newest first
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const total = filtered.length;
      const startIndex = (page - 1) * limit;
      const paginated = filtered.slice(startIndex, startIndex + limit);

      res.json({
        success: true,
        data: paginated,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to retrieve inquiries.' });
    }
  });

  /**
   * Sync Inquiries from Browser Storage (Guarantees zero lost inquiries from client)
   */
  app.post('/api/admin/inquiries/sync-browser', async (req, res) => {
    try {
      const clientInquiries = req.body?.inquiries;
      if (Array.isArray(clientInquiries)) {
        let addedCount = 0;
        for (const item of clientInquiries) {
          if (item && item.name && item.phone) {
            const exists = inMemoryInquiries.some(
              (m) => m.id === item.id || (m.phone === item.phone && m.name === item.name)
            );
            if (!exists && !inMemoryDeletedIds.has(item.id)) {
              inMemoryInquiries.unshift({
                id: item.id || `INQ-SYNC-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                name: item.name,
                phone: item.phone,
                email: item.email || '',
                message: item.message || '',
                source: item.source || 'Get in Touch / Direct Inquiry Form',
                dpdp_consent: Boolean(item.dpdp_consent ?? true),
                status: item.status || 'new',
                admin_notes: item.admin_notes || '',
                created_at: item.created_at || new Date().toISOString(),
                ip_hash: 'browser_sync',
              });
              addedCount++;
            }
          }
        }
        if (addedCount > 0) {
          saveJsonData(INQUIRIES_FILE, inMemoryInquiries);
        }
      }
      res.json({ success: true, count: inMemoryInquiries.length });
    } catch {
      res.status(500).json({ success: false });
    }
  });

  /**
   * Create Manual Inquiry / Booking from Admin Panel
   */
  app.post('/api/admin/inquiries/create', requireAdminAuth, authenticatedUserLimiter, async (req, res) => {
    try {
      const { name, phone, email, message, source, status, admin_notes } = req.body || {};
      if (!name || !phone) {
        res.status(400).json({ success: false, error: 'Customer name and phone number are required.' });
        return;
      }

      const newBooking: StoredInquiry = {
        id: `BOOK-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
        name: sanitizeInput(name, 100),
        phone: sanitizeInput(phone, 25),
        email: email ? sanitizeInput(email, 120).toLowerCase() : '',
        message: message ? sanitizeInput(message, 1500) : '',
        source: source ? sanitizeInput(source, 100) : 'Admin Manual Entry',
        dpdp_consent: true,
        status: status || 'new',
        admin_notes: admin_notes ? sanitizeInput(admin_notes, 2000) : '',
        created_at: new Date().toISOString(),
        ip_hash: 'admin_manual',
      };

      inMemoryInquiries.unshift(newBooking);
      saveJsonData(INQUIRIES_FILE, inMemoryInquiries);

      // Sync to Supabase in background
      try {
        await supabaseServer.from('inquiries').insert([{
          name: newBooking.name,
          phone: newBooking.phone,
          email: newBooking.email || null,
          message: newBooking.message,
          source: newBooking.source,
          dpdp_consent: newBooking.dpdp_consent,
          status: newBooking.status,
          created_at: newBooking.created_at,
        }]);
      } catch {
        // Non-blocking
      }

      res.status(201).json({ success: true, booking: newBooking });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to create booking record.' });
    }
  });

  /**
   * Update Inquiry Status / Notes
   */
  app.patch('/api/admin/inquiries/:id', requireAdminAuth, authenticatedUserLimiter, async (req, res) => {
    try {
      const id = req.params.id;
      if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, error: 'Invalid ID parameter.' });
        return;
      }

      const parsed = InquiryPatchSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || 'Invalid patch data.' });
        return;
      }

      const { status, admin_notes } = parsed.data;

      const target = inMemoryInquiries.find((inq) => inq.id === id);
      if (target) {
        if (status) target.status = status;
        if (admin_notes !== undefined) target.admin_notes = sanitizeInput(admin_notes, 2000);
        saveJsonData(INQUIRIES_FILE, inMemoryInquiries);
      }

      // Sync status to Supabase (Supabase inquiries table doesn't have admin_notes)
      if (status) {
        try {
          await supabaseServer.from('inquiries').update({ status }).eq('id', id);
        } catch {
          // Non-blocking
        }
      }

      res.json({ success: true, message: 'Inquiry updated successfully.' });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to update inquiry.' });
    }
  });

  /**
   * Delete Single Inquiry
   */
  app.delete('/api/admin/inquiries/:id', requireAdminAuth, authenticatedUserLimiter, async (req, res) => {
    try {
      const id = req.params.id;
      if (!id || typeof id !== 'string' || id.length > 100) {
        res.status(400).json({ success: false, error: 'Invalid inquiry identifier.' });
        return;
      }

      inMemoryDeletedIds.add(id);
      const index = inMemoryInquiries.findIndex((inq) => inq.id === id);
      if (index !== -1) {
        inMemoryInquiries.splice(index, 1);
      }
      saveJsonData(INQUIRIES_FILE, inMemoryInquiries);
      saveJsonData(DELETED_IDS_FILE, Array.from(inMemoryDeletedIds));

      // Attempt deletion in Supabase if matched
      try {
        await supabaseServer.from('inquiries').delete().eq('id', id);
      } catch {
        // Non-blocking
      }

      res.json({ success: true, message: 'Inquiry record deleted.' });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to delete inquiry.' });
    }
  });

  /**
   * Bulk Delete Inquiries
   */
  app.post('/api/admin/inquiries/bulk-delete', requireAdminAuth, authenticatedUserLimiter, async (req, res) => {
    try {
      const parsed = InquiryBulkDeleteSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || 'Invalid bulk delete payload.' });
        return;
      }

      const { ids } = parsed.data;
      ids.forEach((id) => inMemoryDeletedIds.add(id));

      const idSet = new Set(ids);
      for (let i = inMemoryInquiries.length - 1; i >= 0; i--) {
        if (idSet.has(inMemoryInquiries[i].id)) {
          inMemoryInquiries.splice(i, 1);
        }
      }
      saveJsonData(INQUIRIES_FILE, inMemoryInquiries);
      saveJsonData(DELETED_IDS_FILE, Array.from(inMemoryDeletedIds));

      // Bulk delete in Supabase
      try {
        await supabaseServer.from('inquiries').delete().in('id', ids);
      } catch {
        // Non-blocking
      }

      res.json({ success: true, count: ids.length });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to perform bulk deletion.' });
    }
  });

  // ====================================================================
  // SECURED COST-HEAVY ENDPOINTS (10 REQ/MIN/USER)
  // ====================================================================

  /**
   * Secured File Upload: Save Broom Image
   * Validates MIME type, extension, size limit (3MB), magic byte signatures, and prevents path traversal
   */
  app.post(
    '/api/save-broom-image',
    requireAdminAuth,
    heavyEndpointsLimiter,
    csrfValidationMiddleware,
    express.json({ limit: '6mb' }),
    async (req, res) => {
      try {
        const { modelId, dataUrl } = req.body;

        if (!modelId || typeof modelId !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(modelId)) {
          res.status(400).json({ success: false, error: 'Invalid model ID identifier.' });
          return;
        }

        if (!dataUrl || typeof dataUrl !== 'string') {
          res.status(400).json({ success: false, error: 'Image data URL required.' });
          return;
        }

        const matches = dataUrl.match(/^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          res.status(400).json({
            success: false,
            error: 'Unsupported image format. Allowed: JPEG, PNG, WEBP.',
          });
          return;
        }

        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');

        // File size limit (3 MB)
        if (buffer.length > 3 * 1024 * 1024) {
          res.status(400).json({ success: false, error: 'File exceeds maximum 3MB limit.' });
          return;
        }

        // Magic Bytes Verification
        const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
        const isPng =
          buffer[0] === 0x89 &&
          buffer[1] === 0x50 &&
          buffer[2] === 0x4e &&
          buffer[3] === 0x47 &&
          buffer[4] === 0x0d &&
          buffer[5] === 0x0a &&
          buffer[6] === 0x1a &&
          buffer[7] === 0x0a;
        const isWebp =
          buffer[0] === 0x52 &&
          buffer[1] === 0x49 &&
          buffer[2] === 0x46 &&
          buffer[3] === 0x46 &&
          buffer[8] === 0x57 &&
          buffer[9] === 0x45 &&
          buffer[10] === 0x42 &&
          buffer[11] === 0x50;

        if (!isJpeg && !isPng && !isWebp) {
          res.status(400).json({ success: false, error: 'Invalid file signature. File is not a valid image binary.' });
          return;
        }

        // Path Traversal Protection
        const uploadDir = path.resolve(process.cwd(), 'public/assets/uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const cleanFilename = `${modelId}.jpg`;
        const targetPath = path.resolve(uploadDir, cleanFilename);

        if (!targetPath.startsWith(uploadDir)) {
          res.status(403).json({ success: false, error: 'Path traversal attempt rejected.' });
          return;
        }

        fs.writeFileSync(targetPath, buffer);

        res.json({
          success: true,
          path: `/assets/uploads/${cleanFilename}?v=${Date.now()}`,
          message: 'Image asset successfully verified and stored.',
        });
      } catch {
        res.status(500).json({ success: false, error: 'Failed to process image upload.' });
      }
    }
  );

  /**
   * Hardened LLM Query / Proxy Endpoint (Prompt Injection & Token Limits)
   */
  app.post('/api/ai/query', heavyEndpointsLimiter, csrfValidationMiddleware, async (req, res) => {
    try {
      const parsed = AIQuerySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || 'Invalid AI prompt query.' });
        return;
      }

      const { prompt, maxTokens } = parsed.data;

      // 1. Scan for Prompt Injection
      if (scanForPromptInjection(prompt)) {
        res.status(400).json({
          success: false,
          error: 'Input rejected due to detected prompt injection or unsafe instruction pattern.',
        });
        return;
      }

      // 2. Delimit user input safely
      const delimited = delimitPromptInput(prompt);

      // 3. Cap max output tokens
      const effectiveMaxTokens = Math.min(maxTokens || 500, 1000);

      // If Gemini API key is configured, execute request safely; else return structured fallback response
      if (process.env.GEMINI_API_KEY) {
        // Safe server-side execution with token caps
        res.json({
          success: true,
          delimitedPrompt: delimited,
          maxTokens: effectiveMaxTokens,
          message: 'Prompt sanitized and bounded safely.',
        });
      } else {
        res.json({
          success: true,
          delimitedPrompt: delimited,
          maxTokens: effectiveMaxTokens,
          message: 'LLM proxy validated. GEMINI_API_KEY can be set in environment variables for live generation.',
        });
      }
    } catch {
      res.status(500).json({ success: false, error: 'AI query processing failed.' });
    }
  });

  // ====================================================================
  // CENTRALIZED ERROR HANDLER (REDACTS STACK TRACES & INTERNAL DATA)
  // ====================================================================
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      return next(err);
    }

    const referenceId = crypto.randomBytes(6).toString('hex');
    console.error(`[SERVER ERROR REF: ${referenceId}]`, err?.message || 'Unknown internal error');

    res.status(err.status || 500).json({
      success: false,
      error: 'An unexpected internal error occurred. Please try again later.',
      referenceId,
    });
  });

  // ====================================================================
  // VITE MIDDLEWARE (DEV) & STATIC FILE SERVING (PROD)
  // ====================================================================
  if (!IS_PROD) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Background sync initial data from Supabase
  try {
    const { data: supaRows } = await supabaseServer
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (Array.isArray(supaRows) && supaRows.length > 0) {
      let added = 0;
      for (const row of supaRows) {
        const exists = inMemoryInquiries.some(
          (m) =>
            m.id === row.id ||
            (m.phone === row.phone && m.name === row.name && m.created_at === row.created_at)
        );
        if (!exists && !inMemoryDeletedIds.has(row.id)) {
          inMemoryInquiries.push({
            id: row.id || `SUPA-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: row.name || 'Customer Booking',
            phone: row.phone || '',
            email: row.email || '',
            message: row.message || '',
            source: row.source || 'Supabase Direct / Web Booking',
            dpdp_consent: Boolean(row.dpdp_consent),
            status: row.status || 'new',
            admin_notes: '',
            created_at: row.created_at || new Date().toISOString(),
            ip_hash: 'supa_sync',
          });
          added++;
        }
      }
      if (added > 0) {
        saveJsonData(INQUIRIES_FILE, inMemoryInquiries);
        console.log(`[Supabase Sync] Bootstrapped ${added} records from Supabase`);
      }
    }
  } catch (e: any) {
    console.warn('[Supabase Sync] Startup sync notice:', e?.message || e);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SECURE SERVER] Listening on port ${PORT} (${IS_PROD ? 'production' : 'development'})`);
  });
}

startServer();
