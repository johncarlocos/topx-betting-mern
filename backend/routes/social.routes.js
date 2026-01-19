const express = require("express");
const router = express.Router();

// Simple social links route - returns default/empty social links
// TODO: Implement database storage if admin needs to manage these links
router.get("/", (req, res) => {
  // Return default social links structure
  // Frontend expects { whatsapp?: string, telegram?: string }
  res.json({
    whatsapp: "",
    telegram: "",
  });
});

// PUT endpoint for updating social links (currently not used but hook expects it)
router.put("/", (req, res) => {
  // TODO: Implement database storage when admin management is needed
  res.json({
    message: "Social links update not yet implemented",
    whatsapp: req.body.whatsapp || "",
    telegram: req.body.telegram || "",
  });
});

module.exports = router;

