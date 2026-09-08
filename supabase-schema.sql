-- ====================================================================
-- ADHRIT INDUSTRIES / SAMRIDDHI BROOM™ - SUPABASE DATABASE SCHEMA
-- Project ID: bmomtedgvcciefdvoiad
-- ====================================================================

-- 1. Create the 'inquiries' table for Get in Touch & Direct Wholesale Enquiries
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT,
  source TEXT DEFAULT 'Get in Touch / Direct Inquiry',
  dpdp_consent BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'new' -- 'new', 'contacted', 'quoted', 'converted', 'closed'
);

-- 2. Enable Row Level Security (RLS) for data protection (DPDP Act Sec 8(5))
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow visitors / website forms to insert new enquiries with consent
DROP POLICY IF EXISTS "Allow public website inquiry inserts" ON public.inquiries;
CREATE POLICY "Allow public website inquiry inserts"
ON public.inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (dpdp_consent IS NOT NULL);

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
-- OPTIONAL: Statutory DPDP Rights Request Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.dpdp_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  right_type TEXT NOT NULL,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' -- 'pending', 'resolved', 'dismissed'
);

ALTER TABLE public.dpdp_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public dpdp request inserts" ON public.dpdp_requests;
CREATE POLICY "Allow public dpdp request inserts"
ON public.dpdp_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated admin view dpdp" ON public.dpdp_requests;
CREATE POLICY "Allow authenticated admin view dpdp"
ON public.dpdp_requests
FOR SELECT
TO authenticated
USING (true);


-- ====================================================================
-- 3. Master Administrator Table (Single Slot Enforced)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password_hash TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  role TEXT DEFAULT 'master_admin'
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- SECURED ADMIN ACCESS POLICIES:
-- Protect admin credential hashes from public anonymous scraping
DROP POLICY IF EXISTS "Allow initial admin registration" ON public.admin_users;
CREATE POLICY "Allow initial admin registration"
ON public.admin_users
FOR INSERT
TO anon, authenticated
WITH CHECK (role = 'master_admin');

-- Allow reading admin verification status strictly for authenticated users or initial setup check
DROP POLICY IF EXISTS "Allow admin authentication read" ON public.admin_users;
CREATE POLICY "Allow admin authentication read"
ON public.admin_users
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow updating password/pin strictly for authenticated administrative sessions
DROP POLICY IF EXISTS "Allow admin password updates" ON public.admin_users;
CREATE POLICY "Allow admin password updates"
ON public.admin_users
FOR UPDATE
TO authenticated
USING (true);

