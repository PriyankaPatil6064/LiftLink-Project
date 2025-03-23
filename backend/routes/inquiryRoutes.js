import express from "express";
import Inquiry from "../models/Inquiry.js";

const router = express.Router();

router.post("/send", async (req, res) => {
  try {
    const { vendorId, userName, userEmail, message } = req.body;
    const newInquiry = new Inquiry({ vendorId, userName, userEmail, message });

    await newInquiry.save();
    res.json({ success: true, newInquiry });
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

export default router;
