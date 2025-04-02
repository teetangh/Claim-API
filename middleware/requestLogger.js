const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// Create a write stream for access logs
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, '../logs/access.log'),
  { flags: 'a' }
);

// Custom token for response time in ms
morgan.token('response-time-ms', (req, res) => {
  return res.responseTime ? `${res.responseTime}ms` : '-';
});

// Custom token for request body
morgan.token('req-body', (req) => {
  // Avoid logging sensitive information
  const body = { ...req.body };
  if (body.password) body.password = '[REDACTED]';
  if (body.creditCard) body.creditCard = '[REDACTED]';
  return JSON.stringify(body);
});

// Define format for development environment
const developmentFormat = ':method :url :status :response-time-ms ms - :req-body';

// Define format for production environment - more concise
const productionFormat = ':remote-addr - :method :url :status :response-time-ms ms';

// Log to file with combined format
const fileLogger = morgan('combined', { 
  stream: accessLogStream,
  skip: (req, res) => res.statusCode < 400 // Only log errors to file
});

// Log to console with appropriate format based on environment
const consoleLogger = morgan(
  process.env.NODE_ENV === 'production' ? productionFormat : developmentFormat, 
  {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }
);

// Middleware that calculates response time
const responseTime = (req, res, next) => {
  const startHrTime = process.hrtime();
  
  res.on('finish', () => {
    const elapsedHrTime = process.hrtime(startHrTime);
    const elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1000000;
    res.responseTime = elapsedTimeInMs.toFixed(3);
  });
  
  next();
};

// Export as an array of middleware
module.exports = [responseTime, fileLogger, consoleLogger]; 