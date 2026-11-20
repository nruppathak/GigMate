import { Message } from '../../database/models/Message.js';
import { User } from '../../database/models/User.js';
import { Project } from '../../database/models/Project.js';
import { fallbackStore, isMongoConnected } from '../../database/index.js';

export const getMessages = async (req, res, next) => {
  try {
    const { userId1, userId2, projectId } = req.query;
    if (!userId1 || !userId2) {
      return res.status(400).json({ error: 'userId1 and userId2 required' });
    }

    if (isMongoConnected) {
      const query = {
        $or: [
          { sender_id: userId1, receiver_id: userId2 },
          { sender_id: userId2, receiver_id: userId1 }
        ]
      };
      if (projectId) query.project_id = projectId;

      const msgs = await Message.find(query).sort({ createdAt: 1 });
      const enriched = await Promise.all(msgs.map(async m => {
        const sender = await User.findById(m.sender_id);
        return {
          ...m.toObject(),
          sender_name: sender?.name || 'User',
          sender_avatar: sender?.avatar || '',
          sender_role: sender?.role || 'student'
        };
      }));
      return res.json(enriched);
    }

    let msgs = fallbackStore.messages.filter(m =>
      (m.sender_id === userId1 && m.receiver_id === userId2) ||
      (m.sender_id === userId2 && m.receiver_id === userId1)
    );
    if (projectId) {
      msgs = msgs.filter(m => m.project_id === projectId);
    }
    msgs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    const enriched = msgs.map(m => {
      const sender = fallbackStore.users.find(u => u.id === m.sender_id);
      return {
        ...m,
        sender_name: sender?.name || 'User',
        sender_avatar: sender?.avatar || '',
        sender_role: sender?.role || 'student'
      };
    });

    res.json(enriched);
  } catch (err) {
    next(err);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { project_id, sender_id, receiver_id, message, attachment_url, attachment_name } = req.body;
    const senderId = req.user ? req.user.id : sender_id;

    if (!senderId || !receiver_id || (!message && !attachment_url)) {
      return res.status(400).json({ error: 'Missing required message fields' });
    }

    const newMsg = {
      _id: 'msg_' + Date.now(),
      id: 'msg_' + Date.now(),
      project_id: project_id || null,
      sender_id: senderId,
      receiver_id,
      message: (message || '').trim(),
      attachment_url: attachment_url || null,
      attachment_name: attachment_name || null,
      created_at: new Date()
    };

    if (isMongoConnected) {
      const created = await Message.create(newMsg);
      return res.status(201).json(created);
    }

    fallbackStore.messages.push(newMsg);
    res.status(201).json(newMsg);
  } catch (err) {
    next(err);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    if (isMongoConnected) {
      const allMsgs = await Message.find({
        $or: [{ sender_id: userId }, { receiver_id: userId }]
      }).sort({ createdAt: -1 });

      const partnersMap = new Map();

      for (const m of allMsgs) {
        const partnerId = m.sender_id === userId ? m.receiver_id : m.sender_id;
        if (!partnersMap.has(partnerId)) {
          partnersMap.set(partnerId, m);
        }
      }

      const threads = await Promise.all(Array.from(partnersMap.entries()).map(async ([partnerId, lastMsg]) => {
        const partner = await User.findById(partnerId);
        const project = lastMsg.project_id ? await Project.findById(lastMsg.project_id) : null;

        return {
          otherUser: partner ? partner.toObject() : null,
          project: project ? project.toObject() : null,
          lastMessage: lastMsg.toObject()
        };
      }));

      return res.json(threads.filter(t => t.otherUser));
    }

    // Fallback store
    const msgs = fallbackStore.messages.filter(m => m.sender_id === userId || m.receiver_id === userId);
    msgs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const partnersMap = new Map();
    msgs.forEach(m => {
      const partnerId = m.sender_id === userId ? m.receiver_id : m.sender_id;
      if (!partnersMap.has(partnerId)) {
        partnersMap.set(partnerId, m);
      }
    });

    const threads = Array.from(partnersMap.entries()).map(([partnerId, lastMsg]) => {
      const partner = fallbackStore.users.find(u => u.id === partnerId);
      const project = lastMsg.project_id ? fallbackStore.projects.find(p => p.id === lastMsg.project_id) : null;

      return {
        otherUser: partner || null,
        project: project || null,
        lastMessage: lastMsg
      };
    });

    res.json(threads.filter(t => t.otherUser));
  } catch (err) {
    next(err);
  }
};
