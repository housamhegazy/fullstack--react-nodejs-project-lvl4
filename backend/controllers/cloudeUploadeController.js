const ImageModel = require("../models/galleryModel");
const { cloudinary, streamUpload } = require("../config/cloudinaryConfig");
const archiver = require("archiver"); // 1. استيراد archiver
const axios = require("axios"); // استيراد axios
// ********************** تعريف دالة handleError هنا **********************
const {handleError} = require("../utils/errorMiddleware");
// to compresse photos before upload
const sharp = require("sharp");

const uploadImage = async (req, res) => {
  if (!req.file) {
    console.error("File missing in request.");
    return res.status(400).json({ message: "لم يتم إرسال ملف الصورة." });
  }
  try {
    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ message: "معرف المستخدم (userId) مطلوب." });
    }

    //================== compresse photos==============================================
    const processedBuffer = await sharp(req.file.buffer) // أو file.buffer
      .resize(800) // 1. تغيير العرض إلى 800 بكسل (الطول يتغير تلقائياً)
      .webp({ quality: 80 }) // 2. تحويل التنسيق إلى WebP وضغط الجودة إلى 80%
      .toBuffer(); // 3. إرجاع النتيجة كـ Buffer جديد

    //=================== upload to cloudinary ========================================
    const uniquePublicId = `${userId}-${Date.now()}`;
    const result = await streamUpload(processedBuffer, {
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
};

const uploadmanyImages = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    console.error("No files received in request.");
    return res.status(400).json({ message: "لم يتم إرسال أي صور." });
  }

  const userId = req.body.userId;
  const uploadedResults = [];
  try {
    if (!userId) {
      return res.status(400).json({ message: "معرف المستخدم (userId) مطلوب." });
    }

    //============= make uniqu Id to every photo ===============================
    for (const file of req.files) {
      const uniquePublicId = `${userId}-${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`;
      //================ compress all photos ======================================
      const processedBuffer = await sharp(file.buffer)
        .resize(800) //
        .webp({ quality: 80 })
        .toBuffer();
      // ============== رفع الصورة إلى Cloudinary ==================================
      const result = await streamUpload(processedBuffer, {
        folder: `mernstack/gallery/${userId}`, // مجلد مخصص لكل مستخدم
        public_id: uniquePublicId,
        upload_preset: "gallery_preset",
      });

      // ============== حفظ بيانات الصورة في MongoDB ================
      const newImage = new ImageModel({
        owner: userId,
        imageUrl: result.secure_url,
        public_id: result.public_id,
      });
      await newImage.save();

      // إضافة بيانات الصورة التي تم رفعها إلى مصفوفة النتائج
      uploadedResults.push({
        imageUrl: result.secure_url,
        publicId: result.public_id,
      });
    }

    // 4. ✅ إرسال استجابة بنجاح ومصفوفة بجميع الروابط
    res.status(200).json({
      message: `✅ تم رفع وحفظ ${uploadedResults.length} صورة بنجاح.`,
      images: uploadedResults,
    });
  } catch (err) {
    console.error("Batch Upload Error:", err);
    res.status(500).json({ message: "حدث خطأ أثناء رفع الصور إلى Cloudinary" });
  }
};

