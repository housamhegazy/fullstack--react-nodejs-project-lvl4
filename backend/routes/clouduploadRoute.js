const express = require("express");
const router = express.Router();
const { upload } = require("../config/cloudinaryConfig");

//==================== import controllers ===============================================
const {
  uploadImage,
  getImages,
  deleteImage,
  deleteAllImages,
} = require("../controllers/cloudeUploadeController");
//=======================================================================================
//=====================(1) store image in cloudinary and send data to mongo db ==========
//=======================================================================================

//===================================== upload images to cloudinary ===================================
router.post("/api/cloudupload/add", upload.single("image"), uploadImage);

//=====================================================================================================
//================================ (2) get images from mongoo db ======================================
//=====================================================================================================

router.get("/api/allImages/:userId", getImages);
//=====================================================================================================
//================================ (3) delete image from mongoo db and cloudinary store ==============
//=====================================================================================================
router.delete("/api/allImages/delete/:publicId/:owner", deleteImage);
//=====================================================================================================
//================================ (3) delete all images from mongoo db and cloudinary store ===========
//=====================================================================================================

router.delete("/api/allImages/deleteall/:owner", deleteAllImages);

module.exports = router;
