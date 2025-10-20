const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const isAuthenticated = require("../middleware/authMiddleware");
const User = require("../models/userModel");
const handleError = require("../utils/errorMiddleware");

router.get("", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id; // يفترض أن isAuthenticated يضيف معرف المستخدم
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    return handleError(res, error);
  }
});

module.exports = router;