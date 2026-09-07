import { supabase, InquiryRecord } from './supabase';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password_hash: string;
  pin_hash: string;
  created_at: string;
  role: 'master_admin';
}

export interface AdminSession {
  token: string;
  adminId: string;
  name: string;
  email: string;
  loginTime: string;
  expiresAt: number;
}

export interface BookingRecord extends InquiryRecord {
  id: string;
  status: 'new' | 'contacted' | 'quote_sent' | 'confirmed' | 'completed' | 'cancelled';
  admin_notes?: string;
  source: string;
  created_at: string;
}

export const AUTHORIZED_MASTER_EMAIL = 'samriddhibroom@gmail.com';
export const AUTHORIZED_MASTER_NAME = 'Adhrit Master Admin';
export const DEFAULT_INITIAL_MASTER_PASSWORD = 'Samriddhi@2026';
export const DEFAULT_INITIAL_MASTER_PIN = '2026';

const STORAGE_ADMIN_SLOT_KEY = 'adhrit_admin_master_account';
const STORAGE_ADMIN_SESSION_KEY = 'adhrit_admin_active_session';
const STORAGE_ADMIN_BOOKINGS_KEY = 'adhrit_inquiries_backup';
const STORAGE_DELETED_BOOKINGS_KEY = 'adhrit_deleted_inquiries_ids';

/**
 * Returns set of IDs marked as deleted
 */
export function getDeletedBookingIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_DELETED_BOOKINGS_KEY);
    if (!raw) return new Set<string>();
    const list: string[] = JSON.parse(raw);
    return new Set<string>(list);
  } catch {
    return new Set<string>();
  }
}

/**
 * Marks IDs as permanently deleted in local cache
 */
export function markBookingIdsAsDeleted(ids: string[]): void {
  try {
    const current = getDeletedBookingIds();
    ids.forEach((id) => current.add(id));
    localStorage.setItem(STORAGE_DELETED_BOOKINGS_KEY, JSON.stringify(Array.from(current)));
  } catch {
    // Non-blocking
  }
}

/**
 * Computes a SHA-256 hash using the native browser Web Crypto API
 */
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Gets or initializes the immutable Master Admin record for samriddhibroom@gmail.com
 */
export async function getOrInitMasterAdmin(): Promise<AdminUser> {
  // 1. Check local storage
  try {
    const localData = localStorage.getItem(STORAGE_ADMIN_SLOT_KEY);
    if (localData) {
      const parsed: AdminUser = JSON.parse(localData);
      if (parsed.email.toLowerCase() === AUTHORIZED_MASTER_EMAIL.toLowerCase()) {
        return parsed;
      }
    }
  } catch {
    // Continue
  }

  // 2. Check Supabase
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', AUTHORIZED_MASTER_EMAIL)
      .limit(1);

    if (!error && data && data.length > 0) {
      const dbAdmin: AdminUser = data[0];
      localStorage.setItem(STORAGE_ADMIN_SLOT_KEY, JSON.stringify(dbAdmin));
      return dbAdmin;
    }
  } catch {
    // Continue
  }

  // 3. Initialize default master admin
  const defaultPasswordHash = await sha256(DEFAULT_INITIAL_MASTER_PASSWORD);
  const defaultPinHash = await sha256(DEFAULT_INITIAL_MASTER_PIN);

  const initialMasterAdmin: AdminUser = {
    id: `ADMIN-MASTER-SAMRIDDHI`,
    name: AUTHORIZED_MASTER_NAME,
    email: AUTHORIZED_MASTER_EMAIL,
    phone: '+91 9431105151',
    password_hash: defaultPasswordHash,
    pin_hash: defaultPinHash,
    created_at: new Date().toISOString(),
    role: 'master_admin',
  };

  try {
    localStorage.setItem(STORAGE_ADMIN_SLOT_KEY, JSON.stringify(initialMasterAdmin));
  } catch {
    // Non-blocking
  }

  try {
    await supabase.from('admin_users').upsert([initialMasterAdmin]);
  } catch {
    // Non-blocking
  }

  return initialMasterAdmin;
}

/**
 * Checks if the single admin slot has already been claimed.
 * ALWAYS returns true because the slot is pre-configured and locked to the business owner.
 */
