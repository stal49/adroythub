const { getFCMTokensCollection } = require("../models/fcmTokenModel");

/**
 * Cleanup inactive FCM tokens
 * Removes tokens that:
 * - Haven't been used in 30+ days
 * - Are marked as inactive
 * - Have invalid format
 */
const cleanupInactiveTokens = async () => {
  try {
    const fcmTokens = await getFCMTokensCollection();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Mark tokens as inactive if not used in 30 days
    const result1 = await fcmTokens.updateMany(
      {
        isActive: true,
        lastUsed: { $lt: thirtyDaysAgo },
      },
      {
        $set: {
          isActive: false,
          updatedAt: new Date(),
        },
      }
    );

    // Mark devices as offline if no activity for 3 minutes (server-side timeout)
    // This handles edge cases where Socket.IO disconnect didn't fire
    // Uses longer timeout (3 min) to account for network delays
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);
    const result2 = await fcmTokens.updateMany(
      {
        isOnline: true,
        lastSeen: { $lt: threeMinutesAgo },
        // Only mark offline if socketId is null (no active socket connection)
        // If socketId exists, Socket.IO will handle disconnect
        $or: [
          { socketId: null },
          { socketId: { $exists: false } }
        ]
      },
      {
        $set: {
          isOnline: false,
          socketId: null,
          updatedAt: new Date(),
        },
      }
    );

    // Delete tokens that are inactive and haven't been used in 60 days
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const result3 = await fcmTokens.deleteMany({
      isActive: false,
      lastUsed: { $lt: sixtyDaysAgo },
    });

    console.log(`🧹 FCM Cleanup completed:
      - Marked ${result1.modifiedCount} tokens as inactive (30+ days old)
      - Marked ${result2.modifiedCount} devices as offline (no heartbeat)
      - Deleted ${result3.deletedCount} old inactive tokens (60+ days old)`);

    return {
      markedInactive: result1.modifiedCount,
      markedOffline: result2.modifiedCount,
      deleted: result3.deletedCount,
    };
  } catch (error) {
    console.error("Error in FCM cleanup:", error);
    // Do not re-throw, just log the error so the server keeps running
    // throw error; 
  }
};

/**
 * Start cleanup cron job
 * Runs every hour
 */
const startCleanupCron = () => {
  // Run immediately on start
  cleanupInactiveTokens();

  // Then run every hour
  setInterval(() => {
    cleanupInactiveTokens();
  }, 60 * 60 * 1000); // 1 hour

  console.log("✅ FCM cleanup cron job started (runs every hour)");
};

module.exports = {
  cleanupInactiveTokens,
  startCleanupCron,
};

