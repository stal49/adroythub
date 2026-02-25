const { ObjectId } = require("mongodb");
const { getPurchasesCollection } = require("../models/purchaseModel");
const { getSsbUserCollection } = require("../models/userModel");
const { getBatchEnrollmentsCollection, getBatchesCollection } = require("../models/batchModel");
const { getUserChallengeProgressCollection } = require("../models/challengeModel");
const { markTrialConsumed } = require("./trialService");

/**
 * Get complete access object for a user
 * 
 * Access resolution priority:
 * 1. Active paid plan
 * 2. Active free trial
 * 3. No plan fallback restrictions
 * 
 * @param {ObjectId|string} userId - User ID
 * @returns {Promise<Object>} Access object with all permissions and limits
 */

async function getUserAccess(userId) {
  try {
    const userIdObj = userId instanceof ObjectId ? userId : new ObjectId(userId);
    const now = new Date();

    const purchasesCollection = await getPurchasesCollection();

    // Get all purchases for user
    const allPurchases = await purchasesCollection
      .find({ userId: userIdObj })
      .sort({ purchasedAt: -1 })
      .toArray();

    // Filter active purchases considering both expiry AND manual deactivation
    const activePurchases = allPurchases.filter(purchase => {
      const expiresAt = new Date(purchase.expiresAt);
      const isNaturallyActive = expiresAt > now;
      const isManuallyDeactivated = purchase.manuallyDeactivated === true;
      
      // Only consider active if not expired AND not manually deactivated
      return isNaturallyActive && !isManuallyDeactivated;
    });

    // Update isActive field for all purchases (respecting manual deactivation).
    // When a free trial is flipped to inactive, mark trial as consumed so the user
    // does not receive another automatic trial on next login (one-trial rule).
    let shouldMarkTrialConsumed = false;
    for (const purchase of allPurchases) {
      const expiresAt = new Date(purchase.expiresAt);
      const isNaturallyActive = expiresAt > now;
      const isManuallyDeactivated = purchase.manuallyDeactivated === true;
      
      // Compute final isActive status
      const shouldBeActive = isNaturallyActive && !isManuallyDeactivated;
      
      // Only update if changed
      if (purchase.isActive !== shouldBeActive) {
        await purchasesCollection.updateOne(
          { _id: purchase._id },
          { $set: { isActive: shouldBeActive, updatedAt: new Date() } }
        );
        if (purchase.isFreeTrial && !shouldBeActive) {
          shouldMarkTrialConsumed = true;
        }
      }
    }
    if (shouldMarkTrialConsumed) {
      await markTrialConsumed(userIdObj);
    }

    // Priority 1: Check for active paid plan
    const activePaidPlan = activePurchases.find(
      purchase => !purchase.isFreeTrial && purchase.isActive
    );

    if (activePaidPlan) {
      return {
        hasPlan: true,
        planType: "paid",
        planId: activePaidPlan.planId,
        purchaseId: activePaidPlan._id,
        expiresAt: activePaidPlan.expiresAt,
        snapshot: activePaidPlan.snapshot,
        batches_free_access: activePaidPlan.snapshot.batches_free_access || [],
        challenges_free_access: activePaidPlan.snapshot.challenges_free_access || [],
        unlimited_task_access: activePaidPlan.snapshot.unlimited_task_access || false,
        unlimited_tests_access: activePaidPlan.snapshot.unlimited_tests_access || false,
        task_limit: activePaidPlan.snapshot.unlimited_task_access ? null : 4,
        test_limit: activePaidPlan.snapshot.unlimited_tests_access ? null : 2,
        test_item_limits: activePaidPlan.snapshot.unlimited_tests_access ? null : {
          WAT: 60,
          TAT: 11,
          SRT: 60,
          Interview: 10,
          Lecturette: 4,
          OIR: 17
        }
      };
    }

    // Priority 2: Check for active free trial
    const activeTrial = activePurchases.find(
      purchase => purchase.isFreeTrial && purchase.isActive
    );

    if (activeTrial) {
      return {
        hasPlan: true,
        planType: "trial",
        planId: activeTrial.planId,
        purchaseId: activeTrial._id,
        expiresAt: activeTrial.expiresAt,
        snapshot: activeTrial.snapshot,
        batches_free_access: activeTrial.snapshot.batches_free_access || [],
        challenges_free_access: activeTrial.snapshot.challenges_free_access || [],
        unlimited_task_access: activeTrial.snapshot.unlimited_task_access || false,
        unlimited_tests_access: activeTrial.snapshot.unlimited_tests_access || false,
        task_limit: activeTrial.snapshot.unlimited_task_access ? null : 4,
        test_limit: activeTrial.snapshot.unlimited_tests_access ? null : 2,
        test_item_limits: activeTrial.snapshot.unlimited_tests_access ? null : {
          WAT: 60,
          TAT: 11,
          SRT: 60,
          Interview: 10,
          Lecturette: 4,
          OIR: 17
        }
      };
    }

    // Priority 3: Fallback restrictions (no active plan)
    return {
      hasPlan: false,
      planType: null,
      planId: null,
      purchaseId: null,
      expiresAt: null,
      snapshot: null,
      batches_free_access: [],
      challenges_free_access: [],
      unlimited_task_access: false,
      unlimited_tests_access: false,
      task_limit: 4, // Maximum 4 self-created tasks
      test_limit: 2, // Maximum 2 total free tests
      test_item_limits: {
        WAT: 60,
        TAT: 11,
        SRT: 60,
        Interview: 10,
        Lecturette: 4,
        OIR: 17
      }
    };

  } catch (error) {
    console.error("Error getting user access:", error);
    // Return fallback restrictions on error
    return {
      hasPlan: false,
      planType: null,
      planId: null,
      purchaseId: null,
      expiresAt: null,
      snapshot: null,
      batches_free_access: [],
      challenges_free_access: [],
      unlimited_task_access: false,
      unlimited_tests_access: false,
      task_limit: 4,
      test_limit: 2,
      test_item_limits: {
        WAT: 60,
        TAT: 11,
        SRT: 60,
        Interview: 10,
        Lecturette: 4,
        OIR: 17
      }
    };
  }
}

