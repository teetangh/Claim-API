const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * Middleware to authenticate JWT tokens
 */
const authenticate = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Authentication failed: No token provided', { 
        ip: req.ip, 
        path: req.originalUrl 
      });
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      logger.warn('Authentication failed: Invalid token format', { 
        ip: req.ip, 
        path: req.originalUrl 
      });
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user info to request object
    req.user = decoded;
    
    logger.debug('User authenticated successfully', { 
      userId: decoded.id,
      path: req.originalUrl
    });
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.warn('Authentication failed: Token expired', { 
        ip: req.ip, 
        path: req.originalUrl 
      });
      return res.status(401).json({ error: 'Token expired' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      logger.warn('Authentication failed: Invalid token', { 
        ip: req.ip, 
        path: req.originalUrl,
        error: error.message
      });
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    logger.error('Authentication error', { 
      ip: req.ip, 
      path: req.originalUrl,
      error: error.message
    });
    
    res.status(500).json({ error: 'Authentication error' });
  }
};

module.exports = authenticate; 