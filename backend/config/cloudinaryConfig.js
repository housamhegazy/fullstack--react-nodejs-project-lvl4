//للربط بين الكلاودناري والمشروع لرفع واستقبال الصور 
const streamifier = require("streamifier"); // سنحتاج هذه المكتبة لتحويل البفر إلى ستريم
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

//====================== cloudinary config ================================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // اسم السحابة الخاص بك
  api_key: process.env.CLOUDINARY_API_KEY, // مفتاح API الخاص بك
  api_secret: process.env.CLOUDINARY_API_SECRET, // سر API الخاص بك
  secure: true, // يفضل استخدام HTTPS
});
//=============================== store image in memory storage by multer =========================
const storage = multer.memoryStorage();
// ============================== determine file size =============================================
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // مثال: 5 ميغابايت
});
//================================ دالة مساعدة لرفع البفر (Buffer) إلى Cloudinary======================
const streamUpload = (buffer, options) => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    });
    // تحويل البفر في الذاكرة إلى Stream للرفع
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

module.exports = { upload, cloudinary,streamUpload };