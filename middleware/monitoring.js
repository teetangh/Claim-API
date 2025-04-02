const promBundle = require('express-prom-bundle');
const client = require('prom-client');
const logger = require('../utils/logger');

// Create a Registry to register metrics
const register = new client.Registry();

// Add default metrics (memory, CPU, etc.)
client.collectDefaultMetrics({ register });

// Create custom metrics
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});

const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const claimProcessingDuration = new client.Histogram({
  name: 'claim_processing_duration_seconds',
  help: 'Duration of claim processing in seconds',
  labelNames: ['status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const claimTotal = new client.Counter({
  name: 'claims_total',
  help: 'Total number of claims processed',
  labelNames: ['status']
});

const dbQueryDuration = new client.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2]
});

// Register metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestCounter);
register.registerMetric(claimProcessingDuration);
register.registerMetric(claimTotal);
register.registerMetric(dbQueryDuration);

// Create metrics middleware
const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  includeUp: true,
  promClient: { 
    collectDefaultMetrics: { register }
  }
});

// Export metrics objects for use in controllers
module.exports = {
  metricsMiddleware,
  metrics: {
    httpRequestDurationMicroseconds,
    httpRequestCounter,
    claimProcessingDuration,
    claimTotal,
    dbQueryDuration
  },
  register
}; 