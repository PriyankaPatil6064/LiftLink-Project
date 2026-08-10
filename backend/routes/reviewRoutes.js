import express from "express";
import mongoose from "mongoose";
import Review from "../models/Review.js";
import Vendor from "../models/Vendor.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { createNotification } from "../utils/notificationHelper.js";

const router = express.Router();

// ─── POST /api/reviews ────────────────────────────────────────────────────────
// User submits a review for a vendor
router.post("/", protect, authorize("user"), async (req, res) => {
  const { vendorId, rating, title, comment } = req.body;

  if (!vendorId || !rating || !comment) {
    return res.status(400).json({ message: "vendorId, rating, and comment are required" });
  }

  if (!mongoose.Types.ObjectId.isValid(vendorId)) {
    return res.status(400).json({ message: "Invalid vendor ID" });
  }

  const vendor = await Vendor.findById(vendorId);
  if (!vendor) return res.status(404).json({ message: "Vendor not found" });

  // Check if user already reviewed this vendor
  const existing = await Review.findOne({ vendorId, userId: req.user._id });
  if (existing) return res.status(400).json({ message: "You have already reviewed this vendor" });

  const review = await Review.create({
    vendorId,
    userId: req.user._id,
    userName: req.user.fullName || req.user.username,
    rating,
    title,
    comment,
  });

  // Update vendor's denormalized rating
  const reviews = await Review.find({ vendorId, isHidden: false });
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  await Vendor.findByIdAndUpdate(vendorId, {
    averageRating: Math.round(avg * 10) / 10,
    totalReviews: reviews.length,
  });

  // Notify vendor
  await createNotification({
    recipientId: vendor._id,
    recipientRole: "vendor",
    type: "new_review",
    title: "New Review Received",
    message: `${req.user.fullName || req.user.username} left a ${rating}-star review.`,
    link: `/vendorDashboard/reviews`,
    refId: review._id,
    refModel: "Review",
  });

  res.status(201).json({ message: "Review submitted successfully", review });
});

// ─── GET /api/reviews/:vendorId ───────────────────────────────────────────────
// Public: get all reviews for a vendor with pagination
router.get("/:vendorId", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.vendorId)) {
    return res.status(400).json({ message: "Invalid vendor ID" });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(50, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({ vendorId: req.params.vendorId, isHidden: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ vendorId: req.params.vendorId, isHidden: false }),
  ]);

  // Compute distribution from DB aggregation (single query, no N+1)
  const distAgg = await Review.aggregate([
    { $match: { vendorId: new mongoose.Types.ObjectId(req.params.vendorId), isHidden: false } },
    { $group: { _id: "$rating", count: { $sum: 1 } } },
  ]);
  const distMap = Object.fromEntries(distAgg.map((d) => [d._id, d.count]));
  const distribution = [5, 4, 3, 2, 1].map((star) => ({ star, count: distMap[star] || 0 }));

  res.json({ reviews, total, page, pages: Math.ceil(total / limit), distribution });
});

// ─── PATCH /api/reviews/:id/helpful ──────────────────────────────────────────
// Toggle helpful vote
router.patch("/:id/helpful", protect, async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: "Review not found" });

  const userId = req.user?._id || req.vendor?._id;
  const alreadyVoted = review.helpfulVotes.includes(userId);

  if (alreadyVoted) {
    review.helpfulVotes = review.helpfulVotes.filter((id) => id.toString() !== userId.toString());
  } else {
    review.helpfulVotes.push(userId);
  }

  await review.save();
  res.json({ helpful: review.helpfulVotes.length, voted: !alreadyVoted });
});

// ─── POST /api/reviews/:id/reply ─────────────────────────────────────────────
// Vendor replies to a review
router.post("/:id/reply", protect, authorize("vendor"), async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: "Review not found" });

  if (review.vendorId.toString() !== req.vendor._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  review.vendorReply = { text: req.body.text, repliedAt: new Date() };
  await review.save();

  res.json({ message: "Reply added", review });
});

// ─── PATCH /api/reviews/:id/report ───────────────────────────────────────────
// Report a review
router.patch("/:id/report", protect, async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: "Review not found" });

  const userId = req.user?._id || req.vendor?._id;
  if (!review.reportedBy.includes(userId)) {
    review.reportedBy.push(userId);
    await review.save();
  }

  res.json({ message: "Review reported" });
});

// ─── DELETE /api/reviews/:id ──────────────────────────────────────────────────
// User deletes their own review, or admin deletes any
router.delete("/:id", protect, async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: "Review not found" });

  const isOwner = req.user && review.userId.toString() === req.user._id.toString();
  const isAdmin = req.userRole === "admin";

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: "Not authorized to delete this review" });
  }

  await review.deleteOne();

  // Update vendor's denormalized rating
  const reviews = await Review.find({ vendorId: review.vendorId, isHidden: false });
  const avg = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  await Vendor.findByIdAndUpdate(review.vendorId, {
    averageRating: Math.round(avg * 10) / 10,
    totalReviews: reviews.length,
  });

  res.json({ message: "Review deleted" });
});

export default router;