export async function checkAdminSlotStatus(): Promise<{
  isClaimed: boolean;
  adminEmail: string;
  adminName: string;
  claimedAt?: string;
}> {
  const master = await getOrInitMasterAdmin();
  return {
    isClaimed: true,
    adminEmail: master.email,
    adminName: master.name,
    claimedAt: master.created_at,
  };
}

/**
 * Registration is permanently closed and forbidden to public visitors.
 */
export async function claimInitialAdminSlot(): Promise<{ success: boolean; error: string }> {
  return {
    success: false,
    error: 'Access Denied: Self-registration is permanently disabled. Only the verified Master Administrator (samriddhibroom@gmail.com) can access this portal.',
  };
}

/**
 * Logs in the administrator via Email and Master Password
 */
export async function loginAdmin(credentials: {
  email: string;
  password: string;
}): Promise<{ success: boolean; error?: string; session?: AdminSession }> {
  const emailClean = credentials.email.trim().toLowerCase();
  const passwordHash = await sha256(credentials.password.trim());

  if (emailClean !== AUTHORIZED_MASTER_EMAIL.toLowerCase()) {
    return {
      success: false,
      error: 'Access Denied: Unrecognized administrator. Only the authorized Adhrit Industries master administrator can access this terminal.',
    };
  }

  const master = await getOrInitMasterAdmin();

  if (master.password_hash !== passwordHash) {
    return {
      success: false,
      error: 'Incorrect administrator password. Please check your credentials or unlock using your 4-digit Security PIN.',
    };
  }

  const session: AdminSession = {
    token: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    adminId: master.id,
    name: master.name,
    email: master.email,
    loginTime: new Date().toISOString(),
    expiresAt: Date.now() + 2 * 60 * 60 * 1000, // 2 hours
  };

  try {
    localStorage.setItem(STORAGE_ADMIN_SESSION_KEY, JSON.stringify(session));
  } catch {
    // Non-blocking
  }

  return { success: true, session };
}

/**
 * Unlocks the admin terminal using the 4-digit master security PIN
 */
export async function loginWithPin(
  pin: string
): Promise<{ success: boolean; error?: string; session?: AdminSession }> {
  const pinHash = await sha256(pin.trim());
  const master = await getOrInitMasterAdmin();

  if (master.pin_hash !== pinHash) {
    return {
      success: false,
      error: 'Incorrect Security PIN. Please verify and re-enter.',
    };
  }

  const session: AdminSession = {
    token: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    adminId: master.id,
    name: master.name,
    email: master.email,
    loginTime: new Date().toISOString(),
    expiresAt: Date.now() + 2 * 60 * 60 * 1000,
  };

  try {
    localStorage.setItem(STORAGE_ADMIN_SESSION_KEY, JSON.stringify(session));
  } catch {
    // Non-blocking
  }

  return { success: true, session };
}

/**
 * Changes administrator password or recovery PIN
 */
export async function updateAdminCredentials(params: {
  currentPasswordOrPin: string;
  newPassword?: string;
  newPin?: string;
}): Promise<{ success: boolean; error?: string }> {
  const master = await getOrInitMasterAdmin();
  const inputHash = await sha256(params.currentPasswordOrPin.trim());

  // Must match either current password or current PIN
  if (master.password_hash !== inputHash && master.pin_hash !== inputHash) {
    return {
      success: false,
      error: 'Current Password or PIN verification failed. Please try again.',
    };
  }

  if (params.newPassword) {
    if (params.newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters.' };
    }
    master.password_hash = await sha256(params.newPassword.trim());
  }

  if (params.newPin) {
    if (params.newPin.trim().length < 4) {
      return { success: false, error: 'Security PIN must be at least 4 digits.' };
    }
    master.pin_hash = await sha256(params.newPin.trim());
  }

  try {
    localStorage.setItem(STORAGE_ADMIN_SLOT_KEY, JSON.stringify(master));
  } catch {
    // Non-blocking
  }

  try {
    await supabase.from('admin_users').upsert([master]);
  } catch {
    // Non-blocking
  }

  return { success: true };
}

/**
 * Resets admin password using the master security PIN
 */
