import express from "express";
import Service from "../models/Service.js";

const router = express.Router();

router.post("/add", async (req, res) => {
  try {
    const { vendorId, serviceName, description, category } = req.body;
    const newService = new Service({ vendorId, serviceName, description, category });

    await newService.save();
    res.json({ success: true, newService });
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

export default router;
