const ApplicantProfile = require('../models/ApplicantProfile');
const Company = require('../models/Company');
const AppError = require('../../../../shared/utils/AppError');

// ===== Applicant Profile =====

exports.getApplicantProfile = async (req, res, next) => {
  try {
    let profile = await ApplicantProfile.findOne({ userId: req.user.id });
    if (!profile) {
      profile = await ApplicantProfile.create({ userId: req.user.id });
    }
    res.status(200).json({ status: 'success', data: { profile } });
  } catch (error) {
    next(error);
  }
};

exports.updateApplicantProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'headline', 'summary', 'phone', 'location', 'skills',
      'experience', 'education', 'certifications', 'languages',
      'socialLinks', 'preferences',
    ];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const profile = await ApplicantProfile.findOneAndUpdate(
      { userId: req.user.id },
      updates,
      { new: true, runValidators: true, upsert: true }
    );

    res.status(200).json({ status: 'success', data: { profile } });
  } catch (error) {
    next(error);
  }
};

exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please upload a file', 400));
    }

    const profile = await ApplicantProfile.findOneAndUpdate(
      { userId: req.user.id },
      {
        resume: {
          url: req.file.path || req.file.location || `/uploads/${req.file.filename}`,
          filename: req.file.originalname,
          uploadedAt: new Date(),
        },
      },
      { new: true, upsert: true }
    );

    res.status(200).json({ status: 'success', data: { profile } });
  } catch (error) {
    next(error);
  }
};

exports.getPublicProfile = async (req, res, next) => {
  try {
    const profile = await ApplicantProfile.findOne({ userId: req.params.id }).select(
      '-bookmarkedJobs -preferences'
    );
    if (!profile) {
      return next(new AppError('Profile not found', 404));
    }
    res.status(200).json({ status: 'success', data: { profile } });
  } catch (error) {
    next(error);
  }
};

// Bookmark job
exports.toggleBookmark = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const profile = await ApplicantProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return next(new AppError('Profile not found', 404));
    }

    const idx = profile.bookmarkedJobs.indexOf(jobId);
    if (idx > -1) {
      profile.bookmarkedJobs.splice(idx, 1);
    } else {
      profile.bookmarkedJobs.push(jobId);
    }
    await profile.save();

    res.status(200).json({
      status: 'success',
      data: { bookmarkedJobs: profile.bookmarkedJobs },
    });
  } catch (error) {
    next(error);
  }
};

// ===== Company / Employer Profile =====

exports.getCompanyProfile = async (req, res, next) => {
  try {
    let company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      company = await Company.create({ userId: req.user.id, companyName: 'My Company' });
    }
    res.status(200).json({ status: 'success', data: { company } });
  } catch (error) {
    next(error);
  }
};

exports.updateCompanyProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'companyName', 'industry', 'description', 'website', 'logo',
      'coverImage', 'size', 'founded', 'headquarters', 'locations',
      'socialLinks', 'benefits', 'techStack',
    ];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const company = await Company.findOneAndUpdate(
      { userId: req.user.id },
      updates,
      { new: true, runValidators: true, upsert: true }
    );

    res.status(200).json({ status: 'success', data: { company } });
  } catch (error) {
    next(error);
  }
};

exports.getPublicCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return next(new AppError('Company not found', 404));
    }
    res.status(200).json({ status: 'success', data: { company } });
  } catch (error) {
    next(error);
  }
};

exports.listCompanies = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const companies = await Company.find({ isVerified: true })
      .skip(skip)
      .limit(limit)
      .sort('-createdAt');

    const total = await Company.countDocuments({ isVerified: true });

    res.status(200).json({
      status: 'success',
      results: companies.length,
      data: {
        companies,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
};
