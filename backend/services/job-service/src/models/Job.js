const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      maxlength: [10000, 'Description cannot exceed 10000 characters'],
    },
    requirements: [String],
    responsibilities: [String],
    company: {
      type: String,
      required: [true, 'Company name is required'],
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: 'India' },
      remote: { type: Boolean, default: false },
    },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
      required: [true, 'Job type is required'],
    },
    category: {
      type: String,
      default: 'General',
    },
    skills: [{ type: String, trim: true }],
    experienceLevel: {
      type: String,
      enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'executive'],
      default: 'mid',
    },
    experienceYears: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },
    salary: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: 'INR' },
      period: { type: String, enum: ['hourly', 'monthly', 'yearly'], default: 'yearly' },
      isNegotiable: { type: Boolean, default: false },
      showSalary: { type: Boolean, default: true },
    },
    benefits: [String],
    applicationDeadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['draft', 'open', 'closed', 'paused'],
      default: 'open',
    },
    applicationsCount: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    tags: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for search performance
jobSchema.index({ title: 'text', description: 'text', skills: 'text', company: 'text' });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ employerId: 1 });
jobSchema.index({ 'location.city': 1 });
jobSchema.index({ type: 1 });
jobSchema.index({ category: 1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ experienceLevel: 1 });
jobSchema.index({ slug: 1 });

// Generate slug before saving
jobSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    const slugify = require('slugify');
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('Job', jobSchema);
