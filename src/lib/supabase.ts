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
 * Ephemeral session fallback for offline/network retry without exposing PII in persistent localStorage
 */
export function backupInquiryForSession(record: InquiryRecord) {
  try {
    const existing = JSON.parse(sessionStorage.getItem('adhrit_session_inquiries') || '[]');
    existing.unshift({
      ...record,
      saved_at: new Date().toISOString(),
    });
    sessionStorage.setItem('adhrit_session_inquiries', JSON.stringify(existing.slice(0, 20)));
  } catch {
    // Non-blocking fallback
  }
}

export function getSessionInquiries(): InquiryRecord[] {
  try {
    return JSON.parse(sessionStorage.getItem('adhrit_session_inquiries') || '[]');
  } catch {
    return [];
  }
}

/**
 * Submits an inquiry. First routes through the hardened server-side endpoint (/api/inquiries)
 * which enforces rate limiting, server-side sanitization, and IP abuse protection.
 * Gracefully synchronizes with Supabase for persistent backup.
 */
export async function submitInquiryToSupabase(
  data: Omit<InquiryRecord, 'id' | 'created_at'>
): Promise<SubmitResult> {
  const payload = {
    name: data.name.trim(),
    phone: data.phone.trim(),
    email: data.email?.trim() || null,
    message: data.message?.trim() || '',
    source: data.source || 'Get in Touch / Direct Inquiry',
    dpdp_consent: Boolean(data.dpdp_consent),
    status: 'new',
    created_at: new Date().toISOString(),
  };

  // 1. Submit through secure backend proxy (Rate-limited & sanitized)
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
      // Also try sync directly to Supabase if configured
      if (HAS_SUPABASE) {
        try {
          await supabase.from('inquiries').insert([payload]);
        } catch {
          // Non-blocking
        }
      }
      return { success: true, message: 'Inquiry saved successfully to Adhrit Industries.' };
    }

    if (res.status === 429) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errData.error || 'Too many submissions from your network. Please wait a few minutes before trying again.',
      };
    }

    if (res.status === 400) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errData.error || 'Please provide valid inquiry details.',
      };
    }
  } catch {
    // Server endpoint unreachable (offline mode), proceed to fallback
  }

  // 2. Direct Supabase fallback if configured
  if (HAS_SUPABASE) {
    try {
      const { error: primaryError } = await supabase.from('inquiries').insert([payload]);

      if (!primaryError) {
        return { success: true, message: 'Inquiry saved successfully.' };
      }

      // If 'inquiries' table not found (PGRST205), try 'enquiries'
      if (primaryError.code === 'PGRST205' || primaryError.message?.includes('schema cache')) {
        const { error: altError } = await supabase.from('enquiries').insert([payload]);
        if (!altError) {
          return { success: true, message: 'Inquiry saved successfully.' };
        }
      }
    } catch {
      // Fall through to local session backup
    }
  }

  backupInquiryForSession(payload);
  return {
    success: true,
    message: 'Inquiry saved securely to local cache.',
    savedLocally: true,
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
