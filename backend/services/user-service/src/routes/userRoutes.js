const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../../../../shared/middleware/auth');

// Multer config for resume uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Applicant routes
router.get('/profile/applicant', authenticate, authorize('applicant'), userController.getApplicantProfile);
router.put('/profile/applicant', authenticate, authorize('applicant'), userController.updateApplicantProfile);
router.post('/profile/applicant/resume', authenticate, authorize('applicant'), upload.single('resume'), userController.uploadResume);
router.get('/profile/applicant/:id', authenticate, userController.getPublicProfile);
router.post('/bookmark/:jobId', authenticate, authorize('applicant'), userController.toggleBookmark);

// Employer/Company routes
router.get('/profile/company', authenticate, authorize('employer'), userController.getCompanyProfile);
router.put('/profile/company', authenticate, authorize('employer'), userController.updateCompanyProfile);
router.get('/companies', userController.listCompanies);
router.get('/companies/:id', userController.getPublicCompany);

module.exports = router;
