const { ObjectId } = require("mongodb");
const { getBatchEnrollmentsCollection, getBatchesCollection } = require("../models/batchModel");
const { getUserChallengeProgressCollection } = require("../models/challengeModel");

/**
 * Revoke batch and challenge access for a specific purchase
 * This is a shared function used by:
 * 1. Plan expiration service (automatic expiry)
 * 2. Admin manual removal
 * 3. Plan replacement (free -> paid)
 * 
 * @param {Object} purchase - Purchase document from DB
 * @param {string} reason - Reason for revocation ('plan_expired', 'manually_removed', 'plan_replaced')
 * @returns {Promise<Object>} Stats about what was revoked
 */
async function revokeAccessForPurchase(purchase, reason = 'plan_expired') {
  const stats = {
    batchesRemoved: 0,
    challengesRevoked: 0,
    errors: []
  };

  try {
    const enrollmentsCollection = await getBatchEnrollmentsCollection();
    const batchesCollection = await getBatchesCollection();
    const progressCollection = await getUserChallengeProgressCollection();
    const now = new Date();

    // Revoke batch enrollments
    if (purchase.snapshot && purchase.snapshot.batches_free_access) {
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
            const batch = await batchesCollection.findOne({ 
              _id: new ObjectId(batchId) 
            });
            
            if (batch && batch.endDate) {
              const endDate = new Date(batch.endDate);
              if (endDate < now) {
                // Batch ended - keep enrollment for historical purposes
                console.log(`   ℹ️  Keeping enrollment for ended batch ${batchId} (historical record)`);
                continue;
              }
            }
            
            // Batch is ongoing or hasn't started - remove enrollment
            await enrollmentsCollection.updateOne(
              { _id: enrollment._id },
              {
                $set: {
                  status: 'removed',
                  removedAt: new Date(),
                  removedReason: reason,
                  updatedAt: new Date()
                }
              }
            );

            stats.batchesRemoved++;
            console.log(`   ✅ Removed enrollment for batch ${batchId} (${reason})`);
          }
        } catch (batchError) {
          console.error(`   ❌ Error processing batch ${batchId}:`, batchError.message);
          stats.errors.push({
            type: 'batch',
            id: batchId,
            error: batchError.message
          });
        }
      }
    }

    // Revoke challenge access
    if (purchase.snapshot && purchase.snapshot.challenges_free_access) {
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

            stats.challengesRevoked++;
            console.log(`   ✅ Revoked access to challenge ${challengeId} (${reason})`);
          } else if (progress && progress.completedAt) {
            console.log(`   ℹ️  Keeping access for completed challenge ${challengeId}`);
          }
        } catch (challengeError) {
          console.error(`   ❌ Error processing challenge ${challengeId}:`, challengeError.message);
          stats.errors.push({
            type: 'challenge',
            id: challengeId,
            error: challengeError.message
          });
        }
      }
    }

    return {
      success: true,
      stats
    };

  } catch (error) {
    console.error("❌ Error in revokeAccessForPurchase:", error);
    return {
      success: false,
      error: error.message,
      stats
    };
  }
}

/**
 * Revoke access for multiple purchases
 * 
 * @param {Array} purchases - Array of purchase documents
 * @param {string} reason - Reason for revocation
 * @returns {Promise<Object>} Aggregated stats
 */
async function revokeAccessForMultiplePurchases(purchases, reason = 'plan_expired') {
  const aggregatedStats = {
    purchasesProcessed: 0,
    batchesRemoved: 0,
    challengesRevoked: 0,
    errors: []
  };

  for (const purchase of purchases) {
    const result = await revokeAccessForPurchase(purchase, reason);
    aggregatedStats.purchasesProcessed++;
    
    if (result.success) {
      aggregatedStats.batchesRemoved += result.stats.batchesRemoved;
      aggregatedStats.challengesRevoked += result.stats.challengesRevoked;
      aggregatedStats.errors.push(...result.stats.errors);
    } else {
      aggregatedStats.errors.push({
        type: 'purchase',
        id: purchase._id,
        error: result.error
      });
    }
  }

  return aggregatedStats;
}

module.exports = {
  revokeAccessForPurchase,
  revokeAccessForMultiplePurchases
};
