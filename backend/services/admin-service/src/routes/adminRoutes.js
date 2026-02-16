const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const { authenticate, authorize } = require('../../../../shared/middleware/auth');

router.use(authenticate, authorize('admin'));

router.get('/dashboard', ctrl.getDashboardStats);
router.get('/users', ctrl.getUsers);
router.put('/users/:id', ctrl.updateUser);
router.delete('/users/:id', ctrl.deleteUser);
router.get('/jobs', ctrl.getJobsForModeration);
router.put('/jobs/:id/moderate', ctrl.moderateJob);
router.get('/audit-logs', ctrl.getAuditLogs);

module.exports = router;
