import { Project } from '../../database/models/Project.js';
import { User } from '../../database/models/User.js';
import { Application } from '../../database/models/Application.js';
import { fallbackStore, isMongoConnected } from '../../database/index.js';
import { calculateSkillMatch } from '../utils/skillMatcher.js';

export const getProjects = async (req, res, next) => {
  try {
    const { category, search, studentId, clientId, status } = req.query;

    let studentSkills = [];
    if (studentId) {
      if (isMongoConnected) {
        const student = await User.findById(studentId);
        studentSkills = student?.skills?.map(s => s.skill_name) || [];
      } else {
        const student = fallbackStore.users.find(u => u.id === studentId);
        studentSkills = student?.skills?.map(s => s.skill_name) || [];
      }
    }

    let projectList = [];

    if (isMongoConnected) {
      const query = {};
      if (status) query.status = status;
      else query.status = { $ne: 'closed' };

      if (clientId) query.client_id = clientId;
      if (category && category !== 'All') query.category = category;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const projs = await Project.find(query).sort({ createdAt: -1 });

      projectList = await Promise.all(projs.map(async p => {
        const client = await User.findById(p.client_id);
        const applicantCount = await Application.countDocuments({
          project_id: p._id,
          status: { $nin: ['withdrawn'] }
        });
        const matchAnalysis = studentId ? calculateSkillMatch(studentSkills, p.skills) : null;

        return {
          ...p.toObject(),
          client_name: client?.name || 'Verified Client',
          client_avatar: client?.avatar || '',
          client_rating: client?.rating_avg || 5.0,
          applicantCount,
          matchAnalysis
        };
      }));

      return res.json(projectList);
    }

    // Fallback in-memory store
    let filtered = [...fallbackStore.projects];
    if (status) filtered = filtered.filter(p => p.status === status);
    else filtered = filtered.filter(p => p.status !== 'closed');

    if (clientId) filtered = filtered.filter(p => p.client_id === clientId);
    if (category && category !== 'All') filtered = filtered.filter(p => p.category === category);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    projectList = filtered.map(p => {
      const client = fallbackStore.users.find(u => u.id === p.client_id);
      const applicantCount = fallbackStore.applications.filter(
        a => a.project_id === p.id && a.status !== 'withdrawn'
      ).length;
      const matchAnalysis = studentId ? calculateSkillMatch(studentSkills, p.skills) : null;

      return {
        ...p,
        client_name: client?.name || 'Verified Client',
        client_avatar: client?.avatar || '',
        client_rating: client?.rating_avg || 5.0,
        applicantCount,
        matchAnalysis
      };
    });

    res.json(projectList);
  } catch (err) {
    next(err);
  }
};

