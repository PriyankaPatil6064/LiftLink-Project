import mongoose from "mongoose";
import { ServiceSchema } from "./Service.js";const projectSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  image: String,
  description: String,
});

const vendorSchema = new mongoose.Schema({
  fullname: String,
  companyName: { type: String, required: true, unique: true }, 
  companyType: String,
  location: String,
  contact: String,
  description: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  companyRegistrationNumber: String,
  services: [ServiceSchema],
  logo: String,
  projects: [projectSchema],
});

const Vendor = mongoose.model("Vendor", vendorSchema, 'vendors');
export default Vendor;
