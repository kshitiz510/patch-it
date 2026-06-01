const mongoose = require("mongoose");

const BidSchema = new mongoose.Schema(
  {
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
      index: true,
    },
    contractor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    walletAddress: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    timelineDays: {
      type: Number,
      required: true,
      min: 1,
      max: 365,
    },
    note: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
    txHash: {
      type: String,
      default: "",
      trim: true,
    },
    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isSuspicious: {
      type: Boolean,
      default: false,
    },
    recommendedAction: {
      type: String,
      enum: ["accept", "review", "reject"],
      default: "accept",
    },
    rankingScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ["submitted", "shortlisted", "selected", "rejected", "withdrawn"],
      default: "submitted",
    },
  },
  { timestamps: true },
);

BidSchema.index({ report: 1, contractor: 1 }, { unique: true });

module.exports = mongoose.model("Bid", BidSchema);
