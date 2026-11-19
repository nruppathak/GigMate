import React, { useState } from 'react';
import { 
  X, 
  GraduationCap, 
  Briefcase, 
  Smile, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  Check
} from 'lucide-react';
import { loginUser } from '../api';

const PRESET_USER_IDS = [
  'usr_student_1', // Nrup Pathak
  'usr_student_2', // Nancy Singh
  'usr_student_3', // Naman Sharma
  'usr_student_4', // Kuldeep Kumar
  'usr_client_1',  // TechVentures Labs
  'usr_client_2'   // GreenCampus Initiative
];

export default function LoginModal({ 
  isOpen, 
  onClose, 
  allUsers = [], 
  currentUser, 
  onSelectUser, 
  onOpenCreateProfile 
}) {
  if (!isOpen) return null;

  const [selectedRole, setSelectedRole] = useState(currentUser?.role || 'student');
  const [emailInput, setEmailInput] = useState('nrup.pathak_cs24@gla.ac.in');
  const [passwordInput, setPasswordInput] = useState('123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('Default credentials pre-filled for Nrup Pathak');

  const sortStudents = (list) => {
    return [...list].sort((a, b) => {
      const getRank = (u) => {
        const name = (u.name || '').toLowerCase();
        if (name.includes('nrup')) return 1;
        if (name.includes('nancy')) return 2;
        if (name.includes('kuldeep')) return 3;
        if (name.includes('naman')) return 4;
        return 5;
      };
      return getRank(a) - getRank(b);
    });
  };

  const students = sortStudents(allUsers.filter(u => u.role === 'student'));
  const clients = allUsers.filter(u => u.role === 'client');

  async function handleFormSubmit(e) {
    e.preventDefault();
    setErrorMessage('');
    
    if (!emailInput.trim()) {
      setErrorMessage('Please enter your Login ID / Email.');
      return;
    }
    if (!passwordInput) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser(emailInput.trim(), passwordInput);
      
      // Find full user details from allUsers or use response
      const matched = allUsers.find(u => u.email.toLowerCase() === emailInput.trim().toLowerCase()) || res.user;
      onSelectUser(matched);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Invalid Login ID or Password. Default password for existing profiles is 123.');
    } finally {
      setLoading(false);
    }
  }

  function handleProfileClick(user) {
    const isPreCreated = PRESET_USER_IDS.includes(user.id) || PRESET_USER_IDS.includes(user._id);
    setEmailInput(user.email);
    setErrorMessage('');

    if (isPreCreated) {
      // Automatically enter mail and password (123) for existing profiles
      setPasswordInput('123');
      setInfoMessage(`✓ Auto-entered credentials for ${user.name}`);
    } else {
      // For profiles created in the future, fill email only, leave password for user to enter
      setPasswordInput('');
      setInfoMessage(`✓ Auto-entered email for ${user.name}. Please type your password above.`);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-gray-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-5 sm:p-6 relative shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#ff6200] flex items-center justify-center text-white shadow-lg shrink-0">
                <Smile className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-black tracking-tight">
                    gig<span className="text-[#ff6200]">mate</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-orange-200 border border-white/15">
                    GLA University
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                  Login to Your Account
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 mt-0.5">
                  Enter your Login ID and Password below, or click any profile to auto-enter credentials.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              title="Close and continue"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 min-h-0 space-y-5">
          
          {/* Real Login Credentials Form */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#ff6200]" />
                <h3 className="text-sm font-bold text-gray-900">Enter Credentials</h3>
              </div>
              {infoMessage && !errorMessage && (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                  <Check className="w-3.5 h-3.5" />
                  <span>{infoMessage}</span>
                </span>
              )}
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Login ID Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Login ID / Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={emailInput}
                      onChange={e => {
                        setEmailInput(e.target.value);
                        setInfoMessage('');
                      }}
                      placeholder="e.g. nrup.pathak_cs24@gla.ac.in"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#ff6200] focus:ring-1 focus:ring-[#ff6200] font-medium"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={passwordInput}
                      onChange={e => {
                        setPasswordInput(e.target.value);
                        setInfoMessage('');
                      }}
                      placeholder="Enter password"
                      className="w-full pl-9 pr-10 py-2 text-sm rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#ff6200] focus:ring-1 focus:ring-[#ff6200] font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#ff6200] hover:bg-[#e55800] transition-all cursor-pointer shadow-sm flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Verifying...</span>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Quick Profile Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#ff6200]" />
                  <span>Choose Account To Auto-Enter</span>
                </h3>
              </div>

              {/* Role Toggle */}
              <div className="flex border border-gray-200 rounded-lg p-0.5 bg-gray-200/60">
                <button
                  type="button"
                  onClick={() => setSelectedRole('student')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    selectedRole === 'student' ? 'bg-white text-[#ff6200] shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🎓 Students ({students.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('client')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    selectedRole === 'client' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  💼 Clients ({clients.length})
                </button>
              </div>
            </div>

            {selectedRole === 'student' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {students.map(student => {
                  const isCurrent = currentUser?.id === student.id;
                  const isSelectedInForm = emailInput.toLowerCase() === student.email.toLowerCase();
                  const isPreCreated = PRESET_USER_IDS.includes(student.id) || PRESET_USER_IDS.includes(student._id);

                  return (
                    <div
                      key={student.id}
                      onClick={() => handleProfileClick(student)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left flex flex-col justify-between group relative ${
                        isCurrent
                          ? 'bg-orange-50/80 border-[#ff6200] shadow-xs ring-1 ring-[#ff6200]'
                          : isSelectedInForm
                          ? 'bg-white border-[#ff6200] shadow-xs ring-1 ring-orange-200'
                          : 'bg-white border-gray-200 hover:border-orange-300 hover:shadow-xs'
                      }`}
                    >
                      {isCurrent && (
                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-[#ff6200] text-white text-[9px] font-black uppercase tracking-wider rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Logged In
                        </span>
                      )}

                      <div className="flex items-start gap-3">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=ff6200&color=fff&bold=true`;
                          }}
                          className="w-11 h-11 rounded-full object-cover border border-gray-200 shrink-0 bg-white"
                        />

                        <div className="min-w-0 flex-1 pr-14 sm:pr-0">
                          <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#ff6200] transition-colors truncate">
                            {student.name}
                          </h4>
                          <p className="text-[11px] text-gray-500 line-clamp-1 font-medium mt-0.5">
                            {student.headline || 'B.Tech CS Student'}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500 font-medium">
                            <span className="text-[#ff6200] font-bold">${student.hourly_rate || 25}/hr</span>
                            <span>•</span>
                            <span>★ {student.rating_avg || 5.0}</span>
                            <span>•</span>
                            <span className="text-[10px] text-gray-400">
                              {isPreCreated ? 'Pre-filled' : 'Custom'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#ff6200]">
                        <span className="text-[10px] text-gray-400 font-medium font-sans">
                          GLA University Mathura
                        </span>
                        <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>{isSelectedInForm ? 'Selected' : `Auto-fill ${student.name.split(' ')[0]}`}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {clients.map(client => {
                  const isCurrent = currentUser?.id === client.id;
                  const isSelectedInForm = emailInput.toLowerCase() === client.email.toLowerCase();
                  const isPreCreated = PRESET_USER_IDS.includes(client.id) || PRESET_USER_IDS.includes(client._id);

                  return (
                    <div
                      key={client.id}
                      onClick={() => handleProfileClick(client)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left flex flex-col justify-between group relative ${
                        isCurrent
                          ? 'bg-blue-50/80 border-blue-500 shadow-xs ring-1 ring-blue-500'
                          : isSelectedInForm
                          ? 'bg-white border-blue-500 shadow-xs ring-1 ring-blue-200'
                          : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-xs'
                      }`}
                    >
                      {isCurrent && (
                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Logged In
                        </span>
                      )}

                      <div className="flex items-start gap-3">
                        <img
                          src={client.avatar}
                          alt={client.name}
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=2563eb&color=fff&bold=true`;
                          }}
                          className="w-11 h-11 rounded-xl object-cover border border-gray-200 shrink-0 bg-white"
                        />

                        <div className="min-w-0 flex-1 pr-14 sm:pr-0">
                          <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                            {client.name}
                          </h4>
                          <p className="text-[11px] text-gray-500 line-clamp-1 font-medium mt-0.5">
                            {client.headline || 'Industry Recruiter'}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500 font-medium">
                            <span className="text-blue-700 font-semibold text-[10px]">Verified Recruiter</span>
                            <span>•</span>
                            <span className="text-[10px] text-gray-400">
                              {isPreCreated ? 'Pre-filled' : 'Custom'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-blue-600">
                        <span className="text-[10px] text-gray-400 font-medium font-sans">
                          Recruiter Account
                        </span>
                        <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>{isSelectedInForm ? 'Selected' : `Auto-fill ${client.name.split(' ')[0]}`}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Sparkles className="w-4 h-4 text-[#ff6200]" />
            <span>
              Active: <strong className="text-gray-900 font-bold">{currentUser?.name || 'Guest'}</strong> ({currentUser?.role === 'student' ? 'Student' : 'Client'})
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => {
                onOpenCreateProfile && onOpenCreateProfile(selectedRole);
                onClose();
              }}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold text-[#ff6200] bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-colors cursor-pointer text-center"
            >
              + Create New Profile (Custom Email & Pass)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold text-white bg-gray-900 hover:bg-black transition-colors cursor-pointer text-center"
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