export async function resetAdminPasswordWithPIN(
  pin: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const pinHash = await sha256(pin.trim());
  const newPasswordHash = await sha256(newPassword.trim());

  let adminRecord: AdminUser | null = null;
  try {
    const raw = localStorage.getItem(STORAGE_ADMIN_SLOT_KEY);
    if (raw) adminRecord = JSON.parse(raw);
  } catch {
    return { success: false, error: 'Could not access admin record.' };
  }

  if (!adminRecord) {
    return { success: false, error: 'No admin account configured.' };
  }

  if (adminRecord.pin_hash !== pinHash) {
    return { success: false, error: 'Security PIN is incorrect.' };
  }

  adminRecord.password_hash = newPasswordHash;
  localStorage.setItem(STORAGE_ADMIN_SLOT_KEY, JSON.stringify(adminRecord));

  // Sync to Supabase if possible
  try {
    await supabase
      .from('admin_users')
      .update({ password_hash: newPasswordHash })
      .eq('email', adminRecord.email);
  } catch {
    // Non-blocking
  }

  return { success: true };
}

/**
 * Retrieves the currently active admin session
 */
export function getActiveAdminSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_ADMIN_SESSION_KEY);
    if (!raw) return null;
    const session: AdminSession = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      logoutAdminSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

/**
 * Logs out the admin session
 */
export function logoutAdminSession(): void {
  try {
    localStorage.removeItem(STORAGE_ADMIN_SESSION_KEY);
  } catch {
    // Non-blocking
  }
}

/**
 * Fetches all bookings and inquiries, combining Supabase and local storage
 */
export async function fetchAllBookings(): Promise<BookingRecord[]> {
  const bookingsMap = new Map<string, BookingRecord>();
  const deletedIds = getDeletedBookingIds();

  // 1. Fetch from Local Storage buffer
  try {
    const rawLocal = localStorage.getItem(STORAGE_ADMIN_BOOKINGS_KEY);
    if (rawLocal) {
      const localList: any[] = JSON.parse(rawLocal);
      localList.forEach((item, index) => {
        const id = item.id || `LOCAL-${index}-${item.phone}`;
        if (deletedIds.has(id)) return;
        bookingsMap.set(id, {
          id,
          name: item.name || 'Anonymous Customer',
          phone: item.phone || '',
          email: item.email || '',
          message: item.message || '',
          source: item.source || 'Website Booking / Direct Enquiry',
          dpdp_consent: Boolean(item.dpdp_consent),
          status: item.status || 'new',
          admin_notes: item.admin_notes || '',
          created_at: item.created_at || item.saved_at || new Date().toISOString(),
        });
      });
    }
  } catch {
    // Non-blocking
  }

  // 2. Fetch from Supabase 'inquiries' table
  try {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      data.forEach((row: any) => {
        const id = row.id || `SUPA-${row.phone}-${row.created_at}`;
        if (deletedIds.has(id)) return;
        bookingsMap.set(id, {
          id,
          name: row.name || 'Anonymous Customer',
          phone: row.phone || '',
          email: row.email || '',
          message: row.message || '',
          source: row.source || 'Website Booking / Direct Enquiry',
          dpdp_consent: Boolean(row.dpdp_consent),
          status: row.status || 'new',
          admin_notes: row.admin_notes || '',
          created_at: row.created_at || new Date().toISOString(),
        });
      });
    }
  } catch {
    // Supabase table not created yet or offline
  }

  const allList = Array.from(bookingsMap.values());
  // Sort descending by created_at
  allList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return allList;
}

/**
 * Updates a booking's status or notes
 */
export async function updateBookingRecord(
  id: string,
  updates: { status?: BookingRecord['status']; admin_notes?: string }
): Promise<boolean> {
  // Update local storage backup
  try {
    const rawLocal = localStorage.getItem(STORAGE_ADMIN_BOOKINGS_KEY);
    if (rawLocal) {
      const localList: any[] = JSON.parse(rawLocal);
      const updatedList = localList.map((item) => {
        if (item.id === id || (item.phone && id.includes(item.phone))) {
          return { ...item, ...updates };
        }
        return item;
      });
      localStorage.setItem(STORAGE_ADMIN_BOOKINGS_KEY, JSON.stringify(updatedList));
    }
  } catch {
    // Non-blocking
  }

  // Update Supabase
  try {
    await supabase.from('inquiries').update(updates).eq('id', id);
  } catch {
    // Non-blocking
  }

  return true;
}

/**
 * Adds a manual booking entry (e.g. walk-in customer or phone order)
 */
