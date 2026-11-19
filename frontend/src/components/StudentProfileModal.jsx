import React, { useState, useEffect } from 'react';
import { 
  X, 
  GraduationCap, 
  MapPin, 
  Star, 
  Clock, 
  DollarSign, 
  ExternalLink, 
  Code2, 
  Plus, 
  Trash2, 
  Award, 
  CheckCircle2, 
  Briefcase,
  Edit3,
  FileText,
  UploadCloud,
  FileCheck,
  Camera,
  MessageSquare
} from 'lucide-react';
import { 
  fetchUserById, 
  addUserSkill, 
  deleteUserSkill, 
  addPortfolioItem, 
  deletePortfolioItem,
  updateUser,
  uploadFile
} from '../api';

export default function StudentProfileModal({ 
  userId, 
  currentUserId, 
  onClose,
  onProfileUpdated,
  onDeleteProfile,
  onOpenChat
}) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('portfolio'); // 'portfolio' | 'skills' | 'reviews' | 'edit'

  // New Skill form
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate');

  // New Portfolio form
  const [newPortTitle, setNewPortTitle] = useState('');
  const [newPortDesc, setNewPortDesc] = useState('');
  const [newPortUrl, setNewPortUrl] = useState('');
  const [newPortGithub, setNewPortGithub] = useState('');
  const [newPortImage, setNewPortImage] = useState('');
  const [newPortTags, setNewPortTags] = useState('');
  const [addingPort, setAddingPort] = useState(false);

  // Edit basic info
  const [editName, setEditName] = useState('');
  const [editHeadline, setEditHeadline] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editCollege, setEditCollege] = useState('');
  const [editMajor, setEditMajor] = useState('');
  const [editGradYear, setEditGradYear] = useState('');
  const [editHourlyRate, setEditHourlyRate] = useState('');
  const [editAvailability, setEditAvailability] = useState('');
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const isOwner = userId === currentUserId;

  useEffect(() => {
    loadProfile();
  }, [userId]);

  async function loadProfile() {
    setLoading(true);
    try {
      const data = await fetchUserById(userId);
      setProfile(data);
      setEditName(data.name || '');
      setEditHeadline(data.headline || '');
      setEditBio(data.bio || '');
      setEditCollege(data.college || '');
      setEditMajor(data.major || '');
      setEditGradYear(data.grad_year || '');
      setEditHourlyRate(data.hourly_rate || '');
      setEditAvailability(data.availability_hours || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddSkill(e) {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    try {
      await addUserSkill(userId, newSkillName.trim(), newSkillLevel);
      setNewSkillName('');
      await loadProfile();
      if (onProfileUpdated) onProfileUpdated();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDeleteSkill(skillName) {
    try {
      await deleteUserSkill(userId, skillName);
      await loadProfile();
      if (onProfileUpdated) onProfileUpdated();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleAddPortfolio(e) {
    e.preventDefault();
    if (!newPortTitle.trim()) return;
    try {
      await addPortfolioItem(userId, {
        title: newPortTitle.trim(),
        description: newPortDesc.trim(),
        project_url: newPortUrl.trim() || null,
        github_url: newPortGithub.trim() || null,
        image_url: newPortImage.trim() || null,
        tags: newPortTags.trim()
      });
      setNewPortTitle('');
      setNewPortDesc('');
      setNewPortUrl('');
      setNewPortGithub('');
      setNewPortImage('');
      setNewPortTags('');
      setAddingPort(false);
      await loadProfile();
      if (onProfileUpdated) onProfileUpdated();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDeletePortfolio(portId) {
    if (!window.confirm('Delete this portfolio project?')) return;
    try {
      await deletePortfolioItem(portId);
      await loadProfile();
      if (onProfileUpdated) onProfileUpdated();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleSaveBasicInfo(e) {
    e.preventDefault();
    try {
      await updateUser(userId, {
        name: editName.trim() || profile.name,
        headline: editHeadline,
        bio: editBio,
        college: editCollege,
        major: editMajor,
        grad_year: parseInt(editGradYear) || 2027,
        hourly_rate: parseFloat(editHourlyRate) || 25,
        availability_hours: parseInt(editAvailability) || 15
      });
      setActiveTab('portfolio');
      await loadProfile();
      if (onProfileUpdated) onProfileUpdated();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleResumeUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      alert('Please upload a PDF file for your resume.');
      return;
    }

    setUploadingResume(true);
    try {
      const res = await uploadFile(file);
      await updateUser(userId, {
        resume_url: res.file.url,
        resume_name: res.file.name
      });
      await loadProfile();
      if (onProfileUpdated) onProfileUpdated();
    } catch (err) {
      alert('Resume upload failed: ' + err.message);
    } finally {
      setUploadingResume(false);
    }
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }

    setUploadingAvatar(true);
    try {
      const res = await uploadFile(file);
      await updateUser(userId, { avatar: res.file.url });
      await loadProfile();
      if (onProfileUpdated) onProfileUpdated();
    } catch (err) {
      alert('Photo upload failed: ' + err.message);
    } finally {
      setUploadingAvatar(false);
    }
  }

  if (loading || !profile) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-200 text-center text-gray-900">
          <div className="w-10 h-10 border-4 border-[#ff6200] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading profile details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-gray-200 text-gray-900 overflow-hidden my-auto h-[90vh] sm:h-[88vh] max-h-[820px] flex flex-col">
        
        {/* Main Scrollable Profile Container with visible scrollbar */}
        <div className="overflow-y-scroll min-h-0 flex-1 flex flex-col [scrollbar-width:thin] [scrollbar-color:#ff6200_#f3f4f6]">
          {/* Large Up Bar / Header Banner */}
          <div className="relative bg-gradient-to-r from-[#11161d] via-[#1f2631] to-[#11161d] h-32 sm:h-36 shrink-0 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#ff6200_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
            
            {/* University Talent Badge */}
            <div className="absolute top-4 left-5 sm:left-6 flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-white backdrop-blur-md border border-white/15 flex items-center gap-2 shadow-xs">
                <GraduationCap className="w-4 h-4 text-[#ff6200]" />
                <span>GLA University Verified Talent</span>
              </span>
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:right-6 px-3 py-1.5 bg-black/40 hover:bg-black/70 text-white rounded-xl transition-all cursor-pointer border border-white/20 flex items-center gap-1.5 text-xs font-bold shadow-md"
              title="Close profile modal"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Close</span>
            </button>
          </div>

          {/* Profile Info Bar */}
          <div className="px-6 pb-4 pt-0 relative border-b border-gray-200 bg-white">
            {/* Top row: Avatar & Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-3">
              <div className="relative group shrink-0">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&background=ff6200&color=fff&bold=true`;
                  }}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-white shadow-xl bg-white"
                />
              {isOwner && (
                <label 
                  className="absolute inset-0 bg-black/60 hover:bg-black/75 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-xs ring-4 ring-white"
                  title="Upload photo of yourself"
                >
                  {uploadingAvatar ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Camera className="w-5 h-5 mb-0.5 text-white" />
                      <span className="text-[10px] font-bold">Change Pic</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {isOwner && (
              <div className="flex items-center gap-2 self-start sm:self-center flex-wrap pt-1 sm:pt-0">
                <label className="px-3.5 py-2 rounded-lg text-xs font-bold bg-[#ff6200] hover:bg-[#e55800] text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95">
                  <Camera className="w-3.5 h-3.5" />
                  <span>{uploadingAvatar ? 'Uploading Pic...' : 'Change Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                    className="hidden"
                  />
                </label>

                <label className="px-3.5 py-2 rounded-lg text-xs font-bold bg-orange-50 hover:bg-orange-100 text-[#ff6200] transition-colors flex items-center gap-1.5 cursor-pointer border border-orange-200 shadow-xs active:scale-95">
                  <UploadCloud className="w-3.5 h-3.5 text-[#ff6200]" />
                  <span>{uploadingResume ? 'Uploading...' : profile.resume_url ? 'Replace Resume (PDF)' : 'Upload Resume (PDF)'}</span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleResumeUpload}
                    disabled={uploadingResume}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={() => setActiveTab(activeTab === 'edit' ? 'portfolio' : 'edit')}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors flex items-center gap-1.5 cursor-pointer border border-gray-200 active:scale-95"
                >
                  <Edit3 className="w-3.5 h-3.5 text-gray-600" />
                  <span>{activeTab === 'edit' ? 'Cancel Editing' : 'Edit Profile'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Profile Name & Professional Headline - Clean High-Contrast on White Background */}
          <div className="mt-2 mb-3.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">
                {profile.name}
              </h2>
              <span className="bg-orange-50 text-[#ff6200] border border-orange-200 text-xs font-bold px-2.5 py-0.5 rounded-full capitalize">
                {profile.role}
              </span>
            </div>
            {profile.headline && (
              <p className="text-xs sm:text-sm font-semibold text-gray-700 mt-1 leading-snug">
                {profile.headline}
              </p>
            )}
          </div>

          {/* Academic details & metrics */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-gray-600">
            {profile.college && (
              <div className="flex items-center gap-1.5 font-semibold text-gray-700">
                <GraduationCap className="w-4 h-4 text-[#ff6200]" />
                <span>{profile.major} • {profile.college} (Class of {profile.grad_year})</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{profile.rating_avg ? profile.rating_avg.toFixed(1) : '5.0'}</span>
              <span className="text-gray-400 font-normal">({profile.rating_count || 0} reviews)</span>
            </div>
            <div className="flex items-center gap-0.5 font-extrabold text-gray-900">
              <span className="text-[#ff6200]">$</span>
              <span>{profile.hourly_rate}/hr</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600 font-medium">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{profile.availability_hours} hrs/week</span>
            </div>

            {profile.resume_url && (
              <a
                href={profile.resume_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 text-emerald-800 font-bold hover:bg-emerald-100 transition-colors border border-emerald-200 shadow-2xs"
              >
                <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>View Resume (PDF)</span>
              </a>
            )}
          </div>

          {profile.bio && (
            <p className="text-xs sm:text-sm text-gray-600 mt-3 leading-relaxed">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Large Navigation Tab Bar (Sticky on scroll) */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-3 border-b border-gray-200 flex items-center gap-2 sm:gap-3 overflow-x-auto text-sm shadow-2xs">
          {[
            { id: 'portfolio', label: 'Portfolios', count: profile.portfolios?.length || 0, icon: Briefcase },
            { id: 'skills', label: 'Skills & Tech Stack', count: profile.skills?.length || 0, icon: Code2 },
            { id: 'reviews', label: 'Reviews & Feedback', count: profile.reviews?.length || 0, icon: Star },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 border ${
                  isActive
                    ? 'bg-[#ff6200] text-white border-[#ff6200] shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-gray-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
                  isActive ? 'bg-white/25 text-white' : 'bg-gray-200 text-gray-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="p-6 space-y-5 bg-[#f9fafb] flex-1 min-h-[350px]">
          {/* 1. Portfolios Tab */}
          {activeTab === 'portfolio' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">Featured Student Projects</h3>
                {isOwner && (
                  <button
                    onClick={() => setAddingPort(!addingPort)}
                    className="px-3 py-1.5 bg-[#ff6200] text-white hover:bg-[#e55800] rounded-md text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Project</span>
                  </button>
                )}
              </div>

              {/* Add portfolio form */}
              {addingPort && (
                <form onSubmit={handleAddPortfolio} className="p-4 bg-white rounded-xl border border-gray-200 space-y-3 shadow-sm">
                  <h4 className="text-xs font-bold text-[#ff6200] uppercase tracking-wider">Add New Portfolio Project</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Project Title"
                      value={newPortTitle}
                      onChange={e => setNewPortTitle(e.target.value)}
                      className="px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-[#ff6200] focus:outline-hidden"
                    />
                    <input
                      type="text"
                      placeholder="Tech Tags (e.g. React, Python, Figma)"
                      value={newPortTags}
                      onChange={e => setNewPortTags(e.target.value)}
                      className="px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-[#ff6200] focus:outline-hidden"
                    />
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Short description of what you built and your role"
                    value={newPortDesc}
                    onChange={e => setNewPortDesc(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-[#ff6200] focus:outline-hidden"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="url"
                      placeholder="Live Demo URL (optional)"
                      value={newPortUrl}
                      onChange={e => setNewPortUrl(e.target.value)}
                      className="px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-[#ff6200] focus:outline-hidden"
                    />
                    <input
                      type="url"
                      placeholder="GitHub URL (optional)"
                      value={newPortGithub}
                      onChange={e => setNewPortGithub(e.target.value)}
                      className="px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-[#ff6200] focus:outline-hidden"
                    />
                    <input
                      type="url"
                      placeholder="Preview Image URL (optional)"
                      value={newPortImage}
                      onChange={e => setNewPortImage(e.target.value)}
                      className="px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-[#ff6200] focus:outline-hidden"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setAddingPort(false)}
                      className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-bold bg-[#ff6200] hover:bg-[#e55800] text-white rounded-md cursor-pointer shadow-xs"
                    >
                      Save Project
                    </button>
                  </div>
                </form>
              )}

              {/* Portfolio items list */}
              {(!profile.portfolios || profile.portfolios.length === 0) ? (
                <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
                  No portfolio items uploaded yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.portfolios.map(item => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-gray-200 bg-white overflow-hidden hover:border-[#ff6200] hover:shadow-md transition-all flex flex-col justify-between shadow-xs"
                    >
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-36 object-cover border-b border-gray-100"
                        />
                      )}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                            {isOwner && (
                              <button
                                onClick={() => handleDeletePortfolio(item.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                                title="Delete project"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-3 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-[#ff6200] truncate max-w-[150px]">
                            {item.tags}
                          </span>
                          <div className="flex items-center gap-2">
                            {item.github_url && (
                              <a
                                href={item.github_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-gray-500 hover:text-gray-800 p-1"
                                title="View GitHub code"
                              >
                                <Code2 className="w-4 h-4" />
                              </a>
                            )}
                            {item.project_url && (
                              <a
                                href={item.project_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#ff6200] hover:underline p-1"
                                title="Live preview"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. Skills Tab */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              {isOwner && (
                <form onSubmit={handleAddSkill} className="flex gap-2 p-3 bg-white rounded-xl border border-gray-200 shadow-xs">
                  <input
                    type="text"
                    required
                    placeholder="Add skill (e.g. Next.js, Docker, PyTorch)"
                    value={newSkillName}
                    onChange={e => setNewSkillName(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-[#ff6200] focus:outline-hidden"
                  />
                  <select
                    value={newSkillLevel}
                    onChange={e => setNewSkillLevel(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-white text-gray-700 font-medium focus:border-[#ff6200] focus:outline-hidden"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Expert">Expert</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#ff6200] hover:bg-[#e55800] text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs"
                  >
                    Add
                  </button>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {profile.skills?.map(skill => (
                  <div
                    key={skill.skill_name}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800 text-xs">{skill.skill_name}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        skill.level === 'Expert' ? 'bg-orange-100 text-[#ff6200]' :
                        skill.level === 'Intermediate' ? 'bg-amber-100 text-amber-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {skill.level}
                      </span>
                    </div>

                    {isOwner && (
                      <button
                        onClick={() => handleDeleteSkill(skill.skill_name)}
                        className="text-gray-400 hover:text-red-500 p-1 cursor-pointer transition-colors"
                        title="Delete skill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {(!profile.reviews || profile.reviews.length === 0) ? (
                <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
                  No reviews received yet. Reviews will appear here when clients approve completed gigs.
                </div>
              ) : (
                profile.reviews.map(rev => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-xl border border-gray-200 bg-white space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={rev.reviewer_avatar}
                          alt={rev.reviewer_name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-200"
                        />
                        <div>
                          <p className="text-xs font-bold text-gray-900">{rev.reviewer_name}</p>
                          <p className="text-[10px] text-gray-500 capitalize">{rev.reviewer_role}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{rev.rating}.0</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 italic bg-gray-50 p-3 rounded-lg border border-gray-100 leading-relaxed">
                      "{rev.comment}"
                    </p>
                    <span className="text-[10px] text-gray-400 block text-right">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 4. Edit Profile Info Form */}
          {activeTab === 'edit' && isOwner && (
            <form onSubmit={handleSaveBasicInfo} className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <h3 className="text-sm font-bold text-gray-900">Edit Profile & Academic Details</h3>
                <span className="text-[11px] text-gray-500">Update your public student profile</span>
              </div>

              {/* Photo / DP Upload Section */}
              <div className="p-3.5 bg-white border border-gray-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&background=ff6200&color=fff&bold=true`;
                    }}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-[#ff6200] shrink-0 bg-white"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Profile Photo / DP</h4>
                    <p className="text-[11px] text-gray-500">Upload a clear photo of yourself (JPG, PNG, WebP)</p>
                  </div>
                </div>
                <label className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#ff6200] hover:bg-[#e55800] text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0">
                  <Camera className="w-3.5 h-3.5" />
                  <span>{uploadingAvatar ? 'Uploading...' : 'Change Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-[#ff6200] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Professional Headline</label>
                  <input
                    type="text"
                    value={editHeadline}
                    onChange={e => setEditHeadline(e.target.value)}
                    placeholder="e.g. Full-Stack Developer | React & Node.js"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-[#ff6200] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">College / University</label>
                  <input
                    type="text"
                    value={editCollege}
                    onChange={e => setEditCollege(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-[#ff6200] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Major / Degree</label>
                  <input
                    type="text"
                    value={editMajor}
                    onChange={e => setEditMajor(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-[#ff6200] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Graduation Year</label>
                  <input
                    type="number"
                    value={editGradYear}
                    onChange={e => setEditGradYear(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-[#ff6200] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Hourly Rate ($)</label>
                  <input
                    type="number"
                    value={editHourlyRate}
                    onChange={e => setEditHourlyRate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-[#ff6200] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Available Hours / Week</label>
                  <input
                    type="number"
                    value={editAvailability}
                    onChange={e => setEditAvailability(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-[#ff6200] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Bio / About Me</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  placeholder="Share a brief overview of your background, coursework, and technical skills..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-[#ff6200] focus:outline-hidden"
                />
              </div>

              {/* Resume upload box in Edit tab */}
              <div className="p-3 bg-white border border-gray-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#ff6200]" />
                    <span>Resume (PDF)</span>
                  </label>
                  <span className="text-[10px] text-gray-400">PDF, max 10MB</span>
                </div>
                {profile.resume_url ? (
                  <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                    <span className="text-emerald-800 font-bold truncate">Current Resume Attached</span>
                    <label className="text-[#ff6200] hover:underline cursor-pointer font-bold">
                      {uploadingResume ? 'Uploading...' : 'Replace PDF'}
                      <input type="file" accept=".pdf" onChange={handleResumeUpload} disabled={uploadingResume} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-200 hover:border-[#ff6200] rounded-lg cursor-pointer text-xs text-gray-600 hover:text-[#ff6200] transition-colors">
                    <UploadCloud className="w-4 h-4 text-[#ff6200]" />
                    <span>{uploadingResume ? 'Uploading...' : 'Click to upload your resume (PDF)'}</span>
                    <input type="file" accept=".pdf" onChange={handleResumeUpload} disabled={uploadingResume} className="hidden" />
                  </label>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('portfolio')}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#ff6200] hover:bg-[#e55800] text-white rounded-lg cursor-pointer shadow-xs"
                >
                  Save Changes
                </button>
              </div>

              {onDeleteProfile && (
                <div className="mt-4 pt-3 border-t border-red-100 bg-red-50/60 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-red-900">Danger Zone</h4>
                    <p className="text-[11px] text-red-600">Permanently delete this user profile and all associated data.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete profile "${profile.name}"? This action cannot be undone.`)) {
                        onDeleteProfile();
                        onClose();
                      }
                    }}
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Profile</span>
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Large Down Bar / Footer Action Bar */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 font-medium flex-wrap">
            <div className="flex items-center gap-1 font-bold text-gray-900">
              <span className="text-[#ff6200] font-extrabold text-base">$</span>
              <span className="text-base font-black">{profile.hourly_rate}</span>
              <span className="text-gray-400 font-normal text-xs">/hr</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{profile.rating_avg ? profile.rating_avg.toFixed(1) : '5.0'}</span>
              <span className="text-gray-400 font-normal text-xs">({profile.rating_count || 0} reviews)</span>
            </div>
            <span>•</span>
            <span className="text-gray-500 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>{profile.availability_hours || 20} hrs/week available</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5 justify-end">
            {!isOwner && onOpenChat && (
              <button
                type="button"
                onClick={() => {
                  onOpenChat({
                    otherUser: {
                      id: profile.id || profile._id,
                      name: profile.name,
                      avatar: profile.avatar,
                      role: 'student'
                    }
                  });
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#ff6200] hover:bg-[#e55800] text-white transition-all cursor-pointer shadow-xs flex items-center gap-2 active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat with {profile.name?.split(' ')[0] || 'Student'}</span>
              </button>
            )}

            {isOwner && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'edit' ? 'portfolio' : 'edit')}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#ff6200] hover:bg-[#e55800] text-white transition-all cursor-pointer shadow-xs flex items-center gap-2 active:scale-95"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{activeTab === 'edit' ? 'Close Editing' : 'Edit Profile'}</span>
                </button>

                {onDeleteProfile && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to permanently delete profile "${profile.name}"? This action cannot be undone.`)) {
                        onDeleteProfile();
                        onClose();
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white hover:bg-red-50 text-red-600 border border-red-200 transition-colors cursor-pointer shadow-xs flex items-center gap-1.5 active:scale-95"
                    title="Delete your profile permanently"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                    <span>Delete Profile</span>
                  </button>
                )}
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer border border-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}