const CustomerModel = require("../models/customesSchema"); // استيراد نموذج المستخدم
// ********************** تعريف دالة handleError هنا **********************
const { handleError } = require("../utils/errorMiddleware");
// **************************************************************************
const getCustomers = async (req, res) => {
  try {
    const users = await CustomerModel.find({ owner: req.params.userId }); // Fetch all users
    res.status(200).json(users); // 200 OK
  } catch (error) {
    return handleError(res, error);
  }
};

const getCustomerById = async (req, res) => {
  try {
    const customer = await CustomerModel.findOne({
      _id: req.params.customerId,
      owner: req.params.userId,
    }); // Fetch all users
    res.status(200).json(customer); // 200 OK
  } catch (error) {
    return handleError(res, error);
  }
};

const getCustomerInEditPage = async (req, res) => {
  try {
    const customer = await CustomerModel.findOne({
      _id: req.params.id,
      owner: req.user.id,
    }); // Fetch one customer
    res.status(200).json(customer); // 200 OK
  } catch (error) {
    return handleError(res, error);
  }
};

const addNewCustomer = async (req, res) => {
  // 1. استخراج بيانات المستخدم من الطلب
  const {customerData,userId} = req.body;

  // 2. دمج هوية المستخدم مع بيانات العميل
  // نفترض أن نموذج العميل يحتوي على حقل باسم 'owner' أو 'createdBy'
  const newUser = new CustomerModel({
    ...customerData,
    owner: userId, // نفترض أن التوكن يحتوي على { user: { id: '...' } }
    // تأكد من أن الحقل الذي يخزن المالك موجود في نموذج CustomerModel
  });
  try {
    await newUser.save();
    res.status(201).send(newUser); // 201 Created
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error (e.g., email already exists)
      return res.status(400).send({ message: "Email already registered." });
    }
    res.status(400).send(error); // 400 Bad Request if validation fails
  }
};

const updateCustomer = async (req, res) => {
  const { id } = req.params; // جلب الـ id من المعاملات
  const updatedData = req.body; // جلب البيانات المراد تحديثها من جسم الطلب
  try {
    const customer = await CustomerModel.findOneAndUpdate(
      { _id: id, owner: req.user.id },
      updatedData,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    res.status(200).json(customer); // إرجاع المستخدم المحدّث
  } catch (error) {
    return handleError(res, error);
  }
};

const deleteCustomer = async (req, res) => {
  const customerId = req.params.customerId;
  const owner = req.params.userId;
  console.log(customerId,owner);
  try {
    const customer = await CustomerModel.findOneAndDelete({
      _id: customerId,
      owner: owner,
    }); // Fetch all users
    res.status(200).json(customer); // 200 OK
  } catch (error) {
    return handleError(res, error);
  }
};

const processdeleteAllCustomers = async (userId) => {
  const deletedcustomers = await CustomerModel.deleteMany({ owner: userId });
};
const deleteAllCustomers = async (req, res) => {
  const userId = req.params.userId;
  try {
    await processdeleteAllCustomers(userId);
    res.status(200).json({ message: "customers deleted succesfully" }); // 200 OK
  } catch (error) {
    return handleError(res, error);
  }
};
module.exports = {
  getCustomers,
  getCustomerById,
  getCustomerInEditPage,
  addNewCustomer,
  updateCustomer,
  deleteCustomer,
  processdeleteAllCustomers,
  deleteAllCustomers,
};
