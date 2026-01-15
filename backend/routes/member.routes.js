const express = require("express");
const router = express.Router();
const MemberController = require("../controllers/member.controller");
const { authenticateMember } = require("../middleware/authMiddleware");

// Route to handle member login
router.post("/login", MemberController.login);

// Route to handle member logout
router.post("/logout", authenticateMember, MemberController.logout);

// Route to check member authentication
router.get("/check-auth", authenticateMember, MemberController.checkAuth);

module.exports = router;
