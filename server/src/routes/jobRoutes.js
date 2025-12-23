const express = require('express');
const router = express.Router();

const { listPublicJobs, getPublicJobDetails } = require('../controllers/jobController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, listPublicJobs);
router.get('/:jobId', optionalAuth, getPublicJobDetails);

module.exports = router;
