import express from 'express';
import bcrypt from 'bcryptjs';
import Vendor from '../models/Vendor.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { fullname, mobile, email, password, businessname, businesstype, compregno } = req.body;
  try {
    const exists = await Vendor.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Vendor already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newVendor = new Vendor({
      fullname,
      mobile,
      email,
      password: hashedPassword,
      businessname,
      businesstype,
      compregno,
    });

    await newVendor.save();
    res.status(201).json({ message: 'Vendor registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
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
        businessname: vendor.businessname,
        businesstype: vendor.businesstype,
      },
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
