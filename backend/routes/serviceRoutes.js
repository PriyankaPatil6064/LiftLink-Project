import express from "express";
import mongoose from "mongoose"; // Import mongoose for ObjectId conversion
import Vendor from "../models/Vendor.js";

const router = express.Router();

/**
 * @route   GET /api/services/:vendorId
 * @desc    Fetch all services of a specific vendor
 */
router.get("/:vendorId", async (req, res) => {
  try {
    const { vendorId } = req.params;

    // Validate vendorId
    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return res.status(400).json({ message: "Invalid Vendor ID" });
    }

    // Convert vendorId string to ObjectId
    const vendor = await Vendor.findById(new mongoose.Types.ObjectId(vendorId));

    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    res.json(vendor.services); // Send services array
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

/**
 * @route   POST /api/services/add
 * @desc    Add a new service for a vendor
 */
router.post("/add", async (req, res) => {
  try {
    const { vendorId, serviceName, description, category } = req.body;

    // Validate input
    if (!vendorId || !serviceName || !description || !category) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Convert vendorId to ObjectId before querying MongoDB
    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return res.status(400).json({ message: "Invalid Vendor ID" });
    }

    const vendor = await Vendor.findById(new mongoose.Types.ObjectId(vendorId));
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    // Create service object
    const newService = {
      _id: new mongoose.Types.ObjectId(),
      serviceName,
      description,
      category,
    };

    // Push new service to vendor's service array
    vendor.services.push(newService);
    await vendor.save();

    res.status(201).json({ success: true, newService });
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

/**
 * @route   DELETE /api/services/:vendorId/:serviceId
 * @desc    Delete a service by vendor and service ID
 */
router.delete("/:vendorId/:serviceId", async (req, res) => {
  try {
    const { vendorId, serviceId } = req.params;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(vendorId) || !mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ message: "Invalid Vendor or Service ID" });
    }

    const vendor = await Vendor.findById(new mongoose.Types.ObjectId(vendorId));
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    // Filter out the service to be deleted
    vendor.services = vendor.services.filter(service => service._id.toString() !== serviceId);
    await vendor.save();

    res.json({ success: true, message: "Service deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

export default router;
