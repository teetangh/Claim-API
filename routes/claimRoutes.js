const express = require('express');
const router = express.Router();
const {
  createClaim,
  getClaimById,
  getClaimStatus
} = require('../controllers/claimController');
const authenticate = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticate);

// POST /claims
router.post('/', createClaim);

// GET /claims/status/:id - This specific route must come BEFORE the general /:id route
router.get('/status/:id', getClaimStatus);

// GET /claims/:id
router.get('/:id', getClaimById);

module.exports = router;
