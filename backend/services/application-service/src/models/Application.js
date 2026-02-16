const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resume: {
      url: String,
      filename: String,
    },
    coverLetter: {
      type: String,
      maxlength: 5000,
      default: '',
    },
    status: {
      type: String,
      enum: ['applied', 'reviewing', 'shortlisted', 'interview', 'offered', 'hired', 'rejected', 'withdrawn'],
      default: 'applied',
    },
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: String,
      },
    ],
    answers: [
      {
        question: String,
        answer: String,
      },
    ],
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    notes: {
      type: String,
      default: '',
    },
    interviewDate: Date,
    withdrawnReason: String,
  },
  { timestamps: true }
);

// Prevent duplicate applications
applicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });
applicationSchema.index({ applicantId: 1, createdAt: -1 });
applicationSchema.index({ jobId: 1, status: 1 });
applicationSchema.index({ employerId: 1 });

module.exports = mongoose.model('Application', applicationSchema);
