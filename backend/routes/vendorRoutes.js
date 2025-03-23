import express from "express";
import multer from "multer";
import Vendor from "../models/Vendor.js";
import path from "path";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.put(
  "/profile/:id",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "projectImages", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const vendorId = req.params.id;
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) return res.status(404).json({ message: "Vendor not found" });

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

      vendor.fullname = fullname || vendor.fullname;
      vendor.companyName = companyName || vendor.companyName;
      vendor.companyType = companyType || vendor.companyType;
      vendor.location = location || vendor.location;
      vendor.contact = contact || vendor.contact;
      vendor.description = description || vendor.description;
      vendor.email = email || vendor.email;
      vendor.companyRegistrationNumber = companyRegistrationNumber || vendor.companyRegistrationNumber;

      if (services) {
        try {
          vendor.services = JSON.parse(services);
        } catch (err) {
          return res.status(400).json({ message: "Invalid services format" });
        }
      }

      if (req.files && req.files.logo && req.files.logo.length > 0) {
        vendor.logo = req.files.logo[0].filename;
      }

      const projectImages = req.files.projectImages || [];
      let projectDescArray = [];

      if (projectDescriptions) {
        try {
          projectDescArray = JSON.parse(projectDescriptions);
        } catch (err) {
          return res.status(400).json({ message: "Invalid project descriptions format" });
        }
      }

      if (projectImages.length > 0) {
        vendor.projects = projectImages.map((img, index) => ({
          image: img.filename,
          description: projectDescArray[index] || "",
        }));
      }

      await vendor.save();

      res.json({ message: "Vendor profile updated successfully!", vendor });
    } catch (error) {
      console.error("Profile Update Error: ", error);
      res.status(500).json({ error: "Error updating profile" });
    }
  }
);

export default router;
