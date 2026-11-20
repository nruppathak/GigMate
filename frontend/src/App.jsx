import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProjectCard from './components/ProjectCard';
import ProjectModal from './components/ProjectModal';
import ApplicationTracker from './components/ApplicationTracker';
import StudentProfileModal from './components/StudentProfileModal';
import PostProjectModal from './components/PostProjectModal';
import ReviewModal from './components/ReviewModal';
import TalentDirectory from './components/TalentDirectory';
import ChatDrawer from './components/ChatDrawer';
import CreateProfileModal from './components/CreateProfileModal';
import LoginModal from './components/LoginModal';

import { 
  fetchUsers, 
  fetchProjects, 
  fetchStats, 
  fetchRecommendedProjects,
  deleteUser,
  deleteAllCustomUsers
} from './api';

import { 
  Search, 
  Sparkles, 
  Briefcase, 
  Award, 
  UserPlus,
  ChevronDown,
  Code,
  Cpu,
  Palette,
  FileText,
  Database,
  Share2,
  X,
  Layers,
  Check
} from 'lucide-react';

const SERVICE_CATEGORIES = [
  {
    id: 'All',
    label: 'All Services',
    icon: Sparkles,
    badge: 'Popular',
    desc: 'Browse all open student gigs across categories',
    subSkills: ['React', 'Python', 'Figma', 'Node.js', 'Content Writing', 'SEO', 'Machine Learning']
  },
  {
    id: 'Web & Mobile',
    label: 'Web & Mobile',
    icon: Code,
    badge: 'High Demand',
    desc: 'Full-stack web apps, mobile applications & frontend interfaces',
    subSkills: ['React', 'Node.js', 'Tailwind CSS', 'TypeScript', 'Flutter', 'Next.js']
  },
  {
    id: 'AI & Machine Learning',
    label: 'AI & Machine Learning',
    icon: Cpu,
    badge: 'Trending',
    desc: 'Model fine-tuning, NLP, PyTorch, computer vision & generative AI',
    subSkills: ['Python', 'Machine Learning', 'PyTorch', 'LLMs', 'OpenAI']
  },
  {
    id: 'Design & Creative',
    label: 'Design & Creative',
    icon: Palette,
    badge: 'Creative',
    desc: 'UI/UX mockups, mobile app wireframes, Figma prototypes & brand assets',
    subSkills: ['Figma', 'UI/UX Design', 'Logo Design', 'Prototyping', 'Canva']
  },
  {
    id: 'Writing & Content',
    label: 'Writing & Content',
    icon: FileText,
    badge: 'Student Friendly',
    desc: 'Technical documentation, blog posts, API guides & academic summaries',
    subSkills: ['Technical Writing', 'Documentation', 'Copywriting', 'SEO']
  },
  {
    id: 'Data & Analytics',
    label: 'Data & Analytics',
    icon: Database,
    badge: 'High Pay',
    desc: 'Automated scrapers, SQL databases, data pipelines & Excel dashboards',
    subSkills: ['Python', 'Web Scraping', 'SQL', 'Data Analysis', 'MongoDB']
  },
  {
    id: 'Marketing & Social Media',
    label: 'Marketing & Social Media',
    icon: Share2,
    badge: 'Campus Growth',
    desc: 'Campus ambassador campaigns, growth strategies & social content',
    subSkills: ['Social Media', 'Content Strategy', 'Canva', 'Branding']
  }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [currentTab, setCurrentTab] = useState('explore'); // 'explore' | 'recommended' | 'applications' | 'talent'
  
  // Data states
  const [projects, setProjects] = useState([]);
  const [recommendedProjects, setRecommendedProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAllServicesOpen, setIsAllServicesOpen] = useState(false);

  // Modals
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isPostProjectOpen, setIsPostProjectOpen] = useState(false);
  const [isCreateProfileOpen, setIsCreateProfileOpen] = useState(false);
  const [createProfileRole, setCreateProfileRole] = useState('student');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(true);
  const [reviewModalData, setReviewModalData] = useState(null);
  
  // Chat Drawer State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatPartner, setChatPartner] = useState(null);
  const [chatProject, setChatProject] = useState(null);

  function handleOpenChat(options = {}) {
    if (options.otherUser) {
      setChatPartner(options.otherUser);
    }
    if (options.project) {
      setChatProject(options.project);
    }
    setIsChatOpen(true);
  }

  // Initialize
  useEffect(() => {
    loadInitialData();
    if (window.location.search.includes('chat') || window.location.hash.includes('chat')) {
      setIsChatOpen(true);
    }
  }, []);

  // Reload projects whenever user or active tab or filters change
  useEffect(() => {
    if (currentUser) {
      loadProjects();
      if (currentUser.role === 'student') {
        loadRecommendations();
      }
    }
  }, [currentUser, selectedCategory, searchQuery]);

  async function loadInitialData() {
    setLoading(true);
    try {
      const [usersData, statsData] = await Promise.all([
        fetchUsers(),
        fetchStats()
      ]);
      setAllUsers(usersData);
      setStats(statsData);

      // Default to the first student (Nrup Pathak first, then Nancy Singh)
      const defaultUser = usersData.find(u => (u.name || '').toLowerCase().includes('nrup'))
        || usersData.find(u => u.role === 'student') 
        || usersData[0];
        console.log("Selected default user:", defaultUser);
      setCurrentUser(defaultUser);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadProjects() {
    try {
      const data = await fetchProjects({
        category: selectedCategory,
        search: searchQuery,
        studentId: currentUser?.role === 'student' ? currentUser.id : undefined
      });
      setProjects(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadRecommendations() {
    if (!currentUser || currentUser.role !== 'student') return;
    try {
      const data = await fetchRecommendedProjects(currentUser._id);
      setRecommendedProjects(data);
    } catch (err) {
      console.error(err);
    }
  }

  function handleSwitchUser(user) {
    setCurrentUser(user);
    if (user.role === 'client' && currentTab === 'recommended') {
      setCurrentTab('explore');
    }
  }

  function handleProfileCreated(newUser) {
    setAllUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    loadProjects();
    if (newUser.role === 'student') {
      loadRecommendations();
      setSelectedStudentId(newUser.id);
    } else {
      setCurrentTab('explore');
    }
  }

  async function handleRefreshProfile() {
    loadProjects();
    if (currentUser?.role === 'student') loadRecommendations();
    try {
      const usersData = await fetchUsers();
      setAllUsers(usersData);
      const updatedUser = usersData.find(u => u.id === currentUser?.id);
      if (updatedUser) {
        setCurrentUser(updatedUser);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteUser(userId, skipConfirm = false) {
    if (!skipConfirm && !window.confirm('Are you sure you want to delete this profile? This action cannot be undone.')) return;
    try {
      await deleteUser(userId);
      const remainingUsers = allUsers.filter(u => u.id !== userId && u._id !== userId);
      setAllUsers(remainingUsers);
      if (currentUser?.id === userId || currentUser?._id === userId) {
        const nextUser = remainingUsers[0] || null;
        setCurrentUser(nextUser);
        setIsLoginModalOpen(true);
      }
      loadProjects();
      if (selectedStudentId === userId) {
        setSelectedStudentId(null);
      }
    } catch (err) {
      alert('Failed to delete profile: ' + err.message);
    }
  }

  async function handleDeleteAllCustom() {
    if (!window.confirm('Are you sure you want to delete all created profiles and reset to initial team profiles?')) return;
    try {
      const res = await deleteAllCustomUsers();
      setAllUsers(res.users);
      const stillActive = res.users.find(u => u.id === currentUser?.id);
      setCurrentUser(stillActive || res.users[0]);
      loadProjects();
      setSelectedStudentId(null);
    } catch (err) {
      alert('Failed to reset profiles: ' + err.message);
    }
  }

  // High performance category click handler with smooth scroll
  function handleSelectCategory(catId, subSkill = '') {
    setSelectedCategory(catId);
    if (subSkill) {
      setSearchQuery(subSkill);
    } else if (catId === 'All') {
      setSearchQuery('');
    }
    if (currentTab !== 'explore') {
      setCurrentTab('explore');
    }
    setIsAllServicesOpen(false);

    // Smooth scroll down so user immediately sees filtered project cards
    setTimeout(() => {
      const el = document.getElementById('available-projects');
      if (el) {
        const yOffset = -80;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 60);
  }

  const isStudent = currentUser?.role === 'student';
  const activeCategoryObj = SERVICE_CATEGORIES.find(c => c.id === selectedCategory) || SERVICE_CATEGORIES[0];

  return (
    <div className="min-h-screen bg-[#f9fafb] text-gray-900 flex flex-col font-sans relative selection:bg-[#ff6200] selection:text-white">
      {/* Header & Navigation */}
      <Navbar
        currentUser={currentUser}
        allUsers={allUsers}
        onSwitchUser={handleSwitchUser}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenPostProject={() => setIsPostProjectOpen(true)}
        onOpenProfile={(id) => setSelectedStudentId(id)}
        onOpenChat={() => handleOpenChat()}
        onOpenCreateProfile={(role = 'student') => {
          setCreateProfileRole(role);
          setIsCreateProfileOpen(true);
        }}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={() => {
          setCurrentUser(null);
          setIsLoginModalOpen(true);
        }}
        onDeleteUser={handleDeleteUser}
        onDeleteAllCustom={handleDeleteAllCustom}
      />

      {/* PeoplePerHour-Style Sub-Navigation Category Bar (Clickable & Interactive) */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1 text-xs font-semibold text-gray-600 no-scrollbar">
            
            {/* All Services with clickable dropdown trigger */}
            <div className="relative shrink-0 flex items-center">
              <button
                type="button"
                onClick={() => handleSelectCategory('All')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === 'All'
                    ? 'text-[#ff6200] font-black bg-orange-50 border border-orange-200 shadow-2xs'
                    : 'hover:text-[#ff6200] hover:bg-orange-50/50'
                }`}
                title="View All Services"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#ff6200]" />
                <span>All Services</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAllServicesOpen(prev => !prev);
                }}
                className={`p-1.5 ml-0.5 rounded-lg text-gray-400 hover:text-[#ff6200] hover:bg-orange-50 transition-colors cursor-pointer ${
                  isAllServicesOpen ? 'bg-orange-50 text-[#ff6200]' : ''
                }`}
                title="Browse all categories menu"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isAllServicesOpen ? 'rotate-180 text-[#ff6200]' : ''}`} />
              </button>
            </div>

            <div className="h-4 w-px bg-gray-200 shrink-0 mx-1" />

            {/* Individual Category Options Beside All Services (All Clickable) */}
            {SERVICE_CATEGORIES.filter(c => c.id !== 'All').map(cat => {
              const IconComponent = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? 'text-[#ff6200] font-black bg-orange-50 border border-orange-200 shadow-2xs'
                      : 'hover:text-[#ff6200] hover:bg-orange-50/50 text-gray-700'
                  }`}
                  title={`Filter by ${cat.label}`}
                >
                  <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-[#ff6200]' : 'text-gray-400'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* PeoplePerHour-Style Mega Dropdown on All Services */}
          {isAllServicesOpen && (
            <>
              <div 
                className="fixed inset-0 z-40 bg-black/10" 
                onClick={() => setIsAllServicesOpen(false)} 
              />
              <div className="absolute top-full left-4 sm:left-6 z-50 mt-1 w-[92vw] sm:w-[620px] bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 sm:p-5 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-gray-900">Explore Freelance Categories</span>
                    <span className="text-[10px] bg-orange-100 text-[#ff6200] px-2 py-0.5 rounded-full font-bold">PeoplePerHour Catalog</span>
                  </div>
                  <button
                    onClick={() => setIsAllServicesOpen(false)}
                    className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[60vh] overflow-y-auto p-1">
                  {SERVICE_CATEGORIES.map(cat => {
                    const IconComp = cat.icon;
                    const isCurrent = selectedCategory === cat.id;
                    return (
                      <div 
                        key={cat.id}
                        className={`p-3 rounded-xl border transition-all ${
                          isCurrent 
                            ? 'border-[#ff6200] bg-orange-50/40 shadow-xs' 
                            : 'border-gray-200 hover:border-[#ff6200] hover:bg-orange-50/20'
                        }`}
                      >
                        <div 
                          onClick={() => handleSelectCategory(cat.id)}
                          className="flex items-start gap-2.5 cursor-pointer"
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            isCurrent
                              ? 'bg-[#ff6200] text-white'
                              : 'bg-orange-50 text-[#ff6200] border border-orange-200'
                          }`}>
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-gray-900 hover:text-[#ff6200] transition-colors truncate">
                                {cat.label}
                              </h4>
                              <span className="text-[9px] font-semibold text-gray-400">
                                {cat.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                              {cat.desc}
                            </p>
                          </div>
                        </div>

                        {/* Sub skills pills */}
                        <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-gray-100">
                          {cat.subSkills.slice(0, 4).map(sub => (
                            <button
                              key={sub}
                              onClick={() => handleSelectCategory(cat.id, sub)}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 hover:bg-orange-100 text-gray-600 hover:text-[#ff6200] font-medium transition-colors cursor-pointer"
                            >
                              {sub}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* 1. EXPLORE PROJECTS VIEW */}
        {currentTab === 'explore' && (
          <div className="space-y-8">
            {/* PeoplePerHour-Style Hero Banner */}
            <div className="relative rounded-2xl bg-gradient-to-r from-[#171b22] via-[#232a35] to-[#171b22] text-white p-8 sm:p-14 text-center overflow-hidden shadow-lg">
              <div className="relative z-10 max-w-3xl mx-auto">
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Hire great freelancers,<br />
                  <span className="text-white">do greater work.</span>
                </h1>

                <p className="mt-3 text-sm sm:text-base text-gray-300 max-w-xl mx-auto">
                  Find verified GLA University student talent for software development, creative design, writing, and machine learning.
                </p>

                {/* Pill-Shaped Search Input with Orange Submit Button */}
                <div className="mt-7 max-w-2xl mx-auto bg-white rounded-full p-1.5 pl-6 shadow-2xl flex items-center justify-between text-gray-900">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search for any service, skill, or project..."
                    className="w-full text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-hidden bg-transparent pr-3"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('available-projects');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-10 h-10 rounded-full bg-[#ff6200] hover:bg-[#e55800] text-white flex items-center justify-center shrink-0 shadow-sm transition-colors cursor-pointer"
                    title="Search projects"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Service Outline Pills (Clickable) */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
                  {[
                    { label: 'Web development →', cat: 'Web & Mobile' },
                    { label: 'UI/UX Design →', cat: 'Design & Creative' },
                    { label: 'Python & ML →', cat: 'AI & Machine Learning' },
                    { label: 'Content Writing →', cat: 'Writing & Content' },
                  ].map(pill => (
                    <button
                      key={pill.label}
                      onClick={() => handleSelectCategory(pill.cat)}
                      className="px-3.5 py-1.5 rounded-full border border-white/30 bg-black/30 hover:border-[#ff6200] hover:text-[#ff6200] hover:bg-black/50 text-gray-200 transition-all cursor-pointer text-[11px] font-semibold backdrop-blur-xs"
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* TRUSTED BY Partner Strip (PeoplePerHour style) */}
            <div className="border-b border-gray-200 pb-6 text-center">
              <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-4">
                TRUSTED BY CAMPUS & STARTUPS
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-sm font-extrabold text-gray-400 tracking-wider">
                <span className="hover:text-gray-700 transition-colors">GLA UNIVERSITY</span>
                <span className="hover:text-gray-700 transition-colors">CAMPUS INCUBATOR</span>
                <span className="hover:text-gray-700 transition-colors">IEEE STUDENT BRANCH</span>
                <span className="hover:text-gray-700 transition-colors">GDSC MATHURA</span>
                <span className="hover:text-gray-700 transition-colors">TECH TALENT NETWORK</span>
              </div>
            </div>

            {/* Quick Profile Creation & Skills Onboarding Banner */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-orange-50 text-[#ff6200] flex items-center justify-center shrink-0 border border-orange-100">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <span>Looking for freelance gigs or want to hire student talent?</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-[#ff6200] border border-orange-200">Free to Join</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    Create your profile in 30 seconds to showcase your skills, upload your resume, and start bidding on relevant projects.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateProfileOpen(true)}
                className="shrink-0 px-4 py-2.5 bg-[#ff6200] hover:bg-[#e55800] text-white font-bold text-xs rounded-md shadow-xs transition-colors cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>+ Create Your Profile & Add Skills</span>
              </button>
            </div>

            {/* Projects Grid Container with Scroll Target */}
            <div id="available-projects" className="scroll-mt-24">
              
              {/* Active Category Filter Header & Sub-Skills Bar */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                    <span>Available Projects</span>
                    <span className="text-xs font-bold text-[#ff6200] bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full">
                      {projects.length} gigs found
                    </span>
                  </h2>

                  <span className="text-gray-300 hidden sm:inline">•</span>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs text-gray-500 font-medium">Category:</span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-[#ff6200] border border-orange-200">
                      <span>{selectedCategory === 'All' ? 'All Services' : selectedCategory}</span>
                      {selectedCategory !== 'All' && (
                        <button
                          type="button"
                          onClick={() => handleSelectCategory('All')}
                          className="hover:text-red-600 cursor-pointer ml-0.5 font-bold"
                          title="Reset to All Services"
                        >
                          ✕
                        </button>
                      )}
                    </span>

                    {searchQuery && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                        <span>Keyword: "{searchQuery}"</span>
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="hover:text-red-600 cursor-pointer ml-0.5 font-bold"
                          title="Clear search"
                        >
                          ✕
                        </button>
                      </span>
                    )}
                  </div>
                </div>

                {/* Sub-skill quick filter chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 md:pt-0">
                  <span className="text-[11px] font-bold text-gray-400 shrink-0">Filter by skill:</span>
                  {activeCategoryObj.subSkills.map(skill => {
                    const isSkillActive = searchQuery.toLowerCase() === skill.toLowerCase();
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => {
                          setSearchQuery(isSkillActive ? '' : skill);
                        }}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer shrink-0 ${
                          isSkillActive
                            ? 'bg-[#ff6200] text-white border-[#ff6200] shadow-2xs'
                            : 'bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-[#ff6200] border-gray-200'
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>

              {projects.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-xl border border-dashed border-gray-200">
                  <Briefcase className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-gray-700">No projects found in this category</h3>
                  <p className="text-xs text-gray-500 mt-1 mb-4">Try clearing your filters or viewing all open gigs.</p>
                  <button
                    onClick={() => handleSelectCategory('All')}
                    className="px-4 py-2 bg-[#ff6200] hover:bg-[#e55800] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    View All Services & Projects
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {projects.map(project => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      isStudent={isStudent}
                      onSelectProject={(proj) => setSelectedProjectId(proj.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. RECOMMENDED PROJECTS VIEW (STUDENTS ONLY) */}
        {currentTab === 'recommended' && isStudent && (
          <div className="space-y-6">
            <div className="bg-[#171b22] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-md">
              <div className="max-w-2xl relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff6200] text-white text-xs font-semibold mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Skill-Matching Algorithm</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Projects Matched to Your Skills
                </h1>
                <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed">
                  Open gigs ranked by exact compatibility with your profile skills. Applying to projects with higher match percentages significantly increases your interview and hiring rate!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recommendedProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isStudent={true}
                  onSelectProject={(proj) => setSelectedProjectId(proj.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* 3. APPLICATION TRACKING & CLIENT MANAGEMENT */}
        {currentTab === 'applications' && (
          <ApplicationTracker
            currentUser={currentUser}
            onSelectProject={(proj) => setSelectedProjectId(proj.id)}
            onOpenReviewModal={(data) => setReviewModalData(data)}
            onOpenChat={handleOpenChat}
          />
        )}

        {/* 4. STUDENT TALENT DIRECTORY */}
        {currentTab === 'talent' && (
          <TalentDirectory
            onSelectStudent={(id) => setSelectedStudentId(id)}
            onOpenChat={handleOpenChat}
            onOpenCreateProfile={() => setIsCreateProfileOpen(true)}
          />
        )}
      </main>

      {/* PeoplePerHour-Style Clean Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white py-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#ff6200] text-white flex items-center justify-center text-[10px] font-bold">
              g
            </div>
            <span className="font-bold text-gray-800">gig<span className="text-[#ff6200]">mate</span></span>
            <span>— GLA University Student Freelance Platform • Mathura, UP</span>
          </div>
          <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
            <span>Sec 3FB: Nrup Pathak • Nancy Singh • Naman Sharma • Kuldeep Kumar</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {/* Login & Role Selection Modal (prompts on initial load or switch) */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        allUsers={allUsers}
        currentUser={currentUser}
        onSelectUser={handleSwitchUser}
        onOpenCreateProfile={(role = 'student') => {
          setCreateProfileRole(role);
          setIsCreateProfileOpen(true);
        }}
      />

      {isCreateProfileOpen && (
        <CreateProfileModal
          isOpen={isCreateProfileOpen}
          onClose={() => setIsCreateProfileOpen(false)}
          onProfileCreated={handleProfileCreated}
          initialRole={createProfileRole}
        />
      )}

      {selectedProjectId && (
        <ProjectModal
          projectId={selectedProjectId}
          currentUser={currentUser}
          onClose={() => setSelectedProjectId(null)}
          onApplicationSubmitted={() => {
            loadProjects();
            if (isStudent) loadRecommendations();
          }}
          onOpenStudentProfile={(id) => setSelectedStudentId(id)}
          onOpenReviewModal={(data) => setReviewModalData(data)}
          onOpenChat={handleOpenChat}
        />
      )}

      {selectedStudentId && (
        <StudentProfileModal
          userId={selectedStudentId}
          currentUserId={currentUser?.id}
          onClose={() => setSelectedStudentId(null)}
          onProfileUpdated={handleRefreshProfile}
          onDeleteProfile={() => handleDeleteUser(selectedStudentId, true)}
          onOpenChat={handleOpenChat}
        />
      )}

      {isPostProjectOpen && currentUser?.role === 'client' && (
        <PostProjectModal
          currentUser={currentUser}
          onClose={() => setIsPostProjectOpen(false)}
          onProjectCreated={() => {
            loadProjects();
            if (isStudent) loadRecommendations();
          }}
        />
      )}

      {reviewModalData && (
        <ReviewModal
          reviewData={reviewModalData}
          onClose={() => setReviewModalData(null)}
          onReviewSubmitted={() => {
            loadProjects();
          }}
        />
      )}

      {/* In-App Project Messaging Drawer */}
      {isChatOpen && currentUser && (
        <ChatDrawer
          currentUser={currentUser}
          initialOtherUser={chatPartner}
          initialProject={chatProject}
          onClose={() => {
            setIsChatOpen(false);
            setChatPartner(null);
            setChatProject(null);
          }}
          onOpenProject={(id) => {
            setSelectedProjectId(id);
            setIsChatOpen(false);
          }}
        />
      )}
    </div>
  );
}
