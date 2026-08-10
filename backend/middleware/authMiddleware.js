import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Vendor from "../models/Vendor.js";

/**
 * Protect routes — verifies JWT token from Authorization header.
 * Attaches req.user or req.vendor depending on the token role.
 */
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.role === "vendor") {
        req.vendor = await Vendor.findById(decoded.id).select("-password");
        if (!req.vendor) return res.status(401).json({ message: "Vendor not found" });
      } else {
        req.user = await User.findById(decoded.id).select("-password");
        if (!req.user) return res.status(401).json({ message: "User not found" });
      }

      req.userRole = decoded.role;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token invalid" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

/**
 * Role-based access control — use after protect().
 * Usage: authorize("vendor") or authorize("user", "vendor")
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        message: `Access denied: role '${req.userRole}' is not authorized`,
      });
    }
    next();
  };
};
