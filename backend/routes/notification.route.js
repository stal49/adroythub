const express = require("express");
const {
  getNotifications,
  updateNotification,
} = require("../controllers/notificationController");
const { isAuthenticated, authorizeRoles } = require("../middleware/authMiddleware");

const notificationRouter = express.Router();

// Get all notifications (admin only)
notificationRouter.get(
  "/get-all-notifications",
  isAuthenticated,
  authorizeRoles("admin"),
  getNotifications
);

// Update notification status (admin only)
notificationRouter.put(
  "/update-notification/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  updateNotification
);

module.exports = notificationRouter;
