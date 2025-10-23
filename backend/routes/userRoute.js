const express = require("express");
const router = express.Router();

// =========================import cloudinary config ==================================
const { upload } = require("../config/cloudinaryConfig");
const {
  getUser,
  updateProfilePhoto,
  deleteProfilePhoto,
  deleteUser,
} = require("../controllers/userControllers");
// get user
router.get("/api/profile", getUser);

// update profile photo
router.put(
  "/api/users/update-profile",
  upload.single("avatar"), // Multer middleware for local uploads
  updateProfilePhoto
);
//delete profile photo 
router.delete("/api/deleteprofilephoto/:userId",deleteProfilePhoto)
// delete user and gallery and profile photo from cloudinary and mongoo
router.delete("/api/deleteuser/:userId", deleteUser);

module.exports = router;
