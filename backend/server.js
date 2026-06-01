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
const MLPredictionModel = require("./models/MLPrediction");
const BidModel = require("./models/Bid");
const RepairContractModel = require("./models/RepairContract");
const AuditLogModel = require("./models/AuditLog");

const DEFAULT_PORT = process.env.PORT || 4000;
const DEFAULT_MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/patchit";
const JWT_SECRET = process.env.AUTH_SECRET || "patchit-dev-secret-change-me";
const MAX_UPLOAD_SIZE_MB = Number(process.env.MAX_UPLOAD_SIZE_MB || 50);
const ML_API_URL = process.env.ML_API_URL || "";

const parseCoordinate = (value, min, max) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) return null;
  return parsed;
};

const safeText = (value, max = 500) => (typeof value === "string" ? value.trim().slice(0, max) : "");

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

const base64url = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");

const signJwt = (payload, expiresInSeconds = 900) => {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url({ alg: "HS256", typ: "JWT" });
  const body = base64url({ ...payload, iat: now, exp: now + expiresInSeconds });
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
};

const verifyJwt = (token) => {
  const [header, body, signature] = String(token || "").split(".");
  if (!header || !body || !signature) return null;
  const expected = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
};

const newRefreshToken = () => crypto.randomBytes(48).toString("base64url");
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const removeFile = (filePath) => {
  if (!filePath) return;
  fs.unlink(filePath, (err) => {
    if (err) console.warn("Failed to remove file:", err.message);
  });
};

const toPublicUser = (user) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
  reputation: user.reputation,
  walletAddress: user.walletAddress || "",
});

const createLocalPrediction = ({ file, duplicateCount = 0, roadType = "urban" }) => {
  const sizeMb = Math.max(file.size / (1024 * 1024), 0.1);
  const isVideo = file.mimetype.startsWith("video/");
  const estimatedArea = Number((Math.min(8, Math.max(0.25, sizeMb * (isVideo ? 0.65 : 0.35)))).toFixed(2));
  const severity = estimatedArea >= 4 || duplicateCount >= 3 ? "high" : estimatedArea >= 1.5 ? "medium" : "low";
  const severityMultiplier = severity === "high" ? 1.8 : severity === "medium" ? 1.25 : 0.8;
  const roadMultiplier = roadType === "highway" ? 1.5 : roadType === "arterial" ? 1.25 : 1;
  const estimatedCost = Math.round(estimatedArea * 9000 * severityMultiplier * roadMultiplier + 6000);
  const confidence = Number(Math.min(0.91, 0.56 + Math.log10(sizeMb + 1) * 0.18 + duplicateCount * 0.04).toFixed(2));
  return {
    modelName: "deterministic-media-estimator-v1",
    severity,
    estimatedArea,
    estimatedCost,
    confidence,
    detections: [],
    source: "local-heuristic",
  };
};

const validateBidRisk = ({ estimatedCost, bidAmount }) => {
  const ratio = estimatedCost > 0 ? bidAmount / estimatedCost : 1;
  const distance = Math.abs(1 - ratio);
  const riskScore = Math.min(100, Math.round(distance * 130));
  const isSuspicious = ratio < 0.55 || ratio > 1.35;
  const recommendedAction = ratio < 0.4 || ratio > 1.75 ? "reject" : isSuspicious ? "review" : "accept";
  return { isSuspicious, riskScore, recommendedAction };
};

const rankingScoreForBid = ({ bidAmount, estimatedCost, contractor, riskScore, timelineDays }) => {
  const proximity = Math.max(0, 100 - Math.abs(1 - bidAmount / Math.max(estimatedCost, 1)) * 100);
  const reputation = contractor?.reputation ?? 50;
  const history = Math.min(100, (contractor?.completedContracts || 0) * 10);
  const speed = Math.max(0, 100 - Math.max(0, timelineDays - 7) * 2);
  return Math.round(proximity * 0.4 + reputation * 0.25 + history * 0.15 + speed * 0.1 + (100 - riskScore) * 0.1);
};

