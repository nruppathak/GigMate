// Proposal Status and Count Utilities for GigMate

export function formatProposalCount(count) {
  const n = typeof count === 'number' ? count : (parseInt(count, 10) || 0);
  return `${n} ${n === 1 ? 'Proposal' : 'Proposals'}`;
}

export function normalizeProposalStatus(status) {
  if (!status) return 'pending';
  const s = String(status).toLowerCase().trim();
  if (s === 'applied') return 'pending';
  if (s === 'declined') return 'rejected';
  return s;
}

export const PROPOSAL_STATUS_CONFIG = {
  pending: {
    key: 'pending',
    label: 'Pending',
    shortLabel: 'Pending',
    description: 'Submitted, awaiting client review',
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
    badge: 'bg-slate-100 text-slate-800 border-slate-200'
  },
  under_review: {
    key: 'under_review',
    label: 'Under Review',
    shortLabel: 'Reviewing',
    description: 'Client is actively reviewing this proposal',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  shortlisted: {
    key: 'shortlisted',
    label: 'Shortlisted',
    shortLabel: 'Shortlisted',
    description: 'Candidate shortlisted for this gig',
    bg: 'bg-indigo-50',
    text: 'text-indigo-800',
    border: 'border-indigo-200',
    dot: 'bg-indigo-500',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  accepted: {
    key: 'accepted',
    label: 'Accepted / Hired',
    shortLabel: 'Hired',
    description: 'Proposal accepted & work in progress',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  },
  rejected: {
    key: 'rejected',
    label: 'Rejected',
    shortLabel: 'Rejected',
    description: 'Candidate not selected for this gig',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-400',
    badge: 'bg-rose-50 text-rose-700 border-rose-200'
  },
  withdrawn: {
    key: 'withdrawn',
    label: 'Withdrawn',
    shortLabel: 'Withdrawn',
    description: 'Proposal withdrawn by student',
    bg: 'bg-gray-100',
    text: 'text-gray-500',
    border: 'border-gray-200',
    dot: 'bg-gray-400',
    badge: 'bg-gray-100 text-gray-600 border-gray-200'
  },
  completed: {
    key: 'completed',
    label: 'Completed',
    shortLabel: 'Completed',
    description: 'Milestones finished & verified',
    bg: 'bg-emerald-100',
    text: 'text-emerald-900',
    border: 'border-emerald-300',
    dot: 'bg-emerald-600',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  }
};

export function getProposalStatusMeta(status) {
  const norm = normalizeProposalStatus(status);
  return PROPOSAL_STATUS_CONFIG[norm] || PROPOSAL_STATUS_CONFIG.pending;
}

export function formatDateTime(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

export function formatRelativeTime(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
