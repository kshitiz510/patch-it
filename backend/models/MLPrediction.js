const mongoose = require("mongoose");

const MLPredictionSchema = new mongoose.Schema(
  {
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
      index: true,
    },
    modelName: {
      type: String,
      default: "heuristic-media-v1",
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },
    estimatedArea: {
      type: Number,
      required: true,
      min: 0,
    },
    estimatedCost: {
      type: Number,
      required: true,
      min: 0,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    detections: {
      type: Array,
      default: [],
    },
    source: {
      type: String,
      enum: ["ml-service", "local-heuristic"],
      default: "local-heuristic",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("MLPrediction", MLPredictionSchema);
