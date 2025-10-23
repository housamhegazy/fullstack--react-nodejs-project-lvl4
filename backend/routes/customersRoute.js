const express = require("express");
const router = express.Router();
//==================== import controllers =========================
const {
  getCustomers,
  getCustomerById,
  getCustomerInEditPage,
  addNewCustomer,
  updateCustomer,
  deleteCustomer,
  deleteAllCustomers
} = require("../controllers/customersController");
// 2. Route to Get All Users (GET)
router.get("/api/allcustomers/:userId", getCustomers);
// 3. Route to Get one User (GET)
router.get("/api/allcustomers/:customerId/:userId", getCustomerById);
// 4. Route to open one customer in edit page (GET)
router.get("/api/edit/:id", getCustomerInEditPage);
// مسار لإضافة مستخدم جديد (POST)
router.post("/api/addcustomers", addNewCustomer);
//5--update funct
router.put("/api/editcustomer/:id", updateCustomer);

//6-delete function
router.delete("/api/deletecustomer/:customerId/:userId", deleteCustomer);
router.delete("/api/deleteallcustomers/:userId", deleteAllCustomers);
module.exports = router;
