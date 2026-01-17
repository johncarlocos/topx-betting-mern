const express = require("express");
const router = express.Router();
const MatchRecordController = require("../controllers/matchRecord.controller");
const { authenticateAdmin, authorize } = require("../middleware/authMiddleware");
const multer = require("multer");

// Configure multer for memory storage (we'll write to disk manually in controller)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and videos
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type. Only images and videos are allowed."),
        false
      );
    }
  },
});

// Route to create a match record (admin only)
router.post(
  "/",
  authenticateAdmin,
  authorize(["main", "sub"]),
  upload.array("media", 20), // Allow up to 20 files
  MatchRecordController.createRecord
);

// Route to get all match records (public - for /match-records page)
router.get("/", MatchRecordController.getAllRecords);

// Route to get a match record by ID (public)
router.get("/:id", MatchRecordController.getRecordById);

// Route to update a match record (admin only)
router.put(
  "/:id",
  authenticateAdmin,
  authorize(["main", "sub"]),
  upload.array("media", 20), // Allow up to 20 files
  MatchRecordController.updateRecord
);

// Route to delete a match record (admin only)
router.delete(
  "/:id",
  authenticateAdmin,
  authorize(["main", "sub"]),
  MatchRecordController.deleteRecord
);

module.exports = router;

