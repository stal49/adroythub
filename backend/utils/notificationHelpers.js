const { sendNotificationToUser } = require("../controllers/notificationController");

/**
 * Send notification to a specific user (all their devices)
 * @param {string|ObjectId} userId - Target user ID
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Optional custom data
 * @param {boolean} sendToOnlineOnly - If true, only send to devices with website open
 * @returns {Promise<object>} - Result with sent/failed counts
 */
const notifyUser = async (userId, title, body, data = {}, sendToOnlineOnly = false) => {
  try {
    return await sendNotificationToUser(userId, title, body, data, sendToOnlineOnly);
  } catch (error) {
    console.error(`Error sending notification to user ${userId}:`, error);
    throw error;
  }
};

/**
 * Send notification to all users
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Optional custom data
 * @param {boolean} sendToOnlineOnly - If true, only send to devices with website open
 * @returns {Promise<object>} - Result with sent/failed counts
 */
const notifyAllUsers = async (title, body, data = {}, sendToOnlineOnly = false) => {
  try {
    return await sendNotificationToUser(null, title, body, data, sendToOnlineOnly);
  } catch (error) {
    console.error("Error sending notification to all users:", error);
    throw error;
  }
};

/**
 * Send notification to all members of a batch
 * @param {string|ObjectId} batchId - Target batch ID
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Optional custom data
 * @param {boolean} sendToOnlineOnly - If true, only send to devices with website open
 * @returns {Promise<object>} - Result with sent/failed counts
 */
const notifyBatch = async (batchId, title, body, data = {}, sendToOnlineOnly = false) => {
  try {
    const { getBatchEnrollmentsCollection } = require("../models/batchModel");
    const { ObjectId } = require("mongodb");
    
    const enrollments = await getBatchEnrollmentsCollection();
    const batchEnrollments = await enrollments
      .find({ 
        batchId: batchId,
        status: 'enrolled' 
      })
      .toArray();

    if (batchEnrollments.length === 0) {
      return {
        success: true,
        message: "No enrolled users found in batch",
        batchId,
        totalUsers: 0,
        totalDevices: 0,
        sent: 0,
        failed: 0,
      };
    }

    // Get unique user IDs
    const userIds = [...new Set(batchEnrollments.map(e => e.userId.toString()))];

    // Send notification to each user
    let totalSent = 0;
    let totalFailed = 0;
    let totalDevices = 0;
    const results = [];

    for (const userId of userIds) {
      try {
        const result = await sendNotificationToUser(
          userId,
          title,
          body,
          { ...data, batchId },
          sendToOnlineOnly
        );
        
        totalSent += result.sentTo;
        totalFailed += result.failed;
        totalDevices += result.onlineDevices + result.offlineDevices;
        results.push({
          userId,
          ...result,
        });
      } catch (error) {
        console.error(`Error sending to user ${userId}:`, error);
        totalFailed++;
        results.push({
          userId,
          success: false,
          error: error.message,
        });
      }
    }

    return {
      success: true,
      message: "Notification sent to batch members",
      batchId,
      totalUsers: userIds.length,
      totalDevices,
      sent: totalSent,
      failed: totalFailed,
      results,
    };
  } catch (error) {
    console.error(`Error sending notification to batch ${batchId}:`, error);
    throw error;
  }
};

module.exports = {
  notifyUser,
  notifyAllUsers,
  notifyBatch,
};

