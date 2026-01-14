// const bcrypt = require("bcryptjs");
const { Member } = require("../models/member.model");
const { Admin } = require("../models/admin.model"); // Ensure Admin model is imported
const SessionService = require("../services/session.service");

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
      console.log("Comparing password for member:", member.username);

      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }

      if (password !== member.password) {
        console.log("Comparing password for member:", member.username);
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
      console.log(
        `Login attempt from IP: ${clientIp} for member: ${member.username}`,
      );

      if (!member.ipAddresses.includes(clientIp)) {
        if (member.ipAddresses.length >= 6 && !member.immuneToIPBan) {
          member.blocked = true;
          await member.save();
          console.log(
            `Member ${member.username} blocked due to too many IP addresses`,
          );
          return res.status(403).json({
            message: "Too many IP addresses. Account blocked.",
            code: "IP_LIMIT_EXCEEDED",
          }); 
           
        } else {
          member.ipAddresses.push(clientIp);
          await member.save();
          console.log(
            `New IP address added for member ${member.username}: ${clientIp}`,
          );
        }
      }

      // Create a session (assuming SessionService.createSession exists)
      const sessionId = await SessionService.createSession(member.id);

      // Set session cookie
      res.cookie("sessionId", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.status(200).json({
        message: "Member login successful",
        slug: member.slug,
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
      const sessionId = req.cookies?.sessionId;

      if (!sessionId) {
        return res.status(400).json({ message: "No session ID provided" });
      }

      await SessionService.revokeSession(sessionId);

      res.clearCookie("sessionId", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

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
      const sessionId = req.cookies?.sessionId;

      if (!sessionId) {
        return res.status(401).json({ 
          message: "No session ID provided",
          code: "NO_SESSION" 
        });
      }

      const session = await SessionService.validateSession(sessionId);

      if (!session) {
        return res.status(401).json({ 
          message: "Invalid session",
          code: "INVALID_SESSION" 
        });
      }

      const member = await Member.findById(session.userId);

      if (!member) {
        // Return 401 instead of 404 for authentication failures
        return res.status(401).json({ 
          message: "Member not found",
          code: "MEMBER_NOT_FOUND" 
        });
      }

      if (member.blocked) {
        return res.status(403).json({ 
          message: "Member is blocked",
          code: "MEMBER_BLOCKED" 
        });
      }

      res.status(200).json({ 
        message: "Member is authenticated",
        authenticated: true 
      });
    } catch (error) {
      console.error("Error in checkAuth:", error);
      res.status(500).json({
        message: "Error checking authentication",
        error: error.message,
        code: "INTERNAL_ERROR"
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
