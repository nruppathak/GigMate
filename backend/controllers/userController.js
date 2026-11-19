import { User } from '../../database/models/User.js';
import { Review } from '../../database/models/Review.js';
import { Application } from '../../database/models/Application.js';
import { Project } from '../../database/models/Project.js';
import { fallbackStore, isMongoConnected } from '../../database/index.js';

const sortUsers = (list) => {
  const getRank = (u) => {
    const name = (u.name || '').toLowerCase();
    if (name.includes('nrup')) return 1;
    if (name.includes('nancy')) return 2;
    if (name.includes('kuldeep')) return 3;
    if (name.includes('naman')) return 4;
    if (u.role === 'student') return 5;
    if (name.includes('techventures')) return 6;
    if (name.includes('greencampus')) return 7;
    return 8;
  };

  return [...list].sort((a, b) => {
    const rankDiff = getRank(a) - getRank(b);
    if (rankDiff !== 0) return rankDiff;
    return (b.rating_avg || 0) - (a.rating_avg || 0);
  });
};

export const getUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    if (isMongoConnected) {
      const filter = role ? { role } : {};
      const users = await User.find(filter).lean();
      return res.json(sortUsers(users));
    }

    let users = [...fallbackStore.users];
    if (role) {
      users = users.filter(u => u.role === role);
    }
    res.json(sortUsers(users));
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    if (isMongoConnected) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

      const rawReviews = await Review.find({ reviewee_id: userId }).sort({ createdAt: -1 });
      const enrichedReviews = await Promise.all(rawReviews.map(async r => {
        const reviewer = await User.findById(r.reviewer_id);
        return {
          ...r.toObject(),
          reviewer_name: reviewer?.name || 'Anonymous',
          reviewer_avatar: reviewer?.avatar || '',
          reviewer_role: reviewer?.role || 'client'
        };
      }));

      return res.json({
        ...user.toObject(),
        reviews: enrichedReviews
      });
    }

    const user = fallbackStore.users.find(u => u.id === userId || u._id === userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const reviews = fallbackStore.reviews
      .filter(r => r.reviewee_id === userId)
      .map(r => {
        const reviewer = fallbackStore.users.find(u => u.id === r.reviewer_id);
        return {
          ...r,
          reviewer_name: reviewer?.name || 'Anonymous',
          reviewer_avatar: reviewer?.avatar || '',
          reviewer_role: reviewer?.role || 'client'
        };
      });

    res.json({
      ...user,
      reviews
    });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;

    if (isMongoConnected) {
      const updated = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true });
      return res.json(updated);
    }

    const index = fallbackStore.users.findIndex(u => u.id === userId || u._id === userId);
    if (index === -1) return res.status(404).json({ error: 'User not found' });

    fallbackStore.users[index] = { ...fallbackStore.users[index], ...updateData };
    res.json(fallbackStore.users[index]);
  } catch (err) {
    next(err);
  }
};

export const addUserSkill = async (req, res, next) => {
  try {
    const { skill_name, level } = req.body;
    if (!skill_name) return res.status(400).json({ error: 'skill_name is required' });

    if (isMongoConnected) {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });

      const existingIndex = user.skills.findIndex(s => s.skill_name.toLowerCase() === skill_name.toLowerCase());
      if (existingIndex >= 0) {
        user.skills[existingIndex].level = level || 'Intermediate';
      } else {
        user.skills.push({ skill_name: skill_name.trim(), level: level || 'Intermediate' });
      }
      await user.save();
      return res.json(user.skills);
    }

    const user = fallbackStore.users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.skills = user.skills || [];
    const idx = user.skills.findIndex(s => s.skill_name.toLowerCase() === skill_name.toLowerCase());
    if (idx >= 0) {
      user.skills[idx].level = level || 'Intermediate';
    } else {
      user.skills.push({ skill_name: skill_name.trim(), level: level || 'Intermediate' });
    }
    res.json(user.skills);
  } catch (err) {
    next(err);
  }
};

export const removeUserSkill = async (req, res, next) => {
  try {
    const skillName = req.params.skillName;
    if (isMongoConnected) {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });

      user.skills = user.skills.filter(s => s.skill_name.toLowerCase() !== skillName.toLowerCase());
      await user.save();
      return res.json(user.skills);
    }

    const user = fallbackStore.users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.skills = (user.skills || []).filter(s => s.skill_name.toLowerCase() !== skillName.toLowerCase());
    res.json(user.skills);
  } catch (err) {
    next(err);
  }
};

export const addPortfolio = async (req, res, next) => {
  try {
    const { title, description, project_url, github_url, image_url, tags } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const newPortfolio = {
      id: 'port_' + Date.now(),
      title,
      description: description || '',
      project_url: project_url || null,
      github_url: github_url || null,
      image_url: image_url || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80',
      tags: tags || '',
      created_at: new Date()
    };

    if (isMongoConnected) {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      user.portfolios.push(newPortfolio);
      await user.save();
      return res.status(201).json(newPortfolio);
    }

    const user = fallbackStore.users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.portfolios = user.portfolios || [];
    user.portfolios.unshift(newPortfolio);
    res.status(201).json(newPortfolio);
  } catch (err) {
    next(err);
  }
};

export const removePortfolio = async (req, res, next) => {
  try {
    const portId = req.params.id;
    if (isMongoConnected) {
      await User.updateOne(
        { 'portfolios.id': portId },
        { $pull: { portfolios: { id: portId } } }
      );
      return res.json({ success: true });
    }

    fallbackStore.users.forEach(u => {
      if (u.portfolios) {
        u.portfolios = u.portfolios.filter(p => p.id !== portId);
      }
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    if (isMongoConnected) {
      const user = await User.findByIdAndDelete(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      await Application.deleteMany({ student_id: userId });
      await Project.deleteMany({ client_id: userId });
      return res.json({ success: true, message: 'Profile deleted successfully', deletedId: userId });
    }

    const index = fallbackStore.users.findIndex(u => u.id === userId || u._id === userId);
    if (index === -1) return res.status(404).json({ error: 'User not found' });

    fallbackStore.users.splice(index, 1);
    fallbackStore.applications = fallbackStore.applications.filter(a => a.student_id !== userId);
    fallbackStore.projects = fallbackStore.projects.filter(p => p.client_id !== userId);

    res.json({ success: true, message: 'Profile deleted successfully', deletedId: userId });
  } catch (err) {
    next(err);
  }
};

export const deleteAllCreatedUsers = async (req, res, next) => {
  try {
    const defaultIds = ['usr_student_1', 'usr_student_2', 'usr_student_3', 'usr_student_4', 'usr_client_1', 'usr_client_2'];

    if (isMongoConnected) {
      await User.deleteMany({ _id: { $nin: defaultIds } });
      await Application.deleteMany({ student_id: { $nin: defaultIds } });
      await Project.deleteMany({ client_id: { $nin: defaultIds } });
      const remainingUsers = await User.find().sort({ rating_avg: -1 });
      return res.json({ success: true, message: 'Custom profiles deleted', users: remainingUsers });
    }

    fallbackStore.users = fallbackStore.users.filter(u => defaultIds.includes(u.id));
    fallbackStore.applications = fallbackStore.applications.filter(a => defaultIds.includes(a.student_id));
    fallbackStore.projects = fallbackStore.projects.filter(p => defaultIds.includes(p.client_id));

    res.json({ success: true, message: 'Custom profiles deleted', users: fallbackStore.users });
  } catch (err) {
    next(err);
  }
};
