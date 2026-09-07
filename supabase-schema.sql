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

-- 2. Enable Row Level Security (RLS) for data protection
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow visitors / website forms to insert new enquiries
DROP POLICY IF EXISTS "Allow public website inquiry inserts" ON public.inquiries;
CREATE POLICY "Allow public website inquiry inserts"
ON public.inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 4. Policy: Allow viewing enquiries
DROP POLICY IF EXISTS "Allow authenticated admin view" ON public.inquiries;
CREATE POLICY "Allow authenticated admin view"
ON public.inquiries
FOR SELECT
TO anon, authenticated
USING (true);

-- 5. Policy: Allow status & admin note updates
DROP POLICY IF EXISTS "Allow inquiry updates" ON public.inquiries;
CREATE POLICY "Allow inquiry updates"
ON public.inquiries
FOR UPDATE
TO anon, authenticated
USING (true);

-- 6. Policy: Allow admin inquiry deletion
DROP POLICY IF EXISTS "Allow inquiry deletion" ON public.inquiries;
CREATE POLICY "Allow inquiry deletion"
ON public.inquiries
FOR DELETE
TO anon, authenticated
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

-- Allow initial single slot registration from the website
DROP POLICY IF EXISTS "Allow initial admin registration" ON public.admin_users;
CREATE POLICY "Allow initial admin registration"
ON public.admin_users
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow reading admin record for authentication check
DROP POLICY IF EXISTS "Allow admin authentication read" ON public.admin_users;
CREATE POLICY "Allow admin authentication read"
ON public.admin_users
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow updating password/pin
DROP POLICY IF EXISTS "Allow admin password updates" ON public.admin_users;
CREATE POLICY "Allow admin password updates"
ON public.admin_users
FOR UPDATE
TO anon, authenticated
USING (true);

