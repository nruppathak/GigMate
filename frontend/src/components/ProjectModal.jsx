import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Calendar, 
  DollarSign, 
  Clock, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Star, 
  UserCheck, 
  ExternalLink, 
  User, 
  Check, 
  MessageSquare, 
  Paperclip, 
  FileText, 
  UploadCloud, 
  FileCheck,
  Briefcase,
  Bookmark,
  XCircle,
  RotateCcw,
  ShieldCheck,
  Filter
} from 'lucide-react';
import { 
  fetchProjectById, 
  submitApplication, 
  updateApplicationStatus, 
  withdrawApplication,
  fetchRecommendedStudents,
  updateProjectStatus,
  uploadFile
} from '../api';
import {
  formatProposalCount,
  getProposalStatusMeta,
  normalizeProposalStatus,
  formatDateTime,
  formatRelativeTime
} from '../utils/proposalUtils';

export default function ProjectModal({ 
  projectId, 
  currentUser, 
  onClose, 
  onApplicationSubmitted,
  onOpenStudentProfile,
  onOpenReviewModal,
  onOpenChat
}) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'applicants' | 'recommended'
  const [recommendedStudents, setRecommendedStudents] = useState([]);
  const modalBodyRef = useRef(null);

  // Proposal form state
  const [bidAmount, setBidAmount] = useState('');
  const [deliveryTimeline, setDeliveryTimeline] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [proposalAttachment, setProposalAttachment] = useState(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isStudent = currentUser?.role === 'student';

  useEffect(() => {
    loadProject();
  }, [projectId]);

  useEffect(() => {
    if (modalBodyRef.current) {
      modalBodyRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  async function loadProject() {
    setLoading(true);
    try {
      const data = await fetchProjectById(projectId);
      setProject(data);
      if (data.budget_amount) setBidAmount(data.budget_amount);
      if (data.duration) setDeliveryTimeline(data.duration);

      // If client or recruiter is viewing project, fetch recommendations
      if (currentUser?.role !== 'student' && currentUser) {
        const recs = await fetchRecommendedStudents(projectId);
        setRecommendedStudents(recs);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load project details');
    } finally {
      setLoading(false);
    }
  }

  const [proposalFilter, setProposalFilter] = useState('all');
  const [withdrawing, setWithdrawing] = useState(false);

  const applications = project?.applications || project?.applicants || [];
  const activeApplications = applications.filter(a => normalizeProposalStatus(a.status) !== 'withdrawn');

  const proposalStats = project?.proposalStats || {
    total: activeApplications.length,
    all: applications.length,
    pending: applications.filter(a => normalizeProposalStatus(a.status) === 'pending').length,
    under_review: applications.filter(a => normalizeProposalStatus(a.status) === 'under_review').length,
    shortlisted: applications.filter(a => normalizeProposalStatus(a.status) === 'shortlisted').length,
    accepted: applications.filter(a => normalizeProposalStatus(a.status) === 'accepted').length,
    rejected: applications.filter(a => normalizeProposalStatus(a.status) === 'rejected').length,
    withdrawn: applications.filter(a => normalizeProposalStatus(a.status) === 'withdrawn').length
  };

  // Check if current student has an active applied proposal
  const existingApplication = isStudent && applications.find(
    app => app.student_id === currentUser?.id
  );
  const isExistingWithdrawn = existingApplication && normalizeProposalStatus(existingApplication.status) === 'withdrawn';

  // Treat any logged-in client or recruiter as an empowered project reviewer
  const isClientOwner = !isStudent && Boolean(currentUser);

  async function handleAttachmentUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAttachment(true);
    setErrorMsg('');
    try {
      const res = await uploadFile(file);
      setProposalAttachment({
        url: res.file.url,
        name: res.file.name
      });
    } catch (err) {
      setErrorMsg('Failed to upload file: ' + err.message);
    } finally {
      setUploadingAttachment(false);
    }
  }

  async function handleSubmitProposal(e) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!bidAmount || !deliveryTimeline || !coverLetter.trim()) {
      setErrorMsg('Please fill in all proposal fields');
      return;
    }

    setSubmitting(true);
    try {
      await submitApplication({
        project_id: projectId,
        student_id: currentUser.id,
        bid_amount: parseFloat(bidAmount),
        delivery_timeline: deliveryTimeline,
        cover_letter: coverLetter.trim(),
        attachment_url: proposalAttachment?.url || '',
        attachment_name: proposalAttachment?.name || ''
      });
      setSuccessMsg('Proposal submitted successfully! You can track its status in My Applications.');
      setProposalAttachment(null);
      await loadProject();
      if (onApplicationSubmitted) onApplicationSubmitted();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit proposal');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(applicationId, newStatus) {
    try {
      await updateApplicationStatus(applicationId, newStatus);
      await loadProject();
      if (onApplicationSubmitted) onApplicationSubmitted();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  }

  async function handleWithdrawProposal(applicationId) {
    if (!window.confirm('Are you sure you want to withdraw your proposal? This action will remove your bid from client review.')) return;
    setWithdrawing(true);
    try {
      await withdrawApplication(applicationId, currentUser.id);
      await loadProject();
      if (onApplicationSubmitted) onApplicationSubmitted();
    } catch (err) {
      alert('Failed to withdraw proposal: ' + err.message);
    } finally {
      setWithdrawing(false);
    }
  }

  async function handleCompleteProject() {
    if (!window.confirm('Mark this project as completed? This will update project records and allow leaving reviews.')) return;
    try {
      await updateProjectStatus(projectId, 'completed');
      await loadProject();
      if (onApplicationSubmitted) onApplicationSubmitted();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading || !project) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-200 text-center">
          <div className="w-10 h-10 border-4 border-[#ff6200] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium text-sm">Loading project details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-gray-200 text-gray-900 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex items-start justify-between bg-white">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-[#ff6200] border border-orange-200">
                {project.category}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize border ${
                project.status === 'in_progress' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                project.status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                ● Status: {project.status.replace('_', ' ')}
              </span>
              {project.experience_level && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                  {project.experience_level}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
              {project.title}
            </h2>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-600 flex-wrap">
              <span>Posted by <strong className="text-gray-900 font-bold">{project.client_name}</strong></span>
              <span>•</span>
              <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{project.client_rating?.toFixed(1) || '5.0'}</span>
              </div>
              {isStudent && onOpenChat && (
                <>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => onOpenChat({
                      otherUser: {
                        id: project.client_id,
                        name: project.client_name,
                        avatar: project.client_avatar,
                        role: 'client'
                      },
                      project
                    })}
                    className="text-[#ff6200] font-bold hover:underline flex items-center gap-1 cursor-pointer bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200 transition-colors hover:bg-orange-100"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#ff6200]" />
                    <span>Contact Client</span>
                  </button>
                </>
              )}
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Client Owner Tab Navigation */}
        {isClientOwner && (
          <div className="flex border-b border-gray-200 px-6 bg-gray-50/70">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'details'
                  ? 'border-[#ff6200] text-[#ff6200]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Project Overview
            </button>
            <button
              onClick={() => setActiveTab('applicants')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'applicants'
                  ? 'border-[#ff6200] text-[#ff6200]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <span>Received Applications</span>
              <span className="bg-orange-100 text-[#ff6200] px-2 py-0.5 rounded-full text-[10px] font-bold">
                {activeApplications.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('recommended')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'recommended'
                  ? 'border-[#ff6200] text-[#ff6200]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#ff6200]" />
              <span>Matched Talent</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div ref={modalBodyRef} className="p-6 overflow-y-auto space-y-6 flex-1 bg-white">
          {activeTab === 'details' && (
            <>
              {/* Key Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5">
                  <div className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-[#ff6200]" />
                    Budget
                  </div>
                  <div className="text-lg font-black text-gray-900 mt-1">
                    ${project.budget_amount}
                    <span className="text-xs font-normal text-gray-500 ml-1">
                      {project.budget_type === 'hourly' ? '/ hr' : 'fixed'}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5">
                  <div className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#ff6200]" />
                    Timeline
                  </div>
                  <div className="text-base font-bold text-gray-900 mt-1">
                    {project.duration}
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5">
                  <div className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-[#ff6200]" />
                    Proposals
                  </div>
                  <div className="text-base font-bold text-gray-900 mt-1">
                    {formatProposalCount(activeApplications.length)}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5 font-medium truncate">
                    {proposalStats.accepted > 0 ? (
                      <span className="text-emerald-700 font-semibold">1 Accepted / Hired</span>
                    ) : proposalStats.pending > 0 ? (
                      <span className="text-amber-700">{proposalStats.pending} Pending Review</span>
                    ) : proposalStats.shortlisted > 0 ? (
                      <span className="text-indigo-700">{proposalStats.shortlisted} Shortlisted</span>
                    ) : (
                      <span>Active Bids</span>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5">
                  <div className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    Posted
                  </div>
                  <div className="text-base font-bold text-gray-900 mt-1">
                    {new Date(project.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Student Perks Banner */}
              {project.perks && (
                <div className="bg-orange-50/70 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
                  <Award className="w-5 h-5 text-[#ff6200] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[#ff6200] uppercase tracking-wider">
                      Student-Friendly Perks
                    </h4>
                    <p className="text-sm text-gray-800 mt-1 font-medium">
                      {project.perks}
                    </p>
                  </div>
                </div>
              )}

              {/* Required Skills Section */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Required Skills & Technologies
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.skills?.map((skill, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-orange-50 text-[#ff6200] border border-orange-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Project Scope / Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Project Description & Deliverables
                </h4>
                <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-xl border border-gray-200">
                  {project.description}
                </div>
              </div>

              {/* Student Application Box */}
              {isStudent && (
                <div className="border-t border-gray-200 pt-6">
                  {existingApplication && !isExistingWithdrawn ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm">Your Proposal is Active</h4>
                            <p className="text-[11px] text-gray-500">Submitted on {formatDateTime(existingApplication.created_at)}</p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        {(() => {
                          const meta = getProposalStatusMeta(existingApplication.status);
                          return (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${meta.badge}`}>
                              <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                              <span>{meta.label}</span>
                            </span>
                          );
                        })()}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-white p-3 rounded-lg border border-slate-200 text-xs">
                        <div>
                          <span className="text-gray-400 block text-[10px] font-semibold">YOUR BID</span>
                          <span className="font-extrabold text-gray-900 text-sm">${existingApplication.bid_amount}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px] font-semibold">DELIVERY</span>
                          <span className="font-bold text-gray-900 text-sm">{existingApplication.delivery_timeline}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px] font-semibold">LAST UPDATE</span>
                          <span className="font-semibold text-gray-600 text-xs">{formatRelativeTime(existingApplication.updated_at || existingApplication.created_at)}</span>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-gray-700 italic">
                        <p className="font-semibold text-gray-500 not-italic text-[10px] mb-1 uppercase tracking-wider">Proposal Note:</p>
                        "{existingApplication.cover_letter}"
                      </div>

                      {existingApplication.attachment_url && (
                        <div className="flex items-center gap-2">
                          <a
                            href={existingApplication.attachment_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#ff6200] bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-colors"
                          >
                            <FileCheck className="w-4 h-4 text-[#ff6200]" />
                            <span>Attached Resume / Spec: <strong>{existingApplication.attachment_name || 'View PDF'}</strong></span>
                            <ExternalLink className="w-3 h-3 text-gray-400" />
                          </a>
                        </div>
                      )}

                      {/* Student Withdrawal Action */}
                      {['pending', 'under_review', 'shortlisted'].includes(normalizeProposalStatus(existingApplication.status)) && (
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                          <span className="text-[11px] text-gray-500">Need to make revisions or withdraw your bid?</span>
                          <button
                            type="button"
                            onClick={() => handleWithdrawProposal(existingApplication.id)}
                            disabled={withdrawing}
                            className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>{withdrawing ? 'Withdrawing...' : 'Withdraw Proposal'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : project.status !== 'open' ? (
                    <div className="bg-gray-50 text-gray-500 border border-gray-200 p-4 rounded-xl text-center text-sm font-medium">
                      This project is currently <strong className="text-gray-900">{project.status}</strong> and is no longer accepting new proposals.
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitProposal} className="space-y-4">
                      {isExistingWithdrawn && (
                        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center gap-2">
                          <RotateCcw className="w-4 h-4 shrink-0 text-amber-600" />
                          <span>You previously withdrew a proposal for this gig. You may submit an updated proposal below.</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                          <Send className="w-4 h-4 text-[#ff6200]" />
                          <span>Submit a Proposal</span>
                        </h4>
                        <span className="text-xs text-[#ff6200] font-semibold">Fast application</span>
                      </div>

                      {errorMsg && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                          <span>{errorMsg}</span>
                        </div>
                      )}

                      {successMsg && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                          <span>{successMsg}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            Your Proposed Bid ($)
                          </label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={bidAmount}
                            onChange={e => setBidAmount(e.target.value)}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-[#ff6200] focus:ring-1 focus:ring-[#ff6200] focus:outline-hidden"
                            placeholder="e.g. 400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            Delivery Timeline
                          </label>
                          <input
                            type="text"
                            required
                            value={deliveryTimeline}
                            onChange={e => setDeliveryTimeline(e.target.value)}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-[#ff6200] focus:ring-1 focus:ring-[#ff6200] focus:outline-hidden"
                            placeholder="e.g. 10 days"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Cover Letter / Why You're a Great Fit
                        </label>
                        <textarea
                          rows={4}
                          required
                          value={coverLetter}
                          onChange={e => setCoverLetter(e.target.value)}
                          className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-[#ff6200] focus:ring-1 focus:ring-[#ff6200] focus:outline-hidden"
                          placeholder="Introduce yourself, mention relevant coursework or portfolio projects, and how you will tackle their requirements..."
                        />
                      </div>

                      {/* PDF Resume / Document Attachment */}
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                            <Paperclip className="w-3.5 h-3.5 text-[#ff6200]" />
                            <span>Attach PDF Resume / Proposal File</span>
                          </label>
                          <span className="text-[11px] text-gray-500">PDF, max 15MB</span>
                        </div>
                        {proposalAttachment ? (
                          <div className="flex items-center justify-between p-2.5 bg-orange-50 border border-orange-200 rounded-lg text-xs">
                            <div className="flex items-center gap-2 text-orange-900 font-semibold truncate">
                              <FileCheck className="w-4 h-4 text-[#ff6200] shrink-0" />
                              <span className="truncate">{proposalAttachment.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setProposalAttachment(null)}
                              className="text-gray-500 hover:text-red-600 text-xs px-2 py-0.5 rounded cursor-pointer transition-colors font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <label className="flex items-center justify-center gap-2 p-3.5 border-2 border-dashed border-gray-300 hover:border-[#ff6200] bg-white rounded-lg cursor-pointer text-xs text-gray-600 hover:text-[#ff6200] transition-colors">
                            <UploadCloud className="w-4 h-4 text-[#ff6200]" />
                            <span>{uploadingAttachment ? 'Uploading PDF...' : 'Click to attach PDF Resume or Project Spec'}</span>
                            <input
                              type="file"
                              accept=".pdf,application/pdf"
                              disabled={uploadingAttachment}
                              onChange={handleAttachmentUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-[#ff6200] hover:bg-[#e55800] text-white font-bold py-3 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {submitting ? 'Submitting proposal...' : 'Send Proposal'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Client & Recruiter Actions */}
              {!isStudent && currentUser && (
                <div className="border-t border-gray-200 pt-5 flex items-center justify-between flex-wrap gap-3">
                  <div className="text-xs text-gray-500 font-medium">
                    {project.status === 'completed'
                      ? '✓ This project has been marked as completed.'
                      : project.status === 'in_progress'
                        ? 'Project is active. Switch to Received Applications tab to track deliverables or complete below.'
                        : 'Switch tabs above to review applications or matched student talent.'}
                  </div>
                  <div className="flex items-center gap-2">
                    {project.status === 'in_progress' && (
                      <button
                        type="button"
                        onClick={handleCompleteProject}
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm flex items-center gap-1.5 active:scale-95"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Project Completed & Leave Review</span>
                      </button>
                    )}
                    {project.status === 'completed' && onOpenReviewModal && (
                      <button
                        type="button"
                        onClick={() => {
                          const acceptedApp = applications.find(a => normalizeProposalStatus(a.status) === 'accepted');
                          onOpenReviewModal({
                            projectId: project.id,
                            reviewerId: currentUser.id,
                            revieweeId: project.student_id || acceptedApp?.student_id || 'usr_student_1',
                            revieweeName: acceptedApp?.student_name || 'Freelancer Student'
                          });
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                      >
                        <Star className="w-3.5 h-3.5 fill-white text-white" />
                        <span>Leave Review</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Client: Received Applicants Tab */}
          {activeTab === 'applicants' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-gray-100">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <span>Received Proposals</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-[#ff6200]">
                      {formatProposalCount(proposalStats.total)}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {proposalStats.all} submitted • {proposalStats.shortlisted} shortlisted • {proposalStats.accepted} accepted
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Student Profiles</span>
                </div>
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {[
                  { key: 'all', label: 'All', count: applications.length },
                  { key: 'pending', label: 'Pending', count: proposalStats.pending },
                  { key: 'under_review', label: 'Under Review', count: proposalStats.under_review },
                  { key: 'shortlisted', label: 'Shortlisted', count: proposalStats.shortlisted },
                  { key: 'accepted', label: 'Accepted', count: proposalStats.accepted },
                  { key: 'rejected', label: 'Rejected', count: proposalStats.rejected },
                  { key: 'withdrawn', label: 'Withdrawn', count: proposalStats.withdrawn },
                ].map(filterTab => {
                  const isActive = proposalFilter === filterTab.key;
                  return (
                    <button
                      key={filterTab.key}
                      type="button"
                      onClick={() => setProposalFilter(filterTab.key)}
                      className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-[#ff6200] text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                    >
                      <span>{filterTab.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {filterTab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {(() => {
                const STATUS_ORDER = {
                  accepted: 1,
                  shortlisted: 2,
                  under_review: 3,
                  pending: 4,
                  rejected: 5,
                  withdrawn: 6
                };

                const filteredApplications = applications
                  .filter(app => {
                    if (proposalFilter === 'all') return true;
                    return normalizeProposalStatus(app.status) === proposalFilter;
                  })
                  .sort((a, b) => {
                    const sA = normalizeProposalStatus(a.status);
                    const sB = normalizeProposalStatus(b.status);
                    const pA = STATUS_ORDER[sA] || 99;
                    const pB = STATUS_ORDER[sB] || 99;
                    if (pA !== pB) return pA - pB;
                    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
                  });

                if (filteredApplications.length === 0) {
                  return (
                    <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-700 text-sm font-semibold">
                        {proposalFilter === 'all'
                          ? 'No student proposals received yet.'
                          : `No proposals with status "${proposalFilter.replace('_', ' ')}".`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {proposalFilter === 'all'
                          ? 'Check the "Matched Talent" tab to invite qualified students!'
                          : 'Try selecting a different status filter above.'}
                      </p>
                    </div>
                  );
                }

                return filteredApplications.map(app => {
                  const normStatus = normalizeProposalStatus(app.status);
                  const statusMeta = getProposalStatusMeta(app.status);
                  const isWithdrawn = normStatus === 'withdrawn';
                  const isAccepted = normStatus === 'accepted';

                  return (
                    <div 
                      key={app.id} 
                      className={`p-4 rounded-xl border bg-white shadow-xs transition-all space-y-3 ${
                        isAccepted 
                          ? 'border-emerald-300 ring-1 ring-emerald-100' 
                          : isWithdrawn 
                            ? 'border-gray-200 opacity-70 bg-gray-50/50' 
                            : 'border-gray-200 hover:border-[#ff6200]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <img 
                            src={app.student_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.student_name || 'Student')}&background=ff6200&color=fff&bold=true`} 
                            alt={app.student_name || 'Student'} 
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(app.student_name || 'Student')}&background=ff6200&color=fff&bold=true`;
                            }}
                            className="w-11 h-11 rounded-full object-cover border border-gray-200 bg-white shrink-0 mt-0.5"
                          />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                type="button"
                                onClick={() => onOpenStudentProfile && onOpenStudentProfile(app.student_id)}
                                className="font-bold text-gray-900 hover:text-[#ff6200] transition-colors text-sm text-left cursor-pointer"
                              >
                                {app.student_name}
                              </button>
                              {app.matchScore > 0 && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-[#ff6200] border border-orange-200">
                                  {app.matchScore}% Match
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              {app.student_major || 'Student'} • {app.student_college || 'GLA University'}
                            </p>
                            {app.student_skills && app.student_skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {app.student_skills.slice(0, 4).map((sk, i) => (
                                  <span key={i} className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 rounded">
                                    {typeof sk === 'string' ? sk : sk.skill_name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status Tag */}
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusMeta.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                            <span>{statusMeta.label}</span>
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {formatRelativeTime(app.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* Proposal Details */}
                      <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-700 leading-relaxed border border-gray-200 space-y-2">
                        <div className="flex items-center justify-between text-gray-500 text-[11px]">
                          <span className="font-bold text-gray-900">Proposal Cover Note</span>
                          <span>Submitted: {formatDateTime(app.created_at)}</span>
                        </div>
                        <p className="italic text-gray-700 whitespace-pre-line">"{app.cover_letter}"</p>
                        
                        {app.attachment_url && (
                          <div className="pt-2 border-t border-gray-200 flex items-center gap-2">
                            <a
                              href={app.attachment_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#ff6200] bg-white hover:bg-orange-50 border border-orange-200 shadow-xs transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5 text-[#ff6200]" />
                              <span>View Proposal Attachment ({app.attachment_name || 'Download Document'})</span>
                              <ExternalLink className="w-3 h-3 text-gray-400" />
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                        <div className="flex items-center gap-3 text-gray-600 font-medium flex-wrap">
                          <span>Proposed Bid: <strong className="text-gray-900 font-bold">${app.bid_amount}</strong></span>
                          <span>Timeline: <strong className="text-gray-900 font-bold">{app.delivery_timeline}</strong></span>
                          <span>Rating: <strong className="text-amber-500 font-bold">★ {app.student_rating || 5.0}</strong></span>
                          {app.updated_at && app.updated_at !== app.created_at && (
                            <span className="text-[11px] text-gray-400 italic">
                              Status updated {formatRelativeTime(app.updated_at)}
                            </span>
                          )}
                        </div>

                        {/* Client Decision Actions */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {onOpenChat && (
                            <button
                              type="button"
                              onClick={() => onOpenChat({
                                otherUser: {
                                  id: app.student_id,
                                  name: app.student_name,
                                  avatar: app.student_avatar,
                                  role: 'student'
                                },
                                project
                              })}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#ff6200] bg-orange-50 hover:bg-orange-100 border border-orange-200 cursor-pointer flex items-center gap-1"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-[#ff6200]" />
                              <span>Chat</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onOpenStudentProfile && onOpenStudentProfile(app.student_id)}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 cursor-pointer"
                          >
                            View Profile
                          </button>
                          
                          {/* Owner workflow decision buttons */}
                          {isClientOwner && (
                            <>
                              {normStatus === 'pending' && (
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(app.id, 'under_review')}
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 cursor-pointer"
                                  title="Mark proposal as currently being reviewed"
                                >
                                  Mark Under Review
                                </button>
                              )}

                              {(normStatus === 'pending' || normStatus === 'under_review') && (
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(app.id, 'shortlisted')}
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 cursor-pointer flex items-center gap-1"
                                  title="Shortlist applicant for final decision"
                                >
                                  <Bookmark className="w-3 h-3 text-purple-600" />
                                  <span>Shortlist</span>
                                </button>
                              )}

                              {normStatus !== 'accepted' && normStatus !== 'withdrawn' && normStatus !== 'completed' && (
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(app.id, 'accepted')}
                                  className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-[#ff6200] hover:bg-[#e55800] shadow-xs cursor-pointer flex items-center gap-1"
                                  title="Accept this proposal and start project"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Accept Proposal</span>
                                </button>
                              )}

                              {(normStatus === 'pending' || normStatus === 'under_review' || normStatus === 'shortlisted') && (
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(app.id, 'rejected')}
                                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 cursor-pointer flex items-center gap-1"
                                  title="Decline this proposal"
                                >
                                  <XCircle className="w-3 h-3 text-red-500" />
                                  <span>Reject</span>
                                </button>
                              )}

                              {normStatus === 'rejected' && (
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(app.id, 'under_review')}
                                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 border border-gray-200 cursor-pointer flex items-center gap-1"
                                  title="Re-open consideration for this proposal"
                                >
                                  <RotateCcw className="w-3 h-3 text-gray-500" />
                                  <span>Re-evaluate</span>
                                </button>
                              )}

                              {normStatus === 'accepted' && project.status !== 'completed' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleStatusChange(app.id, 'completed');
                                    if (onOpenReviewModal) {
                                      onOpenReviewModal({
                                        projectId: project.id,
                                        reviewerId: currentUser.id,
                                        revieweeId: app.student_id,
                                        revieweeName: app.student_name
                                      });
                                    }
                                  }}
                                  className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer shadow-xs flex items-center gap-1"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Mark Completed & Review</span>
                                </button>
                              )}

                              {normStatus === 'withdrawn' && (
                                <span className="text-xs italic text-gray-400 px-2 py-1">
                                  Withdrawn by student
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}

          {/* Client: Recommended Students Tab */}
          {activeTab === 'recommended' && (
            <div className="space-y-4">
              <div className="bg-orange-50/70 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#ff6200] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#ff6200] uppercase tracking-wider">
                    Recommended University Talent
                  </h4>
                  <p className="text-xs text-gray-700 mt-1">
                    Ranked by exact skill match with your project requirements ({project.skills?.join(', ')}).
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {recommendedStudents.map(student => (
                  <div
                    key={student.id}
                    className="p-4 rounded-xl border border-gray-200 bg-white hover:border-[#ff6200] shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || 'Student')}&background=ff6200&color=fff&bold=true`;
                        }}
                        className="w-12 h-12 rounded-full object-cover border border-gray-200 shrink-0 bg-white"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onOpenStudentProfile(student.id)}
                            className="font-bold text-gray-900 hover:text-[#ff6200] transition-colors text-sm text-left cursor-pointer"
                          >
                            {student.name}
                          </button>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-[#ff6200] border border-orange-200">
                            {student.matchScore}% Match
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {student.major} • {student.college}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {student.skills?.map((sk, idx) => (
                            <span 
                              key={idx} 
                              className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                                student.matchedSkills?.includes(sk.skill_name)
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold'
                                  : 'bg-gray-150 text-gray-600 bg-gray-100'
                              }`}
                            >
                              {sk.skill_name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <div className="text-xs text-gray-600 text-right">
                        <div>Rate: <strong className="text-gray-900 font-bold">${student.hourly_rate}/hr</strong></div>
                        <div>Rating: <strong className="text-amber-500 font-bold">★ {student.rating_avg}</strong> ({student.completed_projects_count} completed)</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {onOpenChat && (
                          <button
                            type="button"
                            onClick={() => onOpenChat({
                              otherUser: {
                                id: student.id,
                                name: student.name,
                                avatar: student.avatar,
                                role: 'student'
                              },
                              project
                            })}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-50 text-[#ff6200] hover:bg-orange-100 border border-orange-200 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-[#ff6200]" />
                            <span>Message</span>
                          </button>
                        )}
                        <button
                          onClick={() => onOpenStudentProfile(student.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 transition-colors cursor-pointer"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
