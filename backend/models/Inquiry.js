import mongoose from "mongoose";

const InquirySchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  userName: { type: String, required: true, trim: true },
  userEmail: { type: String, required: true, lowercase: true, trim: true },
  message: { type: String, required: true, maxlength: 2000 },
  date: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
});

// Compound index for common query pattern (vendor fetching their inquiries sorted by date)
InquirySchema.index({ vendorId: 1, date: -1 });
InquirySchema.index({ userEmail: 1, date: -1 });

const Inquiry = mongoose.model("Inquiry", InquirySchema);
export default Inquiry;