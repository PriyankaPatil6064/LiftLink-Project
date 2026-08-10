import express from "express";
import mongoose from "mongoose";
import Quote from "../models/Quote.js";
import Vendor from "../models/Vendor.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { createNotification } from "../utils/notificationHelper.js";
import { sendEmailSafe, sendQuoteNotification, sendQuoteStatusUpdate } from "../utils/emailService.js";

const router = express.Router();

// ─── POST /api/quotes ────────────────────────────────────────────────────────
// User requests a quote from a vendor
router.post("/", protect, authorize("user"), async (req, res) => {
  const { vendorId, liftType, buildingType, floors, installationType, description, budget, timeline, userPhone } = req.body;

  if (!vendorId || !liftType || !description) {
    return res.status(400).json({ message: "vendorId, liftType, and description are required" });
  }

  const vendor = await Vendor.findById(vendorId);
  if (!vendor) return res.status(404).json({ message: "Vendor not found" });

  const quote = await Quote.create({
    vendorId,
    userId: req.user._id,
    userName: req.user.fullName || req.user.username,
    userEmail: req.user.email,
    userPhone,
    liftType,
    buildingType,
    floors,
    installationType,
    description,
    budget,
    timeline,
  });

  // Update vendor stats
  await Vendor.findByIdAndUpdate(vendorId, { $inc: { totalQuotes: 1 } });

  // Notify vendor
  await createNotification({
    recipientId: vendor._id,
    recipientRole: "vendor",
    type: "new_quote",
    title: "New Quote Request",
    message: `${req.user.fullName || req.user.username} has requested a quote for ${liftType}.`,
    link: "/vendorDashboard/quotes",
    refId: quote._id,
    refModel: "Quote",
  });

  // Email vendor
  await sendEmailSafe(sendQuoteNotification, {
    vendorEmail: vendor.email,
    vendorName: vendor.fullname,
    companyName: vendor.companyName,
    userName: req.user.fullName || req.user.username,
    liftType,
    description,
  });

  res.status(201).json({ message: "Quote request sent successfully", quote });
});

// ─── GET /api/quotes/user ─────────────────────────────────────────────────────
// User views their own quote history
router.get("/user", protect, authorize("user"), async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const quotes = await Quote.find({ userId: req.user._id })
    .populate("vendorId", "companyName logo location")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Quote.countDocuments({ userId: req.user._id });
  res.json({ quotes, total, page, pages: Math.ceil(total / limit) });
});

// ─── GET /api/quotes/vendor ───────────────────────────────────────────────────
// Vendor views incoming quote requests
router.get("/vendor", protect, authorize("vendor"), async (req, res) => {
  const { status, page = 1 } = req.query;
  const limit = 15;
  const skip = (page - 1) * limit;

  const filter = { vendorId: req.vendor._id };
  if (status) filter.status = status;

  const quotes = await Quote.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Quote.countDocuments(filter);

  // Status summary
  const summary = await Quote.aggregate([
    { $match: { vendorId: req.vendor._id } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  res.json({ quotes, total, page: parseInt(page), pages: Math.ceil(total / limit), summary });
});

// ─── PATCH /api/quotes/:id/status ─────────────────────────────────────────────
// Vendor updates quote status
router.patch("/:id/status", protect, authorize("vendor"), async (req, res) => {
  const { status, vendorResponse, vendorNote, quotedAmount } = req.body;

  const validStatuses = ["viewed", "accepted", "rejected", "info_requested", "contacted", "completed"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const quote = await Quote.findById(req.params.id).populate("userId", "email fullName username");
  if (!quote) return res.status(404).json({ message: "Quote not found" });

  if (quote.vendorId.toString() !== req.vendor._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  quote.status = status;
  if (vendorResponse) quote.vendorResponse = vendorResponse;
  if (vendorNote) quote.vendorNote = vendorNote;
  if (quotedAmount) quote.quotedAmount = quotedAmount;
  quote.respondedAt = new Date();
  if (status === "completed") quote.completedAt = new Date();

  await quote.save();

  // Notify user
  await createNotification({
    recipientId: quote.userId._id,
    recipientRole: "user",
    type: "quote_update",
    title: "Your Quote Has Been Updated",
    message: `${req.vendor.companyName} has ${status.replace(/_/g, " ")} your quote request.`,
    link: "/userDashboard/quotes",
    refId: quote._id,
    refModel: "Quote",
  });

  // Email user
  await sendEmailSafe(sendQuoteStatusUpdate, {
    userEmail: quote.userId.email,
    userName: quote.userId.fullName || quote.userId.username,
    companyName: req.vendor.companyName,
    status,
    vendorResponse,
  });

  res.json({ message: "Quote status updated", quote });
});

// ─── PATCH /api/quotes/:id/cancel ────────────────────────────────────────────
// User cancels their own quote request
router.patch("/:id/cancel", protect, authorize("user"), async (req, res) => {
  const quote = await Quote.findById(req.params.id);
  if (!quote) return res.status(404).json({ message: "Quote not found" });

  if (quote.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  if (["completed", "cancelled"].includes(quote.status)) {
    return res.status(400).json({ message: `Cannot cancel a ${quote.status} quote` });
  }

  quote.status = "cancelled";
  await quote.save();

  res.json({ message: "Quote cancelled", quote });
});

export default router;
