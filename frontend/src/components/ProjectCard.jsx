import React from 'react';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Sparkles, 
  ArrowRight, 
  Star, 
  Award, 
  CheckCircle2,
  Clock,
  Cpu
} from 'lucide-react';
import { formatProposalCount } from '../utils/proposalUtils';

export default function ProjectCard({ project, isStudent, onSelectProject }) {
  const match = project.matchAnalysis;
  const matchScore = match ? match.score : (project.matchScore || 0);

  // Badge color based on skill match score
  let matchBadgeColor = 'bg-gray-100 text-gray-600 border-gray-200';
  if (matchScore >= 80) {
    matchBadgeColor = 'bg-orange-50 text-[#ff6200] border-orange-200 font-bold';
  } else if (matchScore >= 50) {
    matchBadgeColor = 'bg-amber-50 text-amber-700 border-amber-200 font-medium';
  }

  return (
    <div 
      onClick={() => onSelectProject(project)}
      className="bg-white rounded-xl border border-gray-200 p-5 hover:border-[#ff6200] hover:shadow-md transition-all duration-200 flex flex-col justify-between group cursor-pointer relative shadow-xs"
    >
      <div>
        {/* Top bar: Category & Match Score */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-gray-100 text-gray-700">
            {project.category}
          </span>

          {isStudent && match && (
            <div className={`flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full border ${matchBadgeColor}`}>
              <Sparkles className="w-3.5 h-3.5 text-[#ff6200]" />
              <span>{matchScore}% Match</span>
            </div>
          )}
        </div>

        {/* Project Title */}
        <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-[#ff6200] transition-colors line-clamp-1 mb-1.5 tracking-tight">
          {project.title}
        </h3>

        {/* Client snippet */}
        <div className="flex items-center gap-2 mb-3">
          <img 
            src={project.client_avatar} 
            alt={project.client_name} 
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(project.client_name || 'Client')}&background=ff6200&color=fff&bold=true`;
            }}
            className="w-5 h-5 rounded-full object-cover ring-1 ring-gray-200 bg-white"
          />
          <span className="text-xs font-medium text-gray-600">{project.client_name}</span>
          <div className="flex items-center gap-0.5 text-amber-500 text-xs font-bold">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{project.client_rating ? project.client_rating.toFixed(1) : '5.0'}</span>
          </div>
        </div>

        {/* Description snippet */}
        <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 mb-4 leading-relaxed">
          {project.description}
        </p>

        {/* Perks tag */}
        {project.perks && (
          <div className="bg-orange-50/70 border border-orange-100 rounded-lg p-2.5 mb-4 text-xs text-orange-900 flex items-start gap-2">
            <Award className="w-4 h-4 text-[#ff6200] shrink-0 mt-0.5" />
            <span className="line-clamp-1">
              <strong className="font-semibold text-orange-800">Campus Perks:</strong> {project.perks}
            </span>
          </div>
        )}

        {/* Skills required */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.skills?.map((skill, idx) => {
            const isMatched = match?.matched?.some(m => m.toLowerCase() === skill.toLowerCase());
            return (
              <span
                key={idx}
                className={`text-xs px-2.5 py-0.5 rounded-md font-medium transition-colors ${
                  isMatched
                    ? 'bg-orange-50 text-[#ff6200] border border-orange-200 font-semibold'
                    : 'bg-gray-50 text-gray-600 border border-gray-200'
                }`}
              >
                {skill}
                {isMatched && ' ✓'}
              </span>
            );
          })}
        </div>
      </div>

      {/* Footer Info & Action */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-0.5 font-extrabold text-gray-900 text-base">
            <span className="text-[#ff6200]">$</span>
            <span>{project.budget_amount}</span>
            <span className="text-gray-400 text-[11px] font-normal ml-0.5">
              {project.budget_type === 'hourly' ? '/hr' : 'fixed'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-gray-500">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>{project.duration}</span>
          </div>

          <div className="flex items-center gap-1 hidden sm:flex text-gray-500">
            <Users className="w-3.5 h-3.5 text-gray-400" />
            <span>{formatProposalCount(project.applicantCount || 0)}</span>
          </div>
        </div>

        <span className="text-[#ff6200] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          {isStudent ? 'Apply Now' : 'View Details'}
          <ArrowRight className="w-3.5 h-3.5 text-[#ff6200]" />
        </span>
      </div>
    </div>
  );
}
