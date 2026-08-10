import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: String,
  comment: { type: String, required: true },

  // Vendor reply
  vendorReply: {
    text: String,
    repliedAt: Date,
  },

  // Engagement
  helpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  reportedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isApproved: { type: Boolean, default: true },
  isHidden: { type: Boolean, default: false },
}, { timestamps: true });

// One review per user per vendor
reviewSchema.index({ vendorId: 1, userId: 1 }, { unique: true });
reviewSchema.index({ vendorId: 1, createdAt: -1 });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
