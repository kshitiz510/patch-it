const crypto = require("crypto");
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
require("dotenv").config();

const LocationModel = require("./models/Location");
const UserModel = require("./models/User");
const CommunityPostModel = require("./models/CommunityPost");

const DEFAULT_PORT = process.env.PORT || 4000;
const DEFAULT_MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/patchit";
const TOKEN_SECRET = process.env.AUTH_SECRET || "patchit-dev-secret-change-me";
const MAX_UPLOAD_SIZE_MB = Number(process.env.MAX_UPLOAD_SIZE_MB || 50);
const ML_API_URL = process.env.ML_API_URL || "";

const parseCoordinate = (value, min, max) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  if (parsed < min || parsed > max) return null;
  return parsed;
};

const safeText = (value, max = 500) => {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
};

const hashPassword = (password, salt = crypto.randomBytes(16).toString("hex")) => {
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");
  return `${salt}:${hash}`;
};

const verifyPassword = (password, stored) => {
  const [salt, hash] = String(stored || "").split(":");
  if (!salt || !hash) return false;
  const candidate = hashPassword(password, salt).split(":")[1];
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(candidate));
};

const signToken = (payload) => {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", TOKEN_SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
};

const verifyToken = (token) => {
  const [body, sig] = String(token || "").split(".");
  if (!body || !sig) return null;
  const expected = crypto.createHmac("sha256", TOKEN_SECRET).update(body).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  if (parsed.exp && parsed.exp < Date.now()) return null;
  return parsed;
};

const removeFile = (filePath) => {
  if (!filePath) return;
  fs.unlink(filePath, (err) => {
    if (err) console.warn("Failed to remove file:", err.message);
  });
};

