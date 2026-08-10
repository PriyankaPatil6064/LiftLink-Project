import express from "express";
import crypto from "crypto";
import User from "../models/User.js";
import Vendor from "../models/Vendor.js";
import Inquiry from "../models/Inquiry.js";
import Quote from "../models/Quote.js";
import Review from "../models/Review.js";
import jwt from "jsonwebtoken";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { sendEmailSafe, sendWelcomeEmail, sendPasswordResetEmail } from "../utils/emailService.js";

const router = express.Router();

const generateToken = (id, role = "user") =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ─── POST /api/users/signup ───────────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  const { username, fullName, mobile, email, password } = req.body;
  try {
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "User already exists" });
    }
    const newUser = new User({ username, fullName, mobile, email, password });
    await newUser.save();
    await sendEmailSafe(sendWelcomeEmail, email, fullName, "user");
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ─── POST /api/users/login ────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = generateToken(user._id, "user");
    res.json({
      message: "Login successful",
      token,
      user: { _id: user._id, username: user.username, fullName: user.fullName, email: user.email, mobile: user.mobile, avatar: user.avatar },
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// ─── POST /api/users/forgot-password ─────────────────────────────────────────
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No account with that email" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    await sendEmailSafe(sendPasswordResetEmail, user.email, user.fullName, token);
    res.json({ message: "Password reset email sent" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// ─── POST /api/users/reset-password/:token ───────────────────────────────────
router.post("/reset-password/:token", async (req, res) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
  try {
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: "Token is invalid or has expired" });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful. Please login." });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// ─── GET /api/users/profile ───────────────────────────────────────────────────
router.get("/profile", protect, authorize("user"), async (req, res) => {
  res.json(req.user);
});

// ─── PUT /api/users/profile ───────────────────────────────────────────────────
router.put("/profile", protect, authorize("user"), async (req, res) => {
  const { fullName, username, mobile, avatar } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (fullName) user.fullName = fullName;
    if (username) user.username = username;
    if (mobile) user.mobile = mobile;
    if (avatar) user.avatar = avatar;
    await user.save();
    res.json({ message: "Profile updated", user: { _id: user._id, fullName: user.fullName, username: user.username, email: user.email, mobile: user.mobile } });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// ─── PUT /api/users/change-password ──────────────────────────────────────────
router.put("/change-password", protect, authorize("user"), async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// ─── POST /api/users/save-vendor/:vendorId ────────────────────────────────────
router.post("/save-vendor/:vendorId", protect, authorize("user"), async (req, res) => {
  const user = await User.findById(req.user._id);
  const { vendorId } = req.params;

  const isSaved = user.savedVendors.includes(vendorId);
  if (isSaved) {
    user.savedVendors = user.savedVendors.filter((id) => id.toString() !== vendorId);
    await Vendor.findByIdAndUpdate(vendorId, { $pull: { savedBy: req.user._id } });
  } else {
    user.savedVendors.push(vendorId);
    await Vendor.findByIdAndUpdate(vendorId, { $addToSet: { savedBy: req.user._id } });
  }
  await user.save();
  res.json({ saved: !isSaved, savedCount: user.savedVendors.length });
});

// ─── GET /api/users/saved-vendors ────────────────────────────────────────────
router.get("/saved-vendors", protect, authorize("user"), async (req, res) => {
  const user = await User.findById(req.user._id).populate("savedVendors", "companyName logo location averageRating totalReviews description liftCategories");
  res.json(user.savedVendors);
});

// ─── POST /api/users/track-view/:vendorId ────────────────────────────────────
// Track recently viewed + increment vendor profileViews
router.post("/track-view/:vendorId", protect, authorize("user"), async (req, res) => {
  const user = await User.findById(req.user._id);
  const { vendorId } = req.params;

  // Add to recently viewed (max 10, no duplicates)
  user.recentlyViewed = [
    vendorId,
    ...user.recentlyViewed.filter((id) => id.toString() !== vendorId),
  ].slice(0, 10);

  await user.save();
  await Vendor.findByIdAndUpdate(vendorId, { $inc: { profileViews: 1 } });
  res.json({ message: "Tracked" });
});

// ─── GET /api/users/recently-viewed ──────────────────────────────────────────
router.get("/recently-viewed", protect, authorize("user"), async (req, res) => {
  const user = await User.findById(req.user._id).populate("recentlyViewed", "companyName logo location averageRating totalReviews liftCategories");
  res.json(user.recentlyViewed);
});

// ─── GET /api/users/dashboard ─────────────────────────────────────────────────
router.get("/dashboard", protect, authorize("user"), async (req, res) => {
  const userId = req.user._id;
  const [inquiries, quotes, reviews, savedVendors] = await Promise.all([
    Inquiry.find({ userEmail: req.user.email }).sort({ date: -1 }).limit(5),
    Quote.find({ userId }).populate("vendorId", "companyName logo").sort({ createdAt: -1 }).limit(5),
    Review.find({ userId }).populate("vendorId", "companyName").sort({ createdAt: -1 }).limit(5),
    User.findById(userId).populate("savedVendors", "companyName logo location averageRating").select("savedVendors"),
  ]);

  res.json({
    stats: {
      totalInquiries: await Inquiry.countDocuments({ userEmail: req.user.email }),
      totalQuotes: await Quote.countDocuments({ userId }),
      totalReviews: await Review.countDocuments({ userId }),
      savedVendors: savedVendors.savedVendors?.length || 0,
    },
    recentInquiries: inquiries,
    recentQuotes: quotes,
    recentReviews: reviews,
    savedVendors: savedVendors.savedVendors || [],
  });
});

export default router;