import React, { useState } from 'react';
import { 
  X, 
  PlusCircle, 
  Sparkles, 
  DollarSign, 
  Clock, 
  Award, 
  AlertCircle,
  Check
} from 'lucide-react';
import { createProject } from '../api';

const POPULAR_SKILLS = [
  'React', 'Python', 'Figma', 'Tailwind CSS', 'TypeScript', 
  'Node.js', 'SQL', 'UI/UX Design', 'Machine Learning', 
  'Web Scraping', 'Video Editing', 'Technical Writing'
];

const CATEGORIES = [
  'Web & Mobile',
  'AI & Machine Learning',
  'Design & Creative',
  'Writing & Content',
  'Data & Analytics',
  'Marketing & Social Media'
];

export default function PostProjectModal({ 
  currentUser, 
  onClose, 
  onProjectCreated 
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Web & Mobile');
  const [budgetType, setBudgetType] = useState('fixed');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [duration, setDuration] = useState('2-3 weeks');
  const [experienceLevel, setExperienceLevel] = useState('Entry / Student-friendly');
  const [perks, setPerks] = useState('Flexible exam hours, Letter of Recommendation, Mentorship');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState(['React', 'Tailwind CSS']);
  const [customSkill, setCustomSkill] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  function toggleSkill(skill) {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  }

  function handleAddCustomSkill(e) {
    e.preventDefault();
    if (!customSkill.trim()) return;
    if (!skills.includes(customSkill.trim())) {
      setSkills([...skills, customSkill.trim()]);
    }
    setCustomSkill('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim() || !description.trim() || !budgetAmount) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (skills.length === 0) {
      setErrorMsg('Please select at least one required skill.');
      return;
    }

    setSubmitting(true);
    try {
      await createProject({
        client_id: currentUser.id,
        title: title.trim(),
        description: description.trim(),
        category,
        budget_type: budgetType,
        budget_amount: parseFloat(budgetAmount),
        duration,
        experience_level: experienceLevel,
        perks: perks.trim(),
        skills
      });
      if (onProjectCreated) onProjectCreated();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to post project');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-200 text-gray-900 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#ff6200] border border-orange-200 flex items-center justify-center shadow-xs">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-gray-900">Post a Project</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-50 text-[#ff6200] border border-orange-200 font-bold">PeoplePerHour Style</span>
              </div>
              <p className="text-xs text-gray-500">Hire university talent for focused gigs, sprints, and internships</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5 bg-white">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Build an AI-assisted React note-taking dashboard"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-[#ff6200] focus:ring-1 focus:ring-[#ff6200] focus:outline-hidden"
            />
          </div>

          {/* Category & Experience Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-[#ff6200] focus:ring-1 focus:ring-[#ff6200] focus:outline-hidden"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={e => setExperienceLevel(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-[#ff6200] focus:ring-1 focus:ring-[#ff6200] focus:outline-hidden"
              >
                <option value="Entry / Student-friendly">Entry / Student-friendly</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>

          {/* Budget & Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Budget Type</label>
              <select
                value={budgetType}
                onChange={e => setBudgetType(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-[#ff6200] focus:ring-1 focus:ring-[#ff6200] focus:outline-hidden"
              >
                <option value="fixed">Fixed Price</option>
                <option value="hourly">Hourly Rate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Budget Amount ($) *</label>
              <input
                type="number"
                required
                min="1"
                value={budgetAmount}
                onChange={e => setBudgetAmount(e.target.value)}
                placeholder="e.g. 450"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-[#ff6200] focus:ring-1 focus:ring-[#ff6200] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Duration / Timeline</label>
              <input
                type="text"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                placeholder="e.g. 2-3 weeks"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-[#ff6200] focus:ring-1 focus:ring-[#ff6200] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Student Perks */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#ff6200]" />
              <span>Student Perks (Mentorship, Certificate, Exam Flexibility)</span>
            </label>
            <input
              type="text"
              value={perks}
              onChange={e => setPerks(e.target.value)}
              placeholder="e.g. 1-on-1 mentorship with Lead Engineer, flexible schedule during finals"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-[#ff6200] focus:ring-1 focus:ring-[#ff6200] focus:outline-hidden"
            />
          </div>

          {/* Required Skills Picker */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
              <span>Required Skills *</span>
              <span className="text-[11px] text-[#ff6200] font-bold">{skills.length} selected</span>
            </label>

            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {POPULAR_SKILLS.map(skill => {
                const isSelected = skills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-orange-50 text-[#ff6200] border border-orange-300 font-bold shadow-xs'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-900'
                    }`}
                  >
                    {skill} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>

            {/* Custom skill add */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customSkill}
                onChange={e => setCustomSkill(e.target.value)}
                placeholder="Add custom skill (e.g. Docker, GraphQL, Blender)"
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-[#ff6200] focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddCustomSkill}
                className="px-4 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-xs font-bold cursor-pointer transition-colors border border-gray-200"
              >
                Add Skill
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Project Description & Goals *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detail the scope of work, background, requirements, deliverables, and student learning outcomes..."
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-[#ff6200] focus:ring-1 focus:ring-[#ff6200] focus:outline-hidden"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#ff6200] hover:bg-[#e55800] text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer transition-all disabled:opacity-50"
            >
              {submitting ? 'Publishing project...' : 'Publish Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
