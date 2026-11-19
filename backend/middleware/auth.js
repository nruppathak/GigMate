import jwt from 'jsonwebtoken';
import { User } from '../../database/models/User.js';
import { fallbackStore, isMongoConnected } from '../../database/index.js';

export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'gigmate_super_secure_jwt_secret_key_2026_dev',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized to access this route, no token provided' });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'gigmate_super_secure_jwt_secret_key_2026_dev'
    );

    if (isMongoConnected) {
      req.user = await User.findById(decoded.id).select('-password');
    } else {
      req.user = fallbackStore.users.find(u => u.id === decoded.id || u._id === decoded.id);
    }

    if (!req.user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Not authorized, token invalid or expired' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `User role '${req.user?.role}' is not authorized to perform this action` 
      });
    }
    next();
  };
};
