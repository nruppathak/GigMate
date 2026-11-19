import React, { useState, useEffect } from 'react';
import { 
  fetchApplications, 
  updateApplicationStatus 
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
  Layers
} from 'lucide-react';

export default function ApplicationTracker({ 
  currentUser, 
  onSelectProject,
  onOpenReviewModal,
  onOpenChat
}) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

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
      console.error(err);
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

  const filteredApps = applications.filter(app => {
    if (filterStatus === 'all') return true;
    return app.status === filterStatus;
  });

  const counts = {
    all: applications.length,
    applied: applications.filter(a => a.status === 'applied').length,
    under_review: applications.filter(a => a.status === 'under_review').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    completed: applications.filter(a => a.status === 'completed').length,
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'applied':
        return <span className="bg-gray-100 text-gray-700 border border-gray-200 px-3 py-0.5 rounded-full text-xs font-semibold">Submitted</span>;
      case 'under_review':
        return <span className="bg-amber-50 text-amber-800 border border-amber-200 px-3 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1"><Clock className="w-3 h-3 text-amber-600" /> Under Review</span>;
      case 'accepted':
        return <span className="bg-orange-50 text-[#ff6200] border border-orange-200 px-3 py-0.5 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3 text-[#ff6200]" /> In Progress / Hired</span>;
      case 'completed':
        return <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1"><Sparkles className="w-3 h-3 text-emerald-600" /> Completed</span>;
      case 'declined':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-0.5 rounded-full text-xs font-semibold">Declined</span>;
      default:
        return null;
    }
  };

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
            {isStudent ? 'Application Tracking Pipeline' : 'Client Recruitment Dashboard'}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {isStudent 
              ? 'Track the real-time status of your project bids, deliverables, and client contracts.' 
              : 'Review submitted proposals from students and manage project deliverables.'}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200">
        {[
          { id: 'all', label: 'All Applications' },
          { id: 'applied', label: 'Submitted' },
          { id: 'under_review', label: 'Shortlisted' },
          { id: 'accepted', label: 'In Progress / Hired' },
          { id: 'completed', label: 'Completed' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              filterStatus === tab.id
                ? 'bg-[#ff6200] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              filterStatus === tab.id ? 'bg-[#e55800] text-white' : 'bg-gray-100 text-gray-600'
            }`}>
              {counts[tab.id] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="p-12 text-center text-gray-500">
          <div className="w-8 h-8 border-4 border-[#ff6200] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Fetching pipeline records...</p>
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
          {filteredApps.map(app => (
            <div
              key={app.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-[#ff6200] hover:shadow-md transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-700">
                    {app.project_category}
                  </span>
                  {getStatusBadge(app.status)}
                </div>

                <h3 
                  onClick={() => onSelectProject({ id: app.project_id })}
                  className="text-lg font-bold text-gray-900 hover:text-[#ff6200] transition-colors cursor-pointer"
                >
                  {app.project_title}
                </h3>

                <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <img
                      src={isStudent ? app.client_avatar : app.student_avatar}
                      alt="Avatar"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((isStudent ? app.client_name : app.student_name) || 'User')}&background=ff6200&color=fff&bold=true`;
                      }}
                      className="w-5 h-5 rounded-full object-cover ring-1 ring-gray-200 bg-white"
                    />
                    <span className="text-gray-700 font-medium">{isStudent ? `Client: ${app.client_name}` : `Student: ${app.student_name} (${app.student_college})`}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1 font-bold text-gray-900">
                    <span className="text-[#ff6200]">$</span>
                    <span>Proposed Bid: ${app.bid_amount}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>Delivery: {app.delivery_timeline}</span>
                  </div>
                </div>

                {/* Pitch preview */}
                <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 italic line-clamp-2">
                  "{app.cover_letter}"
                </div>
              </div>

              {/* Actions side */}
              <div className="flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                <div className="flex items-center gap-2">
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
                    onClick={() => onSelectProject({ id: app.project_id })}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>View Project</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>

                {app.status === 'accepted' && (
                  <button
                    onClick={() => handleCompleteProject(app)}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#ff6200] hover:bg-[#e55800] shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 active:scale-95"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Complete & Review</span>
                  </button>
                )}

                {app.status === 'completed' && (
                  <button
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
          ))}
        </div>
      )}
    </div>
  );
}