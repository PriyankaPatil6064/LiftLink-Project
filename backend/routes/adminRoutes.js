import express from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Vendor from "../models/Vendor.js";
import User from "../models/User.js";
import Review from "../models/Review.js";
import Inquiry from "../models/Inquiry.js";
import Quote from "../models/Quote.js";
import { sendEmailSafe, sendVendorApprovalEmail } from "../utils/emailService.js";
import { createNotification } from "../utils/notificationHelper.js";

const router = express.Router();

// ─── Admin Auth Middleware ────────────────────────────────────────────────────
const adminProtect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== "admin") return res.status(403).json({ message: "Admin access only" });
      req.admin = await Admin.findById(decoded.id).select("-password");
      if (!req.admin) return res.status(401).json({ message: "Admin not found" });
      req.userRole = "admin";
      next();
    } catch {
      return res.status(401).json({ message: "Invalid admin token" });
    }
  } else {
    return res.status(401).json({ message: "No token" });
  }
};

// ─── POST /api/admin/login ────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email, isActive: true });
  if (!admin || !(await admin.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid admin credentials" });
  }
  admin.lastLogin = new Date();
  await admin.save();

  const token = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.json({ token, admin: { _id: admin._id, name: admin.name, email: admin.email, role: admin.role } });
});

// ─── POST /api/admin/seed ─────────────────────────────────────────────────────
// One-time: Create first admin (only if none exists)
router.post("/seed", async (req, res) => {
  const count = await Admin.countDocuments();
  if (count > 0) return res.status(400).json({ message: "Admin already exists" });
  const { name, email, password } = req.body;
  const admin = await Admin.create({ name, email, password, role: "superadmin" });
  res.status(201).json({ message: "Admin created", email: admin.email });
});

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────
router.get("/stats", adminProtect, async (req, res) => {
  const [totalVendors, pendingVendors, approvedVendors, totalUsers, totalReviews, totalInquiries, totalQuotes] = await Promise.all([
    Vendor.countDocuments(),
    Vendor.countDocuments({ isApproved: false }),
    Vendor.countDocuments({ isApproved: true }),
    User.countDocuments(),
    Review.countDocuments(),
    Inquiry.countDocuments(),
    Quote.countDocuments(),
  ]);

  // Monthly registration trend (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const vendorTrend = await Vendor.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const quoteTrend = await Quote.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  res.json({
    totalVendors, pendingVendors, approvedVendors, totalUsers,
    totalReviews, totalInquiries, totalQuotes,
    vendorTrend, quoteTrend,
  });
});

// ─── GET /api/admin/vendors ───────────────────────────────────────────────────
router.get("/vendors", adminProtect, async (req, res) => {
  const { search, approved, page = 1 } = req.query;
  const limit = 15;
  const skip = (page - 1) * limit;
  const filter = {};
  if (search) filter.$text = { $search: search };
  if (approved !== undefined) filter.isApproved = approved === "true";

  const vendors = await Vendor.find(filter)
    .select("-password")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const total = await Vendor.countDocuments(filter);
  res.json({ vendors, total, page: parseInt(page), pages: Math.ceil(total / limit) });
});

// ─── PATCH /api/admin/vendors/:id/approve ────────────────────────────────────
router.patch("/vendors/:id/approve", adminProtect, async (req, res) => {
  const { approved } = req.body;
  const vendor = await Vendor.findByIdAndUpdate(
    req.params.id,
    { isApproved: approved, isVerified: approved },
    { new: true }
  ).select("-password");

  if (!vendor) return res.status(404).json({ message: "Vendor not found" });

  await sendEmailSafe(sendVendorApprovalEmail, vendor.email, vendor.companyName, approved);

  await createNotification({
    recipientId: vendor._id,
    recipientRole: "vendor",
    type: approved ? "vendor_approved" : "vendor_rejected",
    title: approved ? "Your Company is Now Verified! 🎉" : "Verification Update",
    message: approved
      ? "Your company has been approved and is now live on LiftLink."
      : "Your verification requires additional review. Please contact support.",
    link: "/vendorDashboard",
  });

  res.json({ message: `Vendor ${approved ? "approved" : "rejected"}`, vendor });
});

// ─── DELETE /api/admin/vendors/:id ───────────────────────────────────────────
router.delete("/vendors/:id", adminProtect, async (req, res) => {
  await Vendor.findByIdAndDelete(req.params.id);
  res.json({ message: "Vendor deleted" });
});

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
router.get("/users", adminProtect, async (req, res) => {
  const { search, page = 1 } = req.query;
  const limit = 15;
  const skip = (page - 1) * limit;
  const filter = search
    ? { $or: [{ email: { $regex: search, $options: "i" } }, { fullName: { $regex: search, $options: "i" } }] }
    : {};

  const users = await User.find(filter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit);
  const total = await User.countDocuments(filter);
  res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
});

// ─── DELETE /api/admin/users/:id ─────────────────────────────────────────────
router.delete("/users/:id", adminProtect, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});

// ─── GET /api/admin/reviews ───────────────────────────────────────────────────
router.get("/reviews", adminProtect, async (req, res) => {
  const { reported, page = 1 } = req.query;
  const limit = 15;
  const skip = (page - 1) * limit;
  const filter = reported === "true" ? { "reportedBy.0": { $exists: true } } : {};

  const reviews = await Review.find(filter)
    .populate("vendorId", "companyName")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Review.countDocuments(filter);
  res.json({ reviews, total, page: parseInt(page), pages: Math.ceil(total / limit) });
});

// ─── PATCH /api/admin/reviews/:id/hide ───────────────────────────────────────
router.patch("/reviews/:id/hide", adminProtect, async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, { isHidden: req.body.hidden }, { new: true });
  if (!review) return res.status(404).json({ message: "Review not found" });
  res.json({ message: "Review updated", review });
});

// ─── DELETE /api/admin/reviews/:id ───────────────────────────────────────────
router.delete("/reviews/:id", adminProtect, async (req, res) => {
  await Review.findByIdAndDelete(req.params.id);
  res.json({ message: "Review deleted" });
});

// ─── GET /api/admin/inquiries ─────────────────────────────────────────────────
router.get("/inquiries", adminProtect, async (req, res) => {
  const { page = 1 } = req.query;
  const limit = 15;
  const skip = (page - 1) * limit;

  const inquiries = await Inquiry.find()
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Inquiry.countDocuments();
  res.json({ inquiries, total, page: parseInt(page), pages: Math.ceil(total / limit) });
});

// ─── GET /api/admin/quotes ────────────────────────────────────────────────────
router.get("/quotes", adminProtect, async (req, res) => {
  const { status, page = 1 } = req.query;
  const limit = 15;
  const skip = (page - 1) * limit;
  const filter = status ? { status } : {};

  const quotes = await Quote.find(filter)
    .populate("vendorId", "companyName")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Quote.countDocuments(filter);
  res.json({ quotes, total, page: parseInt(page), pages: Math.ceil(total / limit) });
});

export default router;
