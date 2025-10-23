const express = require("express");
const router = express.Router();
const CustomerModel = require("../models/customesSchema"); // استيراد نموذج العميل
// ********************** تعريف دالة handleError هنا **********************
const {handleError} = require("../utils/errorMiddleware");
// **************************************************************************


//search function
router.get("/api/search", async (req, res) => {
  try {
    const searchValue = req.query.svalue;
    if (!searchValue) {
      // 2. إذا لم يتم تقديم قيمة للبحث، يمكنك إما:
      //    أ. إرجاع جميع المستخدمين (إذا كان هذا هو السلوك المطلوب لصفحة البحث الفارغة)
      //    ب. إرجاع مصفوفة فارغة أو رسالة تفيد بعدم وجود استعلام
      // const allUsers = await CustomerModel.find({});
      // return res.status(200).json(allUsers);
      // أو:
      return res
        .status(200)
        .json({ message: "Please provide a search query." });
    }
    const customer = await CustomerModel.find({
      $and: [
        { owner: req.user.id }, // شرط الملكية: يجب أن يكون المالك هو المستخدم الحالي
        {
          $or: [
            { firstName: { $regex: searchValue, $options: "i" } },
            { lastName: { $regex: searchValue, $options: "i" } },
            { email: { $regex: searchValue, $options: "i" } },
            { phoneNumber: { $regex: searchValue, $options: "i" } },
            { country: { $regex: searchValue, $options: "i" } },
          ],
        },
      ],
    }); // Fetch all users
    res.status(200).json(customer); // 200 OK
  } catch (error) {
    return handleError(res, error);
  }
});

module.exports = router;
