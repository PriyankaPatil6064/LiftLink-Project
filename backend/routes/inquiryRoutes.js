import express from "express";
import mongoose from "mongoose";
import Inquiry from "../models/Inquiry.js";
import Vendor from "../models/Vendor.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { createNotification } from "../utils/notificationHelper.js";
import { sendEmailSafe, sendInquiryNotification } from "../utils/emailService.js";

const router = express.Router();

// ─── POST /api/inquiries/send ─────────────────────────────────────────────────
// Authenticated user sends an inquiry to a vendor
router.post("/send", protect, authorize("user"), async (req, res) => {
  try {
    const { vendorId, userName, userEmail, message } = req.body;

    if (!vendorId || !userName || !userEmail || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return res.status(400).json({ error: "Invalid vendor ID" });
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ error: "Vendor not found" });

    const newInquiry = new Inquiry({ vendorId, userName, userEmail, message });
    await newInquiry.save();

    // Increment vendor inquiry count
    await Vendor.findByIdAndUpdate(vendorId, { $inc: { totalInquiries: 1 } });

    // Notify vendor (non-blocking)
    await createNotification({
      recipientId: vendor._id,
      recipientRole: "vendor",
      type: "new_inquiry",
      title: "New Inquiry",
      message: `${userName} sent you an inquiry.`,
      link: "/vendorDashboard/inquiries",
      refId: newInquiry._id,
      refModel: "Inquiry",
    });

    // Email vendor (non-blocking)
    await sendEmailSafe(sendInquiryNotification, {
      vendorEmail: vendor.email,
      vendorName: vendor.fullname || vendor.companyName,
      companyName: vendor.companyName,
      userName,
      userEmail,
      message,
    });

    res.json({ success: true, message: "Inquiry sent successfully", newInquiry });
  } catch (err) {
    res.status(500).json({ error: "Server Error", details: err.message });
  }
});

// ─── GET /api/inquiries/:vendorId ─────────────────────────────────────────────
// Vendor fetches their own inquiries (paginated)
router.get("/:vendorId", protect, authorize("vendor"), async (req, res) => {
  try {
    const { vendorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return res.status(400).json({ error: "Invalid vendor ID" });
    }

    // Vendors can only view their own inquiries
    if (req.vendor._id.toString() !== vendorId) {
      return res.status(403).json({ message: "Not authorized to view these inquiries" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const [inquiries, total] = await Promise.all([
      Inquiry.find({ vendorId }).sort({ date: -1 }).skip(skip).limit(limit),
      Inquiry.countDocuments({ vendorId }),
    ]);

    res.json(inquiries); // Keep as array for backward compat with ManageInquiries
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

// ─── DELETE /api/inquiries/:id ────────────────────────────────────────────────
// Vendor deletes a specific inquiry
router.delete("/:id", protect, authorize("vendor"), async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });

    // Ensure this inquiry belongs to the requesting vendor
    if (inquiry.vendorId.toString() !== req.vendor._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this inquiry" });
    }

    await inquiry.deleteOne();
    res.json({ success: true, message: "Inquiry deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

export default router;
