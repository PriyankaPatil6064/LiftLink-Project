import mongoose from "mongoose";

const InquirySchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const Inquiry = mongoose.model("Inquiry", InquirySchema);

export default Inquiry;