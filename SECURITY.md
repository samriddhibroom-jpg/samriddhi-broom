# Security Policy & Architecture Guide

**Application:** Samriddhi Broom™ (Adhrit Industries)  
**Security Standard:** OWASP Top 10 (2021) & India Digital Personal Data Protection (DPDP) Act 2023  
**Classification:** Production-Grade Hardened Web Architecture  

---

## 1. Security Architecture Overview

The application follows a defense-in-depth full-stack architecture combining a security-hardened Express backend proxy with a modern React client. All sensitive operations, authentication verifications, rate limiting, and asset uploads are handled through strictly controlled, authenticated server-side endpoints.

```
+-------------------------------------------------------------------------+
|                              Client Browser                             |
|  - React 19 SPA (Strict CSP, Context-Aware Escaping, Ephemeral Cache)  |
+------------------------------------+------------------------------------+
                                     | HTTPS / Strict Security Headers
                                     v
+------------------------------------+------------------------------------+
|                         Express Security Layer                          |
|  - Content Security Policy (CSP), nosniff, HSTS, strict Referrer-Policy |
|  - In-Memory Sliding Window Rate Limiting (IP-based, 429 response)      |
|  - Strict Request Body Size Limits (100KB JSON, 6MB dedicated upload)   |
|  - Request Connection Timeout (15s Slowloris mitigation)                |
|  - Timing-Safe String Equality (crypto.timingSafeEqual)                 |
|  - Cryptographic Session Token Issuance (HMAC-SHA256, 2-hr expiry)      |
|  - Strict Input Sanitization & Format Validation (Regex + Length)       |
|  - File Upload Hardening (Magic Bytes inspection, Path Traversal guard) |
+------------------+----------------------------------+-------------------+
                   |                                  |
                   v                                  v
+------------------+---------------+  +---------------+-------------------+
|     Local Storage Asset Sink     |  |       Supabase Cloud Database     |
| - Normalized filename whitelist  |  | - Row Level Security (RLS)        |
| - Strictly inside public/uploads |  | - Public anonymous SELECT revoked |
| - Non-executable image binaries  |  | - DPDP compliance audit checks    |
+----------------------------------+  +-----------------------------------+
```

---

## 2. Implemented Security Controls

### 2.1 Input Validation & Output Sanitization
- **Strict Server-Side Validation:** All user inputs submitted via `/api/inquiries` and `/api/dpdp-requests` undergo server-side type, length, and format validation.
- **XSS Stripping:** All string inputs are passed through `sanitizeInput()`, stripping `<script>`, arbitrary HTML tags, null bytes (`\0`), and ASCII control characters.
- **Context-Aware React Output Encoding:** React automatically escapes all JSX expressions, preventing DOM-based or reflected XSS vulnerabilities.

### 2.2 DoS, Slowloris & Abuse Protection
- **Sliding-Window Rate Limiting:**
  - **Global Limit:** 150 requests per minute per IP.
  - **Inquiries Submission Limit:** Maximum 6 submissions per 15 minutes per IP (`HTTP 429 Too Many Requests`).
  - **DPDP Requests Limit:** Maximum 6 requests per 15 minutes per IP (`HTTP 429`).
  - **Admin Authentication Limit:** Maximum 6 attempts per 15 minutes with exponential lockout.
  - **Image Upload Limit:** Maximum 15 uploads per hour per IP.
- **Resource Exhaustion Mitigations:**
  - Connection timeout enforced at 15 seconds.
  - Body parser capped at 100KB for standard requests and 6MB for multipart/base64 uploads.
  - In-memory query results capped and paginated (max 100 items per page).

### 2.3 Authentication, Authorization & Session Management
- **Constant-Time Verification:** Password and PIN verifications execute using `crypto.timingSafeEqual()` to eliminate side-channel timing attacks.
- **Cryptographic Tokens:** Sessions are verified using HMAC-SHA256 signed tokens generated with high-entropy keys (`ADMIN_JWT_SECRET`).
- **No Client Secrets:** Master admin passwords and PINs are strictly confined to the backend process environment; zero plaintext credentials exist in client bundles.
- **Role-Based Access Control:** All `/api/admin/*` and `/api/save-broom-image` endpoints strictly enforce `requireAdminAuth` middleware.

### 2.4 File Upload & Path Traversal Hardening
- **Route:** `/api/save-broom-image`
- **Authentication Required:** Only verified admin tokens can upload custom broom photos.
- **Identifier Whitelisting:** `modelId` is strictly matched against `^[a-zA-Z0-9_-]{1,64}$`, forbidding `../`, slashes, backslashes, or null bytes.
- **Path Resolution Protection:** The resolved file path is tested against `targetPath.startsWith(uploadDir)` to guarantee no traversal outside `public/assets/uploads/`.
- **Magic Bytes Validation:** Uploaded binary buffers are inspected for valid JPEG (`FF D8 FF`), PNG (`89 50 4E 47`), or WebP (`RIFF...WEBP`) file headers. Disguised executables or scripts are rejected.
- **File Size Cap:** Maximum decoded buffer size is 3 MB.

### 2.5 Security Headers
Every HTTP response carries the following defense headers:
- `Content-Security-Policy`: Restricts script execution to `'self'`, allows Google Fonts and Supabase, and enforces frame embedding only within AI Studio and verified containers.
- `X-Content-Type-Options: nosniff`: Prevents MIME-type sniffing.
- `Referrer-Policy: strict-origin-when-cross-origin`: Minimizes leakage of sensitive URLs.
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`: Disables unneeded browser hardware capabilities.
- `X-XSS-Protection: 1; mode=block`: Legacy browser filter fallback.
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`: Enforced in production environments.
- `X-Powered-By`: Explicitly suppressed to prevent framework fingerprinting.

---

## 3. Environment Variables & Secret Configuration

Declare all required variables in your server environment:

| Variable | Scope | Description | Default / Example |
| :--- | :--- | :--- | :--- |
| `ADMIN_EMAIL` | Server | Master administrator email | `samriddhibroom@gmail.com` |
| `ADMIN_PASSWORD` | Server | Master administrator password | User configured |
| `ADMIN_PIN` | Server | 4-digit Master recovery PIN | User configured |
| `ADMIN_JWT_SECRET` | Server | 256-bit secret key for HMAC signing | High-entropy random |
| `VITE_SUPABASE_URL` | Client/Server | Supabase project URL | `https://...supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Client/Server | Supabase publishable anon key | `sb_publishable_...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Optional privileged backend key | Confidential |

---

## 4. Reporting Security Vulnerabilities

To report a vulnerability or security incident:
- Contact: `samriddhibroom@gmail.com`
- Turnaround time for critical patches: < 24 hours.
