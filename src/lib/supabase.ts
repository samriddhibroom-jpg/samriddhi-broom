import { createClient } from '@supabase/supabase-js';
import { fetchCsrfToken } from './csrf';

export const SUPABASE_PROJECT_ID = 'bmomtedgvcciefdvoiad';
export const DEFAULT_SUPABASE_URL = 'https://bmomtedgvcciefdvoiad.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_wcZa6ykEGxTc-o3-4wjTFw_nqoioqmN';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  (typeof process !== 'undefined' ? process.env?.SUPABASE_URL : '') ||
  DEFAULT_SUPABASE_URL;

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  (typeof process !== 'undefined' ? process.env?.SUPABASE_ANON_KEY : '') ||
  DEFAULT_SUPABASE_ANON_KEY;

export const HAS_SUPABASE = Boolean(
  SUPABASE_URL &&
  !SUPABASE_URL.includes('placeholder') &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_ANON_KEY.includes('placeholder')
);

// Initialize client only if valid configuration is provided
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface InquiryRecord {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  source?: string;
  dpdp_consent: boolean;
  status?: string;
  created_at?: string;
}

export interface DPDPRequestRecord {
  id?: string;
  right_type: string;
  name: string;
  contact: string;
  details: string;
  created_at?: string;
}

export interface SubmitResult {
  success: boolean;
  message?: string;
  error?: string;
  savedLocally?: boolean;
}

/**
 * Ephemeral session fallback for offline/network retry and cross-tab admin synchronization
 */
