const { ObjectId } = require("mongodb");
const { getBatchEnrollmentsCollection, getBatchesCollection, getBatchPaymentsCollection } = require("../models/batchModel");
const { getUserChallengeProgressCollection } = require("../models/challengeModel");

/**
 * Auto-enroll user in batches from plan snapshot
 * 
 * @param {ObjectId} userId - User ID
 * @param {Array} batchIds - Array of batch IDs from plan snapshot
 * @param {ObjectId} purchaseId - Purchase record ID
 * @param {string} source - 'free_trial' or 'plan_purchase'
 * @returns {Object} { success: boolean, enrolled: number, skipped: number, errors: Array }
 */
async function autoEnrollBatches(userId, batchIds, purchaseId, source = 'plan_purchase') {
  const results = {
    success: true,
    enrolled: 0,
    skipped: 0,
    errors: []
  };

  if (!batchIds || batchIds.length === 0) {
    return results;
  }

  try {
    const enrollmentsCollection = await getBatchEnrollmentsCollection();
    const batchesCollection = await getBatchesCollection();
    const paymentsCollection = await getBatchPaymentsCollection();
    const now = new Date();

    for (const batchId of batchIds) {
      try {
        // Validate batch ID
        if (!ObjectId.isValid(batchId)) {
          console.warn(`⚠️ [autoEnrollBatches] Invalid batch ID: ${batchId}`);
          results.skipped++;
          continue;
        }

        const batchObjectId = new ObjectId(batchId);

        // Check if batch exists
        const batch = await batchesCollection.findOne({ _id: batchObjectId });
        if (!batch) {
          console.warn(`⚠️ [autoEnrollBatches] Batch ${batchId} not found`);
          results.skipped++;
          continue;
        }

        // Check if batch is active
        if (batch.status !== 'active') {
          console.warn(`⚠️ [autoEnrollBatches] Batch ${batchId} is not active (status: ${batch.status})`);
          results.skipped++;
          continue;
        }

        // Check if user is already enrolled
        const existingEnrollment = await enrollmentsCollection.findOne({
          userId: new ObjectId(userId),
          batchId: batchId.toString(),
          status: 'enrolled'
        });

        if (existingEnrollment) {
          // If already enrolled but not paid, update to paid
          if (existingEnrollment.paymentStatus !== 'paid') {
            await enrollmentsCollection.updateOne(
              { _id: existingEnrollment._id },
              {
                $set: {
                  paymentStatus: 'paid',
                  paymentMethod: source === 'free_trial' ? 'free_trial' : 'plan',
                  amount: 0,
                  planPurchaseId: purchaseId,
                  updatedAt: new Date()
                }
              }
            );
            console.log(`✅ [autoEnrollBatches] Updated enrollment for batch ${batchId} to paid status`);
            results.enrolled++;
          } else {
            console.log(`ℹ️ [autoEnrollBatches] User already enrolled and paid in batch ${batchId}`);
            results.skipped++;
          }
          continue;
        }

        // Check if batch has available slots
        const enrollmentCount = await enrollmentsCollection.countDocuments({
          batchId: batchId.toString(),
          status: 'enrolled'
        });

        if (enrollmentCount >= batch.maxStudents) {
          console.warn(`⚠️ [autoEnrollBatches] Batch ${batchId} is full (${enrollmentCount}/${batch.maxStudents})`);
          results.skipped++;
          continue;
        }

        // Create enrollment
        const enrollment = {
          batchId: batchId.toString(),
          userId: new ObjectId(userId),
          amount: 0, // Free with plan
          studentType: 'new',
          paymentStatus: 'paid', // Free with plan
          paymentMethod: source === 'free_trial' ? 'free_trial' : 'plan',
          status: 'enrolled',
          enrolledAt: new Date(),
          planPurchaseId: purchaseId,
          source: source,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const enrollmentResult = await enrollmentsCollection.insertOne(enrollment);

        // Create payment record for tracking
        await paymentsCollection.insertOne({
          enrollmentId: enrollmentResult.insertedId.toString(),
          userId: userId.toString(),
          batchId: batchId.toString(),
          orderId: `${source}_${Date.now()}_${enrollmentResult.insertedId}`,
          amount: 0,
          currency: 'INR',
          status: 'success',
          provider: source === 'free_trial' ? 'free_trial' : 'plan',
          paymentMethod: source === 'free_trial' ? 'free_trial' : 'plan',
          paidAt: new Date(),
          createdAt: new Date()
        });

        console.log(`✅ [autoEnrollBatches] Auto-enrolled user ${userId} in batch ${batchId} (${source})`);
        results.enrolled++;

      } catch (batchError) {
        console.error(`❌ [autoEnrollBatches] Error processing batch ${batchId}:`, batchError.message);
        results.errors.push({
          batchId: batchId,
          error: batchError.message
        });
      }
    }

    return results;

  } catch (error) {
    console.error("❌ [autoEnrollBatches] Fatal error:", error);
    results.success = false;
    results.errors.push({
      error: error.message
    });
    return results;
  }
}

/**
 * Auto-grant challenge access from plan snapshot
 * 
 * @param {ObjectId} userId - User ID
 * @param {Array} challengeIds - Array of challenge IDs from plan snapshot
 * @param {ObjectId} purchaseId - Purchase record ID
 * @param {string} source - 'free_trial' or 'plan_purchase'
 * @returns {Object} { success: boolean, granted: number, updated: number, skipped: number, errors: Array }
 */
async function autoGrantChallengeAccess(userId, challengeIds, purchaseId, source = 'plan_purchase') {
  const results = {
    success: true,
    granted: 0,
    updated: 0,
    skipped: 0,
    errors: []
  };

  if (!challengeIds || challengeIds.length === 0) {
    return results;
  }

  try {
    const progressCollection = await getUserChallengeProgressCollection();
    const now = new Date();

    for (const challengeId of challengeIds) {
      try {
        // Validate challenge ID
        if (!ObjectId.isValid(challengeId)) {
          console.warn(`⚠️ [autoGrantChallengeAccess] Invalid challenge ID: ${challengeId}`);
          results.skipped++;
          continue;
        }

        const challengeObjectId = new ObjectId(challengeId);

        // Check if challenge progress already exists
        const existingProgress = await progressCollection.findOne({
          userId: new ObjectId(userId),
          challengeId: challengeObjectId
        });

        if (existingProgress) {
          // If progress exists but not paid, update to paid
          if (!existingProgress.isPaid) {
            await progressCollection.updateOne(
              { _id: existingProgress._id },
              {
                $set: {
                  isPaid: true,
                  paidAt: now,
                  paymentMethod: source === 'free_trial' ? 'free_trial' : 'plan',
                  paymentId: purchaseId.toString(),
                  source: source,
                  planPurchaseId: purchaseId,
                  updatedAt: new Date()
                }
              }
            );
            console.log(`✅ [autoGrantChallengeAccess] Updated challenge ${challengeId} access to paid for user ${userId}`);
            results.updated++;
          } else {
            console.log(`ℹ️ [autoGrantChallengeAccess] User already has paid access to challenge ${challengeId}`);
            results.skipped++;
          }
          continue;
        }

        // Create new challenge progress with paid access
        const progress = {
          userId: new ObjectId(userId),
          challengeId: challengeObjectId,
          currentDay: 0,
          isPaid: true,
          paidAt: now,
          paidBy: null, // System-assigned
          paymentMethod: source === 'free_trial' ? 'free_trial' : 'plan',
          paymentId: purchaseId.toString(),
          source: source,
          planPurchaseId: purchaseId,
          startedAt: now,
          completedAt: null,
          totalPoints: 0,
          diamondsEarned: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await progressCollection.insertOne(progress);

        console.log(`✅ [autoGrantChallengeAccess] Granted paid access to challenge ${challengeId} for user ${userId} (${source})`);
        results.granted++;

      } catch (challengeError) {
        console.error(`❌ [autoGrantChallengeAccess] Error processing challenge ${challengeId}:`, challengeError.message);
        results.errors.push({
          challengeId: challengeId,
          error: challengeError.message
        });
      }
    }

    return results;

  } catch (error) {
    console.error("❌ [autoGrantChallengeAccess] Fatal error:", error);
    results.success = false;
    results.errors.push({
      error: error.message
    });
    return results;
  }
}

/**
 * Auto-enroll user in batches and grant challenge access from plan snapshot
 * 
 * @param {ObjectId} userId - User ID
 * @param {Object} snapshot - Plan snapshot with batches_free_access and challenges_free_access
 * @param {ObjectId} purchaseId - Purchase record ID
 * @param {string} source - 'free_trial' or 'plan_purchase'
 * @returns {Object} { success: boolean, batches: Object, challenges: Object }
 */
async function autoEnrollFromPlan(userId, snapshot, purchaseId, source = 'plan_purchase') {
  const batchIds = snapshot.batches_free_access || [];
  const challengeIds = snapshot.challenges_free_access || [];

  console.log(`🚀 [autoEnrollFromPlan] Starting auto-enrollment for user ${userId}`);
  console.log(`   - Source: ${source}`);
  console.log(`   - Batches: ${batchIds.length}`);
  console.log(`   - Challenges: ${challengeIds.length}`);

  const batchResults = await autoEnrollBatches(userId, batchIds, purchaseId, source);
  const challengeResults = await autoGrantChallengeAccess(userId, challengeIds, purchaseId, source);

  const overallSuccess = batchResults.success && challengeResults.success;

  console.log(`✅ [autoEnrollFromPlan] Auto-enrollment completed for user ${userId}`);
  console.log(`   - Batches: ${batchResults.enrolled} enrolled, ${batchResults.skipped} skipped`);
  console.log(`   - Challenges: ${challengeResults.granted} granted, ${challengeResults.updated} updated, ${challengeResults.skipped} skipped`);

  return {
    success: overallSuccess,
    batches: batchResults,
    challenges: challengeResults
  };
}

module.exports = {
  autoEnrollBatches,
  autoGrantChallengeAccess,
  autoEnrollFromPlan
};
