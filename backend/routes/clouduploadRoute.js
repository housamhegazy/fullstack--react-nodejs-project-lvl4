const express = require("express");
const router = express.Router();
const { upload } = require("../config/cloudinaryConfig");

//==================== import controllers ===============================================
const {
  uploadImage,
  getImages,
  deleteImage,
  deleteAllImages,
  uploadmanyImages,
  downloadImage,
  downloadAll
} = require("../controllers/cloudeUploadeController");
//=======================================================================================
//=====================store image in cloudinary and send data to mongo db ==========
//=======================================================================================

//===================================== (1) upload image to cloudinary ===================================
router.post("/api/cloudupload/add", upload.single("image"), uploadImage);
//===================================== (1) upload image to cloudinary ===================================
router.post("/api/cloudupload/addmany", upload.array("image"), uploadmanyImages);
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
//=====================================================================================================
//================================ (4) download image from mongoo db and cloudinary store ===========
//=====================================================================================================

router.get("/api/download/:publicId",downloadImage)
//=====================================================================================================
//================================ (4) download images from mongoo db and cloudinary store ===========
//=====================================================================================================
router.get("/api/downloadAll/:userId", downloadAll);



module.exports = router;
