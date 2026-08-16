import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ServiceSchema } from "./Service.js";

const projectSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  title: String,
  description: String,
  image: String,                // Legacy single image (backward compat)
  images: [String],             // Multiple images
  year: Number,
  location: String,
  projectType: String,          // Commercial, Residential, Industrial, etc.
  elevatorType: String,         // Passenger, Freight, Hospital, etc.
  videoUrl: String,             // YouTube / external video URL
});

const businessHoursSchema = new mongoose.Schema({
  day: String,
  open: String,
  close: String,
  closed: { type: Boolean, default: false },
}, { _id: false });

const socialLinksSchema = new mongoose.Schema({
  website: String,
  linkedin: String,
  instagram: String,
  facebook: String,
  googleMaps: String,
}, { _id: false });

const certificationSchema = new mongoose.Schema({
  name: String,
  issuedBy: String,
  year: Number,
}, { _id: false });

const vendorSchema = new mongoose.Schema({
  // Core fields
  fullname: String,
  companyName: { type: String, required: true, unique: true },
  companyType: String,
  location: String,
  contact: String,
  mobile: String,
  description: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  companyRegistrationNumber: String,

  // Extended profile (Phase 1)
  coverBanner: String,
  logo: String,
  tagline: String,
  experience: { type: Number, default: 0 },       // years in business
  teamSize: { type: String, default: "" },         // e.g. "10-50"
  serviceCities: [String],
  serviceAreas: [String],
  liftCategories: [String],                        // Passenger, Freight, Hydraulic, etc.
  certifications: [certificationSchema],
  businessHours: [businessHoursSchema],
  socialLinks: socialLinksSchema,

  // Services & Projects
  services: [ServiceSchema],
  projects: [projectSchema],

  // Status & verification
  isVerified: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },   // Admin approval
  isActive: { type: Boolean, default: true },

  // Analytics (lightweight — no separate collection needed)
  profileViews: { type: Number, default: 0 },
  savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  // Rating summary (denormalized for performance)
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  totalInquiries: { type: Number, default: 0 },
  totalQuotes: { type: Number, default: 0 },
}, { timestamps: true });

// C-10: Hash password before saving (only if modified)
vendorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

vendorSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Computed: profile completion percentage
vendorSchema.methods.getProfileCompletion = function () {
  const fields = [
    this.fullname, this.companyName, this.description, this.location,
    this.contact, this.logo, this.coverBanner, this.tagline,
    this.experience, this.teamSize,
    this.serviceCities?.length > 0,
    this.liftCategories?.length > 0,
    this.services?.length > 0,
    this.projects?.length > 0,
    this.socialLinks?.website,
    this.certifications?.length > 0,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
};

// Performance: Text search index
vendorSchema.index({ companyName: "text", description: "text", location: "text", serviceCities: "text" });
vendorSchema.index({ isApproved: 1, isActive: 1, averageRating: -1 });
vendorSchema.index({ location: 1 });
vendorSchema.index({ liftCategories: 1 });

const Vendor = mongoose.model("Vendor", vendorSchema, "vendors");
export default Vendor;
