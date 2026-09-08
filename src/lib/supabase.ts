import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://bmomtedgvcciefdvoiad.supabase.co';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_wcZa6ykEGxTc-o3-4wjTFw_nqoioqmN';

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
function backupInquiryForSession(record: InquiryRecord) {
  try {
    const existing = JSON.parse(sessionStorage.getItem('adhrit_session_inquiries') || '[]');
    existing.unshift({
      ...record,
      saved_at: new Date().toISOString(),
    });
    sessionStorage.setItem('adhrit_session_inquiries', JSON.stringify(existing.slice(0, 10)));
  } catch {
    // Non-blocking fallback
  }
}

/**
 * Submits an inquiry to Supabase.
 * Attempts inserting into 'inquiries', and falls back to 'enquiries' if configured with that name.
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

  try {
    // Try primary table 'inquiries'
    const { error: primaryError } = await supabase.from('inquiries').insert([payload]);

    if (!primaryError) {
      return { success: true, message: 'Inquiry saved successfully to Supabase backend.' };
    }

    // If 'inquiries' table not found (PGRST205), try 'enquiries'
    if (primaryError.code === 'PGRST205' || primaryError.message?.includes('schema cache')) {
      const { error: altError } = await supabase.from('enquiries').insert([payload]);
      if (!altError) {
        return { success: true, message: 'Inquiry saved successfully to Supabase backend.' };
      }
      backupInquiryForSession(payload);
      return {
        success: false,
        error: `Supabase table 'inquiries' not found yet. Please create the 'inquiries' table in your Supabase SQL Editor.`,
        savedLocally: true,
      };
    }

    backupInquiryForSession(payload);
    return {
      success: false,
      error: primaryError.message || 'Failed to submit inquiry to Supabase.',
      savedLocally: true,
    };
  } catch (err: unknown) {
    backupInquiryForSession(payload);
    const message = err instanceof Error ? err.message : 'Network error';
    return {
      success: false,
      error: message,
      savedLocally: true,
    };
  }
}

/**
 * Submits a statutory DPDP request to Supabase (table: 'dpdp_requests')
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

  try {
    const { error } = await supabase.from('dpdp_requests').insert([payload]);
    if (!error) {
      return { success: true };
    }
    return { success: false, error: error.message };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Error' };
  }
}
