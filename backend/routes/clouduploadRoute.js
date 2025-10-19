const express = require("express");
const router = express.Router();
require("dotenv").config();
const ImageModel = require("../models/galleryModel");
const {upload, cloudinary,streamUpload } = require('../config/cloudinaryConfig')
// ********************** تعريف دالة handleError هنا **********************
const handleError = require('../handleError/handleError')

//=======================================================================================
//=====================(1) store image in cloudinary and send data to mongo db ==========
//=======================================================================================


//===================================== upload images to cloudinary ================================================
router.post(
  "/api/cloudupload/add",
  upload.single("image"), // Multer سيضع الملف في req.file.buffer
  async (req, res) => {
    // ملاحظة: لن تحتاج لمعالج الأخطاء المعقد لـ Multer هنا لأنه سيتم التعامل مع الأخطاء داخلياً
    if (!req.file) {
      console.error("File missing in request.");
      return res.status(400).json({ message: "لم يتم إرسال ملف الصورة." });
    }
    try {
      const userId = req.body.userId; // رفعها لـ Cloudinary باستخدام Stream

      // تأكد من وجود userId قبل استخدامها
      if (!userId) {
        return res
          .status(400)
          .json({ message: "معرف المستخدم (userId) مطلوب." });
      }
      //============================= store image in cloudinary =================================
      const uniquePublicId = `${userId}-${Date.now()}`;
      const result = await streamUpload(req.file.buffer, {
        folder: `mernstack/gallery/${userId}`, // sort folders in cloudinary based on userId
        // public_id: userId, //  هذا هو اسم الصوره ويضمن عند رفع صوره يقوم بحذف القديمه ومن الممكن تغييره الى دالة الوقت لرفع كل صوره باسم مختلف والاحتفاظ بكل الصور
        public_id: uniquePublicId,
        upload_preset: "gallery_preset", // cloudinary settings لازم تكتب نفس الاسم ده في الكلاوديناري
      });

      //=========================== send data in mongoo database ===============================
      const newImage = new ImageModel({
        owner: userId,
        imageUrl: result.secure_url, // الرابط الذي سنستخدمه للعرض
        public_id: result.public_id, // مفيد لعمليات الحذف أو التحديث
      });
      await newImage.save();
      res.json({
        message: "✅ تم رفع الصورة بنجاح (مباشر)",
        imageUrl: result.secure_url, // // image link in cloudinary
        owner: userId,
        publicId: result.public_id,
      });
    } catch (err) {
      console.error("Cloudinary Upload Error:", err);
      res
        .status(500)
        .json({ message: "حدث خطأ أثناء رفع الصورة إلى Cloudinary" });
    }
  }
);

//=====================================================================================================
//================================ (2) get images from mongoo db =========================================
//=====================================================================================================

router.get("/api/allImages/:userId", async (req, res) => {
  try {
    const userImages = await ImageModel.find({ owner: req.params.userId }).sort(
      { createdAt: -1 }
    ); // Fetch all images

    if (userImages.length === 0) {
      return res
        .status(404)
        .json({ message: "لم يتم العثور على صور لهذا المستخدم." });
    }
    res.status(200).json({
      message: "✅ تم استرجاع الصور بنجاح من Cloudinary (مباشر)",
      images: userImages,
    }); // 200 OK
  } catch (error) {
    return handleError(res, error);
  }
});
//=====================================================================================================
//================================ (3) delete images from mongoo db and cloudinary store ==============
//=====================================================================================================
router.delete("/api/allImages/delete/:publicId/:owner", async (req, res) => {
  const owner = req.params.owner; // (user._id)
  const publicId = req.params.publicId; // (publicId)
  try {
    const deletedImage = await ImageModel.findOneAndDelete({
      public_id: publicId,
      owner: owner,
    });

    if (!deletedImage) {
      return res.status(404).json({ message: "لم يتم العثور على الصورة." });
    }
    // 2. ✅ الحذف من Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.destroy(publicId);
    res.status(200).json({
      message: "تم حذف الصورة من Cloudinary وقاعدة البيانات بنجاح.",
      cloudinaryResult: cloudinaryResponse.result,
    });
  } catch (error) {
    return handleError(res, error);
  }
});
module.exports = router;
