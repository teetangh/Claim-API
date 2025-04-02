const Claim = require('../models/claim');
const logger = require('../utils/logger');
const { metrics } = require('../middleware/monitoring');

// POST /claims
const createClaim = async (req, res) => {
  const startTime = process.hrtime();
  
  try {
    const { payer, amount, procedure_codes } = req.body;

    if (!payer || !amount || !procedure_codes || !Array.isArray(procedure_codes)) {
      logger.warn('Invalid claim data provided', {
        data: req.body,
        userId: req.user?.id,
        ip: req.ip
      });
      
      metrics.claimTotal.inc({ status: 'invalid' });
      
      return res.status(400).json({ error: 'Invalid input data' });
    }

    logger.info('Creating new claim', {
      payer,
      amount,
      procedureCodes: procedure_codes,
      userId: req.user?.id
    });

    // Measure database operation duration
    const dbStart = process.hrtime();
    const claim = await Claim.create({ payer, amount, procedure_codes });
    const dbDiff = process.hrtime(dbStart);
    const dbDurationSec = (dbDiff[0] + dbDiff[1] / 1e9);
    
    // Record DB query duration
    metrics.dbQueryDuration.observe(
      { operation: 'create', table: 'claim' }, 
      dbDurationSec
    );
    
    logger.info('Claim created successfully', {
      claimId: claim.id,
      userId: req.user?.id
    });
    
    // Record metrics
    metrics.claimTotal.inc({ status: 'created' });
    
    // Calculate total duration
    const diff = process.hrtime(startTime);
    const durationSec = (diff[0] + diff[1] / 1e9);
    metrics.claimProcessingDuration.observe({ status: 'success' }, durationSec);
    
    res.status(201).json(claim);
  } catch (error) {
    logger.error('Error creating claim', {
      error: error.message,
      stack: error.stack,
      data: req.body,
      userId: req.user?.id
    });
    
    // Record error metrics
    metrics.claimTotal.inc({ status: 'error' });
    
    // Calculate error duration
    const diff = process.hrtime(startTime);
    const durationSec = (diff[0] + diff[1] / 1e9);
    metrics.claimProcessingDuration.observe({ status: 'error' }, durationSec);
    
    res.status(500).json({ error: error.message });
  }
};

// GET /claims/:id
const getClaimById = async (req, res) => {
  const startTime = process.hrtime();
  
  try {
    logger.info('Fetching claim by ID', {
      claimId: req.params.id,
      userId: req.user?.id
    });
    
    // Measure database operation duration
    const dbStart = process.hrtime();
    const claim = await Claim.findByPk(req.params.id);
    const dbDiff = process.hrtime(dbStart);
    const dbDurationSec = (dbDiff[0] + dbDiff[1] / 1e9);
    
    // Record DB query duration
    metrics.dbQueryDuration.observe(
      { operation: 'findByPk', table: 'claim' }, 
      dbDurationSec
    );
    
    if (!claim) {
      logger.warn('Claim not found', {
        claimId: req.params.id,
        userId: req.user?.id
      });
      
      // Record metrics for not found
      metrics.claimTotal.inc({ status: 'not_found' });
      
      return res.status(404).json({ error: 'Claim not found' });
    }
    
    logger.debug('Claim retrieved successfully', {
      claimId: claim.id,
      userId: req.user?.id
    });
    
    // Calculate total duration
    const diff = process.hrtime(startTime);
    const durationSec = (diff[0] + diff[1] / 1e9);
    metrics.claimProcessingDuration.observe({ status: 'success' }, durationSec);
    
    res.json(claim);
  } catch (error) {
    logger.error('Error retrieving claim', {
      error: error.message,
      stack: error.stack,
      claimId: req.params.id,
      userId: req.user?.id
    });
    
    // Record error metrics
    metrics.claimTotal.inc({ status: 'error' });
    
    // Calculate error duration
    const diff = process.hrtime(startTime);
    const durationSec = (diff[0] + diff[1] / 1e9);
    metrics.claimProcessingDuration.observe({ status: 'error' }, durationSec);
    
    res.status(500).json({ error: error.message });
  }
};

// GET /claims/status/:id
const getClaimStatus = async (req, res) => {
  const startTime = process.hrtime();
  
  try {
    logger.info('Checking claim status', {
      claimId: req.params.id,
      userId: req.user?.id
    });
    
    // Measure database operation duration
    const dbStart = process.hrtime();
    const claim = await Claim.findByPk(req.params.id);
    const dbDiff = process.hrtime(dbStart);
    const dbDurationSec = (dbDiff[0] + dbDiff[1] / 1e9);
    
    // Record DB query duration
    metrics.dbQueryDuration.observe(
      { operation: 'findByPk', table: 'claim' }, 
      dbDurationSec
    );
    
    if (!claim) {
      logger.warn('Claim not found when checking status', {
        claimId: req.params.id,
        userId: req.user?.id
      });
      
      // Record metrics for not found
      metrics.claimTotal.inc({ status: 'not_found' });
      
      return res.status(404).json({ error: 'Claim not found' });
    }
    
    logger.debug('Claim status retrieved successfully', {
      claimId: claim.id,
      status: claim.status,
      userId: req.user?.id
    });
    
    // Calculate total duration
    const diff = process.hrtime(startTime);
    const durationSec = (diff[0] + diff[1] / 1e9);
    metrics.claimProcessingDuration.observe({ status: 'success' }, durationSec);
    
    res.json({ status: claim.status });
  } catch (error) {
    logger.error('Error retrieving claim status', {
      error: error.message,
      stack: error.stack,
      claimId: req.params.id,
      userId: req.user?.id
    });
    
    // Record error metrics
    metrics.claimTotal.inc({ status: 'error' });
    
    // Calculate error duration
    const diff = process.hrtime(startTime);
    const durationSec = (diff[0] + diff[1] / 1e9);
    metrics.claimProcessingDuration.observe({ status: 'error' }, durationSec);
    
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createClaim,
  getClaimById,
  getClaimStatus
};
