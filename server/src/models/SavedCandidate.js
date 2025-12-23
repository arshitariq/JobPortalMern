const mongoose = require("mongoose");
const { Schema } = mongoose;

const savedCandidateSchema = new Schema(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    applicant: {
      type: Schema.Types.ObjectId,
      ref: "Applicant",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notes: String,
    metadata: Schema.Types.Mixed,
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

savedCandidateSchema.index({ company: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model("SavedCandidate", savedCandidateSchema);
