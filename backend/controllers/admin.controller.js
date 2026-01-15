const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Admin } = require("../models/admin.model");
const { Member } = require("../models/member.model");
const { uniqueNamesGenerator, adjectives, colors, animals } = require(
  "unique-names-generator",
);
const SessionService = require("../services/session.service");
const mongoose = require("mongoose");
const Logger = require("../utils/logger");

/**
 * @class AdminController
 * @classdesc Controller for admin-related operations.
 */
class AdminController {
  /**
   * Handles admin login.
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @returns {Promise<void>}
   * @static
   * @async
   */
  static async login(req, res) {
    try {
      const { username, password, expectedRole } = req.body;
      const admin = await Admin.findOne({ username }).select('+password');

      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      // Validate role if expectedRole is provided
      if (expectedRole) {
        if (expectedRole === "main" && admin.role !== "main") {
          return res.status(403).json({ 
            message: "Access denied. Main admin credentials required.",
            code: "INVALID_ROLE" 
          });
        }
        if (expectedRole === "sub" && admin.role !== "sub") {
          return res.status(403).json({ 
            message: "Access denied. Sub-admin credentials required.",
            code: "INVALID_ROLE" 
          });
        }
      }

      Logger.debug("Comparing password for admin:", admin.username);
      
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        Logger.debug("Password comparison failed for admin:", admin.username);
        return res.status(401).json({ 
          message: "Invalid password",
          code: "INVALID_CREDENTIALS" 
        });
      }
      Logger.debug("Password comparison succeeded for admin:", admin.username);

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: admin._id.toString(),
          role: admin.role,
          username: admin.username
        },
        process.env.JWT_SECRET || "your-secret-key-change-in-production",
        { expiresIn: "24h" }
      );

      res.status(200).json({
        message: "Admin login successful",
        token: token,
        role: admin.role,
        username: admin.username,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error logging in",
        error: error.message,
      });
    }
  }

  /**
   * Handles admin logout.
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @returns {Promise<void>}
   * @static
   * @async
   */
  static async logout(req, res) {
    try {
      // Token-based auth doesn't require server-side logout
      // Token is removed from localStorage on client side
      // Optionally, you could maintain a blacklist of tokens here
      res.status(200).json({ message: "Admin logout successful" });
    } catch (error) {
      res.status(500).json({
        message: "Error logging out",
        error: error.message,
      });
    }
  }

  /**
   * Checks if an admin is authenticated.
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @returns {Promise<void>}
   * @static
   * @async
   */
  static async checkAuth(req, res) {
    try {
      // Auth is already validated by middleware
      const admin = req.admin;
      res.status(200).json({
        message: "Admin is authenticated",
        role: admin.role,
        username: admin.username,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error checking authentication",
        error: error.message,
      });
    }
  }

  /**
   * Registers a new sub-admin.
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @returns {Promise<void>}
   * @static
   * @async
   */
  static async registerSubAdmin(req, res) {
    try {
      const { username, password } = req.body;
      const existingAdmin = await Admin.findOne({ username });

      if (existingAdmin) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newSubAdmin = new Admin({
        username,
        password: hashedPassword,
        role: "sub",
      });

      await newSubAdmin.save();
      res.status(201).json({ message: "Sub-admin registered successfully" });
    } catch (error) {
      res.status(500).json({
        message: "Error registering sub-admin",
        error: error.message,
      });
    }
  }

  /**
   * Registers a new member.
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @returns {Promise<void>}
   * @static
   * @async
   */
  static async registerMember(req, res) {
    try {
      const { username, password, price, date } = req.body;
      const admin = req.admin;

      // Validate required fields
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      if (!date) {
        return res.status(400).json({ message: "Date is required" });
      }

      const existingMember = await Member.findOne({ username });

      if (existingMember) {
        return res.status(400).json({ message: "Member already exists" });
      }

      // Generate unique slug
      const generateUniqueSlug = async () => {
        let slug;
        let exists = true;
        let attempts = 0;
        const maxAttempts = 10;
        
        while (exists && attempts < maxAttempts) {
          slug = uniqueNamesGenerator({
            dictionaries: [adjectives, colors, animals],
            separator: "-",
            length: 2,
            style: "lowerCase",
          });
          const member = await Member.findOne({ slug });
          if (!member) exists = false;
          attempts++;
        }
        
        if (exists) {
          throw new Error("Failed to generate unique slug after multiple attempts");
        }
        
        return slug;
      };

      const slug = await generateUniqueSlug();
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Parse the date - handle both string and Date object
      let parsedDate;
      if (date instanceof Date) {
        parsedDate = date;
      } else if (typeof date === 'string') {
        parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
          return res.status(400).json({ message: "Invalid date format" });
        }
      } else {
        return res.status(400).json({ message: "Invalid date format" });
      }

      const newMember = new Member({
        username,
        password: hashedPassword,
        price: price ? Number(price) : undefined,
        date: parsedDate,
        slug,
        createdBy: admin._id, // Use _id for MongoDB ObjectId reference
      });

      await newMember.save();
      
      // Invalidate Redis cache for members (if Redis is available)
      try {
        const RedisCache = require("../utils/redis").RedisCache;
        await RedisCache.deletePattern("members:*");
      } catch (cacheError) {
        Logger.warn("Failed to invalidate Redis cache:", cacheError);
        // Continue even if cache invalidation fails
      }
      
      res.status(201).json({ message: "Member registered successfully" });
    } catch (error) {
      Logger.error("Error registering member:", error);
      res.status(500).json({
        message: "Error registering member",
        error: error.message,
      });
    }
  }

  /**
   * Gets all members with pagination support.
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @returns {Promise<void>}
   * @static
   * @async
   */
  static async getAllMembers(req, res) {
    try {
      const isAdmin = req.admin.role === "main";
      let query = {};
      if (!isAdmin) {
        query = { createdBy: req.admin._id };
      }

      // Pagination parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;

      // Sort parameter (default: createdAt descending)
      const sortBy = req.query.sortBy || 'createdAt';
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      const sort = { [sortBy]: sortOrder };

      // Count total documents for pagination metadata
      const total = await Member.countDocuments(query);

      // Fetch members with pagination, lean() for better performance
      const members = await Member.find(query)
        .populate("createdBy", "username role")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(); // Use lean() for better performance when we don't need full Mongoose documents

      const formattedMembers = members.map((member) => {
        const formattedMember = {
          ...member,
        };
        if (member.createdBy) {
          formattedMember.createdBy = {
            username: member.createdBy.username,
            role: member.createdBy.role,
          };
        } else {
          delete formattedMember.createdBy;
        }
        return formattedMember;
      });

      res.status(200).json({
        data: formattedMembers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      res.status(500).json({
        message: "Error fetching members",
        error: error.message,
      });
    }
  }

  /**
   * Gets all sub-admins.
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @returns {Promise<void>}
   * @static
   * @async
   */
  static async getAllSubAdmins(req, res) {
    try {
      Logger.debug("AdminController: getAllSubAdmins - fetching sub-admins");
      const subAdmins = await Admin.find({ role: "sub" }).lean();
      res.status(200).json(subAdmins);
    } catch (error) {
      res.status(500).json({
        message: "Error fetching sub-admins",
        error: error.message,
      });
    }
  }

  /**
   * Updates a sub-admin's username.
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @returns {Promise<void>}
   * @static
   * @async
   */
  static async updateSubAdmin(req, res) {
    try {
      const { id } = req.params;
      const { username, password } = req.body;

      const updateFields = { username };
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateFields.password = hashedPassword;
      }

      const updatedAdmin = await Admin.findByIdAndUpdate(
        id,
        updateFields,
        { new: true },
      );

      if (!updatedAdmin) {
        return res.status(404).json({ message: "Sub-admin not found" });
      }

      res.status(200).json({
        message: "Sub-admin updated successfully",
        updatedAdmin,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error updating sub-admin",
        error: error.message,
      });
    }
  }

  /**
   * Updates a sub-admin's password.
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @returns {Promise<void>}
   * @static
   * @async
   */
  static async updateSubAdminPassword(req, res) {
    try {
      const { id } = req.params;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const updatedAdmin = await Admin.findByIdAndUpdate(
        id,
        { password: hashedPassword },
        { new: true },
      );

      if (!updatedAdmin) {
        return res.status(404).json({ message: "Sub-admin not found" });
      }

      res.status(200).json({
        message: "Sub-admin password updated successfully",
        updatedAdmin,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error updating sub-admin password",
        error: error.message,
      });
    }
  }

  /**
   * Deletes a sub-admin.
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @returns {Promise<void>}
   * @static
   * @async
   */
  static async deleteSubAdmin(req, res) {
    try {
      const { id } = req.params;
      const deletedAdmin = await Admin.findByIdAndDelete(id);

      if (!deletedAdmin) {
        return res.status(404).json({ message: "Sub-admin not found" });
      }

      res.status(200).json({ message: "Sub-admin deleted successfully" });
    } catch (error) {
      res.status(500).json({
        message: "Error deleting sub-admin",
        error: error.message,
      });
    }
  }

  /**
   * Blocks a member.
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @returns {Promise<void>}
   * @static
   * @async
   */
  static async blockMember(req, res) {
    try {
      const { id } = req.params;
      const updatedMember = await Member.findByIdAndUpdate(
        id,
        { blocked: true },
        { new: true },
      );

      if (!updatedMember) {
        return res.status(404).json({ message: "Member not found" });
      }

      await SessionService.revokeAllSessions(updatedMember._id);

      res.status(200).json({
        message: "Member blocked successfully",
        updatedMember,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error blocking member",
        error: error.message,
      });
    }
  }

  /**
   * Unblocks a member.
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @returns {Promise<void>}
   * @static
   * @async
   */
  static async unblockMember(req, res) {
    try {
      const { id } = req.params;
      const updatedMember = await Member.findByIdAndUpdate(
        id,
        { blocked: false },
        { new: true },
      );

      if (!updatedMember) {
        return res.status(404).json({ message: "Member not found" });
      }
      
      // Check if the member was blocked due to too many IPs
      if (updatedMember.ipAddresses.length >= 6) {
        updatedMember.ipAddresses = [];
        await updatedMember.save();
        Logger.info(`IP addresses cleared for member ${updatedMember.username} after unblocking.`);
      }

      res.status(200).json({
        message: "Member unblocked successfully",
        updatedMember,
      });
    } catch (error) {
      Logger.error("Error unblocking member:", error);
      res.status(500).json({
        message: "Error unblocking member",
        error: error.message,
      });
    }
  }

  /**
   * Updates a member's username, password, and price.
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @returns {Promise<void>}
   * @static
   * @async
   */
  static async updateMember(req, res) {
    try {
      const { id } = req.params;
      const { username, password, price } = req.body;

      const updateFields = {};
      if (username) {
        updateFields.username = username;
      }
      if (password) {
        updateFields.password = password;
      }
      if (price) {
        updateFields.price = price;
      }

      const updatedMember = await Member.findByIdAndUpdate(
        id,
        updateFields,
        { new: true },
      );

      if (!updatedMember) {
        return res.status(404).json({ message: "Member not found" });
      }

      res.status(200).json({
        message: "Member updated successfully",
        updatedMember,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error updating member",
        error: error.message,
      });
    }
  }

  /**
   * Deletes a member.
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @returns {Promise<void>}
   * @static
   * @async
   */
  static async deleteMember(req, res) {
    try {
      const { id } = req.params;
      const deletedMember = await Member.findByIdAndDelete(id);

      if (!deletedMember) {
        return res.status(404).json({ message: "Member not found" });
      }

      res.status(200).json({ message: "Member deleted successfully" });
    } catch (error) {
      res.status(500).json({
        message: "Error deleting member",
        error: error.message,
      });
    }
  }

  /**
   * Toggles member's IP ban immunity status
   * @param {object} req - The request object
   * @param {object} res - The response object
   * @returns {Promise<void>}
   * @static
   * @async
   */
  static async toggleImmuneStatus(req, res) {
    try {
      const { id } = req.params;
      const member = await Member.findById(id);

      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }

      member.immuneToIPBan = !member.immuneToIPBan;
      await member.save();

      res.status(200).json({
        message: `IP ban immunity ${member.immuneToIPBan ? "enabled" : "disabled"}`,
        immuneToIPBan: member.immuneToIPBan
      });
    } catch (error) {
      Logger.error("Error toggling immunity status:", error);
      res.status(500).json({
        message: "Error updating immunity status",
        error: error.message,
      });
    }
  }
}

module.exports = AdminController;
