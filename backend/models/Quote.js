import mongoose from "mongoose";

const quoteSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  userPhone: String,

  // Quote details
  liftType: { type: String, required: true },     // Passenger, Freight, Hydraulic, etc.
  buildingType: String,                            // Residential, Commercial, Industrial
  floors: Number,
  installationType: String,                        // New Installation, Renovation, AMC
  description: { type: String, required: true },
  budget: String,                                  // Budget range
  timeline: String,

  // Status workflow
  status: {
    type: String,
    enum: ["pending", "viewed", "accepted", "rejected", "info_requested", "contacted", "completed", "cancelled"],
    default: "pending",
  },

  // Vendor response
  vendorResponse: String,
  vendorNote: String,
  quotedAmount: String,

  // Timestamps for tracking
  viewedAt: Date,
  respondedAt: Date,
  completedAt: Date,
}, { timestamps: true });

quoteSchema.index({ vendorId: 1, status: 1, createdAt: -1 });
quoteSchema.index({ userId: 1, createdAt: -1 });

const Quote = mongoose.model("Quote", quoteSchema);
export default Quote;
