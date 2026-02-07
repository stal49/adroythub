const { ObjectId } = require("mongodb");
const { getPlansCollection } = require("../models/planModel");
const { getPurchasesCollection } = require("../models/purchaseModel");
const { getSsbUserCollection } = require("../models/userModel");
const { assignFreeTrial } = require("./trialService");

/**
 * Assign free trial plan to all eligible existing users
 * This runs in the background when admin activates a free trial plan
 * 
 * @param {ObjectId} planId - The free trial plan ID that was just activated
 * @returns {Promise<Object>} Result with stats
 */
async function assignFreeTrialToExistingUsers(planId) {
  try {
    console.log(`🚀 Starting background assignment of free trial plan ${planId} to existing users...`);

    const plansCollection = await getPlansCollection();
    const plan = await plansCollection.findOne({ _id: new ObjectId(planId) });

    if (!plan) {
      return {
        success: false,
        error: "Plan not found"
      };
    }

    if (!plan.is_free_trial_plan || !plan.active) {
      return {
        success: false,
        error: "Plan is not an active free trial plan"
      };
    }

    const usersCollection = await getSsbUserCollection();
    const purchasesCollection = await getPurchasesCollection();

    // Get all users who:
    // 1. Have trial_consumed = false (or null/undefined)
    // 2. Don't have an active free trial already
    // 3. Don't have any paid plan purchases
    const allUsers = await usersCollection.find({
      $or: [
        { trial_consumed: { $ne: true } },
        { trial_consumed: { $exists: false } }
      ]
    }).toArray();

    console.log(`📊 Found ${allUsers.length} potential users for free trial assignment`);

    let assigned = 0;
    let skipped = 0;
    let errors = 0;

    // Process users in batches to avoid overwhelming the database
    const batchSize = 50;
    for (let i = 0; i < allUsers.length; i += batchSize) {
      const batch = allUsers.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (user) => {
          try {
            const userId = user._id;

            // Check if user already has an active trial
            const existingTrial = await purchasesCollection.findOne({
              userId: userId,
              isFreeTrial: true,
              isActive: true
            });

            if (existingTrial) {
              skipped++;
              return;
            }

            // Check if user has any paid plan purchases
            const paidPurchase = await purchasesCollection.findOne({
              userId: userId,
              isFreeTrial: false
            });

            if (paidPurchase) {
              skipped++;
              return;
            }

            // Assign free trial
            const result = await assignFreeTrial(userId);

            if (result.success) {
              assigned++;
              console.log(`✅ Assigned free trial to user ${userId}`);
            } else {
              skipped++;
              console.log(`⚠️ Skipped user ${userId}: ${result.error}`);
            }
          } catch (error) {
            errors++;
            console.error(`❌ Error processing user ${user._id}:`, error.message);
          }
        })
      );
    }

    console.log(`✅ Background assignment completed: ${assigned} assigned, ${skipped} skipped, ${errors} errors`);

    return {
      success: true,
      stats: {
        totalUsers: allUsers.length,
        assigned,
        skipped,
        errors
      }
    };

  } catch (error) {
    console.error("❌ Error in assignFreeTrialToExistingUsers:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  assignFreeTrialToExistingUsers
};
