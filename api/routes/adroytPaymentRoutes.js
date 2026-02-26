const express = require("express");
const { isAuthenticated } = require("../middleware/authMiddleware");
const {
  createOrder,
  verifyPayment,
  getOrders,
  getPayments,
  checkServiceStatus
} = require("../controllers/adroytPaymentController");

const router = express.Router();

// Public health check route (no authentication required)
router.get("/check", checkServiceStatus);

// Adroyt Payment API routes (with authentication)
router.post("/create-order", isAuthenticated, createOrder);
router.post("/verify-payment", isAuthenticated, verifyPayment);
router.get("/orders", isAuthenticated, getOrders);
router.get("/payments", isAuthenticated, getPayments);

module.exports = router;
