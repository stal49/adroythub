const { ObjectId } = require("mongodb");
const { getNotificationCollection } = require("../models/notificationModel");

/**
 * Get all notifications (admin only)
 */
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await getNotificationCollection();
    const allNotifications = await notifications
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      notifications: allNotifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Update notification status
 */
exports.updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const notifications = await getNotificationCollection();
    const result = await notifications.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!result.value) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      notification: result.value,
    });
  } catch (error) {
    console.error("Error updating notification:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
