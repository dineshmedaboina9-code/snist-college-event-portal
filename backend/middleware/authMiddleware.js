const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'snist_cemp_jwt_secret_key_2026_super_secure';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access denied. No authorization token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, role, name, ... }
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
};

const optionalToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      // ignore invalid token for public endpoints
    }
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Administrator privileges required.' });
  }
  next();
};

const requireAdminOrOrganizer = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'organizer')) {
    return res.status(403).json({ success: false, message: 'Staff or Organizer privileges required.' });
  }
  next();
};

const requireStudent = (req, res, next) => {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({ success: false, message: 'Student privileges required.' });
  }
  next();
};

module.exports = {
  verifyToken,
  optionalToken,
  requireAdmin,
  requireAdminOrOrganizer,
  requireStudent,
  JWT_SECRET
};
