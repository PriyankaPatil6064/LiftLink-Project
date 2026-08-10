import express from "express";
import jwt from "jsonwebtoken";
import Vendor from "../models/Vendor.js";
import { sendEmailSafe, sendWelcomeEmail } from "../utils/emailService.js";

const router = express.Router();

// Generate JWT token for vendor
const generateToken = (id, role = "vendor") => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// POST /api/vendor/auth/register
router.post("/register", async (req, res) => {
  const {
    fullname, mobile, email, password,
    companyName, companyType,
    compregno,
  } = req.body;

  try {
    if (!companyName) {
      return res.status(400).json({ message: "companyName is required" });
    }
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const exists = await Vendor.findOne({ $or: [{ email }, { companyName }] });
    if (exists) {
      if (exists.email === email) return res.status(400).json({ message: "A vendor with this email already exists" });
      return res.status(400).json({ message: "A vendor with this company name already exists" });
    }

    const newVendor = new Vendor({
      fullname,
      mobile,
      email,
      password,   // plain — model pre-save hook hashes it
      companyName,
      companyType,
      companyRegistrationNumber: compregno || "",
    });

    await newVendor.save();

    // Non-blocking welcome email
    await sendEmailSafe(sendWelcomeEmail, email, fullname || companyName, "vendor");

    res.status(201).json({ message: "Vendor registered successfully. Your account is pending admin approval." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /api/vendor/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const vendor = await Vendor.findOne({ email });
    if (!vendor) return res.status(400).json({ message: "Vendor not found" });

    const isMatch = await vendor.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(vendor._id, "vendor");
    res.status(200).json({
      message: "Login successful",
      token,
      vendor: {
        _id: vendor._id,
        fullname: vendor.fullname,
        email: vendor.email,
        companyName: vendor.companyName,
        companyType: vendor.companyType,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
