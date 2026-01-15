const jwt = require("jsonwebtoken");
const { Admin } = require("../models/admin.model");
const { Member } = require("../models/member.model");
const { RedisCache } = require("../utils/redis");

const authenticateAdmin = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-change-in-production"
    );

    // Check if user is admin or subadmin
    if (decoded.role !== "main" && decoded.role !== "sub") {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    // Try to get admin from cache first (60 second TTL)
    const cacheKey = `admin:${decoded.userId}`;
    let admin = await RedisCache.get(cacheKey);
    
    if (!admin) {
      admin = await Admin.findById(decoded.userId).lean();
      if (admin) {
        // Cache for 60 seconds
        await RedisCache.set(cacheKey, admin, 60);
      }
    }

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(403).json({
      message: "Error validating token",
      error: error.message,
    });
  }
};

const authenticateMember = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-change-in-production"
    );

    // Check if user is member
    if (decoded.role !== "member") {
      return res.status(403).json({ message: "Access denied. Member role required." });
    }

    // Try to get member from cache first (30 second TTL - shorter for members as blocked status changes)
    const cacheKey = `member:${decoded.userId}`;
    let member = await RedisCache.get(cacheKey);
    
    if (!member) {
      member = await Member.findById(decoded.userId).lean();
      if (member) {
        // Cache for 30 seconds (shorter TTL for members due to blocked status)
        await RedisCache.set(cacheKey, member, 30);
      }
    }

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (member.blocked) {
      return res.status(403).json({ message: "Member is blocked" });
    }

    req.member = member;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(403).json({
      message: "Error validating token",
      error: error.message,
    });
  }
};

const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    next();
  };
};

module.exports = { authenticateAdmin, authenticateMember, authorize };
