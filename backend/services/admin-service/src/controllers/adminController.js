const mongoose = require('mongoose');
const AuditLog = require('../models/AuditLog');
const AppError = require('../../../../shared/utils/AppError');

// We reference the shared DB collections
const User = mongoose.model('AdminUser', new mongoose.Schema({}, { strict: false, collection: 'users' }));
const Job = mongoose.model('AdminJob', new mongoose.Schema({}, { strict: false, collection: 'jobs' }));
const Application = mongoose.model('AdminApplication', new mongoose.Schema({}, { strict: false, collection: 'applications' }));

// Dashboard analytics
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalJobs, totalApplications, activeJobs] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments(),
      Job.countDocuments({ status: 'open' }),
    ]);

    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    const applicationsByStatus = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const recentJobs = await Job.find().sort('-createdAt').limit(5).select('title company createdAt status');
    const recentUsers = await User.find().sort('-createdAt').limit(5).select('name email role createdAt');

    // Monthly job postings (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyJobs = await Job.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats: { totalUsers, totalJobs, totalApplications, activeJobs },
        usersByRole,
        applicationsByStatus,
        recentJobs,
        recentUsers,
        monthlyJobs,
      },
    });
  } catch (error) {
    next(error);
  }
};

// User management
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const role = req.query.role;
    const search = req.query.search;
    const skip = (page - 1) * limit;

    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).sort('-createdAt').skip(skip).limit(limit).select('-password -refreshToken');
    const total = await User.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: { users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
    });
  } catch (error) {
    next(error);
  }
};

// Update user status
exports.updateUser = async (req, res, next) => {
  try {
    const { isActive, role } = req.body;
    const updates = {};
    if (typeof isActive === 'boolean') updates.isActive = isActive;
    if (role) updates.role = role;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true })
      .select('-password -refreshToken');

    if (!user) return next(new AppError('User not found', 404));

    await AuditLog.create({
      userId: req.user.id,
      action: 'update_user',
      resource: 'user',
      resourceId: req.params.id,
      details: updates,
      ip: req.ip,
    });

    res.status(200).json({ status: 'success', data: { user } });
  } catch (error) {
    next(error);
  }
};

// Delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return next(new AppError('User not found', 404));

    await AuditLog.create({
      userId: req.user.id,
      action: 'delete_user',
      resource: 'user',
      resourceId: req.params.id,
      ip: req.ip,
    });

    res.status(200).json({ status: 'success', message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

// Job moderation
exports.getJobsForModeration = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const jobs = await Job.find().sort('-createdAt').skip(skip).limit(limit);
    const total = await Job.countDocuments();

    res.status(200).json({
      status: 'success',
      results: jobs.length,
      data: { jobs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
    });
  } catch (error) {
    next(error);
  }
};

// Update job status (moderation)
exports.moderateJob = async (req, res, next) => {
  try {
    const { status } = req.body;
    const job = await Job.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!job) return next(new AppError('Job not found', 404));

    await AuditLog.create({
      userId: req.user.id,
      action: 'moderate_job',
      resource: 'job',
      resourceId: req.params.id,
      details: { status },
      ip: req.ip,
    });

    res.status(200).json({ status: 'success', data: { job } });
  } catch (error) {
    next(error);
  }
};

// Audit logs
exports.getAuditLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const logs = await AuditLog.find().sort('-createdAt').skip(skip).limit(limit);
    const total = await AuditLog.countDocuments();

    res.status(200).json({
      status: 'success',
      data: { logs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
    });
  } catch (error) {
    next(error);
  }
};
