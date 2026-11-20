import { Application } from '../../database/models/Application.js';
import { Project } from '../../database/models/Project.js';
import { User } from '../../database/models/User.js';
import { fallbackStore, isMongoConnected } from '../../database/index.js';

// Normalize status values for consistent platform-wide tracking
export const normalizeStatus = (status) => {
  if (!status) return 'pending';
  const s = String(status).toLowerCase().trim();
  if (s === 'applied') return 'pending';
  if (s === 'declined') return 'rejected';
  return s;
};

// Generic / Filterable applications endpoint
export const getApplications = async (req, res, next) => {
  try {
    const { studentId, clientId, projectId, status } = req.query;

    if (isMongoConnected) {
      let filter = {};
      if (studentId) filter.student_id = studentId;
      if (projectId) filter.project_id = projectId;
      if (status) {
        const norm = normalizeStatus(status);
        if (norm === 'pending') {
          filter.status = { $in: ['pending', 'applied'] };
        } else if (norm === 'rejected') {
          filter.status = { $in: ['rejected', 'declined'] };
        } else {
          filter.status = norm;
        }
      }

      // If filtering by client, find their projects first
      if (clientId) {
        const clientProjects = await Project.find({ client_id: clientId }).select('_id');
        const projectIds = clientProjects.map(p => p._id);
        filter.project_id = { $in: projectIds };
      }

      const apps = await Application.find(filter).sort({ createdAt: -1 });

      const enriched = await Promise.all(apps.map(async a => {
        const project = await Project.findById(a.project_id);
        const client = project ? await User.findById(project.client_id) : null;
        const student = await User.findById(a.student_id);

        return {
          ...a.toObject(),
          id: a._id,
          status: normalizeStatus(a.status),
          project_title: project?.title || 'Project',
          project_category: project?.category || '',
          project_budget: project?.budget_amount || 0,
          project_duration: project?.duration || '1-2 weeks',
          project_status: project?.status || 'open',
          client_id: client?._id || client?.id || project?.client_id || '',
          client_name: client?.name || 'Client',
          client_avatar: client?.avatar || '',
          student_id: student?._id || student?.id || a.student_id,
          student_name: student?.name || 'Student',
          student_avatar: student?.avatar || '',
          student_college: student?.college || '',
          student_major: student?.major || '',
          student_rating: student?.rating_avg || 5.0,
          student_skills: student?.skills || [],
          created_at: a.createdAt || a.created_at,
          updated_at: a.updatedAt || a.updated_at || a.createdAt
        };
      }));

      return res.json(enriched);
    }

    // In-memory fallbackStore
    let list = [...fallbackStore.applications];

    if (studentId) {
      list = list.filter(a => a.student_id === studentId);
    }
    if (projectId) {
      list = list.filter(a => a.project_id === projectId);
    }
    if (clientId) {
      const clientProjectIds = fallbackStore.projects
        .filter(p => p.client_id === clientId)
        .map(p => p.id);
      list = list.filter(a => clientProjectIds.includes(a.project_id));
    }
    if (status) {
      const norm = normalizeStatus(status);
      list = list.filter(a => normalizeStatus(a.status) === norm);
    }

    list.sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0));

    const enriched = list.map(a => {
      const project = fallbackStore.projects.find(p => p.id === a.project_id);
      const client = project ? fallbackStore.users.find(u => u.id === project.client_id) : null;
      const student = fallbackStore.users.find(u => u.id === a.student_id);

      return {
        ...a,
        id: a.id || a._id,
        status: normalizeStatus(a.status),
        project_title: project?.title || 'Project',
        project_category: project?.category || '',
        project_budget: project?.budget_amount || 0,
        project_duration: project?.duration || '1-2 weeks',
        project_status: project?.status || 'open',
        client_id: client?.id || project?.client_id || '',
        client_name: client?.name || 'Client',
        client_avatar: client?.avatar || '',
        student_id: student?.id || a.student_id,
        student_name: student?.name || 'Student',
        student_avatar: student?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student?.name || 'Student')}&background=ff6200&color=fff&bold=true`,
        student_college: student?.college || '',
        student_major: student?.major || '',
        student_rating: student?.rating_avg || 5.0,
        student_skills: student?.skills || [],
        created_at: a.created_at || a.createdAt || new Date(),
        updated_at: a.updated_at || a.updatedAt || a.created_at || new Date()
      };
    });

    res.json(enriched);
  } catch (err) {
    next(err);
  }
};

export const submitApplication = async (req, res, next) => {
  try {
    const { project_id, student_id, cover_letter, bid_amount, delivery_timeline, attachment_url, attachment_name } = req.body;
    const studentId = req.user ? req.user.id : student_id;

    if (!project_id || !studentId || !cover_letter || !bid_amount) {
      return res.status(400).json({ error: 'Required application fields missing (project, student, cover note, or proposed bid).' });
    }

    // Prevent duplicate active proposals for the same project
    if (isMongoConnected) {
      const existing = await Application.findOne({
        project_id,
        student_id: studentId,
        status: { $nin: ['withdrawn'] }
      });
      if (existing) {
        return res.status(400).json({
          error: 'You have already submitted an active proposal for this project. Track its progress in My Applications.'
        });
      }

      const newApp = {
        _id: 'app_' + Date.now(),
        project_id,
        student_id: studentId,
        cover_letter: String(cover_letter).trim(),
        bid_amount: Number(bid_amount),
        delivery_timeline: delivery_timeline || '1-2 weeks',
        attachment_url: attachment_url || null,
        attachment_name: attachment_name || null,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date()
      };

      const created = await Application.create(newApp);
      return res.status(201).json({
        ...created.toObject(),
        id: created._id,
        status: 'pending'
      });
    }

    // In-memory fallback
    const existing = fallbackStore.applications.find(
      a => a.project_id === project_id && a.student_id === studentId && normalizeStatus(a.status) !== 'withdrawn'
    );
    if (existing) {
      return res.status(400).json({
        error: 'You have already submitted an active proposal for this project. Track its progress in My Applications.'
      });
    }

    const newApp = {
      _id: 'app_' + Date.now(),
      id: 'app_' + Date.now(),
      project_id,
      student_id: studentId,
      cover_letter: String(cover_letter).trim(),
      bid_amount: Number(bid_amount),
      delivery_timeline: delivery_timeline || '1-2 weeks',
      attachment_url: attachment_url || null,
      attachment_name: attachment_name || null,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date()
    };

    fallbackStore.applications.unshift(newApp);
    res.status(201).json(newApp);
  } catch (err) {
    next(err);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const rawStatus = req.body.status;
    const appId = req.params.id;
    const actorId = req.body.actor_id || req.user?.id;

    if (!rawStatus) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const status = normalizeStatus(rawStatus);
    const validStatuses = ['pending', 'under_review', 'shortlisted', 'accepted', 'rejected', 'withdrawn', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid proposal status: ${rawStatus}` });
    }

    if (isMongoConnected) {
      const application = await Application.findById(appId);
      if (!application) return res.status(404).json({ error: 'Application not found' });

      const currentStatus = normalizeStatus(application.status);

      // Business rule validation
      if (currentStatus === 'withdrawn') {
        return res.status(400).json({ error: 'Cannot update a proposal that was already withdrawn by the student.' });
      }
      if (status === 'withdrawn') {
        if (['accepted', 'completed'].includes(currentStatus)) {
          return res.status(400).json({ error: 'Cannot withdraw an accepted or completed proposal.' });
        }
        application.withdrawn_at = new Date();
      }

      application.status = status;
      application.updated_at = new Date();
      if (status === 'under_review' && !application.reviewed_at) {
        application.reviewed_at = new Date();
      }
      await application.save();

      // Side-effects on parent project
      if (status === 'accepted') {
        await Project.findByIdAndUpdate(application.project_id, {
          status: 'in_progress',
          student_id: application.student_id
        });
      } else if (status === 'completed') {
        await Project.findByIdAndUpdate(application.project_id, { status: 'completed' });
        await User.findByIdAndUpdate(application.student_id, { $inc: { completed_projects_count: 1 } });
      }

      return res.json({
        ...application.toObject(),
        id: application._id,
        status
      });
    }

    // In-memory store fallback
    const appItem = fallbackStore.applications.find(a => a.id === appId || a._id === appId);
    if (!appItem) return res.status(404).json({ error: 'Application not found' });

    const currentStatus = normalizeStatus(appItem.status);

    if (currentStatus === 'withdrawn') {
      return res.status(400).json({ error: 'Cannot update a proposal that was already withdrawn by the student.' });
    }
    if (status === 'withdrawn') {
      if (['accepted', 'completed'].includes(currentStatus)) {
        return res.status(400).json({ error: 'Cannot withdraw an accepted or completed proposal.' });
      }
      appItem.withdrawn_at = new Date();
    }

    appItem.status = status;
    appItem.updated_at = new Date();
    if (status === 'under_review' && !appItem.reviewed_at) {
      appItem.reviewed_at = new Date();
    }

    // Side-effects on parent project
    if (status === 'accepted') {
      const proj = fallbackStore.projects.find(p => p.id === appItem.project_id);
      if (proj) {
        proj.status = 'in_progress';
        proj.student_id = appItem.student_id;
      }
    } else if (status === 'completed') {
      const proj = fallbackStore.projects.find(p => p.id === appItem.project_id);
      if (proj) proj.status = 'completed';
      const student = fallbackStore.users.find(u => u.id === appItem.student_id);
      if (student) student.completed_projects_count = (student.completed_projects_count || 0) + 1;
    }

    res.json(appItem);
  } catch (err) {
    next(err);
  }
};

