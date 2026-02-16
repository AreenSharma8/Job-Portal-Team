const mongoose = require('mongoose');

const applicantProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    headline: {
      type: String,
      maxlength: 200,
      default: '',
    },
    summary: {
      type: String,
      maxlength: 2000,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    location: {
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: 'India' },
    },
    resume: {
      url: { type: String, default: '' },
      filename: { type: String, default: '' },
      uploadedAt: Date,
    },
    skills: [{ type: String, trim: true }],
    experience: [
      {
        title: String,
        company: String,
        location: String,
        startDate: Date,
        endDate: Date,
        current: { type: Boolean, default: false },
        description: String,
      },
    ],
    education: [
      {
        degree: String,
        institution: String,
        field: String,
        startDate: Date,
        endDate: Date,
        grade: String,
      },
    ],
    certifications: [
      {
        name: String,
        issuer: String,
        issueDate: Date,
        expiryDate: Date,
        credentialUrl: String,
      },
    ],
    languages: [
      {
        name: String,
        proficiency: {
          type: String,
          enum: ['basic', 'intermediate', 'advanced', 'native'],
        },
      },
    ],
    socialLinks: {
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
      portfolio: { type: String, default: '' },
      twitter: { type: String, default: '' },
    },
    preferences: {
      jobTypes: [{ type: String, enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'] }],
      expectedSalary: {
        min: Number,
        max: Number,
        currency: { type: String, default: 'INR' },
      },
      preferredLocations: [String],
      openToRemote: { type: Boolean, default: true },
      noticePeriod: String,
    },
    profileCompleteness: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    bookmarkedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  },
  { timestamps: true }
);

// Calculate profile completeness
applicantProfileSchema.methods.calculateCompleteness = function () {
  let score = 0;
  const weights = {
    headline: 10,
    summary: 10,
    phone: 5,
    location: 5,
    resume: 15,
    skills: 15,
    experience: 15,
    education: 10,
    socialLinks: 5,
    preferences: 10,
  };

  if (this.headline) score += weights.headline;
  if (this.summary) score += weights.summary;
  if (this.phone) score += weights.phone;
  if (this.location?.city) score += weights.location;
  if (this.resume?.url) score += weights.resume;
  if (this.skills?.length > 0) score += weights.skills;
  if (this.experience?.length > 0) score += weights.experience;
  if (this.education?.length > 0) score += weights.education;
  if (this.socialLinks?.linkedin || this.socialLinks?.github) score += weights.socialLinks;
  if (this.preferences?.jobTypes?.length > 0) score += weights.preferences;

  this.profileCompleteness = score;
  return score;
};

applicantProfileSchema.pre('save', function (next) {
  this.calculateCompleteness();
  next();
});

applicantProfileSchema.index({ userId: 1 });
applicantProfileSchema.index({ skills: 1 });
applicantProfileSchema.index({ 'location.city': 1 });

module.exports = mongoose.model('ApplicantProfile', applicantProfileSchema);
