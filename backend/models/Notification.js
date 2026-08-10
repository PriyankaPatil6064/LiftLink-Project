import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, required: true },  // User, Vendor, or Admin _id
  recipientRole: { type: String, enum: ["user", "vendor", "admin"], required: true },

  type: {
    type: String,
    enum: [
      "new_inquiry", "new_quote", "quote_update", "new_review",
      "review_reply", "vendor_approved", "vendor_rejected",
      "account_update", "welcome", "admin_alert"
    ],
    required: true,
  },

  title: { type: String, required: true },
  message: { type: String, required: true },
  link: String,          // Frontend route to navigate on click
  isRead: { type: Boolean, default: false },

  // Reference to related document
  refId: mongoose.Schema.Types.ObjectId,
  refModel: String,      // "Inquiry", "Quote", "Review", "Vendor"
}, { timestamps: true });

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
