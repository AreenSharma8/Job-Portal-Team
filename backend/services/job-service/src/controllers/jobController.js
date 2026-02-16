const Job = require('../models/Job');
const AppError = require('../../../../shared/utils/AppError');

// Create a job
exports.createJob = async (req, res, next) => {
  try {
    const jobData = {
      ...req.body,
      employerId: req.user.id,
    };

    const job = await Job.create(jobData);

    res.status(201).json({
      status: 'success',
      data: { job },
    });
  } catch (error) {
    next(error);
  }
};

// Get all jobs (public, with filters)
exports.getJobs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = '-createdAt',
      search,
      type,
      category,
      experienceLevel,
      location,
      minSalary,
      maxSalary,
      skills,
      remote,
    } = req.query;

    const query = { status: 'open' };

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Filters
    if (type) query.type = type;
    if (category) query.category = category;
    if (experienceLevel) query.experienceLevel = experienceLevel;
    if (location) query['location.city'] = new RegExp(location, 'i');
    if (remote === 'true') query['location.remote'] = true;
    if (skills) {
      const skillsArr = skills.split(',').map((s) => s.trim());
      query.skills = { $in: skillsArr };
    }
    if (minSalary) query['salary.min'] = { $gte: parseInt(minSalary) };
    if (maxSalary) query['salary.max'] = { $lte: parseInt(maxSalary) };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const jobs = await Job.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-description');

    const total = await Job.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: jobs.length,
      data: {
        jobs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get single job
exports.getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    // Increment views
    job.views += 1;
    await job.save({ validateBeforeSave: false });

    res.status(200).json({ status: 'success', data: { job } });
  } catch (error) {
    next(error);
  }
};

// Get job by slug
exports.getJobBySlug = async (req, res, next) => {
  try {
    const job = await Job.findOne({ slug: req.params.slug });
    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    job.views += 1;
    await job.save({ validateBeforeSave: false });

    res.status(200).json({ status: 'success', data: { job } });
  } catch (error) {
    next(error);
  }
};

// Update job (employer only)
exports.updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    if (job.employerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to update this job', 403));
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ status: 'success', data: { job: updatedJob } });
  } catch (error) {
    next(error);
  }
};

// Delete job
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    if (job.employerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to delete this job', 403));
    }

    await Job.findByIdAndDelete(req.params.id);

    res.status(200).json({ status: 'success', message: 'Job deleted' });
  } catch (error) {
    next(error);
  }
};

// Get employer's jobs
exports.getEmployerJobs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    const query = { employerId: req.user.id };
    if (status) query.status = status;

    const jobs = await Job.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Job.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: jobs.length,
      data: {
        jobs,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get job categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Job.distinct('category', { status: 'open' });
    res.status(200).json({ status: 'success', data: { categories } });
  } catch (error) {
    next(error);
  }
};

// Get featured jobs
exports.getFeaturedJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ status: 'open', isFeatured: true })
      .sort('-createdAt')
      .limit(10)
      .select('-description');

    res.status(200).json({ status: 'success', data: { jobs } });
  } catch (error) {
    next(error);
  }
};