export const getRecommendedProjects = async (req, res, next) => {
  try {
    const studentId = req.params.studentId;
    let studentSkills = [];

    if (isMongoConnected) {
      const student = await User.findById(studentId);
      if (!student) return res.status(404).json({ error: 'Student not found' });
      studentSkills = student.skills?.map(s => s.skill_name) || [];

      const openProjects = await Project.find({ status: 'open' });
      const scored = await Promise.all(openProjects.map(async p => {
        const client = await User.findById(p.client_id);
        const match = calculateSkillMatch(studentSkills, p.skills);
        return {
          ...p.toObject(),
          client_name: client?.name || 'Verified Client',
          client_avatar: client?.avatar || '',
          client_rating: client?.rating_avg || 5.0,
          matchAnalysis: match
        };
      }));

      scored.sort((a, b) => b.matchAnalysis.score - a.matchAnalysis.score);
      return res.json(scored.filter(p => p.matchAnalysis.score >= 30));
    }

    const student = fallbackStore.users.find(u => u.id === studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    studentSkills = student.skills?.map(s => s.skill_name) || [];

    const scored = fallbackStore.projects
      .filter(p => p.status === 'open')
      .map(p => {
        const client = fallbackStore.users.find(u => u.id === p.client_id);
        const match = calculateSkillMatch(studentSkills, p.skills);
        return {
          ...p,
          client_name: client?.name || 'Verified Client',
          client_avatar: client?.avatar || '',
          client_rating: client?.rating_avg || 5.0,
          matchAnalysis: match
        };
      });

    scored.sort((a, b) => b.matchAnalysis.score - a.matchAnalysis.score);
    res.json(scored.filter(p => p.matchAnalysis.score >= 30));
  } catch (err) {
    next(err);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const projectId = req.params.id;

    if (isMongoConnected) {
      const project = await Project.findById(projectId);
      if (!project) return res.status(404).json({ error: 'Project not found' });

      const client = await User.findById(project.client_id);
      const rawApps = await Application.find({ project_id: projectId });

      const applicants = await Promise.all(rawApps.map(async a => {
        const student = await User.findById(a.student_id);
        const studentSkills = student?.skills?.map(s => s.skill_name) || [];
        const match = calculateSkillMatch(studentSkills, project.skills);

        return {
          ...a.toObject(),
          student_name: student?.name || 'Student',
          student_avatar: student?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student?.name || 'Student')}&background=ff6200&color=fff&bold=true`,
          student_college: student?.college || '',
          student_major: student?.major || '',
          student_rating: student?.rating_avg || 5.0,
          student_skills: studentSkills,
          matchAnalysis: match,
          matchScore: match.score
        };
      }));

      const allStudents = await User.find({ role: 'student' });
      const recommendedCandidates = allStudents.map(student => {
        const studentSkills = student.skills?.map(s => s.skill_name) || [];
        const match = calculateSkillMatch(studentSkills, project.skills);
        return {
          student_id: student._id,
          name: student.name,
          avatar: student.avatar,
          college: student.college,
          headline: student.headline,
          rating_avg: student.rating_avg,
          matchAnalysis: match
        };
      }).filter(c => c.matchAnalysis.score > 0).sort((a, b) => b.matchAnalysis.score - a.matchAnalysis.score);

      const normalizedApplicants = applicants.map(a => {
        let normStatus = a.status;
        if (normStatus === 'applied') normStatus = 'pending';
        if (normStatus === 'declined') normStatus = 'rejected';
        return {
          ...a,
          status: normStatus
        };
      });

      const activeProposals = normalizedApplicants.filter(a => a.status !== 'withdrawn');
      const proposalStats = {
        total: activeProposals.length,
        all: normalizedApplicants.length,
        pending: normalizedApplicants.filter(a => a.status === 'pending').length,
        under_review: normalizedApplicants.filter(a => a.status === 'under_review').length,
        shortlisted: normalizedApplicants.filter(a => a.status === 'shortlisted').length,
        accepted: normalizedApplicants.filter(a => a.status === 'accepted').length,
        rejected: normalizedApplicants.filter(a => a.status === 'rejected').length,
        withdrawn: normalizedApplicants.filter(a => a.status === 'withdrawn').length
      };

      return res.json({
        ...project.toObject(),
        client_name: client?.name || 'Verified Client',
        client_avatar: client?.avatar || '',
        client_rating: client?.rating_avg || 5.0,
        applicantCount: activeProposals.length,
        proposalStats,
        applicants: normalizedApplicants,
        applications: normalizedApplicants,
        recommendedCandidates
      });
    }

    // Fallback store
    const project = fallbackStore.projects.find(p => p.id === projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const client = fallbackStore.users.find(u => u.id === project.client_id);
    const applicants = fallbackStore.applications
      .filter(a => a.project_id === projectId)
      .map(a => {
        const student = fallbackStore.users.find(u => u.id === a.student_id);
        const studentSkills = student?.skills?.map(s => s.skill_name) || [];
        const match = calculateSkillMatch(studentSkills, project.skills);
        let normStatus = a.status;
        if (normStatus === 'applied') normStatus = 'pending';
        if (normStatus === 'declined') normStatus = 'rejected';

        return {
          ...a,
          status: normStatus,
          student_name: student?.name || 'Student',
          student_avatar: student?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student?.name || 'Student')}&background=ff6200&color=fff&bold=true`,
          student_college: student?.college || '',
          student_major: student?.major || '',
          student_rating: student?.rating_avg || 5.0,
          student_skills: studentSkills,
          matchAnalysis: match,
          matchScore: match.score
        };
      });

    const activeProposals = applicants.filter(a => a.status !== 'withdrawn');
    const proposalStats = {
      total: activeProposals.length,
      all: applicants.length,
      pending: applicants.filter(a => a.status === 'pending').length,
      under_review: applicants.filter(a => a.status === 'under_review').length,
      shortlisted: applicants.filter(a => a.status === 'shortlisted').length,
      accepted: applicants.filter(a => a.status === 'accepted').length,
      rejected: applicants.filter(a => a.status === 'rejected').length,
      withdrawn: applicants.filter(a => a.status === 'withdrawn').length
    };

    const recommendedCandidates = fallbackStore.users
      .filter(u => u.role === 'student')
      .map(student => {
        const studentSkills = student.skills?.map(s => s.skill_name) || [];
        const match = calculateSkillMatch(studentSkills, project.skills);
        return {
          student_id: student.id,
          name: student.name,
          avatar: student.avatar,
          college: student.college,
          headline: student.headline,
          rating_avg: student.rating_avg,
          matchAnalysis: match
        };
      })
      .filter(c => c.matchAnalysis.score > 0)
      .sort((a, b) => b.matchAnalysis.score - a.matchAnalysis.score);

    res.json({
      ...project,
      client_name: client?.name || 'Verified Client',
      client_avatar: client?.avatar || '',
      client_rating: client?.rating_avg || 5.0,
      applicantCount: activeProposals.length,
      proposalStats,
      applicants,
      applications: applicants,
      recommendedCandidates
    });
  } catch (err) {
    next(err);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const {
      client_id,
      title,
      description,
      category,
      budget_type,
      budget_amount,
      duration,
      experience_level,
      perks,
      skills
    } = req.body;

    const clientId = req.user ? req.user.id : client_id;

    if (!clientId || !title || !description || !budget_amount) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const newProject = {
      _id: 'proj_' + Date.now(),
      id: 'proj_' + Date.now(),
      client_id: clientId,
      title,
      description,
      category: category || 'Web & Mobile',
      budget_type: budget_type || 'fixed',
      budget_amount: Number(budget_amount),
      duration: duration || '1-2 weeks',
      experience_level: experience_level || 'Entry / Student-friendly',
      perks: perks || '',
      status: 'open',
      skills: Array.isArray(skills) ? skills : []
    };

    if (isMongoConnected) {
      const created = await Project.create(newProject);
      return res.status(201).json(created);
    }

    fallbackStore.projects.unshift(newProject);
    res.status(201).json(newProject);
  } catch (err) {
    next(err);
  }
};