const createApp = ({
  Location = LocationModel,
  User = UserModel,
  CommunityPost = CommunityPostModel,
  uploadsDir = path.join(__dirname, "uploads", "reports"),
} = {}) => {
  const app = express();

  const corsOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(cors({ origin: corsOrigins }));
  app.use(express.json({ limit: "1mb" }));

  fs.mkdirSync(uploadsDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
      const cleaned = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      cb(null, `${Date.now()}-${crypto.randomUUID()}-${cleaned}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const validVideo = [".mp4", ".mov", ".avi", ".mkv"].includes(ext);
    const validImage = [".jpg", ".jpeg", ".png", ".webp"].includes(ext);
    if (validVideo || validImage) cb(null, true);
    else cb(new Error("Only video or image files are allowed"), false);
  };

  const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_UPLOAD_SIZE_MB * 1024 * 1024 },
  });

  const requireAuth = (req, res, next) => {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
    const user = verifyToken(token);
    if (!user) return res.status(401).json({ error: "Authentication required" });
    req.user = user;
    return next();
  };

  const toPublicUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
  });

  const maybeRunMlDetection = async (file, location) => {
    if (!ML_API_URL || !file.mimetype.startsWith("image/")) return null;
    try {
      const FormData = require("form-data");
      const form = new FormData();
      form.append("image", fs.createReadStream(file.path), {
        filename: file.originalname,
        contentType: file.mimetype,
      });
      const response = await axios.post(`${ML_API_URL.replace(/\/$/, "")}/api/detect/`, form, {
        headers: form.getHeaders(),
        timeout: 30000,
      });
      location.mlDetections = response.data.detections || [];
      location.severity = response.data.detections?.[0]?.severity || "unknown";
      return response.data;
    } catch (err) {
      location.mlError = err.response?.data?.error || err.message;
      return null;
    }
  };

  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  app.get(["/health", "/api/health"], (req, res) => {
    res.json({
      status: "ok",
      database:
        mongoose.connection.readyState === 1
          ? "connected"
          : mongoose.connection.readyState === 2
            ? "connecting"
            : "disconnected",
      mlConfigured: Boolean(ML_API_URL),
    });
  });

  app.post(["/auth/register", "/api/auth/register"], async (req, res) => {
    const name = safeText(req.body.name, 80);
    const email = safeText(req.body.email, 120).toLowerCase();
    const password = String(req.body.password || "");

    if (!name || !email || !email.includes("@") || password.length < 8) {
      return res.status(400).json({ error: "Name, valid email, and 8+ character password are required" });
    }

    try {
      const existing = await User.findOne({ email });
      if (existing) return res.status(409).json({ error: "Email is already registered" });

      const user = await User.create({ name, email, passwordHash: hashPassword(password) });
      const token = signToken({ sub: String(user._id), name: user.name, email: user.email, exp: Date.now() + 7 * 86400000 });
      return res.status(201).json({ token, user: toPublicUser(user) });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post(["/auth/login", "/api/auth/login"], async (req, res) => {
    const email = safeText(req.body.email, 120).toLowerCase();
    const password = String(req.body.password || "");

    try {
      const user = await User.findOne({ email });
      if (!user || !verifyPassword(password, user.passwordHash)) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const token = signToken({ sub: String(user._id), name: user.name, email: user.email, exp: Date.now() + 7 * 86400000 });
      return res.json({ token, user: toPublicUser(user) });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Login failed" });
    }
  });

  app.get(["/auth/me", "/api/auth/me"], requireAuth, (req, res) => {
    res.json({ user: req.user });
  });

  app.post(
    ["/upload", "/api/upload"],
    upload.fields([
      { name: "media", maxCount: 1 },
      { name: "video", maxCount: 1 },
      { name: "image", maxCount: 1 },
    ]),
    async (req, res) => {
      const file = req.files?.media?.[0] || req.files?.video?.[0] || req.files?.image?.[0];

      try {
        const parsedLat = parseCoordinate(req.body.lat, -90, 90);
        const parsedLng = parseCoordinate(req.body.lng, -180, 180);

        if (parsedLat === null || parsedLng === null) {
          if (file?.path) removeFile(file.path);
          return res.status(400).json({ error: "Invalid latitude or longitude" });
        }

        if (!file) return res.status(400).json({ error: "Media file is required" });

        const relativePath = `uploads/reports/${file.filename}`;
        const location = new Location({
          latitude: parsedLat,
          longitude: parsedLng,
          location: { type: "Point", coordinates: [parsedLng, parsedLat] },
          mediaPath: relativePath,
          mediaType: file.mimetype.startsWith("image/") ? "image" : "video",
          videoPath: file.mimetype.startsWith("video/") ? relativePath : "",
          imagePath: file.mimetype.startsWith("image/") ? relativePath : "",
          description: safeText(req.body.description),
          status: "submitted",
          reporterName: safeText(req.body.reporterName, 80),
        });

        await maybeRunMlDetection(file, location);
        await location.save();

        return res.status(201).json({ message: "Report uploaded successfully", location });
      } catch (error) {
        console.error(error);
        if (file?.path) removeFile(file.path);
        return res.status(500).json({ error: "Failed to save report" });
      }
    },
  );

  const listLocations = async (req, res) => {
    try {
      const filter = {};
      if (req.query.status) filter.status = req.query.status;
      const locations = await Location.find(filter).sort({ createdAt: -1 }).lean();
      return res.status(200).json(locations);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch locations" });
    }
  };

  app.get(["/locations", "/api/locations"], listLocations);

  app.patch(["/locations/:id/status", "/api/locations/:id/status"], async (req, res) => {
    const allowed = new Set(["submitted", "verified", "in_review", "tendered", "repaired", "rejected"]);
    if (!allowed.has(req.body.status)) return res.status(400).json({ error: "Invalid status" });

    try {
      const location = await Location.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true, runValidators: true },
      );
      if (!location) return res.status(404).json({ error: "Report not found" });
      return res.json(location);
    } catch (err) {
      return res.status(400).json({ error: "Invalid report id" });
    }
  });

  app.post(["/locations/:id/confirm", "/api/locations/:id/confirm"], async (req, res) => {
    try {
      const location = await Location.findByIdAndUpdate(
        req.params.id,
        { $inc: { confirmCount: 1 }, $set: { confirmed: true } },
        { new: true },
      );
      if (!location) return res.status(404).json({ error: "Report not found" });
      return res.json(location);
    } catch (err) {
      return res.status(400).json({ error: "Invalid report id" });
    }
  });

  app.post(["/community/posts", "/api/community/posts"], async (req, res) => {
    const author = safeText(req.body.author, 80) || "Citizen";
    const body = safeText(req.body.body, 1000);
    const locationId = safeText(req.body.locationId, 60);
    if (!body) return res.status(400).json({ error: "Post body is required" });

    try {
      const post = await CommunityPost.create({ author, body, locationId: locationId || undefined });
      return res.status(201).json(post);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to create post" });
    }
  });

  app.get(["/community/posts", "/api/community/posts"], async (req, res) => {
    try {
      const posts = await CommunityPost.find().sort({ createdAt: -1 }).lean();
      return res.json(posts);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.post(["/community/posts/:id/like", "/api/community/posts/:id/like"], async (req, res) => {
    try {
      const post = await CommunityPost.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true });
      if (!post) return res.status(404).json({ error: "Post not found" });
      return res.json(post);
    } catch (err) {
      return res.status(400).json({ error: "Invalid post id" });
    }
  });

  app.post(["/community/posts/:id/comments", "/api/community/posts/:id/comments"], async (req, res) => {
    const author = safeText(req.body.author, 80) || "Citizen";
    const body = safeText(req.body.body, 500);
    if (!body) return res.status(400).json({ error: "Comment body is required" });

    try {
      const post = await CommunityPost.findByIdAndUpdate(
        req.params.id,
        { $push: { comments: { author, body, createdAt: new Date() } } },
        { new: true, runValidators: true },
      );
      if (!post) return res.status(404).json({ error: "Post not found" });
      return res.json(post);
    } catch (err) {
      return res.status(400).json({ error: "Invalid post id" });
    }
  });

  app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      const message = err.code === "LIMIT_FILE_SIZE" ? `File too large. Limit is ${MAX_UPLOAD_SIZE_MB}MB` : err.message;
      return res.status(400).json({ error: message });
    }
    if (err?.message === "Only video or image files are allowed") {
      return res.status(400).json({ error: err.message });
    }
    console.error(err);
    return res.status(500).json({ error: "Unexpected server error" });
  });

  return app;
};

const start = async () => {
  await mongoose.connect(DEFAULT_MONGO_URI);
  mongoose.connection.once("open", () => console.log("Connected to MongoDB"));
  mongoose.connection.on("error", (err) => console.error("MongoDB connection error:", err));

  const app = createApp();
  app.listen(DEFAULT_PORT, () => {
    console.log(`Server is running on http://localhost:${DEFAULT_PORT}`);
  });
};

if (require.main === module) {
  start().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
}

module.exports = {
  createApp,
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  parseCoordinate,
};