const createApp = ({
  Location = LocationModel,
  User = UserModel,
  CommunityPost = CommunityPostModel,
  MLPrediction = MLPredictionModel,
  Bid = BidModel,
  RepairContract = RepairContractModel,
  AuditLog = AuditLogModel,
  uploadsDir = path.join(__dirname, "uploads", "reports"),
} = {}) => {
  const app = express();

  const corsOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
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
    const valid = [".mp4", ".mov", ".avi", ".mkv", ".jpg", ".jpeg", ".png", ".webp"].includes(ext);
    if (valid) cb(null, true);
    else cb(new Error("Only video or image files are allowed"), false);
  };

  const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_UPLOAD_SIZE_MB * 1024 * 1024 } });

  const audit = async (actor, action, entityType, entityId = "", metadata = {}) => {
    try {
      await AuditLog.create({ actor: actor || null, action, entityType, entityId: String(entityId || ""), metadata });
    } catch (err) {
      console.warn("Audit log failed:", err.message);
    }
  };

  const requireAuth = async (req, res, next) => {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
    const payload = verifyJwt(token);
    if (!payload?.sub) return res.status(401).json({ error: "Authentication required" });
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: "User no longer exists" });
    req.user = user;
    return next();
  };

  const requireRole = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: "Insufficient permissions" });
    return next();
  };

  const issueTokens = async (user) => {
    const accessToken = signJwt({ sub: String(user._id), role: user.role, name: user.name, email: user.email });
    const refreshToken = newRefreshToken();
    user.refreshTokenHash = hashToken(refreshToken);
    await user.save?.();
    return { accessToken, refreshToken, user: toPublicUser(user) };
  };

  const findDuplicates = async (lat, lng) => {
    const since = new Date(Date.now() - 30 * 86400000);
    return Location.find({
      createdAt: { $gte: since },
      latitude: { $gte: lat - 0.0008, $lte: lat + 0.0008 },
      longitude: { $gte: lng - 0.0008, $lte: lng + 0.0008 },
    }).limit(10);
  };

  const runPrediction = async ({ file, report, duplicateCount, roadType }) => {
    if (ML_API_URL && file.mimetype.startsWith("image/")) {
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
        const detections = response.data.detections || [];
        const strongest = detections.sort((a, b) => (b.confidence || 0) - (a.confidence || 0))[0];
        const fallback = createLocalPrediction({ file, duplicateCount, roadType });
        return {
          modelName: "external-yolo-service",
          severity: strongest?.severity || fallback.severity,
          estimatedArea: response.data.estimatedArea || fallback.estimatedArea,
          estimatedCost: response.data.estimatedCost || fallback.estimatedCost,
          confidence: response.data.confidence || strongest?.confidence || fallback.confidence,
          detections,
          source: "ml-service",
        };
      } catch (err) {
        report.mlError = err.response?.data?.error || err.message;
      }
    }
    return createLocalPrediction({ file, duplicateCount, roadType });
  };

  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  app.get(["/health", "/api/health"], (req, res) => {
    res.json({
      status: "ok",
      database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      mlConfigured: Boolean(ML_API_URL),
    });
  });

  app.post(["/auth/register", "/api/auth/register"], async (req, res) => {
    const name = safeText(req.body.name, 80);
    const email = safeText(req.body.email, 120).toLowerCase();
    const password = String(req.body.password || "");
    const role = ["citizen", "contractor", "admin"].includes(req.body.role) ? req.body.role : "citizen";
    if (!name || !email.includes("@") || password.length < 8) {
      return res.status(400).json({ error: "Name, valid email, and 8+ character password are required" });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "Email is already registered" });
    const user = await User.create({ name, email, role, passwordHash: hashPassword(password) });
    await audit(user._id, "user.registered", "User", user._id, { role });
    return res.status(201).json(await issueTokens(user));
  });

  app.post(["/auth/login", "/api/auth/login"], async (req, res) => {
    const email = safeText(req.body.email, 120).toLowerCase();
    const password = String(req.body.password || "");
    const user = await User.findOne({ email });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    await audit(user._id, "user.logged_in", "User", user._id);
    return res.json(await issueTokens(user));
  });

  app.post(["/auth/refresh", "/api/auth/refresh"], async (req, res) => {
    const refreshToken = String(req.body.refreshToken || "");
    const user = await User.findOne({ refreshTokenHash: hashToken(refreshToken) });
    if (!user) return res.status(401).json({ error: "Invalid refresh token" });
    return res.json(await issueTokens(user));
  });

  app.post(["/auth/logout", "/api/auth/logout"], requireAuth, async (req, res) => {
    req.user.refreshTokenHash = "";
    await req.user.save();
    await audit(req.user._id, "user.logged_out", "User", req.user._id);
    res.json({ ok: true });
  });

  app.get(["/auth/me", "/api/auth/me"], requireAuth, (req, res) => res.json({ user: toPublicUser(req.user) }));

  app.post(["/wallets", "/api/wallets"], requireAuth, async (req, res) => {
    const walletAddress = safeText(req.body.walletAddress, 80).toLowerCase();
    if (!/^0x[a-f0-9]{40}$/.test(walletAddress)) return res.status(400).json({ error: "Invalid wallet address" });
    req.user.walletAddress = walletAddress;
    await req.user.save();
    await audit(req.user._id, "wallet.linked", "Wallet", walletAddress);
    res.json({ user: toPublicUser(req.user) });
  });

  app.post(
    ["/upload", "/api/upload", "/reports", "/api/reports"],
    requireAuth,
    upload.fields([
      { name: "media", maxCount: 1 },
      { name: "video", maxCount: 1 },
      { name: "image", maxCount: 1 },
    ]),
    async (req, res) => {
      const file = req.files?.media?.[0] || req.files?.video?.[0] || req.files?.image?.[0];
      try {
        const lat = parseCoordinate(req.body.lat, -90, 90);
        const lng = parseCoordinate(req.body.lng, -180, 180);
        if (lat === null || lng === null) {
          if (file?.path) removeFile(file.path);
          return res.status(400).json({ error: "Invalid latitude or longitude" });
        }
        if (!file) return res.status(400).json({ error: "Media file is required" });

        const duplicates = await findDuplicates(lat, lng);
        if (duplicates.length >= 3) {
          removeFile(file.path);
          return res.status(409).json({ error: "Likely duplicate report already exists nearby" });
        }

        const relativePath = `uploads/reports/${file.filename}`;
        const report = new Location({
          reporter: req.user._id,
          reporterName: req.user.name,
          latitude: lat,
          longitude: lng,
          location: { type: "Point", coordinates: [lng, lat] },
          mediaPath: relativePath,
          mediaType: file.mimetype.startsWith("image/") ? "image" : "video",
          videoPath: file.mimetype.startsWith("video/") ? relativePath : "",
          imagePath: file.mimetype.startsWith("image/") ? relativePath : "",
          description: safeText(req.body.description),
          status: "submitted",
          duplicateReportIds: duplicates.map((item) => item._id),
        });

        const prediction = await runPrediction({
          file,
          report,
          duplicateCount: duplicates.length,
          roadType: safeText(req.body.roadType, 40) || "urban",
        });
        Object.assign(report, {
          severity: prediction.severity,
          estimatedArea: prediction.estimatedArea,
          estimatedCost: prediction.estimatedCost,
          confidence: prediction.confidence,
          mlDetections: prediction.detections,
          credibilityScore: Math.min(100, Math.round(35 + req.user.reputation * 0.25 + duplicates.length * 12 + prediction.confidence * 25)),
        });
        await report.save();
        const savedPrediction = await MLPrediction.create({ ...prediction, report: report._id });
        await audit(req.user._id, "report.created", "Location", report._id, { prediction: savedPrediction._id });
        return res.status(201).json({ message: "Report uploaded and analyzed", location: report, prediction: savedPrediction });
      } catch (error) {
        console.error(error);
        if (file?.path) removeFile(file.path);
        return res.status(500).json({ error: "Failed to save report" });
      }
    },
  );

  app.get(["/locations", "/api/locations", "/reports", "/api/reports"], async (req, res) => {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const reports = await Location.find(filter).sort({ createdAt: -1 }).lean();
    res.json(reports);
  });

  app.get(["/reports/:id", "/api/reports/:id"], async (req, res) => {
    const report = await Location.findById(req.params.id).lean();
    if (!report) return res.status(404).json({ error: "Report not found" });
    const prediction = await MLPrediction.findOne({ report: report._id }).sort({ createdAt: -1 }).lean();
    const bids = await Bid.find({ report: report._id }).sort({ rankingScore: -1 }).lean();
    res.json({ report, prediction, bids });
  });

  app.patch(["/locations/:id/status", "/api/locations/:id/status", "/reports/:id/status", "/api/reports/:id/status"], requireAuth, requireRole("admin"), async (req, res) => {
    const allowed = new Set(["submitted", "verified", "in_review", "tendered", "repaired", "rejected"]);
    if (!allowed.has(req.body.status)) return res.status(400).json({ error: "Invalid status" });
    const report = await Location.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
    if (!report) return res.status(404).json({ error: "Report not found" });
    await audit(req.user._id, "report.status_updated", "Location", report._id, { status: req.body.status });
    res.json(report);
  });

  app.post(["/locations/:id/confirm", "/api/locations/:id/confirm", "/reports/:id/confirm", "/api/reports/:id/confirm"], requireAuth, async (req, res) => {
    const report = await Location.findByIdAndUpdate(
      req.params.id,
      { $inc: { confirmCount: 1, credibilityScore: 5 }, $set: { confirmed: true } },
      { new: true },
    );
    if (!report) return res.status(404).json({ error: "Report not found" });
    await audit(req.user._id, "report.confirmed", "Location", report._id);
    res.json(report);
  });

  app.post(["/reports/:id/open-bidding", "/api/reports/:id/open-bidding"], requireAuth, requireRole("admin"), async (req, res) => {
    const report = await Location.findByIdAndUpdate(req.params.id, { status: "tendered" }, { new: true });
    if (!report) return res.status(404).json({ error: "Report not found" });
    await audit(req.user._id, "bidding.opened", "Location", report._id);
    res.json(report);
  });

  app.post(["/community/posts", "/api/community/posts"], requireAuth, async (req, res) => {
    const body = safeText(req.body.body, 1000);
    if (!body) return res.status(400).json({ error: "Post body is required" });
    const post = await CommunityPost.create({
      author: req.user.name,
      authorUser: req.user._id,
      body,
      locationId: safeText(req.body.locationId, 60) || undefined,
    });
    await audit(req.user._id, "community.post_created", "CommunityPost", post._id);
    res.status(201).json(post);
  });

  app.get(["/community/posts", "/api/community/posts"], requireAuth, async (req, res) => {
    const posts = await CommunityPost.find().sort({ createdAt: -1 }).lean();
    res.json(posts);
  });

  app.post(["/community/posts/:id/like", "/api/community/posts/:id/like"], requireAuth, async (req, res) => {
    const post = await CommunityPost.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true });
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  });

  app.post(["/community/posts/:id/comments", "/api/community/posts/:id/comments"], requireAuth, async (req, res) => {
    const body = safeText(req.body.body, 500);
    if (!body) return res.status(400).json({ error: "Comment body is required" });
    const post = await CommunityPost.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { author: req.user.name, authorUser: req.user._id, body, parentId: safeText(req.body.parentId, 60), createdAt: new Date() } } },
      { new: true, runValidators: true },
    );
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  });

  app.get(["/marketplace/reports", "/api/marketplace/reports"], requireAuth, requireRole("contractor", "admin"), async (req, res) => {
    const reports = await Location.find({ status: "tendered" }).sort({ credibilityScore: -1, createdAt: -1 }).lean();
    res.json(reports);
  });

  app.post(["/bids", "/api/bids"], requireAuth, requireRole("contractor"), async (req, res) => {
    const report = await Location.findById(req.body.reportId);
    if (!report) return res.status(404).json({ error: "Report not found" });
    if (report.status !== "tendered") return res.status(400).json({ error: "Report is not open for bidding" });
    const amount = Number(req.body.amount);
    const timelineDays = Number(req.body.timelineDays);
    const walletAddress = safeText(req.body.walletAddress || req.user.walletAddress, 80).toLowerCase();
    if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(timelineDays) || timelineDays <= 0) {
      return res.status(400).json({ error: "Valid amount and timeline are required" });
    }
    if (!/^0x[a-f0-9]{40}$/.test(walletAddress)) return res.status(400).json({ error: "Valid wallet address is required" });
    const risk = validateBidRisk({ estimatedCost: report.estimatedCost, bidAmount: amount });
    const rankingScore = rankingScoreForBid({ bidAmount: amount, estimatedCost: report.estimatedCost, contractor: req.user, riskScore: risk.riskScore, timelineDays });
    try {
      const bid = await Bid.create({
        report: report._id,
        contractor: req.user._id,
        walletAddress,
        amount,
        timelineDays,
        note: safeText(req.body.note),
        txHash: safeText(req.body.txHash, 120),
        ...risk,
        rankingScore,
      });
      await audit(req.user._id, "bid.submitted", "Bid", bid._id, { report: report._id, risk });
      res.status(201).json(bid);
    } catch (err) {
      if (err.code === 11000) return res.status(409).json({ error: "You already submitted a bid for this report" });
      throw err;
    }
  });

  app.get(["/bids", "/api/bids"], requireAuth, async (req, res) => {
    const filter = req.user.role === "contractor" ? { contractor: req.user._id } : {};
    if (req.query.reportId) filter.report = req.query.reportId;
    const bids = await Bid.find(filter).sort({ rankingScore: -1 }).lean();
    res.json(bids);
  });

  app.post(["/contracts/select-winner", "/api/contracts/select-winner"], requireAuth, requireRole("admin"), async (req, res) => {
    const report = await Location.findById(req.body.reportId);
    if (!report) return res.status(404).json({ error: "Report not found" });
    const bids = await Bid.find({ report: report._id, recommendedAction: { $ne: "reject" } }).sort({ rankingScore: -1 });
    if (!bids.length) return res.status(400).json({ error: "No eligible bids" });
    const winningBid = bids[0];
    await Bid.updateMany({ report: report._id }, { status: "rejected" });
    winningBid.status = "selected";
    await winningBid.save();
    report.status = "in_review";
    await report.save();
    const contract = await RepairContract.create({
      report: report._id,
      bid: winningBid._id,
      contractor: winningBid.contractor,
      amount: winningBid.amount,
      projectKey: `${report.latitude}_${report.longitude}`,
      txHash: safeText(req.body.txHash, 120),
    });
    await audit(req.user._id, "contract.allocated", "RepairContract", contract._id, { winningBid: winningBid._id });
    res.status(201).json({ contract, winningBid });
  });

  app.patch(["/contracts/:id/status", "/api/contracts/:id/status"], requireAuth, async (req, res) => {
    const allowed = new Set(["work_in_progress", "completed", "verified", "payment_released"]);
    if (!allowed.has(req.body.status)) return res.status(400).json({ error: "Invalid contract status" });
    const contract = await RepairContract.findById(req.params.id);
    if (!contract) return res.status(404).json({ error: "Contract not found" });
    const isContractor = String(contract.contractor) === String(req.user._id);
    const adminOnly = ["verified", "payment_released"].includes(req.body.status);
    if (adminOnly && req.user.role !== "admin") return res.status(403).json({ error: "Admin action required" });
    if (!adminOnly && !isContractor && req.user.role !== "admin") return res.status(403).json({ error: "Only contractor or admin can update" });
    contract.status = req.body.status;
    await contract.save();
    await audit(req.user._id, "contract.status_updated", "RepairContract", contract._id, { status: req.body.status });
    res.json(contract);
  });

  app.get(["/contracts", "/api/contracts"], requireAuth, async (req, res) => {
    const filter = req.user.role === "contractor" ? { contractor: req.user._id } : {};
    const contracts = await RepairContract.find(filter).sort({ createdAt: -1 }).lean();
    res.json(contracts);
  });

  app.post(["/dev/seed-test-accounts", "/api/dev/seed-test-accounts"], async (req, res) => {
    if (process.env.NODE_ENV === "production") return res.status(403).json({ error: "Disabled in production" });
    const accounts = [
      { name: "Citizen Tester", email: "citizen@patchit.local", password: "Citizen123!", role: "citizen" },
      { name: "Contractor Tester", email: "contractor@patchit.local", password: "Contractor123!", role: "contractor" },
      { name: "Admin Tester", email: "admin@patchit.local", password: "Admin123!", role: "admin" },
    ];
    for (const account of accounts) {
      await User.findOneAndUpdate(
        { email: account.email },
        { ...account, passwordHash: hashPassword(account.password), reputation: account.role === "contractor" ? 82 : 60 },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
    }
    res.json({ accounts: accounts.map(({ password, ...account }) => ({ ...account, password })) });
  });

  app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      const message = err.code === "LIMIT_FILE_SIZE" ? `File too large. Limit is ${MAX_UPLOAD_SIZE_MB}MB` : err.message;
      return res.status(400).json({ error: message });
    }
    if (err?.message === "Only video or image files are allowed") return res.status(400).json({ error: err.message });
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
  app.listen(DEFAULT_PORT, () => console.log(`Server is running on http://localhost:${DEFAULT_PORT}`));
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
  signJwt,
  verifyJwt,
  parseCoordinate,
  validateBidRisk,
  rankingScoreForBid,
};
