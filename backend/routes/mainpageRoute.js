const express = require("express");
const router = express.Router();

// المسار الافتراضي
router.get("/", (req, res) => {
  res.send("Hello World! This is your backend API.");
});

module.exports = router;
