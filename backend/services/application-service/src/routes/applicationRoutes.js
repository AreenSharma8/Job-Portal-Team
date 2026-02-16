const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/applicationController');
const { authenticate, authorize } = require('../../../../shared/middleware/auth');

// Applicant routes
router.post('/', authenticate, authorize('applicant'), ctrl.applyForJob);
router.get('/my', authenticate, authorize('applicant'), ctrl.getMyApplications);
router.post('/:id/withdraw', authenticate, authorize('applicant'), ctrl.withdrawApplication);

// Employer routes
router.get('/employer', authenticate, authorize('employer'), ctrl.getEmployerApplications);
router.get('/job/:jobId', authenticate, authorize('employer', 'admin'), ctrl.getJobApplications);
router.put('/:id/status', authenticate, authorize('employer', 'admin'), ctrl.updateApplicationStatus);

// Shared
router.get('/:id', authenticate, ctrl.getApplication);

module.exports = router;
