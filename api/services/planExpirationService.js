const { ObjectId } = require("mongodb");
const { getPurchasesCollection } = require("../models/purchaseModel");
const { getBatchEnrollmentsCollection, getBatchesCollection } = require("../models/batchModel");
const { getUserChallengeProgressCollection } = require("../models/challengeModel");
const { markTrialConsumed } = require("./trialService");

/**
 * Handle plan expiration - update isActive status and handle challenge access
 * 
 * This should be called:
 * 1. Periodically via cron job (e.g., daily)
 * 2. When checking user access (already done in getUserAccess)
 * 
 * @returns {Promise<Object>} Result with stats
 */
async function handlePlanExpiration() {
  try {
    console.log("🔄 Starting plan expiration check...");

    const purchasesCollection = await getPurchasesCollection();
    const now = new Date();

    // Get all purchases that should be expired (expiresAt <= now but isActive = true)
    // Skip manually deactivated plans (they're already handled by admin removal)
    const expiredPurchases = await purchasesCollection
      .find({
        isActive: true,
        expiresAt: { $lte: now },
        $or: [
          { manuallyDeactivated: { $exists: false } },
          { manuallyDeactivated: false }
        ]
      })
      .toArray();

    console.log(`📊 Found ${expiredPurchases.length} expired purchases to process`);
    let updated = 0;
    let challengesUpdated = 0;
    let trialsConsumed = 0;

    for (const purchase of expiredPurchases) {
      try {
        // Update purchase to inactive
        await purchasesCollection.updateOne(
          { _id: purchase._id },
          {
            $set: {
              isActive: false,
              updatedAt: new Date()
            }
          }
        );

        updated++;

        // If it's a free trial, mark as consumed for the user
        if (purchase.isFreeTrial) {
          console.log(`ℹ️ [handlePlanExpiration] Free trial expired for user ${purchase.userId}, marking as consumed`);
          await markTrialConsumed(purchase.userId);
          trialsConsumed++;
        }

        // Handle batches that were enrolled via plan
        if (purchase.snapshot && purchase.snapshot.batches_free_access) {
          const enrollmentsCollection = await getBatchEnrollmentsCollection();
          const batchesCollection = await getBatchesCollection();
          
          for (const batchId of purchase.snapshot.batches_free_access) {
            try {
              const enrollment = await enrollmentsCollection.findOne({
                userId: purchase.userId,
                batchId: batchId.toString(),
                paymentMethod: 'plan',
                status: 'enrolled'
              });

              if (enrollment) {
                // Check if batch has ended
                const batch = await batchesCollection.findOne({ _id: new ObjectId(batchId) });
                const now = new Date();
                
                if (batch && batch.endDate) {
                  const endDate = new Date(batch.endDate);
                  if (endDate < now) {
                    // Batch ended - keep enrollment for historical purposes
                    console.log(`   ℹ️ Keeping enrollment for ended batch ${batchId} (historical record)`);
                    continue;
                  }
                }
                
                // Batch is ongoing or hasn't started - remove enrollment
                // User will need to pay or have active plan to continue
                await enrollmentsCollection.updateOne(
                  {
                    userId: purchase.userId,
                    batchId: batchId.toString(),
                    paymentMethod: 'plan',
                    status: 'enrolled'
                  },
                  {
                    $set: {
                      status: 'removed',
                      removedAt: new Date(),
                      removedReason: 'plan_expired',
                      updatedAt: new Date()
                    }
                  }
                );

                console.log(`   ⚠️ Removed enrollment for batch ${batchId} (plan expired, batch ongoing)`);
              }
            } catch (batchError) {
              console.error(`   ❌ Error processing batch ${batchId}:`, batchError.message);
            }
          }
        }

        // Handle challenges that were accessed via plan
        // If challenge was paid via plan and not completed, user needs to pay again
        if (purchase.snapshot && purchase.snapshot.challenges_free_access) {
          const progressCollection = await getUserChallengeProgressCollection();
          
          for (const challengeId of purchase.snapshot.challenges_free_access) {
            try {
              const progress = await progressCollection.findOne({
                userId: purchase.userId,
                challengeId: new ObjectId(challengeId),
                paymentMethod: 'plan'
              });

              if (progress && !progress.completedAt) {
                // Challenge not completed - revoke access (mark as unpaid)
                // But keep the progress so user can continue if they pay again
                await progressCollection.updateOne(
                  {
                    userId: purchase.userId,
                    challengeId: new ObjectId(challengeId),
                    paymentMethod: 'plan'
                  },
                  {
                    $set: {
                      isPaid: false,
                      paymentMethod: null,
                      paymentId: null,
                      paidAt: null,
                      updatedAt: new Date()
                    }
                  }
                );

                challengesUpdated++;
                console.log(`   ⚠️ Revoked access to challenge ${challengeId} for user ${purchase.userId} (plan expired, challenge not completed)`);
              }
            } catch (challengeError) {
              console.error(`   ❌ Error processing challenge ${challengeId}:`, challengeError.message);
            }
          }
        }

        console.log(`   ✅ Processed expired purchase ${purchase._id} for user ${purchase.userId}`);
      } catch (error) {
        console.error(`   ❌ Error processing purchase ${purchase._id}:`, error.message);
      }
    }

    // Count batch enrollments removed
    let batchesRemoved = 0;
    try {
      const enrollmentsCollection = await getBatchEnrollmentsCollection();
      const removedEnrollments = await enrollmentsCollection.countDocuments({
        removedReason: 'plan_expired',
        removedAt: { $gte: new Date(Date.now() - 60000) } // Within last minute
      });
      batchesRemoved = removedEnrollments;
    } catch (err) {
      console.error("Error counting removed batch enrollments:", err);
    }

    console.log(`✅ Plan expiration check completed: ${updated} purchases updated, ${challengesUpdated} challenges revoked, ${batchesRemoved} batch enrollments removed, ${trialsConsumed} trials marked consumed`);

    return {
      success: true,
      stats: {
        expiredPurchases: expiredPurchases.length,
        updated,
        challengesUpdated,
        batchesRemoved,
        trialsConsumed
      }
    };

  } catch (error) {
    console.error("❌ Error in handlePlanExpiration:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check and update a specific user's plan expiration status
 * 
 * @param {ObjectId|string} userId - User ID
 * @returns {Promise<Object>} Result
 */
async function checkUserPlanExpiration(userId) {
  try {
    const userIdObj = userId instanceof ObjectId ? userId : new ObjectId(userId);
    const purchasesCollection = await getPurchasesCollection();
    const now = new Date();

    // Get user's purchases that should be expired
    // Skip manually deactivated plans
    const expiredPurchases = await purchasesCollection
      .find({
        userId: userIdObj,
        isActive: true,
        expiresAt: { $lte: now },
        $or: [
          { manuallyDeactivated: { $exists: false } },
          { manuallyDeactivated: false }
        ]
      })
      .toArray();

    if (expiredPurchases.length === 0) {
      return {
        success: true,
        expired: false,
        message: "No expired plans found"
      };
    }

    // Update expired purchases and mark free trials as consumed (one-trial rule)
    for (const purchase of expiredPurchases) {
      await purchasesCollection.updateOne(
        { _id: purchase._id },
        {
          $set: {
            isActive: false,
            updatedAt: new Date()
          }
        }
      );
      if (purchase.isFreeTrial) {
        await markTrialConsumed(purchase.userId);
      }
    }

    return {
      success: true,
      expired: true,
      expiredCount: expiredPurchases.length,
      message: `${expiredPurchases.length} plan(s) expired`
    };

  } catch (error) {
    console.error("Error checking user plan expiration:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  handlePlanExpiration,
  checkUserPlanExpiration
};
