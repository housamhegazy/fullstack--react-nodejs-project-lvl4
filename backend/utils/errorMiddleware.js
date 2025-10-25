// errorMiddleware.js

// دالة معالجة الأخطاء العامة التي استخدمتها داخل try...catch
const handleError = (res, error) => {
    console.error("API Error:", error);
    let statusCode = 500;
    let message = "An internal server error occurred.";

    // يمكنك إضافة منطق تخصيص الأخطاء (مثل Mongoose Validation) هنا
    if (error.name === 'ValidationError') {
        statusCode = 400; 
        message = Object.values(error.errors).map(val => val.message).join(' | ');
    } else if (error.code && error.code === 11000) {
        statusCode = 400; 
        message = `Duplicate field value entered: ${Object.keys(error.keyValue)} is already taken.`;
    }

    res.status(statusCode).json({
        message: message,
        errorDetails: process.env.NODE_ENV === 'production' ? null : error.message,
    });
};


// ----------------------------------------------------------------------

// دالة لمعالجة المسارات غير الموجودة (404 Not Found)
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error); // تمرير الخطأ إلى دالة معالج الأخطاء النهائية
};


// ----------------------------------------------------------------------

// دالة معالجة الأخطاء النهائية لـ Express (تستخدم 4 وسائط)
const errorHandler = (err, req, res, next) => {
    // تحديد رمز الحالة: إذا كانت الاستجابة 200 (مما يعني أن الخطأ حدث بعد إرسال الهيدر)، نستخدم 500
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);

    res.json({
        message: err.message,
        // عرض الـ stack trace فقط في وضع التطوير
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

// تصدير جميع الدوال
module.exports = {
    handleError,
    notFound,
    errorHandler,
};