import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Lock,
  UserCheck,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  Phone,
  Mail,
  MessageSquare,
  FileSpreadsheet,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  LogOut,
  Sparkles,
  Package,
  Trash2,
  AlertTriangle,
  CheckSquare,
  Square,
  Shield,
  Settings,
} from 'lucide-react';
import {
  checkAdminSlotStatus,
  loginAdmin,
  loginWithPin,
  getActiveAdminSession,
  updateAdminCredentials,
  resetAdminPasswordWithPIN,
  logoutAdminSession,
  fetchAllBookings,
  updateBookingRecord,
  createManualBookingRecord,
  deleteBookingRecord,
  deleteMultipleBookings,
  deleteOldInquiries,
  AUTHORIZED_MASTER_EMAIL,
  AUTHORIZED_MASTER_NAME,
  DEFAULT_INITIAL_MASTER_PASSWORD,
  DEFAULT_INITIAL_MASTER_PIN,
  AdminSession,
  BookingRecord,
} from '../lib/adminAuth';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({ isOpen, onClose }) => {
  // Session & Slot status
  const [session, setSession] = useState<AdminSession | null>(null);
  const [claimedEmail, setClaimedEmail] = useState<string>(AUTHORIZED_MASTER_EMAIL);
  const [loadingInitial, setLoadingInitial] = useState(false);

  // Auth Forms State: 'login' (Password), 'unlock_pin' (PIN), 'forgot_pin' (Reset)
  const [authMode, setAuthMode] = useState<'login' | 'unlock_pin' | 'forgot_pin'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);

  // Login & PIN Fields
  const [loginEmail, setLoginEmail] = useState(AUTHORIZED_MASTER_EMAIL);
  const [loginPassword, setLoginPassword] = useState('');
  const [unlockPin, setUnlockPin] = useState('');

  // Forgot PIN Fields
  const [resetPin, setResetPin] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');

  // Security Credentials Modal
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [credCurrent, setCredCurrent] = useState('');
  const [credNewPassword, setCredNewPassword] = useState('');
  const [credNewPin, setCredNewPin] = useState('');
  const [credSubmitting, setCredSubmitting] = useState(false);
  const [credMsg, setCredMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Dashboard State
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  // Manual Booking Modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualModel, setManualModel] = useState('Samriddhi Premium 500+ Units');
  const [manualMessage, setManualMessage] = useState('');
  const [manualStatus, setManualStatus] = useState<BookingRecord['status']>('new');
  const [manualNotes, setManualNotes] = useState('');

  // Delete & Purge States
  const [itemToDelete, setItemToDelete] = useState<BookingRecord | null>(null);
  const [isDeletingSingle, setIsDeletingSingle] = useState(false);
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgeDays, setPurgeDays] = useState<number>(30);
  const [purgeStatusFilter, setPurgeStatusFilter] = useState<string>('all');
  const [isPurging, setIsPurging] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeletingBatch, setIsDeletingBatch] = useState(false);

  // Auto-dismiss feedback toast
  useEffect(() => {
    if (!feedbackToast) return;
    const timer = setTimeout(() => {
      setFeedbackToast(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [feedbackToast]);

  // CRITICAL SECURITY ENFORCEMENT:
  // Every time the admin panel opens or mounts, it is strictly locked with session = null and requires password.
  // Closing the panel completely closes it and destroys any session credentials.
  useEffect(() => {
    // Strictly clear any lingering session credentials on mount
    logoutAdminSession();
    setSession(null);
    setLoginPassword('');
    setUnlockPin('');
    setAuthMode('login');
    setAuthError(null);
    setAuthSuccessMsg(null);

    const init = async () => {
      try {
        const status = await checkAdminSlotStatus();
        if (status.adminEmail) {
          setClaimedEmail(status.adminEmail);
          setLoginEmail(status.adminEmail);
        }
      } catch {
        // Fallback email already initialized
      }
    };

    init();

    return () => {
      logoutAdminSession();
      setSession(null);
      setLoginPassword('');
      setUnlockPin('');
    };
  }, []);

  // Lock and close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadBookings = async () => {
    setLoadingBookings(true);
    try {
      const data = await fetchAllBookings();
      if (Array.isArray(data)) {
        setBookings(data);
      }
    } catch {
      // Non-blocking
    } finally {
      setLoadingBookings(false);
    }
  };

  // Live Auto-Refresh & Synchronization with Website Form Submissions
  useEffect(() => {
    if (!isOpen || !session) return;

    // Refresh immediately when a form is submitted
    const handleInquiryAdded = () => {
      loadBookings();
    };

    // Refresh when user returns to this window or tab
    const handleFocus = () => {
      loadBookings();
    };

    // Auto-poll every 5 seconds to ensure newly incoming submissions reflect instantly
    const interval = setInterval(() => {
      loadBookings();
    }, 5000);

    window.addEventListener('adhrit_inquiry_added', handleInquiryAdded);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleInquiryAdded);

    return () => {
      clearInterval(interval);
      window.removeEventListener('adhrit_inquiry_added', handleInquiryAdded);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleInquiryAdded);
    };
  }, [isOpen, session]);

  // Sign In with Master Password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const cleanPass = loginPassword.trim();
    if (!cleanPass) {
      setAuthError('Please enter your master administrator password.');
      return;
    }

    setAuthSubmitting(true);
    const res = await loginAdmin({
      email: loginEmail.trim() || AUTHORIZED_MASTER_EMAIL,
      password: cleanPass,
    });
    setAuthSubmitting(false);

    if (res.success && res.session) {
      setSession(res.session);
      setLoginPassword('');
      loadBookings();
    } else {
      setAuthError('Invalid password.');
    }
  };

  // Sign In with 4-Digit Security PIN
  const handlePinUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const cleanPin = unlockPin.trim();
    if (!cleanPin) {
      setAuthError('Please enter your 4-digit Master Security PIN.');
      return;
    }

    setAuthSubmitting(true);
    const res = await loginWithPin(cleanPin);
    setAuthSubmitting(false);

    if (res.success && res.session) {
      setSession(res.session);
      setUnlockPin('');
      loadBookings();
    } else {
      setAuthError('Invalid Security PIN.');
    }
  };

  // Reset Password via PIN
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!resetPin.trim() || !resetNewPassword.trim()) {
      setAuthError('Please provide both your Security PIN and new password.');
      return;
    }

    if (resetNewPassword.length < 6) {
      setAuthError('New password must be at least 6 characters.');
      return;
    }

    setAuthSubmitting(true);
    const res = await resetAdminPasswordWithPIN(resetPin, resetNewPassword);
    setAuthSubmitting(false);

    if (res.success) {
      setAuthSuccessMsg(`Password reset successfully to "${resetNewPassword}"! You can now unlock with your new password.`);
      setLoginPassword(resetNewPassword);
      setAuthMode('login');
      setResetPin('');
      setResetNewPassword('');
    } else {
      setAuthError(res.error || 'Invalid Security PIN. Please verify your 4-digit PIN.');
    }
  };

  // Change Admin Credentials (Password & PIN)
  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredMsg(null);

    if (!credCurrent.trim()) {
      setCredMsg({ type: 'error', text: 'Please enter your current Password or Security PIN.' });
      return;
    }

    if (!credNewPassword.trim() && !credNewPin.trim()) {
      setCredMsg({ type: 'error', text: 'Please provide either a new password or a new PIN.' });
      return;
    }

    if (credNewPassword && credNewPassword.length < 6) {
      setCredMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    if (credNewPin && credNewPin.length < 4) {
      setCredMsg({ type: 'error', text: 'New Security PIN must be at least 4 digits.' });
      return;
    }

    setCredSubmitting(true);
    const res = await updateAdminCredentials({
      currentPasswordOrPin: credCurrent,
      newPassword: credNewPassword.trim() || undefined,
      newPin: credNewPin.trim() || undefined,
    });
    setCredSubmitting(false);

    if (res.success) {
      setCredMsg({ type: 'success', text: 'Credentials updated and secured successfully!' });
      setCredCurrent('');
      setCredNewPassword('');
      setCredNewPin('');
      setFeedbackToast({ type: 'success', text: 'Master admin credentials updated successfully.' });
      setTimeout(() => {
        setShowSecurityModal(false);
        setCredMsg(null);
      }, 1500);
    } else {
      setCredMsg({ type: 'error', text: res.error || 'Current credentials verification failed.' });
    }
  };

  // Lock Terminal / Logout
  const handleLockTerminal = () => {
    logoutAdminSession();
    setSession(null);
    setLoginPassword('');
    setUnlockPin('');
    setAuthMode('login');
    setAuthSuccessMsg('Operations terminal locked. Password is required to re-open.');
  };

  // Close Modal: Automatically locks the terminal so credentials are required on reopen
  const handleCloseModal = () => {
    handleLockTerminal();
    onClose();
  };

  // Status Change
  const handleStatusChange = async (id: string, newStatus: BookingRecord['status']) => {
    // Optimistic UI update
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
    await updateBookingRecord(id, { status: newStatus });
  };

  // Save Notes
  const handleSaveNotes = async (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, admin_notes: noteDraft } : b))
    );
    await updateBookingRecord(id, { admin_notes: noteDraft });
    setEditingNotesId(null);
  };

  // Add Manual Booking
  const handleCreateManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualPhone.trim()) {
      alert('Customer Name and Phone Number are required.');
      return;
    }

    const created = await createManualBookingRecord({
      name: manualName,
      phone: manualPhone,
      email: manualEmail,
      source: manualModel,
      message: manualMessage,
      status: manualStatus,
      admin_notes: manualNotes,
    });

    setBookings((prev) => [created, ...prev]);
    setShowManualModal(false);
    // Reset
    setManualName('');
    setManualPhone('');
    setManualEmail('');
    setManualMessage('');
    setManualNotes('');
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (bookings.length === 0) {
      alert('No bookings to export.');
      return;
    }

    const headers = [
      'Booking ID',
      'Date & Time',
      'Customer Name',
      'Phone Number',
      'Email',
      'Model / Source',
      'Customer Message',
      'Status',
      'Admin Remarks',
    ];

    const rows = bookings.map((b) => [
      `"${b.id}"`,
      `"${new Date(b.created_at).toLocaleString('en-IN')}"`,
      `"${b.name.replace(/"/g, '""')}"`,
      `"${b.phone}"`,
      `"${b.email || ''}"`,
      `"${(b.source || '').replace(/"/g, '""')}"`,
      `"${(b.message || '').replace(/"/g, '""')}"`,
      `"${b.status}"`,
      `"${(b.admin_notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `adhrit_samriddhi_bookings_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Single Delete Confirmation
  const handleConfirmSingleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeletingSingle(true);
    const targetId = itemToDelete.id;
    const targetName = itemToDelete.name;
    const success = await deleteBookingRecord(targetId);
    setIsDeletingSingle(false);

    if (success) {
      setBookings((prev) => prev.filter((b) => b.id !== targetId));
      setItemToDelete(null);
      setFeedbackToast({
        type: 'success',
        text: `Inquiry from "${targetName}" deleted successfully.`,
      });
    } else {
      setFeedbackToast({
        type: 'error',
        text: 'Could not delete inquiry. Please try again.',
      });
    }
  };

  // Purge Old Inquiries
  const handlePurgeOldInquiries = async () => {
    setIsPurging(true);
    const res = await deleteOldInquiries(purgeDays, purgeStatusFilter);
    setIsPurging(false);
    setShowPurgeModal(false);

    if (res.count > 0) {
      const deletedSet = new Set(res.deletedIds);
      setBookings((prev) => prev.filter((b) => !deletedSet.has(b.id)));
      setFeedbackToast({
        type: 'success',
        text: `Purged ${res.count} old inquiries (${purgeDays}+ days old) successfully.`,
      });
    } else {
      setFeedbackToast({
        type: 'error',
        text: 'No inquiries found matching this age criteria.',
      });
    }
  };

  // Delete Multi-Selected Inquiries
  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Are you sure you want to permanently delete ${selectedIds.size} selected inquiries? This cannot be undone.`)) {
      return;
    }

    setIsDeletingBatch(true);
    const ids: string[] = Array.from(selectedIds);
    await deleteMultipleBookings(ids);
    setIsDeletingBatch(false);

    setBookings((prev) => prev.filter((b) => !selectedIds.has(b.id)));
    setFeedbackToast({
      type: 'success',
      text: `Deleted ${ids.length} selected inquiries.`,
    });
    setSelectedIds(new Set());
    setMultiSelectMode(false);
  };

  // Toggle Selection
  const toggleSelectId = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Select all / Deselect all filtered
  const toggleSelectAllFiltered = () => {
    if (selectedIds.size === filteredBookings.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredBookings.map((b) => b.id)));
    }
  };

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Status filter
      if (statusFilter !== 'all' && b.status !== statusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = b.name.toLowerCase().includes(q);
        const matchesPhone = b.phone.toLowerCase().includes(q);
        const matchesEmail = (b.email || '').toLowerCase().includes(q);
        const matchesSource = (b.source || '').toLowerCase().includes(q);
        const matchesMessage = (b.message || '').toLowerCase().includes(q);
        return matchesName || matchesPhone || matchesEmail || matchesSource || matchesMessage;
      }
      return true;
    });
  }, [bookings, statusFilter, searchQuery]);

  // Status Counts
  const counts = useMemo(() => {
    return {
      total: bookings.length,
      new: bookings.filter((b) => b.status === 'new').length,
      contacted: bookings.filter((b) => b.status === 'contacted' || b.status === 'quote_sent').length,
      confirmed: bookings.filter((b) => b.status === 'confirmed' || b.status === 'completed').length,
    };
  }, [bookings]);

  // Matching inquiries count for age-based deletion purge
  const purgeCandidateCount = useMemo(() => {
    const cutoff = Date.now() - purgeDays * 24 * 60 * 60 * 1000;
    return bookings.filter((b) => {
      const itemTime = new Date(b.created_at).getTime();
      const isOld = itemTime < cutoff;
      if (purgeStatusFilter !== 'all') {
        return isOld && b.status === purgeStatusFilter;
      }
      return isOld;
    }).length;
  }, [bookings, purgeDays, purgeStatusFilter]);

  if (!isOpen) return null;

  return (
    <div
      id="admin-panel-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleCloseModal();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#1A1A1A]/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="admin-panel-container"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-[#FDFBF7] text-[#1A1A1A] rounded-2xl shadow-2xl border border-[#C5A05940] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-[#1A1A1A] text-[#FDFBF7] flex items-center justify-between border-b border-[#C5A05930] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#C5A059]/20 border border-[#C5A05940] flex items-center justify-center text-[#C5A059]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A059] font-sans">
                  Adhrit Industries
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-[#FDFBF780] font-mono">
                  Master Portal
                </span>
              </div>
              <h2 className="font-serif text-lg sm:text-xl text-[#FDFBF7] font-medium leading-tight">
                {session ? 'Admin Operations & Bookings Manager' : 'Master Administrator Access'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {session && (
              <>
                <button
                  type="button"
                  onClick={() => setShowSecurityModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#C5A05960] bg-[#C5A05915] hover:bg-[#C5A05925] text-[#C5A059] text-xs font-sans transition-colors cursor-pointer"
                  title="Update Administrator Password & Master PIN"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline font-semibold">Security & PIN</span>
                </button>

                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-300 hover:bg-red-500/20 text-xs font-sans transition-colors cursor-pointer"
                  title="Lock Admin Terminal & Close"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Lock & Close</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleCloseModal}
              id="admin-modal-close-btn"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#FDFBF7] text-xs font-semibold transition-colors cursor-pointer"
              aria-label="Close and Lock"
              title="Close Admin Panel"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto">
          {loadingInitial ? (
            <div className="py-24 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#C5A059] animate-spin mx-auto" />
              <p className="text-xs text-[#1A1A1A]/70 uppercase tracking-widest font-sans">
                Verifying Security Credentials...
              </p>
            </div>
          ) : session ? (
            /* =======================================================
               LOGGED IN: ADMIN DASHBOARD
               ======================================================= */
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
              {/* Profile & Control Toolbar */}
              <div className="p-4 rounded-xl bg-white border border-[#C5A05925] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#4A5D4E]/10 border border-[#4A5D4E]/20 text-[#4A5D4E] flex items-center justify-center font-bold text-base">
                    {session.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-base text-[#1A1A1A] font-semibold">
                        Admin Panel
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#4A5D4E]/15 text-[#4A5D4E] font-bold uppercase tracking-wider">
                        Master Admin
                      </span>
                    </div>
                    <p className="text-xs text-[#1A1A1A]/60 font-sans">
                      {session.email} • Authenticated Session
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={loadBookings}
                    disabled={loadingBookings}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#1A1A1A20] hover:bg-[#1A1A1A08] text-xs font-semibold text-[#1A1A1A] transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingBookings ? 'animate-spin text-[#C5A059]' : ''}`} />
                    <span>{loadingBookings ? 'Syncing...' : 'Refresh'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPurgeModal(true)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-semibold text-red-700 transition-colors cursor-pointer"
                    title="Clean up or delete old inquiries by age and status"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    <span>Delete Old Inquiries</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMultiSelectMode(!multiSelectMode);
                      setSelectedIds(new Set());
                    }}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                      multiSelectMode
                        ? 'bg-amber-100 border-amber-300 text-amber-900'
                        : 'border-[#1A1A1A20] hover:bg-[#1A1A1A08] text-[#1A1A1A]'
                    }`}
                    title="Select specific inquiries to delete"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>{multiSelectMode ? 'Exit Select' : 'Select'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#C5A059] bg-[#C5A059]/10 hover:bg-[#C5A059]/20 text-xs font-semibold text-[#1A1A1A] transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowManualModal(true)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#1A1A1A] hover:bg-[#4A5D4E] text-white text-xs font-bold tracking-wider uppercase transition-colors shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>+ Add Booking</span>
                  </button>
                </div>
              </div>

              {/* Action Feedback Banner */}
              {feedbackToast && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200 shadow-sm ${
                    feedbackToast.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {feedbackToast.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span className="font-medium font-sans">{feedbackToast.text}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFeedbackToast(null)}
                    className="text-xs font-bold opacity-60 hover:opacity-100 cursor-pointer p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Multi-Select Action Bar */}
              {multiSelectMode && (
                <div className="p-3.5 bg-amber-50/90 border border-amber-300 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-amber-950 shadow-xs">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={toggleSelectAllFiltered}
                      className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 font-bold hover:bg-amber-100 transition-colors cursor-pointer text-xs"
                    >
                      {selectedIds.size === filteredBookings.length ? 'Deselect All' : `Select All (${filteredBookings.length})`}
                    </button>
                    <span className="font-sans font-medium">
                      <strong>{selectedIds.size}</strong> of {filteredBookings.length} inquiries selected
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={selectedIds.size === 0 || isDeletingBatch}
                      onClick={handleDeleteSelected}
                      className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isDeletingBatch ? 'Deleting...' : `Delete Selected (${selectedIds.size})`}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMultiSelectMode(false);
                        setSelectedIds(new Set());
                      }}
                      className="px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-amber-800 hover:bg-amber-100 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* KPI Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-xl bg-white border border-[#C5A05925] shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/60 block font-sans">
                    Total Bookings
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-serif text-2xl sm:text-3xl font-semibold text-[#1A1A1A]">
                      {counts.total}
                    </span>
                    <span className="text-[11px] text-[#1A1A1A]/50">All Records</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#C5A05925] shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block font-sans">
                    New Enquiries
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-serif text-2xl sm:text-3xl font-semibold text-blue-900">
                      {counts.new}
                    </span>
                    <span className="text-[11px] text-blue-600 font-medium">Pending action</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#C5A05925] shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block font-sans">
                    In Discussion
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-serif text-2xl sm:text-3xl font-semibold text-amber-900">
                      {counts.contacted}
                    </span>
                    <span className="text-[11px] text-amber-600 font-medium">Contacted / Quoted</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#C5A05925] shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 block font-sans">
                    Confirmed Orders
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-serif text-2xl sm:text-3xl font-semibold text-green-900">
                      {counts.confirmed}
                    </span>
                    <span className="text-[11px] text-green-600 font-medium">Ready / Dispatched</span>
                  </div>
                </div>
              </div>

              {/* Filters & Search Row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#C5A05920]">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#1A1A1A]/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by customer name, phone, email, product..."
                    className="w-full pl-9 pr-4 py-2 bg-[#FDFBF7] border border-[#1A1A1A10] rounded-lg text-xs text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 focus:outline-none focus:border-[#C5A059]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                  <span className="text-[11px] font-bold text-[#1A1A1A]/60 uppercase tracking-wider shrink-0 flex items-center gap-1 font-sans">
                    <Filter className="w-3 h-3 text-[#C5A059]" />
                    <span>Filter:</span>
                  </span>
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'new', label: 'New' },
                    { key: 'contacted', label: 'Contacted' },
                    { key: 'quote_sent', label: 'Quote Sent' },
                    { key: 'confirmed', label: 'Confirmed' },
                    { key: 'completed', label: 'Completed' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setStatusFilter(tab.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                        statusFilter === tab.key
                          ? 'bg-[#1A1A1A] text-white'
                          : 'bg-[#FDFBF7] text-[#1A1A1A]/70 hover:bg-[#1A1A1A08]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bookings List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#1A1A1A]/70 px-1 font-sans">
                  <span>
                    Showing <strong>{filteredBookings.length}</strong> of{' '}
                    <strong>{bookings.length}</strong> bookings & wholesale leads
                  </span>
                  <span className="text-[11px] text-[#C5A059] font-medium">
                    Integrated with Supabase Backend + Local Storage
                  </span>
                </div>

                {filteredBookings.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-[#C5A05920] space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#C5A059]/10 text-[#C5A059] flex items-center justify-center mx-auto">
                      <Package className="w-6 h-6" />
                    </div>
                    <h4 className="font-serif text-lg text-[#1A1A1A]">No Bookings Found</h4>
                    <p className="text-xs text-[#1A1A1A]/60 max-w-sm mx-auto font-sans">
                      {searchQuery || statusFilter !== 'all'
                        ? 'No bookings match your current filter criteria. Try resetting filters.'
                        : 'No website bookings or enquiries have been recorded yet. Any enquiry submitted via the website form will appear here instantly.'}
                    </p>
                  </div>
                ) : (
                  filteredBookings.map((b) => {
                    const isExpanded = expandedBookingId === b.id;
                    const dateFormatted = new Date(b.created_at).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    const whatsappUrl = `https://wa.me/91${b.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Hello ${b.name}, thank you for your enquiry with Adhrit Industries regarding ${b.source}. We are pleased to assist you.`
                    )}`;

                    return (
                      <div
                        key={b.id}
                        className="bg-white rounded-xl border border-[#C5A05925] shadow-xs overflow-hidden transition-all duration-200 hover:border-[#C5A05960]"
                      >
                        {/* Main Item Row */}
                        <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          {/* Multi-select checkbox */}
                          {multiSelectMode && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSelectId(b.id);
                              }}
                              className="self-start lg:self-center p-1 text-[#1A1A1A] hover:text-[#C5A059] cursor-pointer shrink-0 transition-transform active:scale-95"
                              title={selectedIds.has(b.id) ? 'Deselect inquiry' : 'Select inquiry'}
                            >
                              {selectedIds.has(b.id) ? (
                                <CheckSquare className="w-5 h-5 text-red-600" />
                              ) : (
                                <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                              )}
                            </button>
                          )}

                          {/* Left Column: Customer & Source */}
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-mono text-[#C5A059] font-bold">
                                {b.id.startsWith('MANUAL-')
                                  ? 'OFFLINE ORDER'
                                  : b.id.startsWith('ADH-')
                                  ? b.id
                                  : `ADH-${b.id.slice(0, 8)}`}
                              </span>
                              <span className="text-[11px] text-[#1A1A1A]/40">•</span>
                              <span className="text-xs text-[#1A1A1A]/60 flex items-center gap-1 font-sans">
                                <Calendar className="w-3 h-3 text-[#C5A059]" />
                                {dateFormatted}
                              </span>
                            </div>

                            <h4 className="font-serif text-lg text-[#1A1A1A] font-semibold truncate">
                              {b.name}
                            </h4>

                            <div className="flex flex-wrap items-center gap-3 text-xs font-sans">
                              <a
                                href={`tel:${b.phone}`}
                                className="inline-flex items-center gap-1 font-semibold text-[#1A1A1A] hover:text-[#4A5D4E] transition-colors"
                              >
                                <Phone className="w-3.5 h-3.5 text-[#C5A059]" />
                                <span>{b.phone}</span>
                              </a>

                              {b.email && (
                                <a
                                  href={`mailto:${b.email}`}
                                  className="inline-flex items-center gap-1 text-[#1A1A1A]/70 hover:text-[#1A1A1A] transition-colors"
                                >
                                  <Mail className="w-3.5 h-3.5 text-[#C5A059]" />
                                  <span>{b.email}</span>
                                </a>
                              )}

                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FDFBF7] border border-[#C5A05930] text-[11px] text-[#1A1A1A]/80">
                                <Package className="w-3 h-3 text-[#C5A059]" />
                                <span>{b.source}</span>
                              </span>
                            </div>
                          </div>

                          {/* Middle: Actions (WhatsApp & Call) */}
                          <div className="flex items-center gap-2">
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>

                            <a
                              href={`tel:${b.phone}`}
                              className="px-3 py-1.5 rounded-lg border border-[#1A1A1A20] hover:bg-[#1A1A1A08] text-[#1A1A1A] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                              title="Call Customer"
                            >
                              <Phone className="w-3.5 h-3.5 text-[#C5A059]" />
                              <span>Call</span>
                            </a>
                          </div>

                          {/* Right: Status Selector */}
                          <div className="flex items-center gap-2 sm:self-auto">
                            <select
                              value={b.status}
                              onChange={(e) =>
                                handleStatusChange(b.id, e.target.value as BookingRecord['status'])
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border cursor-pointer focus:outline-none transition-colors ${
                                b.status === 'new'
                                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                                  : b.status === 'contacted'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : b.status === 'quote_sent'
                                  ? 'bg-purple-50 text-purple-800 border-purple-300'
                                  : b.status === 'confirmed'
                                  ? 'bg-green-50 text-green-800 border-green-300'
                                  : b.status === 'completed'
                                  ? 'bg-gray-100 text-gray-800 border-gray-300'
                                  : 'bg-red-50 text-red-800 border-red-300'
                              }`}
                            >
                              <option value="new">● New Lead</option>
                              <option value="contacted">● Contacted</option>
                              <option value="quote_sent">● Quote Sent</option>
                              <option value="confirmed">● Order Confirmed</option>
                              <option value="completed">● Delivered / Closed</option>
                              <option value="cancelled">● Cancelled</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => setExpandedBookingId(isExpanded ? null : b.id)}
                              className="p-1.5 rounded-lg border border-[#1A1A1A15] hover:bg-[#1A1A1A05] text-[#1A1A1A]/70"
                              title="Toggle Details & Notes"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => setItemToDelete(b)}
                              className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-400 hover:text-red-700 transition-colors cursor-pointer"
                              title="Delete this inquiry"
                              aria-label={`Delete inquiry from ${b.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Collapsible Details & Notes Area */}
                        {isExpanded && (
                          <div className="px-5 py-4 bg-[#FDFBF7] border-t border-[#C5A05920] space-y-3 text-xs">
                            {b.message && (
                              <div>
                                <span className="font-bold text-[#1A1A1A]/70 uppercase tracking-wider text-[10px] block mb-1">
                                  Customer Inquiry Message:
                                </span>
                                <p className="p-3 bg-white rounded-lg border border-[#1A1A1A10] text-[#1A1A1A] font-sans leading-relaxed">
                                  {b.message}
                                </p>
                              </div>
                            )}

                            {/* Internal Admin Remarks */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-[#1A1A1A]/70 uppercase tracking-wider text-[10px]">
                                  Internal Admin Notes & Dispatch Remarks:
                                </span>
                                {editingNotesId !== b.id && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingNotesId(b.id);
                                      setNoteDraft(b.admin_notes || '');
                                    }}
                                    className="text-[11px] text-[#C5A059] font-bold hover:underline"
                                  >
                                    {b.admin_notes ? 'Edit Notes' : '+ Add Note'}
                                  </button>
                                )}
                              </div>

                              {editingNotesId === b.id ? (
                                <div className="space-y-2">
                                  <textarea
                                    value={noteDraft}
                                    onChange={(e) => setNoteDraft(e.target.value)}
                                    placeholder="Enter internal follow-up notes, negotiated price per unit, expected delivery date, transporter name..."
                                    rows={3}
                                    className="w-full p-2.5 bg-white rounded-lg border border-[#C5A059] text-xs text-[#1A1A1A] focus:outline-none"
                                  />
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleSaveNotes(b.id)}
                                      className="px-3 py-1 bg-[#1A1A1A] text-white rounded text-xs font-bold"
                                    >
                                      Save Note
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingNotesId(null)}
                                      className="px-3 py-1 border border-[#1A1A1A20] rounded text-xs"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="p-2.5 bg-white rounded-lg border border-[#1A1A1A10] text-[#1A1A1A]/80 italic">
                                  {b.admin_notes || 'No internal notes added yet.'}
                                </p>
                              )}
                            </div>

                            {/* Bottom metadata and delete action */}
                            <div className="pt-2.5 border-t border-[#C5A05920] flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2 text-[11px] text-[#1A1A1A]/50 font-sans">
                                <span>Consent: {b.dpdp_consent ? '✓ Verified (Explicit)' : 'Implicit Website Form'}</span>
                                <span>•</span>
                                <span>Source: {b.source}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setItemToDelete(b)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors text-xs font-semibold cursor-pointer shadow-2xs"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete This Inquiry</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* =======================================================
               LOGGED OUT: STRICT AUTHENTICATION REQUIRED (NO BYPASS)
               ======================================================= */
            <div className="p-6 sm:p-10 max-w-xl mx-auto space-y-6">
              {/* Security Shield Banner */}
              <div className="p-4 rounded-xl bg-white border border-[#C5A05930] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs text-[#1A1A1A]">
                    <div className="w-6 h-6 rounded-full bg-[#4A5D4E]/10 flex items-center justify-center text-[#4A5D4E]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <span>Designated Master Administrator</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#4A5D4E]/15 text-[#4A5D4E]">
                    Single Account (1/1)
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#FDFBF7] border border-[#1A1A1A10] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span className="text-xs font-mono font-semibold text-[#1A1A1A]">
                      {claimedEmail}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                    Registration Closed
                  </span>
                </div>

                <p className="text-[11px] text-[#1A1A1A]/70 leading-relaxed font-sans">
                  This terminal controls wholesale bookings and customer inquiries. Public registration is prohibited. Enter your credentials below to unlock access.
                </p>
              </div>

              {/* Mode Switcher Tabs */}
              {authMode !== 'forgot_pin' && (
                <div className="grid grid-cols-2 gap-2 p-1 bg-[#1A1A1A08] rounded-xl border border-[#1A1A1A10]">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setAuthError(null);
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      authMode === 'login'
                        ? 'bg-white text-[#1A1A1A] shadow-xs border border-[#1A1A1A15]'
                        : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Master Password</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('unlock_pin');
                      setAuthError(null);
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      authMode === 'unlock_pin'
                        ? 'bg-white text-[#1A1A1A] shadow-xs border border-[#1A1A1A15]'
                        : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 text-[#4A5D4E]" />
                    <span>4-Digit PIN Unlock</span>
                  </button>
                </div>
              )}

              {/* Error or Success message */}
              {authError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{authError}</span>
                </div>
              )}

              {authSuccessMsg && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                  <span>{authSuccessMsg}</span>
                </div>
              )}

              {/* Forms according to authMode */}
              {authMode === 'login' ? (
                /* ================= PASSWORD UNLOCK FORM ================= */
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-serif text-xl text-[#1A1A1A] font-semibold">
                      Admin Panel
                    </h3>
                    <p className="text-xs text-[#1A1A1A]/70 font-sans">
                      Enter the master administrator password for {claimedEmail}.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1A1A1A]/80">
                          Master Password
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('forgot_pin');
                            setAuthError(null);
                          }}
                          className="text-[11px] text-[#C5A059] font-semibold hover:underline cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          autoFocus
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Enter your master password"
                          className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#1A1A1A20] text-sm focus:outline-none focus:border-[#C5A059] pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black cursor-pointer"
                          aria-label="Toggle password visibility"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={authSubmitting}
                      className="flex-1 py-3.5 px-6 bg-[#1A1A1A] hover:bg-[#4A5D4E] text-white text-xs font-bold tracking-widest uppercase transition-all rounded-lg shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      <KeyRound className="w-4 h-4 text-[#C5A059]" />
                      <span>{authSubmitting ? 'VERIFYING CREDENTIALS...' : 'UNLOCK ADMIN PANEL'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="py-3.5 px-5 bg-transparent hover:bg-[#1A1A1A08] border border-[#1A1A1A20] text-[#1A1A1A] text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </form>
              ) : authMode === 'unlock_pin' ? (
                /* ================= 4-DIGIT PIN UNLOCK FORM ================= */
                <form onSubmit={handlePinUnlock} className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-serif text-xl text-[#1A1A1A] font-semibold">
                      Unlock with 4-Digit Security PIN
                    </h3>
                    <p className="text-xs text-[#1A1A1A]/70 font-sans">
                      Enter your master 4-digit security PIN for instant access.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1A1A1A]/80">
                          4-Digit Master PIN
                        </label>
                      </div>
                      <input
                        type="password"
                        required
                        autoFocus
                        maxLength={6}
                        value={unlockPin}
                        onChange={(e) => setUnlockPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••"
                        className="w-full px-3.5 py-3 rounded-lg bg-white border border-[#1A1A1A20] text-center font-mono text-lg tracking-widest focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={authSubmitting}
                      className="flex-1 py-3.5 px-6 bg-[#1A1A1A] hover:bg-[#4A5D4E] text-white text-xs font-bold tracking-widest uppercase transition-all rounded-lg shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      <Shield className="w-4 h-4 text-[#C5A059]" />
                      <span>{authSubmitting ? 'VERIFYING PIN...' : 'UNLOCK WITH PIN'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="py-3.5 px-5 bg-transparent hover:bg-[#1A1A1A08] border border-[#1A1A1A20] text-[#1A1A1A] text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </form>
              ) : (
                /* ================= FORGOT PASSWORD / PIN RESET ================= */
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A059] font-sans">
                        Password Recovery
                      </span>
                    </div>
                    <h3 className="font-serif text-xl text-[#1A1A1A] font-semibold">
                      Reset Password using Security PIN
                    </h3>
                    <p className="text-xs text-[#1A1A1A]/70 font-sans leading-relaxed">
                      Verify your 4-digit Master Security PIN to reset your Master Password.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1A1A1A]/80">
                          4-Digit Master PIN
                        </label>
                      </div>
                      <input
                        type="password"
                        required
                        maxLength={6}
                        value={resetPin}
                        onChange={(e) => setResetPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 4-digit PIN"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#1A1A1A20] text-sm focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1A1A1A]/80">
                          New Master Password
                        </label>
                      </div>
                      <input
                        type="password"
                        required
                        value={resetNewPassword}
                        onChange={(e) => setResetNewPassword(e.target.value)}
                        placeholder="Enter new master password"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#1A1A1A20] text-sm font-mono focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={authSubmitting}
                      className="flex-1 py-3 px-6 bg-[#1A1A1A] hover:bg-[#4A5D4E] text-white text-xs font-bold tracking-widest uppercase transition-all rounded-lg cursor-pointer disabled:opacity-60"
                    >
                      {authSubmitting ? 'RESETTING...' : 'RESET MASTER PASSWORD'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setAuthError(null);
                      }}
                      className="px-4 py-3 border border-[#1A1A1A20] rounded-lg text-xs font-semibold text-[#1A1A1A] hover:bg-gray-50 cursor-pointer"
                    >
                      Back
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#FDFBF7] border-t border-[#C5A05925] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#1A1A1A]/60 font-sans shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
            <span>End-to-End TLS 1.3 & SHA-256 Encrypted Admin Session</span>
          </div>
          <div>
            <span>Adhrit Industries © 2026 • Ranchi, Jharkhand</span>
          </div>
        </div>
      </div>

      {/* Manual Booking Add Dialog */}
      {showManualModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 border border-[#C5A05930] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif text-xl text-[#1A1A1A]">Record Manual / Offline Booking</h3>
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="text-gray-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualBooking} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#1A1A1A]/80 uppercase text-[10px] mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar (Wholesale Depot)"
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1A1A1A]/80 uppercase text-[10px] mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 9876543210"
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1A1A1A]/80 uppercase text-[10px] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    placeholder="optional"
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1A1A1A]/80 uppercase text-[10px] mb-1">
                    Product / Model
                  </label>
                  <select
                    value={manualModel}
                    onChange={(e) => setManualModel(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-white"
                  >
                    <option value="Samriddhi Classic Gold - Wholesale">Samriddhi Classic Gold</option>
                    <option value="Samriddhi Deluxe Pro Jumbo - Bulk (500+ Units)">
                      Samriddhi Deluxe Pro Jumbo (500+ Units)
                    </option>
                    <option value="State Distributor Consignment (1000+ Units)">
                      Distributor Consignment (1000+ Units)
                    </option>
                    <option value="Direct Call / Custom Order">Direct Call / Custom Order</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#1A1A1A]/80 uppercase text-[10px] mb-1">
                    Initial Status
                  </label>
                  <select
                    value={manualStatus}
                    onChange={(e) => setManualStatus(e.target.value as BookingRecord['status'])}
                    className="w-full p-2.5 border rounded-lg bg-white"
                  >
                    <option value="new">New Lead</option>
                    <option value="contacted">Contacted</option>
                    <option value="quote_sent">Quote Sent</option>
                    <option value="confirmed">Order Confirmed</option>
                    <option value="completed">Completed / Delivered</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1A1A1A]/80 uppercase text-[10px] mb-1">
                  Customer Requirement / Notes
                </label>
                <textarea
                  value={manualMessage}
                  onChange={(e) => setManualMessage(e.target.value)}
                  placeholder="Quantity, delivery location, specific packing requests..."
                  rows={2}
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1A1A1A] hover:bg-[#4A5D4E] text-white rounded-lg font-bold"
                >
                  Save Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
         DELETE SINGLE INQUIRY CONFIRMATION MODAL
         ======================================================= */}
      {itemToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl border border-red-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">
                  Delete Customer Inquiry?
                </h3>
                <p className="text-xs text-[#1A1A1A]/70 font-sans leading-relaxed">
                  Are you sure you want to permanently delete this inquiry from the system?
                </p>
              </div>
            </div>

            {/* Target Inquiry Summary */}
            <div className="p-3.5 bg-red-50/60 rounded-xl border border-red-100 space-y-1.5 text-xs font-sans">
              <div className="flex justify-between">
                <span className="text-[#1A1A1A]/60">Customer:</span>
                <span className="font-bold text-[#1A1A1A]">{itemToDelete.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#1A1A1A]/60">Phone:</span>
                <span className="font-mono font-medium text-[#1A1A1A]">{itemToDelete.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#1A1A1A]/60">Inquiry ID:</span>
                <span className="font-mono text-[#C5A059] font-bold">{itemToDelete.id.slice(0, 16)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#1A1A1A]/60">Date:</span>
                <span className="text-[#1A1A1A]">
                  {new Date(itemToDelete.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
              {itemToDelete.message && (
                <div className="pt-1 border-t border-red-200/60">
                  <span className="text-[10px] uppercase font-bold text-[#1A1A1A]/50 block">Message:</span>
                  <p className="italic text-[#1A1A1A]/80 line-clamp-2 mt-0.5">"{itemToDelete.message}"</p>
                </div>
              )}
            </div>

            <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200/80 flex items-start gap-2 text-[11px] text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                This will remove the record permanently from both your local database and the Supabase cloud store.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeletingSingle}
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingSingle}
                onClick={handleConfirmSingleDelete}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeletingSingle ? 'Deleting...' : 'Permanently Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
         PURGE / CLEANUP OLD INQUIRIES MODAL
         ======================================================= */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-red-200 shadow-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">
                    Delete Old Inquiries
                  </h3>
                  <p className="text-xs text-[#1A1A1A]/60 font-sans">
                    Clean up obsolete records and maintain a tidy bookings database
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPurgeModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Age Presets */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]/80 font-sans">
                Select Age Threshold:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { days: 7, label: 'Older than 7 Days' },
                  { days: 30, label: 'Older than 30 Days' },
                  { days: 60, label: 'Older than 60 Days' },
                  { days: 90, label: 'Older than 90 Days' },
                ].map((preset) => (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => setPurgeDays(preset.days)}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-semibold text-center transition-colors cursor-pointer ${
                      purgeDays === preset.days
                        ? 'bg-red-50 border-red-400 text-red-700 ring-1 ring-red-400'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Custom Days Input */}
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs text-[#1A1A1A]/70 font-sans">Or specify custom days:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    max="3650"
                    value={purgeDays}
                    onChange={(e) => setPurgeDays(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 px-2.5 py-1 text-xs border border-gray-300 rounded-lg text-center font-bold focus:outline-none focus:border-red-400"
                  />
                  <span className="text-xs text-gray-500 font-sans">days old</span>
                </div>
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]/80 font-sans">
                Filter by Status:
              </label>
              <select
                value={purgeStatusFilter}
                onChange={(e) => setPurgeStatusFilter(e.target.value)}
                className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-medium text-[#1A1A1A] focus:outline-none focus:border-red-400"
              >
                <option value="all">Any Status (Delete all inquiries older than threshold)</option>
                <option value="completed">Only Completed / Delivered inquiries</option>
                <option value="cancelled">Only Cancelled inquiries</option>
                <option value="contacted">Only Contacted / Quoted inquiries</option>
                <option value="new">Only New / Uncontacted inquiries</option>
              </select>
            </div>

            {/* Live Matches Counter */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-600 font-sans block">
                  Records matching this cleanup rule:
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="font-serif text-2xl font-bold text-red-600">
                    {purgeCandidateCount}
                  </span>
                  <span className="text-xs text-slate-500 font-sans">
                    out of {bookings.length} total inquiries
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-mono text-slate-500">
                  Cutoff: {new Date(Date.now() - purgeDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {/* Warning Note */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="font-sans leading-relaxed text-[11px]">
                Deleted inquiries cannot be recovered. Make sure you have exported a CSV backup if you need an archival record.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isPurging}
                onClick={() => setShowPurgeModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={purgeCandidateCount === 0 || isPurging}
                onClick={handlePurgeOldInquiries}
                className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {isPurging
                    ? 'Purging Records...'
                    : `Permanently Delete ${purgeCandidateCount} Inquiries`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security & PIN Settings Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-[#C5A05930] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-[#1A1A1A]">
                <div className="w-8 h-8 rounded-lg bg-[#C5A05915] text-[#C5A059] flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base">Security & PIN Settings</h3>
                  <p className="text-[10px] text-gray-500 font-sans">Update Master Password or Emergency PIN</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSecurityModal(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {credMsg && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  credMsg.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                {credMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                )}
                <span>{credMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateCredentials} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#1A1A1A]/80 uppercase text-[10px] mb-1">
                  Current Master Password or PIN <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={credCurrent}
                  onChange={(e) => setCredCurrent(e.target.value)}
                  placeholder="Enter current password or PIN"
                  className="w-full p-2.5 border rounded-lg focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-3">
                <div>
                  <label className="block font-bold text-[#1A1A1A]/80 uppercase text-[10px] mb-1">
                    New Master Password (Optional)
                  </label>
                  <input
                    type="password"
                    value={credNewPassword}
                    onChange={(e) => setCredNewPassword(e.target.value)}
                    placeholder="Leave blank to keep unchanged"
                    className="w-full p-2.5 border bg-white rounded-lg focus:outline-none focus:border-[#C5A059]"
                  />
                  <span className="text-[10px] text-gray-500 block mt-0.5">Minimum 6 characters</span>
                </div>

                <div>
                  <label className="block font-bold text-[#1A1A1A]/80 uppercase text-[10px] mb-1">
                    New 4-Digit Emergency PIN (Optional)
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={credNewPin}
                    onChange={(e) => setCredNewPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Leave blank to keep unchanged"
                    className="w-full p-2.5 border bg-white rounded-lg focus:outline-none focus:border-[#C5A059]"
                  />
                  <span className="text-[10px] text-gray-500 block mt-0.5">Numeric only (e.g. 2026)</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSecurityModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={credSubmitting}
                  className="px-5 py-2 rounded-lg bg-[#1A1A1A] hover:bg-[#4A5D4E] text-white font-bold transition-all disabled:opacity-60 cursor-pointer"
                >
                  {credSubmitting ? 'Saving Changes...' : 'Save New Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
