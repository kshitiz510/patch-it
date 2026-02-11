const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const Location = require("./models/Location");

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/patchit";
mongoose.connect(MONGO_URI);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

// Multer Setup for File Uploads (Videos)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads", "videos"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if ([".mp4", ".mov", ".avi", ".mkv"].includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only video files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

// Serve Static Files (Videos)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes

// POST Route: Upload a video and location
app.post("/upload", upload.single("video"), async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Video file is required" });
    }

    const location = new Location({
      latitude: lat,
      longitude: lng,
      videoPath: "uploads/videos/" + req.file.filename,
    });

    await location.save();

    res.status(201).json({ message: "Location and video uploaded successfully", location });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save location and video" });
  }
});

// GET Route: Fetch all locations
app.get("/locations", async (req, res) => {
  try {
    const locations = await Location.find().select("latitude longitude videoPath");
    res.status(200).json(locations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch locations" });
  }
});

// Start the Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
