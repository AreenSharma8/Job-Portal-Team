const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    industry: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      maxlength: 5000,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    logo: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+', ''],
      default: '',
    },
    founded: {
      type: Number,
    },
    headquarters: {
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: 'India' },
      address: { type: String, default: '' },
    },
    locations: [
      {
        city: String,
        state: String,
        country: String,
      },
    ],
    socialLinks: {
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      facebook: { type: String, default: '' },
    },
    benefits: [String],
    techStack: [String],
    isVerified: {
      type: Boolean,
      default: false,
    },
    totalJobs: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

companySchema.index({ userId: 1 });
companySchema.index({ companyName: 'text', industry: 'text' });
companySchema.index({ isVerified: 1 });

module.exports = mongoose.model('Company', companySchema);
