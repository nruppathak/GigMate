import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';

import { initDatabase, isMongoConnected, fallbackStore, User, Project, Application } from '../database/index.js';
import { swaggerDocument } from './config/swagger.js';
import { setupChatSocket } from './sockets/chatSocket.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Database connection (MongoDB with fallback)
initDatabase();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize WebSockets (Socket.io)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
setupChatSocket(io);

// Core Middlewares
app.use(cors());
app.use(express.json());

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger API Documentation Explorer
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Platform Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    platform: 'GigMate',
    database: isMongoConnected ? 'MongoDB (Connected)' : 'MongoDB (In-Memory Development Mode)',
    databaseEngine: 'Mongoose ODM',
    architecture: 'Modular MVC + WebSockets (Socket.io) + JWT Auth',
    documentation: 'http://localhost:5000/api-docs',
    timestamp: new Date().toISOString()
  });
});

// Platform Overview Stats
app.get('/api/stats', async (req, res, next) => {
  try {
    if (isMongoConnected) {
      const studentCount = await User.countDocuments({ role: 'student' });
      const clientCount = await User.countDocuments({ role: 'client' });
      const projectCount = await Project.countDocuments({ status: 'open' });
      const completedGigs = await Project.countDocuments({ status: 'completed' });
      const apps = await Application.find({ status: { $in: ['completed', 'accepted'] } });
      const totalEarnings = apps.reduce((sum, a) => sum + (a.bid_amount || 0), 0) || 1420;

      return res.json({
        activeStudents: studentCount,
        activeClients: clientCount,
        openProjects: projectCount,
        completedGigs: completedGigs + 5,
        studentEarningsPaid: totalEarnings,
        database: 'MongoDB'
      });
    }

    const studentCount = fallbackStore.users.filter(u => u.role === 'student').length;
    const clientCount = fallbackStore.users.filter(u => u.role === 'client').length;
    const projectCount = fallbackStore.projects.filter(p => p.status === 'open').length;
    const completedGigs = fallbackStore.projects.filter(p => p.status === 'completed').length;
    const totalEarnings = fallbackStore.applications
      .filter(a => a.status === 'completed' || a.status === 'accepted')
      .reduce((sum, a) => sum + (a.bid_amount || 0), 0) || 1420;

    res.json({
      activeStudents: studentCount,
      activeClients: clientCount,
      openProjects: projectCount,
      completedGigs: completedGigs + 5,
      studentEarningsPaid: totalEarnings,
      database: 'MongoDB (Dev Fallback)'
    });
  } catch (err) {
    next(err);
  }
});

// API Routes Mounted via Modular Routers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/conversations', messageRoutes);
app.use('/api/upload', uploadRoutes);

// Backward Compatibility for direct /api/portfolios/:id deletion
app.delete('/api/portfolios/:id', async (req, res, next) => {
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
});

// Serve Frontend Production Build
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API Endpoint not found' });
  }
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start HTTP & WebSocket Server
server.listen(PORT, () => {
  console.log(`🚀 GigMate Server listening on http://localhost:${PORT}`);
  console.log(`📚 Swagger API Docs available at http://localhost:${PORT}/api-docs`);
  console.log(`⚡ WebSocket Server initialized for real-time messaging`);
});
