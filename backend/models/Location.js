const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema(
  {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
    // GeoJSON point for geospatial queries (lng, lat)
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
      },
    },
    videoPath: {
      type: String,
      default: "",
    },
    imagePath: {
      type: String,
      default: "",
    },
    mediaPath: {
      type: String,
      required: true,
    },
    mediaType: {
      type: String,
      enum: ["video", "image"],
      required: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
    severity: {
      type: String,
      enum: ["unknown", "low", "medium", "high"],
      default: "unknown",
    },
    status: {
      type: String,
      enum: ["submitted", "verified", "in_review", "tendered", "repaired", "rejected"],
      default: "submitted",
    },
    depth: {
      type: Number,
      default: null,
      min: 0,
    },
    reporterName: {
      type: String,
      default: "",
      trim: true,
      maxlength: 80,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    mlDetections: {
      type: [
        {
          confidence: Number,
          bbox: [Number],
          class: String,
          severity: String,
        },
      ],
      default: [],
    },
    mlError: {
      type: String,
      default: "",
    },
    credibilityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    duplicateReportIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Location",
      default: [],
    },
    estimatedArea: {
      type: Number,
      default: 0,
      min: 0,
    },
    estimatedCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    confidence: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
    confirmCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

LocationSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Location", LocationSchema);
