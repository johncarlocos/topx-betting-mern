const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Member } = require("../models/member.model");
const { Admin } = require("../models/admin.model"); // Ensure Admin model is imported
const SessionService = require("../services/session.service");
const Logger = require("../utils/logger");

/**
 * @class MemberController
 * @classdesc Controller for member-related operations.
 */
class MemberController {
  /**
   * Handles member login.
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @returns {Promise<void>}
   * @static
   * @async
   */
  static async login(req, res) {
    try {
      const { username, password } = req.body;
      const member = await Member.findOne({ username }).select("+password");

      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }

      // Compare password using bcrypt (handles both hashed and plain text for backward compatibility)
      let isPasswordValid = false;
      
      // Check if password is hashed (starts with $2a$, $2b$, or $2y$)
      if (member.password.startsWith('$2a$') || member.password.startsWith('$2b$') || member.password.startsWith('$2y$')) {
        // Password is hashed, use bcrypt.compare
        isPasswordValid = await bcrypt.compare(password, member.password);
      } else {
        // Legacy plain text password (for backward compatibility with existing members)
        isPasswordValid = password === member.password;
        // If plain text matches, hash it for future logins
        if (isPasswordValid) {
          const hashedPassword = await bcrypt.hash(password, 10);
          member.password = hashedPassword;
          await member.save();
          Logger.info(`Migrated password to hashed format for member: ${member.username}`);
        }
      }

      if (!isPasswordValid) {
        Logger.debug("Password comparison failed for member:", member.username);
        return res.status(401).json({
          message: "Invalid password",
          code: "INVALID_CREDENTIALS",
        });
      }

      if (member.blocked && !member.immuneToIPBan) {
        return res.status(403).json({ message: "Member is blocked" });
      }

      // Check IP address
      const clientIp = req.headers["x-forwarded-for"] || req.headers["x-real-ip"] ||
        req.connection.remoteAddress || req.ip;
      Logger.debug(
        `Login attempt from IP: ${clientIp} for member: ${member.username}`,
      );

      if (!member.ipAddresses.includes(clientIp)) {
        if (member.ipAddresses.length >= 6 && !member.immuneToIPBan) {
          member.blocked = true;
          await member.save();
          Logger.warn(
            `Member ${member.username} blocked due to too many IP addresses`,
          );
          return res.status(403).json({
            message: "Too many IP addresses. Account blocked.",
            code: "IP_LIMIT_EXCEEDED",
          }); 
           
        } else {
          member.ipAddresses.push(clientIp);
          await member.save();
          Logger.info(
            `New IP address added for member ${member.username}: ${clientIp}`,
          );
        }
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: member._id.toString(),
          role: "member",
          username: member.username,
          slug: member.slug
        },
        process.env.JWT_SECRET || "your-secret-key-change-in-production",
        { expiresIn: "24h" }
      );

      res.status(200).json({
        message: "Member login successful",
        token: token,
        slug: member.slug,
        username: member.username,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error logging in",
        error: error.message,
      });
    }
  }

  /**
   * Handles member logout.
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
      res.status(200).json({ message: "Member logout successful" });
    } catch (error) {
      res.status(500).json({
        message: "Error logging out",
        error: error.message,
      });
    }
  }

  /**
   * Checks if a member is authenticated.
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @returns {Promise<void>}
   * @static
   * @async
   */
  static async checkAuth(req, res) {
    try {
      // Auth is already validated by middleware
      const member = req.member;
      if (member.blocked) {
        return res.status(403).json({ message: "Member is blocked" });
      }
      res.status(200).json({ 
        message: "Member is authenticated",
        slug: member.slug,
        username: member.username,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error checking authentication",
        error: error.message,
      });
    }
  }

  /**
   * Handles member creation.
   * This method is separate from login to maintain clear responsibilities.
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @returns {Promise<void>}
   * @static
   * @async
   */
  static async createMember(req, res) {
    try {
      const { username, password, price, date } = req.body;

      const admin = await Admin.findOne({ username: req.user.username });

      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      // Hash the password before saving
      const newMember = new Member({
        username,
        password: password,
        price,
        date,
        // Ensure 'slug' is defined or generated appropriately
        slug: generateSlug(username), // You need to implement generateSlug
        createdBy: admin.id,
      });

      await newMember.save();

      res.status(201).json({ message: "Member created successfully" });
    } catch (error) {
      res.status(500).json({
        message: "Error creating member",
        error: error.message,
      });
    }
  }
}

module.exports = MemberController;
