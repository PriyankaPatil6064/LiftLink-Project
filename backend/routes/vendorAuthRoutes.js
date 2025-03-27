import express from 'express';
import bcrypt from 'bcryptjs';
import Vendor from '../models/Vendor.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  console.log("Incoming Request Body:", req.body);  // ✅ Debugging step
  const { 
    fullname, mobile, email, password, companyName, companyType, compregno } = req.body;
  
  try {
    if (!companyName) {
      console.log("❌ Error: companyName is missing in request body");
      return res.status(400).json({ message: "companyName is required" });
    }
    const exists = await Vendor.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Vendor already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newVendor = new Vendor({
      fullname,
      mobile,
      email,
      password: hashedPassword,
      companyName, // ✅ Ensure correct mapping
      companyType,
      compregno,
    });

    console.log("Saving Vendor:", newVendor);

    await newVendor.save();
    res.status(201).json({ message: 'Vendor registered successfully' });
  } catch (err) {
    console.error("Registration Error: ", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const vendor = await Vendor.findOne({ email });
    if (!vendor) return res.status(400).json({ message: 'Vendor not found' });

    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    res.status(200).json({
      message: 'Login successful',
      vendor: {
        _id: vendor._id,
        fullname: vendor.fullname,
        email: vendor.email,
        companyName: vendor.companyName, 
        companyType: vendor.companyType, 
      },
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
