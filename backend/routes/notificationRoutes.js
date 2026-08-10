import express from "express";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ─── GET /api/notifications ───────────────────────────────────────────────────
// Get notifications for the authenticated user/vendor
router.get("/", protect, async (req, res) => {
  const recipientId = req.user?._id || req.vendor?._id;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = 20;
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ recipientId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments({ recipientId }),
    Notification.countDocuments({ recipientId, isRead: false }),
  ]);

  res.json({ notifications, total, unreadCount, page, pages: Math.ceil(total / limit) });
});

// ─── PATCH /api/notifications/mark-all-read ──────────────────────────────────
// IMPORTANT: This MUST come before /:id/read to prevent Express matching
// "mark-all-read" as an :id parameter
router.patch("/mark-all-read", protect, async (req, res) => {
  const recipientId = req.user?._id || req.vendor?._id;
  const result = await Notification.updateMany({ recipientId, isRead: false }, { isRead: true });
  res.json({ message: "All notifications marked as read", modified: result.modifiedCount });
});

// ─── PATCH /api/notifications/:id/read ───────────────────────────────────────
// Mark a single notification as read
router.patch("/:id/read", protect, async (req, res) => {
  const recipientId = req.user?._id || req.vendor?._id;
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipientId },
    { isRead: true },
    { new: true }
  );
  if (!notification) return res.status(404).json({ message: "Notification not found" });
  res.json({ notification });
});

// ─── DELETE /api/notifications/:id ───────────────────────────────────────────
// Delete a single notification (only owner)
router.delete("/:id", protect, async (req, res) => {
  const recipientId = req.user?._id || req.vendor?._id;
  const notification = await Notification.findOneAndDelete({ _id: req.params.id, recipientId });
  if (!notification) return res.status(404).json({ message: "Notification not found" });
  res.json({ message: "Notification deleted" });
});

// ─── DELETE /api/notifications ────────────────────────────────────────────────
// Clear all notifications for the current user/vendor
router.delete("/", protect, async (req, res) => {
  const recipientId = req.user?._id || req.vendor?._id;
  const result = await Notification.deleteMany({ recipientId });
  res.json({ message: "All notifications cleared", deleted: result.deletedCount });
});

export default router;
