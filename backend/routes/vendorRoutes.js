import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import Vendor from "../models/Vendor.js";
import path from "path";
import fs from "fs";

const router = express.Router();

// ✅ Ensure "uploads/" folder exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ✅ GET Vendor Profile
router.get('/profile/:vendorId', async (req, res) => {
  try {
      const { vendorId } = req.params;

      // Check if vendorId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(vendorId)) {
          return res.status(400).json({ message: "Invalid Vendor ID format" });
      }

      const vendor = await Vendor.findById(vendorId);
      if (!vendor) {
          return res.status(404).json({ message: "Vendor not found" });
      }

      res.status(200).json(vendor);
  } catch (error) {
      console.error("Error fetching vendor:", error);
      res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// ✅ PUT: Update Vendor Profile
router.put(
  "/profile/:id",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "projectImages", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const vendorId = req.params.id;
      const vendor = await Vendor.findById(new mongoose.Types.ObjectId(vendorId));

      if (!vendor) return res.status(404).json({ message: "Vendor not found" });

      // ✅ Destructure request body
      const {
        fullname,
        companyName,
        companyType,
        location,
        contact,
        description,
        email,
        companyRegistrationNumber,
        services,
        projectDescriptions,
      } = req.body;

      // ✅ Update only provided fields
      if (fullname) vendor.fullname = fullname;
      if (companyName) vendor.companyName = companyName;
      if (companyType) vendor.companyType = companyType;
      if (location) vendor.location = location;
      if (contact) vendor.contact = contact;
      if (description) vendor.description = description;
      if (email) vendor.email = email;
      if (companyRegistrationNumber) vendor.companyRegistrationNumber = companyRegistrationNumber;

      // ✅ Parse services array safely
      if (services) {
        try {
          vendor.services = typeof services === "string" ? JSON.parse(services) : services;
        } catch (err) {
          return res.status(400).json({ message: "Invalid services format" });
        }
      }

      // ✅ Handle Logo Upload (if provided)
      if (req.files?.logo?.length > 0) {
        vendor.logo = req.files.logo[0].filename;
      }

      // ✅ Handle Project Images & Descriptions
      let projectImages = req.files?.projectImages || [];
      let projectDescArray = [];

      if (projectDescriptions) {
        try {
          projectDescArray = typeof projectDescriptions === "string"
            ? JSON.parse(projectDescriptions)
            : projectDescriptions;
        } catch (err) {
          return res.status(400).json({ message: "Invalid project descriptions format" });
        }
      }

      // ✅ Append new project images without overwriting old ones
      if (projectImages.length > 0) {
        const newProjects = projectImages.map((img, index) => ({
          image: img.filename,
          description: projectDescArray[index] || "",
        }));

        vendor.projects = [...(vendor.projects || []), ...newProjects];
      }

      // ✅ Save updated vendor profile
      await vendor.save();

      res.json({ message: "Vendor profile updated successfully!", vendor });
    } catch (error) {
      console.error("Profile Update Error: ", error);
      res.status(500).json({ error: "Error updating profile" });
    }
  }
);

export default router;
