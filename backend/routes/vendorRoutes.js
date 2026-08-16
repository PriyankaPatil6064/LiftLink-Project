import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import fs from "fs";
import Vendor from "../models/Vendor.js";
import Quote from "../models/Quote.js";
import Inquiry from "../models/Inquiry.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Ensure uploads/ folder exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname)}`),
});

const imageFilter = (req, file, cb) => {
  const allowedExt = /\.(jpeg|jpg|png|webp|gif)$/i;
  const allowedMime = /^image\/(jpeg|jpg|png|webp|gif)$/;
  if (allowedExt.test(file.originalname) && allowedMime.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, jpg, png, webp, gif) are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ─── GET /api/vendor/all ─────────────────────────────────────────────────────
// Advanced search with filters, sorting, pagination
router.get("/all", async (req, res) => {
  try {
    const {
      search, city, state, liftType, serviceType, minRating,
      minExperience, sortBy, page = 1, limit = 12,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter = { isApproved: true, isActive: true };

    if (search) {
      filter.$text = { $search: search };
    } else if (city || state) {
      const locationQuery = city || state;
      filter.$or = [
        { location: { $regex: locationQuery, $options: "i" } },
        { serviceCities: { $elemMatch: { $regex: locationQuery, $options: "i" } } },
        { serviceAreas: { $elemMatch: { $regex: locationQuery, $options: "i" } } },
      ];
    }

    if (liftType) {
      filter.liftCategories = { $elemMatch: { $regex: liftType, $options: "i" } };
    }

    if (serviceType) {
      filter["services.serviceName"] = { $regex: serviceType, $options: "i" };
    }

    if (minRating) {
      filter.averageRating = { $gte: parseFloat(minRating) };
    }

    if (minExperience) {
      filter.experience = { $gte: parseInt(minExperience) };
    }

    let sortObj = { createdAt: -1 };
    if (sortBy === "rating") sortObj = { averageRating: -1, totalReviews: -1 };
    else if (sortBy === "reviews") sortObj = { totalReviews: -1 };
    else if (sortBy === "experience") sortObj = { experience: -1 };
    else if (sortBy === "newest") sortObj = { createdAt: -1 };
    if (search) sortObj = { score: { $meta: "textScore" }, ...sortObj };

    const projection = {
      fullname: 1, companyName: 1, companyType: 1, location: 1, contact: 1,
      description: 1, logo: 1, services: 1, tagline: 1, experience: 1,
      teamSize: 1, liftCategories: 1, serviceCities: 1, averageRating: 1,
      totalReviews: 1, isVerified: 1, profileViews: 1,
      ...(search ? { score: { $meta: "textScore" } } : {}),
    };

    const [vendors, total] = await Promise.all([
      Vendor.find(filter, projection).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Vendor.countDocuments(filter),
    ]);

    res.status(200).json({
      vendors,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      hasMore: pageNum < Math.ceil(total / limitNum),
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// ─── GET /api/vendor/dashboard/analytics ─────────────────────────────────────
// IMPORTANT: This MUST come before /:vendorId to avoid route conflict
router.get("/dashboard/analytics", protect, authorize("vendor"), async (req, res) => {
  try {
    const vendorId = req.vendor._id;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [vendor, totalInquiries, totalQuotes, recentInquiries, recentQuotes, quoteStatusSummary, monthlyInquiries] =
      await Promise.all([
        Vendor.findById(vendorId).select(
          "profileViews savedBy averageRating totalReviews totalInquiries totalQuotes companyName isVerified createdAt"
        ),
        Inquiry.countDocuments({ vendorId }),
        Quote.countDocuments({ vendorId }),
        Inquiry.find({ vendorId }).sort({ date: -1 }).limit(5),
        Quote.find({ vendorId }).sort({ createdAt: -1 }).limit(5),
        Quote.aggregate([
          { $match: { vendorId: new mongoose.Types.ObjectId(vendorId) } },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        Inquiry.aggregate([
          {
            $match: {
              vendorId: new mongoose.Types.ObjectId(vendorId),
              date: { $gte: sixMonthsAgo },
            },
          },
          {
            $group: {
              _id: { year: { $year: "$date" }, month: { $month: "$date" } },
              count: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]),
      ]);

    res.json({
      overview: {
        profileViews: vendor?.profileViews || 0,
        savedBy: vendor?.savedBy?.length || 0,
        averageRating: vendor?.averageRating || 0,
        totalReviews: vendor?.totalReviews || 0,
        totalInquiries,
        totalQuotes,
        isVerified: vendor?.isVerified || false,
        memberSince: vendor?.createdAt,
      },
      quoteStatusSummary,
      monthlyInquiries,
      recentInquiries,
      recentQuotes,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// ─── GET /api/vendor/profile/:id ─────────────────────────────────────────────
// Protected: vendor fetches their own full profile (for ManageProfile form)
// IMPORTANT: Must come before /:vendorId
router.get("/profile/:id", protect, authorize("vendor"), async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Vendor ID" });
    }
    if (req.vendor._id.toString() !== id) {
      return res.status(403).json({ message: "Not authorized to view this profile" });
    }
    const vendor = await Vendor.findById(id).select("-password");
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// ─── GET /api/vendor/:vendorId ───────────────────────────────────────────────
// Public: full vendor profile page (must come AFTER specific named routes)
router.get("/:vendorId", async (req, res) => {
  try {
    const { vendorId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return res.status(400).json({ message: "Invalid Vendor ID format" });
    }
    const vendor = await Vendor.findById(vendorId).select("-password");
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    res.status(200).json(vendor);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// ─── PUT /api/vendor/profile/:id ─────────────────────────────────────────────
router.put(
  "/profile/:id",
  protect,
  authorize("vendor"),
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "coverBanner", maxCount: 1 },
    { name: "projectImages", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const vendorId = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(vendorId)) {
        return res.status(400).json({ message: "Invalid Vendor ID" });
      }
      if (req.vendor._id.toString() !== vendorId) {
        return res.status(403).json({ message: "Not authorized to update this profile" });
      }

      const vendor = await Vendor.findById(vendorId);
      if (!vendor) return res.status(404).json({ message: "Vendor not found" });

      // Simple string fields
      const simpleFields = [
        "fullname", "companyName", "companyType", "location", "contact",
        "description", "email", "companyRegistrationNumber", "tagline",
        "experience", "teamSize",
      ];
      simpleFields.forEach((f) => {
        if (req.body[f] !== undefined) vendor[f] = req.body[f];
      });

      // Array fields sent as JSON strings
      const jsonFields = ["services", "serviceCities", "serviceAreas", "liftCategories", "certifications", "businessHours"];
      for (const field of jsonFields) {
        if (req.body[field]) {
          try {
            vendor[field] =
              typeof req.body[field] === "string"
                ? JSON.parse(req.body[field])
                : req.body[field];
          } catch {
            return res.status(400).json({ message: `Invalid ${field} format — must be valid JSON` });
          }
        }
      }

      // Social links
      if (req.body.socialLinks) {
        try {
          vendor.socialLinks =
            typeof req.body.socialLinks === "string"
              ? JSON.parse(req.body.socialLinks)
              : req.body.socialLinks;
        } catch {
          // Silently ignore malformed socialLinks
        }
      }

      // File uploads
      if (req.files?.logo?.length > 0) vendor.logo = req.files.logo[0].filename;
      if (req.files?.coverBanner?.length > 0) vendor.coverBanner = req.files.coverBanner[0].filename;

      // New project images
      if (req.files?.projectImages?.length > 0) {
        let projectDescriptions = [];
        try {
          projectDescriptions = req.body.projectDescriptions
            ? JSON.parse(req.body.projectDescriptions)
            : [];
        } catch {}

        const newProjects = req.files.projectImages.map((img, idx) => ({
          image: img.filename,
          description: projectDescriptions[idx] || "",
          title: req.body[`projectTitle_${idx}`] || "",
        }));
        vendor.projects = [...(vendor.projects || []), ...newProjects];
      }

      await vendor.save();
      const vendorObj = vendor.toObject();
      delete vendorObj.password;
      res.json({ message: "Profile updated successfully!", vendor: vendorObj });
    } catch (error) {
      res.status(500).json({ error: "Error updating profile", details: error.message });
    }
  }
);

// ─── POST /api/vendor/project ────────────────────────────────────────────────
// Create a new project with multi-image upload
router.post(
  "/project",
  protect,
  authorize("vendor"),
  upload.fields([{ name: "projectImages", maxCount: 10 }]),
  async (req, res) => {
    try {
      const vendor = await Vendor.findById(req.vendor._id);
      if (!vendor) return res.status(404).json({ message: "Vendor not found" });

      const { title, description, year, location, projectType, elevatorType, videoUrl } = req.body;
      const images = req.files?.projectImages?.map((f) => f.filename) || [];

      const newProject = {
        _id: new mongoose.Types.ObjectId(),
        title: title || "",
        description: description || "",
        year: year ? parseInt(year) : undefined,
        location: location || "",
        projectType: projectType || "",
        elevatorType: elevatorType || "",
        videoUrl: videoUrl || "",
        images,
        image: images[0] || "",
      };

      vendor.projects.push(newProject);
      await vendor.save();
      res.status(201).json({ message: "Project created", project: newProject });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  }
);

// ─── PUT /api/vendor/project/:projectId ──────────────────────────────────────
// Update an existing project (text fields + add new images)
router.put(
  "/project/:projectId",
  protect,
  authorize("vendor"),
  upload.fields([{ name: "projectImages", maxCount: 10 }]),
  async (req, res) => {
    try {
      const vendor = await Vendor.findById(req.vendor._id);
      if (!vendor) return res.status(404).json({ message: "Vendor not found" });

      const project = vendor.projects.id(req.params.projectId);
      if (!project) return res.status(404).json({ message: "Project not found" });

      // Update text fields
      const fields = ["title", "description", "location", "projectType", "elevatorType", "videoUrl"];
      fields.forEach((f) => { if (req.body[f] !== undefined) project[f] = req.body[f]; });
      if (req.body.year) project.year = parseInt(req.body.year);

      // Handle image removals
      if (req.body.removeImages) {
        try {
          const toRemove = JSON.parse(req.body.removeImages);
          project.images = (project.images || []).filter((img) => !toRemove.includes(img));
        } catch {}
      }

      // Add new uploaded images
      const newImages = req.files?.projectImages?.map((f) => f.filename) || [];
      project.images = [...(project.images || []), ...newImages];
      project.image = project.images[0] || project.image || "";

      await vendor.save();
      res.json({ message: "Project updated", project });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  }
);

// ─── DELETE /api/vendor/project/:vendorId/:projectId ─────────────────────────
router.delete("/project/:vendorId/:projectId", protect, authorize("vendor"), async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.vendorId);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    if (vendor._id.toString() !== req.vendor._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    vendor.projects = vendor.projects.filter(
      (p) => p._id.toString() !== req.params.projectId
    );
    await vendor.save();
    res.json({ message: "Project deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

export default router;
