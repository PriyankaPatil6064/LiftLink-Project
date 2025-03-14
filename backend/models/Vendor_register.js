// models/Vendor_register.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const vendorRegisterSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    businessname: { type: String, required: true, unique: true },
    businesstype: { type: String, required: true },
    compregno: { type: String, required: true },
  },
  { timestamps: true }
);

// Hash password before saving
vendorRegisterSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const Vendor_register = mongoose.model("Vendor_register", vendorRegisterSchema);
export default Vendor_register;