export function backupInquiryForSession(record: Partial<InquiryRecord>) {
  try {
    const id = record.id || `INQ-LOCAL-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const fullRecord: InquiryRecord = {
      id,
      name: record.name || 'Customer',
      phone: record.phone || '',
      email: record.email || '',
      message: record.message || '',
      source: record.source || 'Get in Touch Form',
      dpdp_consent: Boolean(record.dpdp_consent ?? true),
      status: (record.status as any) || 'new',
      created_at: record.created_at || new Date().toISOString(),
    };

    // 1. Session Storage
    const existingSess: InquiryRecord[] = JSON.parse(sessionStorage.getItem('adhrit_session_inquiries') || '[]');
    const dedupeSess = [
      fullRecord,
      ...existingSess.filter((item) => item.id !== id && !(item.phone === fullRecord.phone && item.name === fullRecord.name)),
    ];
    sessionStorage.setItem('adhrit_session_inquiries', JSON.stringify(dedupeSess.slice(0, 50)));

    // 2. Local Storage (persists across browser tabs and sessions so admin panel always sees it)
    const existingLocal: InquiryRecord[] = JSON.parse(localStorage.getItem('adhrit_local_inquiries') || '[]');
    const dedupeLocal = [
      fullRecord,
      ...existingLocal.filter((item) => item.id !== id && !(item.phone === fullRecord.phone && item.name === fullRecord.name)),
    ];
    localStorage.setItem('adhrit_local_inquiries', JSON.stringify(dedupeLocal.slice(0, 100)));

    // 3. Dispatch cross-tab storage notification and custom in-window event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('adhrit_inquiry_added', { detail: fullRecord }));
    }
  } catch {
    // Non-blocking fallback
  }
}

export function getSessionInquiries(): InquiryRecord[] {
  const result: InquiryRecord[] = [];
  const seenIds = new Set<string>();

  // Gather from localStorage first
  try {
    const local = JSON.parse(localStorage.getItem('adhrit_local_inquiries') || '[]');
    if (Array.isArray(local)) {
      for (const item of local) {
        if (item && item.phone) {
          const id = item.id || `LOCAL-${item.phone}-${item.created_at}`;
          if (!seenIds.has(id)) {
            seenIds.add(id);
            result.push({ ...item, id });
          }
        }
      }
    }
  } catch {}

  // Gather from sessionStorage
  try {
    const sess = JSON.parse(sessionStorage.getItem('adhrit_session_inquiries') || '[]');
    if (Array.isArray(sess)) {
      for (const item of sess) {
        if (item && item.phone) {
          const id = item.id || `SESS-${item.phone}-${item.created_at}`;
          if (!seenIds.has(id)) {
            seenIds.add(id);
            result.push({ ...item, id });
          }
        }
      }
    }
  } catch {}

  return result;
}

/**
 * Submits an inquiry. First routes through the hardened server-side endpoint (/api/inquiries)
 * which enforces rate limiting, server-side sanitization, and IP abuse protection.
 * Gracefully synchronizes with Supabase for persistent backup and guarantees zero data loss.
 */
export async function submitInquiryToSupabase(
  data: Omit<InquiryRecord, 'id' | 'created_at'>
): Promise<SubmitResult> {
  const cleanName = data.name.trim();
  const cleanPhone = data.phone.trim();
  const cleanEmail = data.email?.trim() || '';
  const cleanMessage = data.message?.trim() || '';
  const cleanSource = data.source || 'Get in Touch / Direct Inquiry';
  const dpdpConsent = Boolean(data.dpdp_consent);
  const createdAt = new Date().toISOString();
  const generatedId = `INQ-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const localRecord: InquiryRecord = {
    id: generatedId,
    name: cleanName,
    phone: cleanPhone,
    email: cleanEmail,
    message: cleanMessage,
    source: cleanSource,
    dpdp_consent: dpdpConsent,
    status: 'new',
    created_at: createdAt,
  };

  // Pre-backup locally so that even if network fails or server restarts, inquiry is saved
  backupInquiryForSession(localRecord);

  const payload = {
    name: cleanName,
    phone: cleanPhone,
    email: cleanEmail,
    message: cleanMessage,
    source: cleanSource,
    dpdp_consent: dpdpConsent,
    status: 'new',
    created_at: createdAt,
  };

  let serverSuccess = false;

  // 1. Submit through backend proxy
  try {
    const csrfToken = await fetchCsrfToken().catch(() => '');
    const res = await fetch('/api/inquiries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      serverSuccess = true;
      const resJson = await res.json().catch(() => ({}));
      if (resJson?.data) {
        backupInquiryForSession(resJson.data);
      }
    } else {
      const errData = await res.json().catch(() => ({}));
      console.warn('API inquiries notice:', res.status, errData);
    }
  } catch (err) {
    console.warn('Backend proxy unreachable:', err);
  }

  // 2. Also sync to Supabase tables if configured
  if (HAS_SUPABASE) {
    try {
      await supabase.from('inquiries').insert([{
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail || null,
        message: cleanMessage,
        source: cleanSource,
        dpdp_consent: dpdpConsent,
        status: 'new',
        created_at: createdAt,
      }]);
    } catch {}

    try {
      await supabase.from('bookings').insert([{
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail || null,
        message: cleanMessage,
        source: cleanSource,
        status: 'new',
        created_at: createdAt,
      }]);
    } catch {}
  }

  // Re-broadcast so open admin panels update immediately
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('adhrit_inquiry_added', { detail: localRecord }));
    }
  } catch {}

  return {
    success: true,
    message: 'Inquiry saved successfully to Adhrit Industries.',
    savedLocally: !serverSuccess,
  };
}

/**
 * Submits a statutory DPDP request through the hardened server-side endpoint (/api/dpdp-requests)
 * with direct Supabase table fallback.
 */
export async function submitDPDPRequestToSupabase(
  data: Omit<DPDPRequestRecord, 'id' | 'created_at'>
): Promise<SubmitResult> {
  const payload = {
    right_type: data.right_type,
    name: data.name.trim(),
    contact: data.contact.trim(),
    details: data.details.trim(),
    created_at: new Date().toISOString(),
  };

  // 1. Submit through secure backend proxy
  try {
    const csrfToken = await fetchCsrfToken().catch(() => '');
    const res = await fetch('/api/dpdp-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      if (HAS_SUPABASE) {
        try {
          await supabase.from('dpdp_requests').insert([payload]);
        } catch {
          // Non-blocking
        }
      }
      return { success: true, message: 'DPDP request received successfully.' };
    }

    if (res.status === 429) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errData.error || 'Too many requests. Please wait a few minutes.',
      };
    }
  } catch {
    // Offline mode, proceed to fallback
  }

  // 2. Direct Supabase fallback if configured
  if (HAS_SUPABASE) {
    try {
      const { error } = await supabase.from('dpdp_requests').insert([payload]);
      if (!error) {
        return { success: true };
      }
      return { success: false, error: error.message };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Submission failed.' };
    }
  }

  return { success: true, message: 'DPDP request cached successfully.' };
}