// router.get("/api/allImages/:userId?page=1&limit=9&order=desc", getImages);
const getImages = async (req, res) => {
  // 1. pagination Query
  const page = parseInt(req.query.page) || 1; // رقم الصفحة الافتراضي هو 1
  const limit = parseInt(req.query.limit) || 9; // عدد العناصر في الصفحة، الافتراضي 9
  const userId = req.params.userId;
  const skip = (page - 1) * limit; // حساب عدد العناصر التي سيتم تخطيها

  // 1. sorting and filtering Query
  const sortField = req.query.sort || "createdAt"; // الفرز الافتراضي: تاريخ الإنشاء
  const sortOrder = req.query.order === "asc" ? 1 : -1; // -1 تنازلي (الأحدث أولاً)، 1 تصاعدي

  let filter = { owner: userId };
  try {
    // اولا نحسب اجمالي عدد الصور 
    const totalImages = await ImageModel.countDocuments(filter);
    // التحقق من عدم وجود صور قبل الجلب لتجنب العمل غير الضروري
    if (totalImages === 0 && page === 1) {
      return res
        .status(404)
        .json({ message: "No Photos for this User" });
    }

    // ⭐️ الخطوة 2: استعلام موحد يطبق الفرز والتقسيم
    const images = await ImageModel.find(filter)
      .sort({ [sortField]: sortOrder }) // ✅ تطبيق الفرز الذي تم تحديده
      .skip(skip) // ✅ تطبيق التخطي
      .limit(limit); // ✅ تطبيق الحد

    // ⭐️ الخطوة 3: إرسال الرد
    res.status(200).json({
      message: "✅ تم استرجاع الصور بنجاح.",
      images: images, // ✅ استخدام النتيجة الصحيحة
      currentPage: page,
      totalPages: Math.ceil(totalImages / limit),
      totalImages: totalImages,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const deleteImage = async (req, res) => {
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
    const cloudinaryResponse = await cloudinary.uploader.destroy(owner);
    res.status(200).json({
      message: "تم حذف الصورة من Cloudinary وقاعدة البيانات بنجاح.",
      cloudinaryResult: cloudinaryResponse.result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const deleteAllImages = async (req, res) => {
  const owner = req.params.owner; // (user._id)
  // المسار في Cloudinary الذي يحتوي على جميع صور المستخدم
  const folderPath = `mernstack/gallery/${owner}`;
  try {
    // 2. ✅ الحذف من Cloudinary
    const cloudinaryResponse = await cloudinary.api.delete_resources_by_prefix(
      folderPath,
      { resource_type: "image" }
    );
    const deletedImages = await ImageModel.deleteMany({ owner: owner });
    // يمكننا التحقق من عدد الصور المحذوفة: deletedImages.deletedCount
    if (
      deletedImages.deletedCount === 0 &&
      cloudinaryResponse.deleted.length === 0
    ) {
      return res
        .status(404)
        .json({ message: "لا توجد صور لحذفها لهذا المستخدم." });
    }

    res.status(200).json({
      message: "✅ تم حذف جميع الصور من Cloudinary وقاعدة البيانات بنجاح.",
      dbResult: deletedImages.deletedCount,
      cloudinaryResult: cloudinaryResponse,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

//========================== download image ======================================
const downloadImage = async (req, res) => {
  // 1. فك تشفير Public ID (كما كان صحيحاً)
  const publicId = decodeURIComponent(req.params.publicId);

  try {
    const image = await ImageModel.findOne({ public_id: publicId });

    if (!image) {
      return res
        .status(404)
        .json({ message: "لم يتم العثور على الصورة للتحميل." });
    }

    // 2. توليد رابط الصورة المباشر (بدون flags: attachment)
    const imageUrl = cloudinary.url(image.public_id, {
      resource_type: "image",
    });

    // 3. ⭐️ الخطوة الحاسمة: جلب الملف من Cloudinary باستخدام Axios
    const response = await axios({
      url: imageUrl,
      method: "GET",
      responseType: "stream", // مهم جداً لجلب الملف كـ Stream
    });

    // 4. تحديد اسم الملف المطلوب
    const originalFileName = publicId.split("/").pop();
    const suggestedFileName = `downloaded-${originalFileName}.webp`; // أو .png/.jpg حسب صيغة الرفع

    // 5. ⭐️ إرسال ترويسة Content-Disposition القسرية
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${suggestedFileName}"`
    );

    // 6. إرسال نوع المحتوى
    res.setHeader(
      "Content-Type",
      response.headers["content-type"] || "image/webp"
    );

    // 7. بث الملف (Streaming) إلى المتصفح مباشرةً
    response.data.pipe(res);
  } catch (error) {
    console.error("Download Error (Streaming):", error);
    return handleError(res, error);
  }
};

//========================== download all images ======================================
// npm install archiver
const downloadAll = async (req, res) => {
  const userId = req.params.userId;
  // المسار في Cloudinary الذي يحتوي على جميع صور المستخدم
  const folderPath = `mernstack/gallery/${userId}`;
  try {
    // 1. جلب جميع الصور للمستخدم من قاعدة البيانات
    const images = await ImageModel.find({ owner: userId }).select("public_id");
    if (!images.length === 0) {
      return res.status(404).json({ message: "لا توجد صور متاحة للتحميل." });
    }
    // 2. إعداد ترويسات الاستجابة (Headers)
    const archive = archiver("zip", {
      zlib: { level: 9 }, // مستوى ضغط عالي
    });
    const zipFileName = `gallery-backup-${userId}.zip`;
    //  تحديد نوع المحتوى وترويسة اسم الملف للمتصفح
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${zipFileName}"`
    );

    // 3. ربط ملف الـ ZIP بالاستجابة (Streaming)
    archive.pipe(res);
    // 4. تكرار لجلب كل صورة وإضافتها إلى الملف المضغوط
    for (const image of images) {
      const publicId = image.public_id;

      // توليد رابط الصورة المباشر من Cloudinary
      const imageUrl = cloudinary.url(publicId, { resource_type: "image" });

      // جلب الصورة كـ Stream باستخدام Axios
      const response = await axios({
        url: imageUrl,
        method: "GET",
        responseType: "stream",
      });

      // استخراج اسم الملف النهائي (بدون مسار المجلدات)
      const fileName = publicId.split("/").pop() + ".webp";

      // إضافة Stream الصورة إلى ملف الـ ZIP
      archive.append(response.data, { name: fileName });
    }

    // 5. إنهاء عملية الضغط وإرسال الـ ZIP إلى المتصفح
    await archive.finalize();
  } catch (error) {
    console.error("Download All Error:", error);
    // في حالة حدوث خطأ، يجب إنهاء الاتصال لمنع توقف المتصفح
    if (!res.headersSent) {
      return handleError(res, error);
    } else {
      res.end();
    }
  }
};
module.exports = {
  uploadImage,
  getImages,
  deleteImage,
  deleteAllImages,
  uploadmanyImages,
  downloadImage,
  downloadAll,
};
