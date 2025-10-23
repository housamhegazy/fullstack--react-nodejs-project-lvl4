const express = require("express");
const User = require("../models/userModel");
require("dotenv").config();
// ********************** تعريف دالة handleError هنا **********************
const { handleError } = require("../utils/errorMiddleware");
//======================================= edite profile pic ==========================
const {
  processDeleteAllImages,
} = require("../controllers/cloudeUploadeController");
const {
  processdeleteAllCustomers,
} = require("../controllers/customersController");

// =========================import cloudinary config ==================================
const { cloudinary, streamUpload } = require("../config/cloudinaryConfig");

//================= Get User ============================================================
const getUser = async (req, res) => {
  try {
    const userId = req.user._id; // يفترض أن isAuthenticated يضيف معرف المستخدم
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    return handleError(res, error);
  }
};
//=================== update profile photo =============================
const updateProfilePhoto = async (req, res) => {
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
    return handleError(res, error);
  }
};
//=================== delete profile photo function =====================================
const processDeleteProfilePhoto = async (userId) => {
  const userToDelete = await User.findById(userId).select("avatar");
  if (!userToDelete) {
    // إيقاف العملية وإرجاع 404 إذا لم يتم العثور على المستخدم
    return res
      .status(404)
      .json({ message: "User not found or already deleted." });
  }

  const avatarUrl = userToDelete.avatar;

  // ⭐️ حذف مجلد الصورة الشخصية (Avatar Folder)
  if (
    avatarUrl &&
    avatarUrl.includes("cloudinary.com") &&
    !avatarUrl.includes("default") // تجنب حذف الصور الافتراضية
  ) {
    try {
      // 💡 استخدام نفس المنطق الذي يركز على مسار المجلد (الذي يحمل ID المستخدم)
      const uploadIndex = avatarUrl.indexOf("/upload/") + "/upload/".length;
      let publicIdPart = avatarUrl.substring(uploadIndex);

      if (publicIdPart.startsWith("v")) {
        publicIdPart = publicIdPart.substring(publicIdPart.indexOf("/") + 1);
      }

      const pathSegments = publicIdPart.split("/");
      pathSegments.pop(); // إزالة اسم الملف

      const folderPath = pathSegments.join("/"); // المسار الصحيح للحذف

      if (folderPath) {
        // / هذا يزيل الصورة الشخصية نفسها، ويضمن أن المجلد يصبح فارغًا
        await cloudinary.api.delete_resources_by_prefix(folderPath);
        // ⭐️ حذف المجلد بالكامل
        await cloudinary.api.delete_folder(folderPath);
      }
    } catch (error) {
      // سجل الخطأ لكن استمر في حذف المستخدم (لتجنب تعليق العملية بالكامل)
      console.error(
        "⚠️ Failed to delete Cloudinary profile folder:",
        error.message
      );
      // لا نرمي الخطأ، بل نكتفي بتسجيله ونسمح بمسح المستخدم من MongoDB
    }
  }
};
//============================= delete profile photo controller ============================
const deleteProfilePhoto = async (req, res) => {
  const userId = req.params.userId;
  try {
    await processDeleteProfilePhoto(userId);
    // ⭐️ بعد الحذف من Cloudinary، يجب تحديث سجل المستخدم في MongoDB
    await User.findByIdAndUpdate(userId, {
      avatar:
        process.env.CLOUDINARY_DEFAULT_AVATAR_URL ||
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png", // تعيين الصورة الافتراضية
    });
    const user = await User.findById(userId);
    res
      .status(200)
      .json({
        message: "Profile picture deleted successfully.",
        avatar: user.avatar,
      });
  } catch (error) {
    return handleError(res, error);
  }
};
//==============================delete user (galler - customers - profile photo )=====================
const deleteUser = async (req, res) => {
  const userId = req.params.userId;
  try {
    //1-delete gallery from mongoo and cloudinary
    await processDeleteAllImages(userId);
    //2- delete customers
    await processdeleteAllCustomers(userId);
    // 3- delete profile photo
    await processDeleteProfilePhoto(userId);
    // 4- delete user
    await User.findByIdAndDelete(userId);
    // 5. مسح الـ Cookie/Token لضمان تسجيل الخروج الفوري
    res.cookie("token", "", { httpOnly: true, expires: new Date(0) });

    // 5. إرسال رد النجاح
    res.status(200).json({
      message:
        "✅ User, profile picture, and all gallery images deleted successfully.",
    });
  } catch (error) {
    return handleError(res, error);
  }
};
module.exports = {
  getUser,
  updateProfilePhoto,
  deleteUser,
  deleteProfilePhoto,
};
