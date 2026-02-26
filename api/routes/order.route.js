const express = require("express");
const { isAuthenticated, authorizeRoles } = require("../middleware/authMiddleware");
const { createOrder, getAllOrders, sendStripePublishableKey, newPayment } = require("../controllers/orderController");
const orderRouter = express.Router();

orderRouter.post("/create-order", isAuthenticated, createOrder);

orderRouter.get("/get-orders", isAuthenticated, authorizeRoles("admin"), getAllOrders);

orderRouter.get("/payment/stripepublishablekey", sendStripePublishableKey);

orderRouter.post("/payment", isAuthenticated, newPayment);

module.exports = orderRouter;