export const withdrawApplication = async (req, res, next) => {
  try {
    const appId = req.params.id;
    const studentId = req.body.student_id || req.user?.id;

    if (isMongoConnected) {
      const application = await Application.findById(appId);
      if (!application) return res.status(404).json({ error: 'Application not found' });

      if (studentId && application.student_id !== studentId) {
        return res.status(403).json({ error: 'You are only authorized to withdraw your own proposals.' });
      }

      const currentStatus = normalizeStatus(application.status);
      if (['accepted', 'completed'].includes(currentStatus)) {
        return res.status(400).json({ error: 'Cannot withdraw an application that has already been accepted.' });
      }
      if (currentStatus === 'withdrawn') {
        return res.status(400).json({ error: 'Application is already withdrawn.' });
      }

      application.status = 'withdrawn';
      application.withdrawn_at = new Date();
      application.updated_at = new Date();
      await application.save();

      return res.json({
        ...application.toObject(),
        id: application._id,
        status: 'withdrawn',
        message: 'Proposal withdrawn successfully.'
      });
    }

    const appItem = fallbackStore.applications.find(a => a.id === appId || a._id === appId);
    if (!appItem) return res.status(404).json({ error: 'Application not found' });

    if (studentId && appItem.student_id !== studentId) {
      return res.status(403).json({ error: 'You are only authorized to withdraw your own proposals.' });
    }

    const currentStatus = normalizeStatus(appItem.status);
    if (['accepted', 'completed'].includes(currentStatus)) {
      return res.status(400).json({ error: 'Cannot withdraw an application that has already been accepted.' });
    }
    if (currentStatus === 'withdrawn') {
      return res.status(400).json({ error: 'Application is already withdrawn.' });
    }

    appItem.status = 'withdrawn';
    appItem.withdrawn_at = new Date();
    appItem.updated_at = new Date();

    res.json({
      ...appItem,
      status: 'withdrawn',
      message: 'Proposal withdrawn successfully.'
    });
  } catch (err) {
    next(err);
  }
};

export const getStudentApplications = async (req, res, next) => {
  req.query.studentId = req.params.studentId;
  return getApplications(req, res, next);
};
