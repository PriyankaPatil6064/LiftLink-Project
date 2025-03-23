import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  image: String,
  description: String,
});

const vendorSchema = new mongoose.Schema({
  fullname: String,
  companyName: String,
  companyType: String,
  location: String,
  contact: String,
  description: String,
  email: String,
  companyRegistrationNumber: String,
  services: [String],
  logo: String,
  projects: [projectSchema],
});

const Vendor = mongoose.model("Vendor", vendorSchema);
export default Vendor;
