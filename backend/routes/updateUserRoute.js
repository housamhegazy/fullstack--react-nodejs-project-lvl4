const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
// =========================import cloudinary config ==================================
const {upload, cloudinary,streamUpload } = require('../config/cloudinaryConfig')
// ********************** تعريف دالة handleError هنا **********************
const handleError = require('../handleError/handleError')
//======================================= edite profile pic ==========================
router.put(
  "/update-profile",
  upload.single("avatar"), // Multer middleware for local uploads
  async (req, res) => {
    try {
      const userId = req.user._id;
      const { fullName, email, avatarUrl } = req.body; // avatarUrl لو الصورة جاية من فيسبوك أو جوجل إلخ
      // 🧩 التحقق من المدخلات
      if (!fullName || !email) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // 🧩 التأكد إن الإيميل مش مستخدم من مستخدم تاني
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }

      // Prepare updated data
      const updateData = { fullName, email };

      // 🧩 لو فيه صورة جديدة
      if (req.file) {
        // حذف الصورة القديمة من Cloudinary (إن وجدت)
        if (req.user.avatar && req.user.avatar.includes("cloudinary.com")) {
          try {
            // استخراج المسار الكامل بعد "/upload/"
            const parts = req.user.avatar.split("/upload/");
            if (parts.length > 1) {
              const path = parts[1].split(".")[0]; // بيرجع user_profiles/xxx_xxx بدون الامتداد
              console.log("🧩 Deleting Cloudinary image:", path);
              await cloudinary.uploader.destroy(path);
            } else {
              console.warn("⚠️ Couldn't extract Cloudinary path correctly.");
            }
          } catch (err) {
            console.warn(
              "⚠️ Failed to delete old Cloudinary image:",
              err.message
            );
          }
        }

        //============================= store image in cloudinary =================================

        // الصوره مرفوعه من الجهاز المحلي
        if (req.file) {
          const result = await streamUpload(req.file.buffer, {
            folder: `mernstack/profile-pic/${userId}`, // sort folders in cloudinary based on userId
            public_id: userId, //  هذا هو اسم الصوره ويضمن عند رفع صوره يقوم بحذف القديمه ومن الممكن تغييره الى دالة الوقت لرفع كل صوره باسم مختلف والاحتفاظ بكل الصور
            upload_preset: "gallery_preset", // cloudinary settings لازم تكتب نفس الاسم ده في الكلاوديناري
          });
          updateData.avatar = result.secure_url;
        }
      }

      // 🔄 تحديث بيانات المستخدم في قاعدة البيانات
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      }).select("-password");

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      return handleError(res,error)
    }
  }
);

module.exports = router;
