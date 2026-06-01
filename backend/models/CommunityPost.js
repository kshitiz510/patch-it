const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    author: {
      type: String,
      default: "Citizen",
      trim: true,
      maxlength: 80,
    },
    authorUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    parentId: {
      type: String,
      default: "",
    },
  },
  { _id: true },
);

const CommunityPostSchema = new mongoose.Schema(
  {
    author: {
      type: String,
      default: "Citizen",
      trim: true,
      maxlength: 80,
    },
    authorUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      default: null,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    comments: {
      type: [CommentSchema],
      default: [],
    },
  },
  { timestamps: true },
);

CommunityPostSchema.index({ createdAt: -1 });

module.exports = mongoose.model("CommunityPost", CommunityPostSchema);