/**
 * Check if user has access to a specific batch
 * 
 * Priority:
 * 1. Direct enrollment (user paid for batch directly)
 * 2. Plan-based access (batch included in active plan)
 * 
 * @param {ObjectId|string} userId - User ID
 * @param {ObjectId|string} batchId - Batch ID
 * @returns {Promise<boolean>} True if user has access
 */
async function hasBatchAccess(userId, batchId) {
  try {
    const userIdObj = userId instanceof ObjectId ? userId : new ObjectId(userId);
    const batchIdObj = batchId instanceof ObjectId ? batchId : new ObjectId(batchId);

    // Priority 1: Check enrollment (user paid for batch directly OR via plan)
    const enrollmentsCollection = await getBatchEnrollmentsCollection();
    const enrollment = await enrollmentsCollection.findOne({
      userId: userIdObj,
      batchId: batchIdObj.toString(),
      status: 'enrolled'
    });

    if (enrollment) {
      // If enrollment was via plan, check if plan is still active
      if (enrollment.paymentMethod === 'plan') {
        // Check if user still has active plan that includes this batch
        const access = await getUserAccess(userId);
        if (access.hasPlan) {
          const batchIdStr = batchIdObj.toString();
          const hasPlanAccess = access.batches_free_access.some(batch => {
            const batchObj = batch instanceof ObjectId ? batch : new ObjectId(batch);
            return batchObj.toString() === batchIdStr;
          });
          
          if (hasPlanAccess) {
            return true; // Plan still active and includes batch
          }
        }
        
        // Plan expired or batch not in plan anymore - check if batch has ended
        // If batch ended, keep access for historical purposes
        const batchesCollection = await getBatchesCollection();
        const batch = await batchesCollection.findOne({ _id: batchIdObj });
        if (batch && batch.endDate) {
          const endDate = new Date(batch.endDate);
          const now = new Date();
          if (endDate < now) {
            return true; // Batch ended - keep access for historical purposes
          }
        }
        
        return false; // Plan expired, batch ongoing - need to pay to continue
      } else {
        // Direct payment (not via plan) - always grant access
        return true;
      }
    }

    // Priority 2: Check plan-based access
    const access = await getUserAccess(userId);
    
    if (!access.hasPlan) {
      return false; // No plan = no batch access
    }

    const batchIdStr = batchIdObj.toString();

    // Check if batch is in free access list from plan
    const hasPlanAccess = access.batches_free_access.some(batch => {
      const batchObj = batch instanceof ObjectId ? batch : new ObjectId(batch);
      return batchObj.toString() === batchIdStr;
    });

    return hasPlanAccess;

  } catch (error) {
    console.error("Error checking batch access:", error);
    return false;
  }
}

/**
 * Check if user has access to a specific challenge
 * 
 * Priority:
 * 1. Direct purchase (user paid for challenge directly, isPaid = true)
 * 2. Plan-based access (challenge included in active plan)
 * 
 * Edge case: If user got challenge via plan but plan expired and challenge not completed,
 * they need to pay again to continue. But if they already paid directly, they keep access.
 * 
 * @param {ObjectId|string} userId - User ID
 * @param {ObjectId|string} challengeId - Challenge ID
 * @returns {Promise<boolean>} True if user has access
 */
