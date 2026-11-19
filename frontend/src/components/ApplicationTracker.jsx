import React, { useState, useEffect } from 'react';
import { 
  fetchApplications, 
  updateApplicationStatus,
  withdrawApplication 
} from '../api';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  DollarSign, 
  Calendar, 
  FileText, 
  Star, 
  ExternalLink,
  MessageSquare,
  Sparkles,
  Layers,
  XCircle,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import {
  normalizeProposalStatus,
  getProposalStatusMeta,
  formatDateTime,
  formatRelativeTime
} from '../utils/proposalUtils';

export default function ApplicationTracker({ 
  currentUser, 
  onSelectProject,
  onOpenReviewModal,
  onOpenChat
}) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [withdrawingId, setWithdrawingId] = useState(null);

  const isStudent = currentUser?.role === 'student';

  useEffect(() => {
    loadApplications();
  }, [currentUser]);

  async function loadApplications() {
    setLoading(true);
    try {
      const query = isStudent 
        ? { studentId: currentUser.id }
        : { clientId: currentUser.id };
      const data = await fetchApplications(query);
      setApplications(data);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCompleteProject(app) {
    if (!window.confirm('Mark this project as delivered and completed?')) return;
    try {
      await updateApplicationStatus(app.id, 'completed');
      await loadApplications();
      if (onOpenReviewModal) {
        onOpenReviewModal({
          projectId: app.project_id,
          reviewerId: currentUser.id,
          revieweeId: isStudent ? app.client_id : app.student_id,
          revieweeName: isStudent ? app.client_name : app.student_name
        });
      }
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleWithdraw(appId) {
    if (!window.confirm('Are you sure you want to withdraw this application? This will cancel your bid and notify the client.')) {
      return;
    }
    setWithdrawingId(appId);
    try {
      await withdrawApplication(appId, currentUser.id);
      await loadApplications();
    } catch (err) {
      alert('Failed to withdraw application: ' + err.message);
    } finally {
      setWithdrawingId(null);
    }
  }

  const counts = {
    all: applications.length,
    pending: applications.filter(a => normalizeProposalStatus(a.status) === 'pending').length,
    under_review: applications.filter(a => normalizeProposalStatus(a.status) === 'under_review').length,
    shortlisted: applications.filter(a => normalizeProposalStatus(a.status) === 'shortlisted').length,
    accepted: applications.filter(a => normalizeProposalStatus(a.status) === 'accepted').length,
    completed: applications.filter(a => normalizeProposalStatus(a.status) === 'completed').length,
    rejected: applications.filter(a => normalizeProposalStatus(a.status) === 'rejected').length,
    withdrawn: applications.filter(a => normalizeProposalStatus(a.status) === 'withdrawn').length,
  };

  const filteredApps = applications.filter(app => {
    if (filterStatus === 'all') return true;
    return normalizeProposalStatus(app.status) === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Title & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#ff6200] text-xs font-semibold mb-2 border border-orange-200">
            <Layers className="w-3.5 h-3.5 text-[#ff6200]" />
            <span>Proposals & Work Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {isStudent ? 'My Applications & Proposals' : 'Client Recruitment Dashboard'}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {isStudent 
              ? 'Track the real-time review status of your project bids, active contracts, and client decisions.' 
              : 'Review submitted proposals from students and manage project deliverables.'}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 text-xs">
        {[
          { id: 'all', label: 'All Applications', count: counts.all },
          { id: 'pending', label: 'Pending', count: counts.pending },
          { id: 'under_review', label: 'Under Review', count: counts.under_review },
          { id: 'shortlisted', label: 'Shortlisted', count: counts.shortlisted },
          { id: 'accepted', label: 'Accepted / Active', count: counts.accepted },
          { id: 'completed', label: 'Completed', count: counts.completed },
          { id: 'rejected', label: 'Rejected', count: counts.rejected },
          { id: 'withdrawn', label: 'Withdrawn', count: counts.withdrawn },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3.5 py-2 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer shrink-0 ${
              filterStatus === tab.id
                ? 'bg-[#ff6200] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              filterStatus === tab.id ? 'bg-[#e55800] text-white' : 'bg-gray-100 text-gray-700'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="p-12 text-center text-gray-500">
          <div className="w-8 h-8 border-4 border-[#ff6200] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Fetching pipeline records...</p>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-dashed border-gray-200">
          <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-700">No applications in this category</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            {isStudent 
              ? 'Browse open projects and submit proposals to kickstart your student freelance journey.' 
              : 'You have not received any proposals for this filter yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredApps.map(app => {
            const normStatus = normalizeProposalStatus(app.status);
            const statusMeta = getProposalStatusMeta(app.status);
            const canWithdraw = isStudent && ['pending', 'under_review', 'shortlisted'].includes(normStatus);
            const isAccepted = normStatus === 'accepted';
            const isCompleted = normStatus === 'completed';

            return (
              <div
                key={app.id}
                className={`bg-white rounded-xl border p-5 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 ${
                  isAccepted 
                    ? 'border-emerald-300 ring-1 ring-emerald-100' 
                    : normStatus === 'withdrawn'
                      ? 'border-gray-200 opacity-75 bg-gray-50/50'
                      : 'border-gray-200 hover:border-[#ff6200] hover:shadow-md'
                }`}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-700">
                      {app.project_category || 'General'}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusMeta.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                      <span>{statusMeta.label}</span>
                    </span>
                  </div>

                  <h3 
                    onClick={() => onSelectProject({ id: app.project_id })}
                    className="text-lg font-bold text-gray-900 hover:text-[#ff6200] transition-colors cursor-pointer"
                  >
                    {app.project_title}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <img
                        src={isStudent ? app.client_avatar : app.student_avatar}
                        alt="Avatar"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((isStudent ? app.client_name : app.student_name) || 'User')}&background=ff6200&color=fff&bold=true`;
                        }}
                        className="w-5 h-5 rounded-full object-cover ring-1 ring-gray-200 bg-white"
                      />
                      <span className="text-gray-700 font-medium">
                        {isStudent 
                          ? `Client: ${app.client_name || 'Client'}` 
                          : `Applicant: ${app.student_name || 'Student'} (${app.student_college || 'GLA University'})`}
                      </span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1 font-bold text-gray-900">
                      <span>Proposed Bid: ${app.bid_amount}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>Timeline: {app.delivery_timeline || '1-2 weeks'}</span>
                    </div>
                  </div>

                  {/* Submission and Update Timestamps */}
                  <div className="flex items-center gap-3 text-[11px] text-gray-400 flex-wrap pt-0.5">
                    <span>Submitted: {formatDateTime(app.created_at)} ({formatRelativeTime(app.created_at)})</span>
                    {app.updated_at && app.updated_at !== app.created_at && (
                      <>
                        <span>•</span>
                        <span className="text-gray-600 font-medium">
                          Last Updated: {formatRelativeTime(app.updated_at)}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Pitch preview */}
                  <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 italic line-clamp-2">
                    "{app.cover_letter}"
                  </div>

                  {/* Attachment if present */}
                  {app.attachment_url && (
                    <div className="pt-1">
                      <a
                        href={app.attachment_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#ff6200] hover:underline"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Attachment: {app.attachment_name || 'Attached Document'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Actions side */}
                <div className="flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    {onOpenChat && (
                      <button
                        type="button"
                        onClick={() => onOpenChat({
                          otherUser: {
                            id: isStudent ? app.client_id : app.student_id,
                            name: isStudent ? app.client_name : app.student_name,
                            avatar: isStudent ? app.client_avatar : app.student_avatar,
                            role: isStudent ? 'client' : 'student'
                          },
                          project: {
                            id: app.project_id,
                            title: app.project_title,
                            category: app.project_category
                          }
                        })}
                        className="px-3 py-2 rounded-lg text-xs font-bold text-gray-700 bg-gray-100 hover:bg-orange-50 hover:text-[#ff6200] transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#ff6200]" />
                        <span>Chat</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onSelectProject({ id: app.project_id })}
                      className="px-3.5 py-2 rounded-lg text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>View Project</span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>

                  {/* Student withdrawal option */}
                  {canWithdraw && (
                    <button
                      type="button"
                      disabled={withdrawingId === app.id}
                      onClick={() => handleWithdraw(app.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer flex items-center gap-1.5"
                      title="Withdraw this proposal before client acceptance"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{withdrawingId === app.id ? 'Withdrawing...' : 'Withdraw Proposal'}</span>
                    </button>
                  )}

                  {/* Complete & Review when accepted */}
                  {isAccepted && (
                    <button
                      type="button"
                      onClick={() => handleCompleteProject(app)}
                      className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Complete & Review</span>
                    </button>
                  )}

                  {/* Feedback button when completed */}
                  {isCompleted && (
                    <button
                      type="button"
                      onClick={() => onOpenReviewModal({
                        projectId: app.project_id,
                        reviewerId: currentUser.id,
                        revieweeId: isStudent ? app.client_id : app.student_id,
                        revieweeName: isStudent ? app.client_name : app.student_name
                      })}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>Feedback</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
