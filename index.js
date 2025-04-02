const express = require('express');
const app = express();
require('dotenv').config();
const sequelize = require('./config/db');
const logger = require('./utils/logger');
const requestLoggerMiddleware = require('./middleware/requestLogger');
const securityMiddleware = require('./middleware/security');
const { metricsMiddleware, register } = require('./middleware/monitoring');

// Apply request logging middleware
app.use(requestLoggerMiddleware);

// Apply security middleware
app.use(securityMiddleware);

// Apply metrics middleware
app.use(metricsMiddleware);

// Expose Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Basic middleware
app.use(express.json());

// Routes
app.use('/claims', require('./routes/claimRoutes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`, { ip: req.ip });
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`, { 
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip
  });
  
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message 
  });
});

// Sync DB and Start Server
sequelize.authenticate()
  .then(() => {
    logger.info('Database connected successfully');
    return sequelize.sync();
  })
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    logger.error('Failed to start server', { error: err.message, stack: err.stack });
    process.exit(1);
  });

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { error: err.message, stack: err.stack });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection', { 
    reason: reason?.message || reason,
    stack: reason?.stack
  });
  process.exit(1);
});
