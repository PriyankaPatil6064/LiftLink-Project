import express from "express";
import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import Vendor from "../models/Vendor.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route   GET /api/services/:vendorId
 * @desc    Fetch all services of a specific vendor
 * @access  Public
 */
router.get("/:vendorId", asyncHandler(async (req, res) => {
  const { vendorId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(vendorId)) {
    res.status(400);
    throw new Error("Invalid Vendor ID");
  }

  const vendor = await Vendor.findById(new mongoose.Types.ObjectId(vendorId));
  if (!vendor) {
    res.status(404);
    throw new Error("Vendor not found");
  }

  res.json(vendor.services);
}));

/**
 * @route   POST /api/services/add
 * @desc    Add a new service for a vendor
 * @access  Private (vendor only, own services)
 */
router.post("/add", protect, authorize('vendor'), asyncHandler(async (req, res) => {
  const { vendorId, serviceName, description, category } = req.body;

  if (!vendorId || !serviceName || !description || !category) {
    res.status(400);
    throw new Error("All fields are required");
  }

  if (!mongoose.Types.ObjectId.isValid(vendorId)) {
    res.status(400);
    throw new Error("Invalid Vendor ID");
  }

  // Ensure vendor can only add to their own services
  if (req.vendor._id.toString() !== vendorId) {
    res.status(403);
    throw new Error("Not authorized to modify this vendor's services");
  }

  const vendor = await Vendor.findById(new mongoose.Types.ObjectId(vendorId));
  if (!vendor) {
    res.status(404);
    throw new Error("Vendor not found");
  }

  const newService = {
    _id: new mongoose.Types.ObjectId(),
    serviceName,
    description,
    category,
  };

  vendor.services.push(newService);
  await vendor.save();

  res.status(201).json({ success: true, newService });
}));

/**
 * @route   DELETE /api/services/:vendorId/:serviceId
 * @desc    Delete a service by vendor and service ID
 * @access  Private (vendor only, own services)
 */
router.delete("/:vendorId/:serviceId", protect, authorize('vendor'), asyncHandler(async (req, res) => {
  const { vendorId, serviceId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(vendorId) || !mongoose.Types.ObjectId.isValid(serviceId)) {
    res.status(400);
    throw new Error("Invalid Vendor or Service ID");
  }

  // Ensure vendor can only delete their own services
  if (req.vendor._id.toString() !== vendorId) {
    res.status(403);
    throw new Error("Not authorized to modify this vendor's services");
  }

  const vendor = await Vendor.findById(new mongoose.Types.ObjectId(vendorId));
  if (!vendor) {
    res.status(404);
    throw new Error("Vendor not found");
  }

  vendor.services = vendor.services.filter(service => service._id.toString() !== serviceId);
  await vendor.save();

  res.json({ success: true, message: "Service deleted successfully" });
}));

export default router;
