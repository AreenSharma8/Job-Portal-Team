const mongoose = require('mongoose');

// We'll use the Job model directly from same DB
const jobSchema = new mongoose.Schema({}, { strict: false, collection: 'jobs' });
const Job = mongoose.model('SearchJob', jobSchema);

// Search jobs with auto-suggestions
exports.searchJobs = async (req, res, next) => {
  try {
    const {
      q, location, type, experience, minSalary, maxSalary,
      skills, remote, page = 1, limit = 20, sort = '-createdAt',
    } = req.query;

    const pipeline = [];

    // Text search stage
    if (q) {
      pipeline.push({
        $match: { $text: { $search: q } },
      });
      pipeline.push({
        $addFields: { score: { $meta: 'textScore' } },
      });
    }

    // Status filter
    pipeline.push({ $match: { status: 'open' } });

    // Additional filters
    const matchStage = {};
    if (type) matchStage.type = type;
    if (experience) matchStage.experienceLevel = experience;
    if (location) matchStage['location.city'] = { $regex: location, $options: 'i' };
    if (remote === 'true') matchStage['location.remote'] = true;
    if (skills) {
      const skillsArr = skills.split(',').map((s) => s.trim());
      matchStage.skills = { $in: skillsArr };
    }
    if (minSalary) matchStage['salary.min'] = { $gte: parseInt(minSalary) };
    if (maxSalary) matchStage['salary.max'] = { $lte: parseInt(maxSalary) };

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Count total
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await Job.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    // Sort
    if (q) {
      pipeline.push({ $sort: { score: -1, createdAt: -1 } });
    } else {
      pipeline.push({ $sort: { createdAt: -1 } });
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    // Exclude heavy fields
    pipeline.push({
      $project: { description: 0 },
    });

    const jobs = await Job.aggregate(pipeline);

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

// Auto-suggestions
exports.suggest = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.status(200).json({ status: 'success', data: { suggestions: [] } });
    }

    const regex = new RegExp(q, 'i');

    // Get title suggestions
    const titleSuggestions = await Job.aggregate([
      { $match: { title: regex, status: 'open' } },
      { $group: { _id: '$title' } },
      { $limit: 5 },
      { $project: { _id: 0, text: '$_id', type: { $literal: 'title' } } },
    ]);

    // Get skill suggestions
    const skillSuggestions = await Job.aggregate([
      { $unwind: '$skills' },
      { $match: { skills: regex } },
      { $group: { _id: '$skills' } },
      { $limit: 5 },
      { $project: { _id: 0, text: '$_id', type: { $literal: 'skill' } } },
    ]);

    // Get company suggestions
    const companySuggestions = await Job.aggregate([
      { $match: { company: regex, status: 'open' } },
      { $group: { _id: '$company' } },
      { $limit: 3 },
      { $project: { _id: 0, text: '$_id', type: { $literal: 'company' } } },
    ]);

    const suggestions = [...titleSuggestions, ...skillSuggestions, ...companySuggestions];

    res.status(200).json({ status: 'success', data: { suggestions } });
  } catch (error) {
    next(error);
  }
};

// Trending searches / popular categories
exports.trending = async (req, res, next) => {
  try {
    const popularCategories = await Job.aggregate([
      { $match: { status: 'open' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const popularSkills = await Job.aggregate([
      { $match: { status: 'open' } },
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]);

    res.status(200).json({
      status: 'success',
      data: { popularCategories, popularSkills },
    });
  } catch (error) {
    next(error);
  }
};
