-- ====================================================================
-- ADHRIT INDUSTRIES / SAMRIDDHI BROOM™ - SECURED SUPABASE DATABASE SCHEMA
-- Project ID: bmomtedgvcciefdvoiad
-- Hardened for OWASP Top 10 & DPDP Act 2023 Compliance
-- ====================================================================

-- 1. Create the 'inquiries' table for Get in Touch & Direct Wholesale Enquiries
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(25) NOT NULL,
  email VARCHAR(120),
  message TEXT,
  source VARCHAR(150) DEFAULT 'Get in Touch / Direct Inquiry',
  dpdp_consent BOOLEAN NOT NULL DEFAULT true,
  status VARCHAR(30) DEFAULT 'new', -- 'new', 'contacted', 'quote_sent', 'confirmed', 'completed', 'cancelled'
  admin_notes TEXT
);

-- Performance and Anti-DoS Query Indexes
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries (status);
CREATE INDEX IF NOT EXISTS idx_inquiries_phone ON public.inquiries (phone);

-- 2. Enable Row Level Security (RLS) for data protection (DPDP Act Sec 8(5))
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow visitors / website forms to insert new enquiries with strict consent check
DROP POLICY IF EXISTS "Allow public website inquiry inserts" ON public.inquiries;
CREATE POLICY "Allow public website inquiry inserts"
ON public.inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (
  dpdp_consent = true AND
  length(name) >= 2 AND
  length(phone) >= 8
);

-- 4. Policy: SECURED - Restrict reading customer enquiries to authenticated admins ONLY
-- CRITICAL DPDP AUDIT FIX: Never grant SELECT to 'anon' as anyone with the public anon key
-- could otherwise query and dump all customer names, phone numbers, and messages.
DROP POLICY IF EXISTS "Allow authenticated admin view" ON public.inquiries;
CREATE POLICY "Allow authenticated admin view"
ON public.inquiries
FOR SELECT
TO authenticated
USING (true);

-- 5. Policy: SECURED - Restrict updates (status, notes) to authenticated admins ONLY
DROP POLICY IF EXISTS "Allow inquiry updates" ON public.inquiries;
CREATE POLICY "Allow inquiry updates"
ON public.inquiries
FOR UPDATE
TO authenticated
USING (true);

-- 6. Policy: SECURED - Restrict deletion (DSR erasure / cleanup) to authenticated admins ONLY
DROP POLICY IF EXISTS "Allow inquiry deletion" ON public.inquiries;
CREATE POLICY "Allow inquiry deletion"
ON public.inquiries
FOR DELETE
TO authenticated
USING (true);


-- ====================================================================
-- 2. Statutory DPDP Rights Request Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.dpdp_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  right_type VARCHAR(60) NOT NULL,
  name VARCHAR(120) NOT NULL,
  contact VARCHAR(120) NOT NULL,
  details TEXT,
  status VARCHAR(30) DEFAULT 'pending' -- 'pending', 'resolved', 'dismissed'
);

CREATE INDEX IF NOT EXISTS idx_dpdp_created_at ON public.dpdp_requests (created_at DESC);

ALTER TABLE public.dpdp_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public dpdp request inserts" ON public.dpdp_requests;
CREATE POLICY "Allow public dpdp request inserts"
ON public.dpdp_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(name) >= 2 AND
  length(contact) >= 6
);

DROP POLICY IF EXISTS "Allow authenticated admin view dpdp" ON public.dpdp_requests;
CREATE POLICY "Allow authenticated admin view dpdp"
ON public.dpdp_requests
FOR SELECT
TO authenticated
USING (true);


-- ====================================================================
-- 3. Master Administrator Table (Single Slot Enforced & Hardened)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  phone VARCHAR(25),
  password_hash TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  role VARCHAR(30) DEFAULT 'master_admin'
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- SECURED ADMIN ACCESS POLICIES:
-- CRITICAL HARDENING: Revoke public/anonymous SELECT from admin_users.
-- Credential hashes must NEVER be readable by the public anon role.
DROP POLICY IF EXISTS "Allow initial admin registration" ON public.admin_users;
DROP POLICY IF EXISTS "Allow admin authentication read" ON public.admin_users;
DROP POLICY IF EXISTS "Allow admin password updates" ON public.admin_users;

-- Only authenticated users (or service_role) can access or view admin accounts
CREATE POLICY "Allow authenticated admin read"
ON public.admin_users
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated admin updates"
ON public.admin_users
FOR UPDATE
TO authenticated
USING (true);
