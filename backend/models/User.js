const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 120,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["citizen", "admin", "contractor"],
      default: "citizen",
    },
    reputation: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    completedContracts: {
      type: Number,
      default: 0,
      min: 0,
    },
    walletAddress: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },
    refreshTokenHash: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", UserSchema);
