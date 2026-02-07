const { getFCMTokensCollection } = require("../models/fcmTokenModel");

/**
 * Server-side timeout to mark devices offline
 * Runs more frequently than cleanup (every 2 minutes)
 * Handles edge cases where Socket.IO disconnect didn't fire
 * 
 * This is part of the hybrid heartbeat approach:
 * - Primary: Socket.IO ping/pong (automatic, zero HTTP)
 * - Backup: Server-side timeout (this function)
 * - Fallback: HTTP heartbeat (optional, longer interval)
 */
const markInactiveDevicesOffline = async () => {
  try {
    const fcmTokens = await getFCMTokensCollection();
    
    // Mark devices offline if no activity for 3 minutes
    // This is longer than Socket.IO ping interval to account for network delays
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);
    
    const result = await fcmTokens.updateMany(
      {
        isOnline: true,
        lastSeen: { $lt: threeMinutesAgo },
        // Only mark offline if no active socket connection
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

    if (result.modifiedCount > 0) {
      console.log(`⏱️ Server-side timeout: Marked ${result.modifiedCount} device(s) as offline (no activity for 3+ minutes)`);
    }

    return {
      markedOffline: result.modifiedCount,
    };
  } catch (error) {
    console.error("Error in device timeout:", error);
    throw error;
  }
};

/**
 * Start device timeout cron job
 * Runs every 2 minutes (more frequent than cleanup)
 * This ensures devices are marked offline quickly if Socket.IO disconnect didn't fire
 */
const startDeviceTimeoutCron = () => {
  // Run immediately on start
  markInactiveDevicesOffline();

  // Then run every 2 minutes
  const interval = setInterval(() => {
    markInactiveDevicesOffline();
  }, 2 * 60 * 1000); // 2 minutes

  console.log("✅ Device timeout cron job started (runs every 2 minutes)");

  // Return interval so it can be cleared if needed
  return interval;
};

module.exports = {
  markInactiveDevicesOffline,
  startDeviceTimeoutCron,
};