async function hasChallengeAccess(userId, challengeId) {
  try {
    const userIdObj = userId instanceof ObjectId ? userId : new ObjectId(userId);
    const challengeIdObj = challengeId instanceof ObjectId ? challengeId : new ObjectId(challengeId);

    // Priority 1: Check direct purchase (user paid for challenge directly)
    const progressCollection = await getUserChallengeProgressCollection();
    const challengeProgress = await progressCollection.findOne({
      userId: userIdObj,
      challengeId: challengeIdObj
    });

    if (challengeProgress && challengeProgress.isPaid === true) {
      // User paid directly - check if payment was via plan or direct
      // If paymentMethod is 'plan', check if plan is still active
      if (challengeProgress.paymentMethod === 'plan') {
        // Check if user still has active plan that includes this challenge
        const access = await getUserAccess(userId);
        if (access.hasPlan) {
          const challengeIdStr = challengeIdObj.toString();
          const hasPlanAccess = access.challenges_free_access.some(challenge => {
            const challengeObj = challenge instanceof ObjectId ? challenge : new ObjectId(challenge);
            return challengeObj.toString() === challengeIdStr;
          });
          
          if (hasPlanAccess) {
            return true; // Plan still active and includes challenge
          }
        }
        
        // Plan expired - user needs to pay again to continue
        // But if challenge is completed, they should still have read access
        if (challengeProgress.completedAt) {
          return true; // Completed challenges remain accessible
        }
        
        return false; // Plan expired, challenge not completed - need to pay again
      } else {
        // Direct payment (not via plan) - always grant access
        return true;
      }
    }

    // Priority 2: Check plan-based access
    const access = await getUserAccess(userId);
    
    if (!access.hasPlan) {
      return false; // No plan = no challenge access
    }

    const challengeIdStr = challengeIdObj.toString();

    // Check if challenge is in free access list from plan
    const hasPlanAccess = access.challenges_free_access.some(challenge => {
      const challengeObj = challenge instanceof ObjectId ? challenge : new ObjectId(challenge);
      return challengeObj.toString() === challengeIdStr;
    });

    return hasPlanAccess;

  } catch (error) {
    console.error("Error checking challenge access:", error);
    return false;
  }
}

/**
 * Check if user can create unlimited tasks
 * 
 * @param {ObjectId|string} userId - User ID
 * @returns {Promise<boolean>} True if unlimited task access
 */
async function canCreateUnlimitedTasks(userId) {
  try {
    const access = await getUserAccess(userId);
    return access.unlimited_task_access === true;
  } catch (error) {
    console.error("Error checking unlimited task access:", error);
    return false;
  }
}

/**
 * Check if user can take unlimited tests
 * 
 * @param {ObjectId|string} userId - User ID
 * @returns {Promise<boolean>} True if unlimited test access
 */
async function canTakeUnlimitedTests(userId) {
  try {
    const access = await getUserAccess(userId);
    return access.unlimited_tests_access === true;
  } catch (error) {
    console.error("Error checking unlimited test access:", error);
    return false;
  }
}

/**
 * Get task creation limit for user
 * 
 * @param {ObjectId|string} userId - User ID
 * @returns {Promise<number|null>} Task limit (null for unlimited)
 */
async function getTaskLimit(userId) {
  try {
    const access = await getUserAccess(userId);
    return access.task_limit;
  } catch (error) {
    console.error("Error getting task limit:", error);
    return 4; // Default fallback
  }
}

/**
 * Get test limits for user
 * 
 * @param {ObjectId|string} userId - User ID
 * @returns {Promise<Object>} Test limits object
 */
async function getTestLimits(userId) {
  try {
    const access = await getUserAccess(userId);
    return {
      total_limit: access.test_limit, // null for unlimited
      per_type_limit: 2, // Maximum 2 tests per test type (when not unlimited)
      item_limits: access.test_item_limits // Per-test-item limits
    };
  } catch (error) {
    console.error("Error getting test limits:", error);
    return {
      total_limit: 2,
      per_type_limit: 2,
      item_limits: {
        WAT: 60,
        TAT: 11,
        SRT: 60,
        Interview: 10,
        Lecturette: 4,
        OIR: 17
      }
    };
  }
}

/**
 * Get user's active plan information
 * 
 * @param {ObjectId|string} userId - User ID
 * @returns {Promise<Object|null>} Active plan info or null
 */
async function getActivePlanInfo(userId) {
  try {
    const access = await getUserAccess(userId);
    
    if (!access.hasPlan) {
      return null;
    }

    return {
      planType: access.planType,
      planId: access.planId,
      purchaseId: access.purchaseId,
      expiresAt: access.expiresAt,
      snapshot: access.snapshot
    };
  } catch (error) {
    console.error("Error getting active plan info:", error);
    return null;
  }
}

module.exports = {
  getUserAccess,
  hasBatchAccess,
  hasChallengeAccess,
  canCreateUnlimitedTasks,
  canTakeUnlimitedTests,
  getTaskLimit,
  getTestLimits,
  getActivePlanInfo
};
