const express = require("express");
const { isAuthenticated, authorizeRoles } = require("../middleware/authMiddleware");
const { getUsersAnalytics, getOrderAnalytics, getCoursesAnalytics } = require("../controllers/analyticsController");
const analyticsRouter = express.Router();

analyticsRouter.get(
  "/get-users-analytics",
  isAuthenticated,
  authorizeRoles("admin"),
  getUsersAnalytics
);

analyticsRouter.get(
  "/get-orders-analytics",
  isAuthenticated,
  authorizeRoles("admin"),
  getOrderAnalytics
);

analyticsRouter.get(
  "/get-courses-analytics",
  isAuthenticated,
  authorizeRoles("admin"),
  getCoursesAnalytics
);

module.exports = analyticsRouter;
