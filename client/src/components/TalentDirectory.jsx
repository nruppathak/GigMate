import React, { useState, useEffect } from 'react';
import { 
  fetchUsers 
} from '../api';
import { 
  GraduationCap, 
  Star, 
  DollarSign, 
  Clock, 
  Search, 
  Briefcase, 
  Award, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  MessageSquare,
  UserPlus,
  Bot,
  Cpu
} from 'lucide-react';

export default function TalentDirectory({ onSelectStudent, onOpenChat, onOpenCreateProfile }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('All');

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    setLoading(true);
    try {
      const data = await fetchUsers('student');
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Extract all unique skills across students
  const allSkills = ['All', ...new Set(
    students.flatMap(s => s.skills?.map(sk => sk.skill_name) || [])
  )];

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.college?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.major?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.skills?.some(s => s.skill_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSkill = selectedSkill === 'All' || 
      student.skills?.some(s => s.skill_name.toLowerCase() === selectedSkill.toLowerCase());

    return matchesSearch && matchesSkill;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 text-gray-900 relative overflow-hidden shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#ff6200] text-xs font-semibold mb-3 border border-orange-200">
            <GraduationCap className="w-3.5 h-3.5 text-[#ff6200]" />
            <span>GLA University Freelance Talent</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
            Discover Top Student Freelancers
          </h1>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            Connect directly with verified student developers, designers, writers, and engineers at competitive student-friendly rates.
          </p>
        </div>

        {onOpenCreateProfile && (
          <div className="relative z-10 shrink-0">
            <button
              onClick={onOpenCreateProfile}
              className="px-4 py-2.5 bg-[#ff6200] hover:bg-[#e55800] text-white font-bold text-xs sm:text-sm rounded-md shadow-xs transition-colors cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-white" />
              <span>+ Create Student Profile</span>
            </button>
          </div>
        )}
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by student name, skills (e.g. React, Python), university..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#ff6200] focus:ring-1 focus:ring-[#ff6200]"
          />
        </div>

        {/* Skill filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-xl">
          {allSkills.slice(0, 8).map(skill => (
            <button
              key={skill}
              onClick={() => setSelectedSkill(skill)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedSkill === skill
                  ? 'bg-[#ff6200] text-white font-bold'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Student Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-gray-500">
          <div className="w-8 h-8 border-4 border-[#ff6200] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Loading verified student talent...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-dashed border-gray-200">
          <GraduationCap className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-gray-700">No students found matching your criteria</h3>
          <p className="text-xs text-gray-500 mt-1 mb-4">Try clearing your search query or create a new student profile.</p>
          {onOpenCreateProfile && (
            <button
              onClick={onOpenCreateProfile}
              className="px-4 py-2 bg-[#ff6200] hover:bg-[#e55800] text-white font-bold text-xs rounded-md shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Create My Student Profile</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStudents.map(student => (
            <div
              key={student.id}
              onClick={() => onSelectStudent(student.id)}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-[#ff6200] hover:shadow-md transition-all duration-200 flex flex-col justify-between group cursor-pointer shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || 'Student')}&background=ff6200&color=fff&bold=true`;
                      }}
                      className="w-12 h-12 rounded-full object-cover ring-1 ring-gray-200 bg-white"
                    />
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-[#ff6200] transition-colors text-sm">
                        {student.name}
                      </h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <GraduationCap className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate max-w-[150px]">{student.college}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 text-amber-500 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{student.rating_avg ? student.rating_avg.toFixed(1) : '5.0'}</span>
                  </div>
                </div>

                <p className="text-xs font-semibold text-gray-800 mb-1 line-clamp-1">
                  {student.headline}
                </p>

                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4">
                  {student.bio}
                </p>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {student.skills?.slice(0, 4).map(skill => (
                    <span
                      key={skill.skill_name}
                      className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-gray-50 text-gray-700 border border-gray-200"
                    >
                      {skill.skill_name}
                    </span>
                  ))}
                  {student.skills?.length > 4 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md text-gray-400 font-medium">
                      +{student.skills.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-gray-900 text-sm">${student.hourly_rate}/hr</span>
                  <span>•</span>
                  <span>{student.availability_hours}h/wk</span>
                </div>

                <div className="flex items-center gap-2">
                  {onOpenChat && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenChat({ otherUser: student });
                      }}
                      className="p-1.5 text-gray-400 hover:text-[#ff6200] hover:bg-orange-50 rounded-md transition-colors cursor-pointer"
                      title={`Message ${student.name}`}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  )}
                  <span className="text-[#ff6200] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform text-xs">
                    View Profile
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
