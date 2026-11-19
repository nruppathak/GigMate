import React, { useState } from 'react';
import { 
  GraduationCap, 
  Briefcase, 
  Compass, 
  Sparkles, 
  Layers, 
  PlusCircle, 
  Users, 
  ChevronDown, 
  Check, 
  Clock, 
  Award,
  DollarSign,
  MessageSquare,
  UserPlus,
  Search,
  Smile,
  Edit3,
  Trash2
} from 'lucide-react';

export default function Navbar({ 
  currentUser, 
  allUsers, 
  onSwitchUser, 
  currentTab, 
  setCurrentTab,
  onOpenPostProject,
  onOpenProfile,
  onOpenChat,
  onOpenCreateProfile,
  onDeleteUser,
  onDeleteAllCustom
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isStudent = currentUser?.role === 'student';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      {/* Top University Micro Banner */}
      <div className="bg-[#1b222c] text-gray-300 text-[11px] py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff6200] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff6200]"></span>
        </span>
        <GraduationCap className="w-3.5 h-3.5 text-[#ff6200]" />
        <span className="truncate">
          <strong className="text-white font-semibold">GigMate:</strong> GLA University Student Freelance Platform • Mathura, UP (Sec 3FB Project)
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand (PeoplePerHour style) */}
          <div className="flex items-center gap-6 lg:gap-8">
            <button 
              onClick={() => setCurrentTab('explore')}
              className="flex items-center gap-2.5 text-left focus:outline-hidden group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-[#ff6200] flex items-center justify-center text-white shadow-xs group-hover:bg-[#e55800] transition-colors">
                <Smile className="w-5 h-5 text-white" />
              </div>
              <div className="leading-none">
                <span className="text-2xl font-black tracking-tight text-gray-900 font-sans">
                  gig<span className="text-[#ff6200]">mate</span>
                </span>
                <span className="block text-[9.5px] uppercase font-bold tracking-wider text-gray-400 mt-0.5">
                  GLA University
                </span>
              </div>
            </button>

            {/* Main Nav items */}
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => setCurrentTab('explore')}
                className={`text-sm font-semibold transition-colors cursor-pointer py-1 ${
                  currentTab === 'explore'
                    ? 'text-[#ff6200] border-b-2 border-[#ff6200]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Explore Projects
              </button>

              {isStudent && (
                <button
                  onClick={() => setCurrentTab('recommended')}
                  className={`text-sm font-semibold transition-colors cursor-pointer py-1 ${
                    currentTab === 'recommended'
                      ? 'text-[#ff6200] border-b-2 border-[#ff6200]'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Skill Matched
                </button>
              )}

              <button
                onClick={() => setCurrentTab('applications')}
                className={`text-sm font-semibold transition-colors cursor-pointer py-1 ${
                  currentTab === 'applications'
                    ? 'text-[#ff6200] border-b-2 border-[#ff6200]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {isStudent ? 'My Applications' : 'Manage Listings'}
              </button>

              <button
                onClick={() => setCurrentTab('talent')}
                className={`text-sm font-semibold transition-colors cursor-pointer py-1 ${
                  currentTab === 'talent'
                    ? 'text-[#ff6200] border-b-2 border-[#ff6200]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Student Talent
              </button>
            </nav>
          </div>

          {/* Right Action side: Post Project, Profile, Messages, Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Pill (PeoplePerHour style) */}
            <button
              onClick={() => setCurrentTab('explore')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-300 text-xs font-bold text-gray-600 hover:text-[#ff6200] hover:border-[#ff6200] transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-[#ff6200]" />
              <span>SEARCH</span>
            </button>

            {/* Messages Chat Trigger Button */}
            <button
              onClick={onOpenChat}
              className="relative p-2 text-gray-600 hover:text-[#ff6200] hover:bg-orange-50 border border-gray-200 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
              title="Open Project Messages"
            >
              <MessageSquare className="w-4 h-4 text-gray-500" />
              <span className="hidden sm:inline text-xs font-semibold text-gray-700">Messages</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#ff6200] rounded-full ring-2 ring-white" />
            </button>

            {/* POST PROJECT in signature PeoplePerHour Orange */}
            <button
              onClick={onOpenPostProject}
              className="bg-[#ff6200] hover:bg-[#e55800] text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>POST PROJECT</span>
            </button>

            {/* Create Profile Quick Trigger Button */}
            <button
              onClick={onOpenCreateProfile}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold text-[#ff6200] bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-colors cursor-pointer"
              title="Create new Student or Client profile and add your skills"
            >
              <UserPlus className="w-3.5 h-3.5 shrink-0 text-[#ff6200]" />
              <span className="hidden sm:inline">+ Create Profile</span>
              <span className="sm:hidden">+ Profile</span>
            </button>

            {/* Direct Edit Profile Button */}
            <button
              onClick={() => onOpenProfile(currentUser?.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold text-gray-700 hover:text-[#ff6200] bg-white hover:bg-orange-50 border border-gray-200 transition-colors cursor-pointer shadow-2xs"
              title="Edit your profile details, photo, bio & skills"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#ff6200]" />
              <span className="hidden md:inline">Edit Profile</span>
              <span className="md:hidden">Edit</span>
            </button>

            {/* Persona Switcher Menu */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all cursor-pointer text-left"
                title="Switch persona (Student / Client)"
              >
                <img
                  src={currentUser?.avatar}
                  alt={currentUser?.name}
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'User')}&background=ff6200&color=fff&bold=true`;
                  }}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-200 bg-white"
                />
                <div className="hidden lg:block leading-tight">
                  <div className="text-xs font-bold text-gray-900 truncate max-w-[110px]">
                    {currentUser?.name}
                  </div>
                  <div className="text-[10px] font-semibold text-gray-500 capitalize flex items-center gap-1">
                    {isStudent ? '🎓 Student' : '💼 Recruiter'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 p-2 z-50 text-gray-900 animate-in fade-in zoom-in-95 duration-150">
                  
                  {/* Current Active Profile Card with Direct Edit Button */}
                  <div className="p-2.5 mb-2 bg-orange-50/80 border border-orange-200 rounded-lg flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={currentUser?.avatar}
                        alt={currentUser?.name}
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'User')}&background=ff6200&color=fff&bold=true`;
                        }}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-[#ff6200] shrink-0 bg-white"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-black text-gray-900 truncate">
                          {currentUser?.name}
                        </div>
                        <div className="text-[10px] text-gray-600 truncate">
                          {currentUser?.headline || (isStudent ? '🎓 Student Freelancer' : '💼 Recruiter')}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onOpenProfile(currentUser?.id);
                        setDropdownOpen(false);
                      }}
                      className="px-2.5 py-1 text-xs font-bold text-white bg-[#ff6200] hover:bg-[#e55800] rounded-md transition-colors shrink-0 shadow-2xs cursor-pointer flex items-center gap-1 active:scale-95"
                      title="Edit this profile & change photo"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#ff6200]" />
                      <span>Switch Personas</span>
                    </p>
                    <button
                      onClick={() => {
                        onOpenCreateProfile();
                        setDropdownOpen(false);
                      }}
                      className="text-[11px] font-bold text-[#ff6200] hover:underline cursor-pointer"
                    >
                      + Add New
                    </button>
                  </div>

                  <div className="py-1 max-h-56 overflow-y-auto">
                    {allUsers.map(user => {
                      const selected = user.id === currentUser?.id;
                      return (
                        <div
                          key={user.id}
                          onClick={() => {
                            onSwitchUser(user);
                            setDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors cursor-pointer group ${
                            selected 
                              ? 'bg-orange-50 text-[#ff6200] font-semibold' 
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              onError={(e) => {
                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=ff6200&color=fff&bold=true`;
                              }}
                              className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-gray-200 bg-white"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold truncate text-gray-900">{user.name}</p>
                              <p className="text-[10px] text-gray-500 truncate">
                                {user.role === 'student' ? `🎓 ${user.college || 'Student'}` : '💼 Recruiter'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 shrink-0">
                            {selected && <Check className="w-4 h-4 text-[#ff6200]" />}
                            {allUsers.length > 1 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteUser && onDeleteUser(user.id);
                                }}
                                className="p-1 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                title={`Delete profile "${user.name}"`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-gray-100 px-2 pb-1 space-y-1.5">
                    <button
                      onClick={() => {
                        onOpenCreateProfile();
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 p-2 rounded-lg text-xs font-bold text-[#ff6200] bg-orange-50 hover:bg-orange-100 border border-orange-200 shadow-2xs transition-colors cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Create Another Profile</span>
                    </button>

                    {onDeleteAllCustom && (
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteAllCustom();
                          setDropdownOpen(false);
                        }}
                        className="w-full text-center text-[10px] text-gray-400 hover:text-red-600 font-semibold py-1 transition-colors cursor-pointer flex items-center justify-center gap-1"
                        title="Delete all newly created profiles and reset to initial team"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete / Reset All Custom Profiles</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
