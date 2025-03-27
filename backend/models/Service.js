import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  serviceName: { type: String, required: true },
  description: { type: String },
  category: { type: String },
});

const Service = mongoose.model("Service", ServiceSchema);

export { ServiceSchema };  // ✅ Export ServiceSchema
export default Service;