export async function createManualBookingRecord(data: {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  source?: string;
  status: BookingRecord['status'];
  admin_notes?: string;
}): Promise<BookingRecord> {
  const newBooking: BookingRecord = {
    id: `MANUAL-${Date.now()}`,
    name: data.name.trim(),
    phone: data.phone.trim(),
    email: data.email?.trim() || '',
    message: data.message?.trim() || '',
    source: data.source || 'Direct Call / Manual Booking',
    dpdp_consent: true,
    status: data.status,
    admin_notes: data.admin_notes || '',
    created_at: new Date().toISOString(),
  };

  // Save to local
  try {
    const raw = localStorage.getItem(STORAGE_ADMIN_BOOKINGS_KEY);
    const list: any[] = raw ? JSON.parse(raw) : [];
    list.unshift(newBooking);
    localStorage.setItem(STORAGE_ADMIN_BOOKINGS_KEY, JSON.stringify(list));
  } catch {
    // Non-blocking
  }

  // Save to Supabase
  try {
    await supabase.from('inquiries').insert([
      {
        name: newBooking.name,
        phone: newBooking.phone,
        email: newBooking.email,
        message: newBooking.message,
        source: newBooking.source,
        status: newBooking.status,
        created_at: newBooking.created_at,
      },
    ]);
  } catch {
    // Non-blocking
  }

  return newBooking;
}

/**
 * Deletes a single booking / inquiry record from both local cache and Supabase
 */
export async function deleteBookingRecord(id: string): Promise<boolean> {
  // 1. Mark in permanent deleted set so it never reappears on re-fetch
  markBookingIdsAsDeleted([id]);

  // 2. Remove from Local Storage buffer
  try {
    const raw = localStorage.getItem(STORAGE_ADMIN_BOOKINGS_KEY);
    if (raw) {
      const list: any[] = JSON.parse(raw);
      const filtered = list.filter((item) => item.id !== id && !id.includes(item.id || '___'));
      localStorage.setItem(STORAGE_ADMIN_BOOKINGS_KEY, JSON.stringify(filtered));
    }
  } catch {
    // Non-blocking
  }

  // 3. Attempt Supabase delete
  try {
    // If id is standard Supabase UUID or id
    if (!id.startsWith('LOCAL-') && !id.startsWith('MANUAL-') && !id.startsWith('SUPA-')) {
      await supabase.from('inquiries').delete().eq('id', id);
    } else if (id.startsWith('SUPA-')) {
      // It might be formatted as SUPA-phone-created_at
      const parts = id.split('-');
      if (parts.length >= 2) {
        const phone = parts[1];
        await supabase.from('inquiries').delete().eq('phone', phone);
      }
    }
  } catch {
    // Non-blocking
  }

  return true;
}

/**
 * Deletes multiple bookings / inquiries in batch
 */
export async function deleteMultipleBookings(ids: string[]): Promise<{ count: number }> {
  if (ids.length === 0) return { count: 0 };

  // 1. Mark in permanent deleted set
  markBookingIdsAsDeleted(ids);

  // 2. Remove from local storage buffer
  try {
    const raw = localStorage.getItem(STORAGE_ADMIN_BOOKINGS_KEY);
    if (raw) {
      const list: any[] = JSON.parse(raw);
      const idSet = new Set(ids);
      const filtered = list.filter((item) => !idSet.has(item.id));
      localStorage.setItem(STORAGE_ADMIN_BOOKINGS_KEY, JSON.stringify(filtered));
    }
  } catch {
    // Non-blocking
  }

  // 3. Delete from Supabase for valid UUID/ID records
  try {
    const validIds = ids.filter(
      (id) => !id.startsWith('LOCAL-') && !id.startsWith('MANUAL-') && !id.startsWith('SUPA-')
    );
    if (validIds.length > 0) {
      await supabase.from('inquiries').delete().in('id', validIds);
    }
  } catch {
    // Non-blocking
  }

  return { count: ids.length };
}

/**
 * Deletes inquiries older than a specified number of days (or matching status)
 */
export async function deleteOldInquiries(
  daysOld: number,
  statusFilter?: string
): Promise<{ count: number; deletedIds: string[] }> {
  const allBookings = await fetchAllBookings();
  const cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000;

  const toDelete = allBookings.filter((b) => {
    const itemTime = new Date(b.created_at).getTime();
    const isOldEnough = itemTime < cutoffTime;
    if (statusFilter && statusFilter !== 'all') {
      return isOldEnough && b.status === statusFilter;
    }
    return isOldEnough;
  });

  const ids = toDelete.map((b) => b.id);
  await deleteMultipleBookings(ids);

  return { count: ids.length, deletedIds: ids };
}

