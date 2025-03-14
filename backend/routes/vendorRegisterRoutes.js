import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Vendor_register from "../models/Vendor_register.js";

const router = express.Router();

// Vendor Register Route
router.post("/vendor_register", async (req, res) => {
  const { fullname, mobile, email, password, businessname, businesstype, compregno } = req.body;

  try {
    let userExists = await Vendor_register.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const newUser = new Vendor_register({
      fullname,
      mobile,
      email,
      password,
      businessname,
      businesstype,
      compregno,
    });

    await newUser.save();
    res.status(201).json({ message: "Vendor registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Vendor Login Route
router.post("/loginvendor", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Vendor_register.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    res.json({ message: "Login successful", user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});
export default router;