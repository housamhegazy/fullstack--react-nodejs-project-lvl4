const express = require("express");
const router = express.Router();
//==================== import controllers =========================
const {getCustomers ,getCustomerById,getCustomerInEditPage,addNewCustomer,updateCustomer,deleteCustomer} = require("../controllers/customersController")
// 2. Route to Get All Users (GET)
router.get("/api/allcustomers", getCustomers);
// 3. Route to Get one User (GET)
router.get("/api/allcustomers/:id", getCustomerById);
// 4. Route to open one customer in edit page (GET)
router.get("/api/edit/:id", getCustomerInEditPage);
// مسار لإضافة مستخدم جديد (POST)
router.post("/api/addcustomers", addNewCustomer);
//5--update funct
router.put("/api/editcustomer/:id", updateCustomer);

//6-delete function
router.delete("/api/allcustomers/:id", deleteCustomer);
module.exports = router;
