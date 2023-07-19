const express = require("express");
const adminRouter = express.Router();
const app = express();

app.use(express.json({ limit: "50mb" }));
const auth = require("../middleware/auth");
const adminLogin = require('../controllers/admin/adminLogin')
const admin = require('../controllers/admin/admin')
//for extra charges
const ExtraCharges = require('../controllers/charges/charges')

adminRouter.post("/admin/login", adminLogin);

adminRouter.get("/admin/getAdmin", auth, admin.getAdmin)
adminRouter.get("/admin/getShopUser", auth, admin.getShopUser)
adminRouter.get("/admin/getShopUserById/:id", auth, admin.getShopUserById)
adminRouter.get("/admin/getServiceUser", auth, admin.getServiceUser)
adminRouter.get("/admin/getCustomer", auth, admin.getCustomer)
adminRouter.get("/admin/getEmployee", auth, admin.getEmployee)
// get uploaded document for servicerUsr,shpopuser,employee,
adminRouter.get("/admin/getShopUserDoc/:id",auth,admin.getShopUserDoc)
adminRouter.get("/admin/getServiceUserDoc/:id",auth,admin.getServiceUserDoc)

//update to verify uploaded document
adminRouter.patch("/admin/updateShopUserDoc/:id",auth,admin.verifyShopUserDoc)

// update and delete 
adminRouter.patch("/admin/updateShopUser/:id", auth, admin.updateShopUser)
adminRouter.delete("/admin/deleteShopUser/:id", auth, admin.deleteShopUser)

adminRouter.patch("/admin/updateServiceUser/:id", auth, admin.updateServiceUser)
adminRouter.delete("/admin/deleteServiceUser/:id", auth, admin.deleteServiceUser)

adminRouter.patch("/admin/updateCustomer/:id", auth, admin.updateCustomer)
adminRouter.delete("/admin/deleteCustomer/:id", auth, admin.deleteCustomer)

adminRouter.patch("/admin/updateEmployee/:id", auth, admin.updateEmployee)
adminRouter.delete("/admin/deleteEmployee/:id", auth, admin.deleteEmployee)

// for Order from shopUser
adminRouter.get("/admin/getShopOrder/:id", auth, admin.getShopOrder)

// for product from shopUser
adminRouter.get("/admin/getShopProduct/:id", auth, admin.getShopProduct)

//for update and delete shopUser orders
adminRouter.patch("/admin/updateShopOrder/:id", auth, admin.updateShopOrder)
adminRouter.delete("/admin/deleteShopOrder/:id", auth, admin.deleteShopOrder)
//for update shop order status 
adminRouter.patch("/admin/updateShopOrderStatus/:id", auth, admin.updateShopOrderStatus)


// for update and delete shopUser Products
adminRouter.patch("/admin/updateShopProduct/:id", auth, admin.updateShopProduct)
adminRouter.delete("/admin/deleteShopProduct/:id", auth, admin.deleteShopProduct)

// for get payment request getpayoutRequest

adminRouter.get("/admin/getpayoutRequest", auth, admin.getpayoutRequest)
adminRouter.patch("/admin/updatepayoutRequest",auth,admin.updatepayoutRequest)
adminRouter.patch("/admin/updatedecriptionpayoutRequest",auth,admin.updatedescriptionpayoutRequest)
// for contactus query
adminRouter.post("/admin/contactus",admin.contactus)

// for dasboard total cout
adminRouter.get("/admin/getTotalOrders",auth,admin.totalOrders)
adminRouter.get("/admin/getTotalOrdersPending",auth,admin.totalOrdersPending)
adminRouter.get("/admin/getTotalOrdersConfirmed",auth,admin.totalOrdersConfirmed)
adminRouter.get("/admin/getTotalOrdersCancelled",auth,admin.totalOrdersCancelled)
adminRouter.get("/admin/getTotalOrdersDelivered",auth,admin.totalOrdersDelivered)

//routes for extra charges
adminRouter.post("/createExtraCharge",ExtraCharges.createExtraCharges)
adminRouter.post("/updateExtraCharge",auth,ExtraCharges.updateExtraCharges)
adminRouter.get("/getExtraCharge",ExtraCharges.getExtraCharges)

module.exports = adminRouter;

