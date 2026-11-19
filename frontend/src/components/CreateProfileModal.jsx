import React, { useState } from 'react';
import { 
  X, 
  GraduationCap, 
  Briefcase, 
  User, 
  Mail, 
  Sparkles, 
  UploadCloud, 
  Paperclip, 
  FileCheck, 
  DollarSign, 
  Clock, 
  Award, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Trash2,
  Camera
} from 'lucide-react';
import { registerUser, uploadFile } from '../api';

const POPULAR_SKILLS = [
  'React', 'Node.js', 'Python', 'Tailwind CSS', 'Figma', 
  'JavaScript', 'UI/UX Design', 'Flutter', 'TypeScript', 
  'MongoDB', 'Java', 'Machine Learning', 'Content Writing',
  'HTML/CSS', 'SQL', 'C++', 'Data Analysis', 'Docker',
  'Git & GitHub', 'Next.js', 'Graphic Design'
];

const PRESET_AVATARS = {
  student: [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
  ],
  client: [
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80'
  ]
};

export default function CreateProfileModal({ isOpen, onClose, onProfileCreated, initialRole = 'student' }) {
  if (!isOpen) return null;

  const [role, setRole] = useState(initialRole || 'student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('123');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(PRESET_AVATARS.student[0]);
  
  // Student-specific fields
  const [college, setCollege] = useState('GLA University, Mathura');
  const [major, setMajor] = useState('B.Tech Computer Science & Engineering');
  const [gradYear, setGradYear] = useState('2026');
  const [hourlyRate, setHourlyRate] = useState('25');
  const [availabilityHours, setAvailabilityHours] = useState('15');
  const [selectedSkills, setSelectedSkills] = useState([
    { skill_name: 'React', level: 'Intermediate' },
    { skill_name: 'Node.js', level: 'Intermediate' }
  ]);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [customSkillLevel, setCustomSkillLevel] = useState('Intermediate');
  const [resumeAttachment, setResumeAttachment] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setErrorMsg('');
    try {
      const res = await uploadFile(file);
      setAvatar(res.file.url);
    } catch (err) {
      setErrorMsg('Failed to upload photo: ' + err.message);
    } finally {
      setUploadingAvatar(false);
    }
  }

  function handleRoleChange(newRole) {
    setRole(newRole);
    setAvatar(PRESET_AVATARS[newRole][0]);
    if (newRole === 'student' && !headline) {
      setHeadline('Full-Stack Web & Mobile Developer');
    } else if (newRole === 'client' && !headline) {
      setHeadline('Tech Lead & Recruiter');
    }
  }

  function handleAddSkill(skillName, level = 'Intermediate') {
    if (!skillName.trim()) return;
    const exists = selectedSkills.some(s => 
      (typeof s === 'string' ? s : s.skill_name).toLowerCase() === skillName.trim().toLowerCase()
    );
    if (!exists) {
      setSelectedSkills([...selectedSkills, { skill_name: skillName.trim(), level }]);
      setCustomSkillInput('');
    }
  }

  function handleRemoveSkill(skillName) {
    setSelectedSkills(selectedSkills.filter(s => 
      (typeof s === 'string' ? s : s.skill_name) !== skillName
    ));
  }

  function handleToggleSkillLevel(skillName) {
    setSelectedSkills(selectedSkills.map(s => {
      const currentName = typeof s === 'string' ? s : s.skill_name;
      if (currentName === skillName) {
        const currentLevel = typeof s === 'string' ? 'Intermediate' : s.level;
        const nextLevel = currentLevel === 'Beginner' ? 'Intermediate' : currentLevel === 'Intermediate' ? 'Expert' : 'Beginner';
        return { skill_name: currentName, level: nextLevel };
      }
      return s;
    }));
  }

  async function handleResumeUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setErrorMsg('Please upload a valid PDF document for your resume.');
      return;
    }

    setUploadingResume(true);
    setErrorMsg('');
    try {
      const res = await uploadFile(file);
      setResumeAttachment({
        url: res.file.url,
        name: res.file.name
      });
    } catch (err) {
      setErrorMsg('Resume upload failed: ' + err.message);
    } finally {
      setUploadingResume(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim() || !email.trim()) {
      setErrorMsg('Please enter your full name and email address.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim() || '123',
        role,
        avatar,
        headline: headline.trim() || (role === 'student' ? 'Student Freelancer' : 'Project Recruiter'),
        bio: bio.trim(),
        college: role === 'student' ? college.trim() : null,
        major: role === 'student' ? major.trim() : null,
        grad_year: role === 'student' ? parseInt(gradYear) || 2026 : null,
        hourly_rate: role === 'student' ? parseFloat(hourlyRate) || 20 : null,
        availability_hours: role === 'student' ? parseInt(availabilityHours) || 15 : null,
        skills: role === 'student' 
          ? selectedSkills.map(s => typeof s === 'string' ? { skill_name: s, level: 'Intermediate' } : s)
          : [],
        resume_url: resumeAttachment?.url || null,
        resume_name: resumeAttachment?.name || null
      };

      const res = await registerUser(payload);
      setSuccessMsg('Profile created successfully! Loading your account...');
      
      setTimeout(() => {
        if (onProfileCreated) {
          onProfileCreated(res.user);
        }
        onClose();
      }, 700);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create profile. Please check if email is already in use.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-200 text-gray-900 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-200 flex items-start justify-between bg-white shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-[#ff6200] border border-orange-200 mb-1.5">
              <User className="w-3.5 h-3.5 text-[#ff6200]" />
              <span>Free Registration</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Create Your GigMate Profile
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Set up your profile to start finding student freelance gigs or hiring top campus talent.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs flex items-center gap-2 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleChange('student')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  role === 'student'
                    ? 'border-[#ff6200] bg-orange-50/50 ring-1 ring-[#ff6200]'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  role === 'student' ? 'bg-[#ff6200] text-white font-bold' : 'bg-gray-100 text-gray-500'
                }`}>
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Student Freelancer</h4>
                  <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
                    Bid on projects, upload resume, and get hired.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('client')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  role === 'client'
                    ? 'border-[#ff6200] bg-orange-50/50 ring-1 ring-[#ff6200]'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  role === 'client' ? 'bg-[#ff6200] text-white font-bold' : 'bg-gray-100 text-gray-500'
                }`}>
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Client / Recruiter</h4>
                  <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
                    Post projects and recruit student talent.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Profile Photo: Upload Your Picture or Choose Preset */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                Profile Photo
              </label>
              <span className="text-[10px] text-[#ff6200] font-semibold">Upload photo or pick preset</span>
            </div>

            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex flex-col sm:flex-row items-center gap-4">
              {/* Photo Preview with change badge */}
              <div className="relative group shrink-0">
                <img
                  src={avatar}
                  alt="Profile Avatar"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=ff6200&color=fff&bold=true`;
                  }}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-[#ff6200] shadow-sm bg-white"
                />
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2.5 text-center sm:text-left">
                {/* Upload Button */}
                <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-[#ff6200] hover:bg-[#e55800] transition-colors cursor-pointer shadow-xs">
                    <Camera className="w-4 h-4" />
                    <span>{uploadingAvatar ? 'Uploading Photo...' : 'Upload Photo of Yourself'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingAvatar}
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-gray-500">JPG, PNG or WebP</span>
                </div>

                {/* Preset Avatars */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-200 flex-wrap justify-center sm:justify-start">
                  <span className="text-[10px] text-gray-500 font-medium">Or select an avatar:</span>
                  {PRESET_AVATARS[role].map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAvatar(url)}
                      className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                        avatar === url 
                          ? 'border-[#ff6200] scale-110 shadow-xs' 
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                      title="Select avatar"
                    >
                      <img src={url} alt="Preset avatar" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Basic Info: Name, Login ID/Email & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={role === 'student' ? 'e.g. Aditi Verma' : 'e.g. Rahul Gupta'}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#ff6200] focus:ring-1 focus:ring-[#ff6200]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Login ID / Email <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={role === 'student' ? 'e.g. aditi.verma_cs24@gla.ac.in' : 'e.g. rahul@company.com'}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#ff6200] focus:ring-1 focus:ring-[#ff6200]"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">Any email or ID format is accepted</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Choose any password"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#ff6200] focus:ring-1 focus:ring-[#ff6200]"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">Type whatever password you want</span>
            </div>
          </div>

          {/* Headline */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Headline / Professional Title
            </label>
            <input
              type="text"
              value={headline}
              onChange={e => setHeadline(e.target.value)}
              placeholder={role === 'student' ? 'e.g. MERN Stack Developer & UI Designer' : 'e.g. Founder at TechVentures'}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#ff6200] focus:ring-1 focus:ring-[#ff6200]"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              About / Bio
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder={role === 'student' 
                ? 'Briefly introduce your interests, programming background, or coursework...' 
                : 'Briefly share what kinds of projects you hire for...'}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#ff6200] focus:ring-1 focus:ring-[#ff6200]"
            />
          </div>

          {/* Student Specific Fields */}
          {role === 'student' && (
            <div className="space-y-4 pt-2 border-t border-gray-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-[#ff6200]" />
                Academic & Freelancing Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    College / University
                  </label>
                  <input
                    type="text"
                    value={college}
                    onChange={e => setCollege(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-hidden focus:border-[#ff6200]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Major / Branch
                  </label>
                  <input
                    type="text"
                    value={major}
                    onChange={e => setMajor(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-hidden focus:border-[#ff6200]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Grad Year
                  </label>
                  <input
                    type="number"
                    value={gradYear}
                    onChange={e => setGradYear(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-hidden focus:border-[#ff6200]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Rate ($/hr)
                  </label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={e => setHourlyRate(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-hidden focus:border-[#ff6200]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Hours/Week
                  </label>
                  <input
                    type="number"
                    value={availabilityHours}
                    onChange={e => setAvailabilityHours(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-hidden focus:border-[#ff6200]"
                  />
                </div>
              </div>

              {/* Skills Multi-Select */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Skills & Technologies
                  </label>
                  <span className="text-[10px] text-[#ff6200]">Click level on tag to change</span>
                </div>
                
                {/* Selected skills tags */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {selectedSkills.map(skill => {
                    const sName = typeof skill === 'string' ? skill : skill.skill_name;
                    const sLevel = typeof skill === 'string' ? 'Intermediate' : skill.level;
                    return (
                      <span 
                        key={sName}
                        className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg text-xs font-bold bg-orange-50 border border-orange-200 text-[#ff6200]"
                      >
                        <span>{sName}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleSkillLevel(sName)}
                          className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white border border-orange-200 text-[#ff6200] hover:bg-orange-100 transition-colors cursor-pointer"
                          title="Click to toggle proficiency: Beginner, Intermediate, Expert"
                        >
                          {sLevel}
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveSkill(sName)}
                          className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer p-0.5"
                          title="Remove skill"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>

                {/* Custom skill input with level dropdown */}
                <div className="flex gap-2 mb-2.5">
                  <input
                    type="text"
                    value={customSkillInput}
                    onChange={e => setCustomSkillInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill(customSkillInput, customSkillLevel);
                      }
                    }}
                    placeholder="Type skill name (e.g. Next.js, Docker, Canva) and press Add..."
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#ff6200]"
                  />
                  <select
                    value={customSkillLevel}
                    onChange={e => setCustomSkillLevel(e.target.value)}
                    className="px-2.5 py-2 text-xs rounded-lg border border-gray-300 bg-white font-medium text-gray-700 focus:outline-hidden focus:border-[#ff6200]"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Expert">Expert</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleAddSkill(customSkillInput, customSkillLevel)}
                    className="px-4 py-2 rounded-lg bg-[#ff6200] hover:bg-[#e55800] text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {/* Popular chips */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] text-gray-500 font-medium">Quick Suggestions:</span>
                  {POPULAR_SKILLS.map(s => {
                    const isAdded = selectedSkills.some(sk => (typeof sk === 'string' ? sk : sk.skill_name).toLowerCase() === s.toLowerCase());
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => isAdded ? handleRemoveSkill(s) : handleAddSkill(s, 'Intermediate')}
                        className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                          isAdded 
                            ? 'bg-[#ff6200] text-white font-bold' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {isAdded ? `✓ ${s}` : `+ ${s}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Resume Upload (PDF) */}
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-[#ff6200]" />
                    Upload Verified Resume / CV (PDF)
                  </label>
                  <span className="text-[10px] text-gray-400">Optional</span>
                </div>
                {resumeAttachment ? (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                    <div className="flex items-center gap-2 text-emerald-800 font-medium truncate">
                      <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">{resumeAttachment.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setResumeAttachment(null)}
                      className="text-gray-400 hover:text-red-500 text-xs px-2 py-0.5 rounded cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 hover:border-[#ff6200] bg-white rounded-lg cursor-pointer text-xs text-gray-600 hover:text-[#ff6200] transition-colors">
                    <UploadCloud className="w-4 h-4 text-[#ff6200]" />
                    <span>{uploadingResume ? 'Uploading Resume...' : 'Choose PDF Resume to attach to profile'}</span>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      disabled={uploadingResume}
                      onChange={handleResumeUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Submit Actions */}
          <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingResume || uploadingAvatar}
              className="px-6 py-2.5 rounded-lg bg-[#ff6200] hover:bg-[#e55800] text-white font-bold text-sm shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2 active:scale-95"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <span>Create & Launch Profile</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}