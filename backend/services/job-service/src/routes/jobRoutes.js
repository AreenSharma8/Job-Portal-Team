const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticate, authorize } = require('../../../../shared/middleware/auth');
const { apiLimiter } = require('../../../../shared/middleware/rateLimiter');

// Public routes
router.get('/', apiLimiter, jobController.getJobs);
router.get('/featured', jobController.getFeaturedJobs);
router.get('/categories', jobController.getCategories);
router.get('/slug/:slug', jobController.getJobBySlug);
router.get('/:id', jobController.getJob);

// Employer routes
router.post('/', authenticate, authorize('employer', 'admin'), jobController.createJob);
router.put('/:id', authenticate, authorize('employer', 'admin'), jobController.updateJob);
router.delete('/:id', authenticate, authorize('employer', 'admin'), jobController.deleteJob);
router.get('/employer/my-jobs', authenticate, authorize('employer'), jobController.getEmployerJobs);

module.exports = router;
