const handleError = (res, error) => {
  console.error("API Error:", error); // تسجيل الخطأ في الـ console لـ debugging
  res.status(500).json({
    message: "An internal server error occurred.",
    error: error.message,
  });
};

module.exports =  handleError