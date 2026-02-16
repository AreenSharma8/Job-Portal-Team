const Application = require('../models/Application');
const AppError = require('../../../../shared/utils/AppError');

// Apply for a job
exports.applyForJob = async (req, res, next) => {
  try {
    const { jobId, employerId, resume, coverLetter, answers } = req.body;

    const existingApp = await Application.findOne({
      jobId,
      applicantId: req.user.id,
    });

    if (existingApp) {
      return next(new AppError('You have already applied for this job', 400));
    }

    const application = await Application.create({
      jobId,
      applicantId: req.user.id,
      employerId,
      resume,
      coverLetter,
      answers,
      statusHistory: [{ status: 'applied', changedBy: req.user.id }],
    });

    res.status(201).json({ status: 'success', data: { application } });
  } catch (error) {
    next(error);
  }
};

// Get applicant's applications
exports.getMyApplications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    const query = { applicantId: req.user.id };
    if (status) query.status = status;

    const applications = await Application.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('jobId', 'title company location type salary slug');

    const total = await Application.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: applications.length,
      data: {
        applications,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get applications for a job (employer)
exports.getJobApplications = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    const query = { jobId, employerId: req.user.id };
    if (status) query.status = status;

    const applications = await Application.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Application.countDocuments(query);

    // Stats
    const stats = await Application.aggregate([
      { $match: { jobId: require('mongoose').Types.ObjectId.createFromHexString(jobId), employerId: require('mongoose').Types.ObjectId.createFromHexString(req.user.id) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      status: 'success',
      results: applications.length,
      data: {
        applications,
        stats,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update application status (employer)
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return next(new AppError('Application not found', 404));
    }

    if (application.employerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized', 403));
    }

    application.status = status;
    application.statusHistory.push({
      status,
      changedBy: req.user.id,
      note,
    });

    await application.save();

    res.status(200).json({ status: 'success', data: { application } });
  } catch (error) {
    next(error);
  }
};

// Withdraw application (applicant)
exports.withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      applicantId: req.user.id,
    });

    if (!application) {
      return next(new AppError('Application not found', 404));
    }

    if (['hired', 'rejected', 'withdrawn'].includes(application.status)) {
      return next(new AppError('Cannot withdraw this application', 400));
    }

    application.status = 'withdrawn';
    application.withdrawnReason = req.body.reason || '';
    application.statusHistory.push({
      status: 'withdrawn',
      changedBy: req.user.id,
      note: req.body.reason,
    });

    await application.save();

    res.status(200).json({ status: 'success', data: { application } });
  } catch (error) {
    next(error);
  }
};

// Get single application
exports.getApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('jobId', 'title company location type salary');

    if (!application) {
      return next(new AppError('Application not found', 404));
    }

    // Only applicant, employer, or admin can view
    const isOwner = application.applicantId.toString() === req.user.id;
    const isEmployer = application.employerId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isEmployer && !isAdmin) {
      return next(new AppError('Not authorized', 403));
    }

    res.status(200).json({ status: 'success', data: { application } });
  } catch (error) {
    next(error);
  }
};

// Get all applications for employer
exports.getEmployerApplications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { employerId: req.user.id };
    if (req.query.status) query.status = req.query.status;

    const applications = await Application.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('jobId', 'title company');

    const total = await Application.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: applications.length,
      data: {
        applications,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
};
