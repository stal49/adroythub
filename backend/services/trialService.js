const { ObjectId } = require("mongodb");
const { getPlansCollection } = require("../models/planModel");
const { getPurchasesCollection } = require("../models/purchaseModel");
const { getSsbUserCollection } = require("../models/userModel");

/**
 * Check if user is eligible for a free trial
 * 
 * Eligibility conditions (ALL must be met):
 * 1. A global free trial plan exists and is active
 * 2. User has never consumed a free trial (trial_consumed = false)
 * 3. User has never purchased a paid plan
 * 
 * @param {ObjectId} userId - User ID to check
 * @returns {Object} { eligible: boolean, reason?: string, plan?: Object }
 */
async function checkTrialEligibility(userId) {
  try {
    // Check if user has trial_consumed flag set
    const usersCollection = await getSsbUserCollection();
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return {
        eligible: false,
        reason: "User not found"
      };
    }

    // Condition 1: Check if user has consumed trial
    if (user.trial_consumed === true) {
      return {
        eligible: false,
        reason: "User has already consumed their free trial"
      };
    }

    // Condition 2: Check if user has purchased any paid plan
    const purchasesCollection = await getPurchasesCollection();
    const paidPurchase = await purchasesCollection.findOne({
      userId: new ObjectId(userId),
      isFreeTrial: false
    });

    if (paidPurchase) {
      return {
        eligible: false,
        reason: "User has already purchased a paid plan"
      };
    }

    // Condition 3: Check if there's an active free trial plan
    const plansCollection = await getPlansCollection();
    const freeTrialPlan = await plansCollection.findOne({
      is_free_trial_plan: true,
      active: true
    });

    if (!freeTrialPlan) {
      return {
        eligible: false,
        reason: "No active free trial plan available"
      };
    }

    // All conditions met - user is eligible
    return {
      eligible: true,
      plan: freeTrialPlan
    };

  } catch (error) {
    console.error("Error checking trial eligibility:", error);
    return {
      eligible: false,
      reason: "Error checking eligibility: " + error.message
    };
  }
}

/**
 * Assign free trial to eligible user
 * 
 * Creates a purchase record with snapshot of the plan at assignment time.
 * Does NOT mark trial_consumed (that happens on expiration or paid purchase).
 * 
 * @param {ObjectId} userId - User ID to assign trial to
 * @returns {Object} { success: boolean, purchase?: Object, error?: string }
 */
async function assignFreeTrial(userId) {
  try {
    // Check eligibility first
    const eligibility = await checkTrialEligibility(userId);

    if (!eligibility.eligible) {
      return {
        success: false,
        error: eligibility.reason || "User is not eligible for free trial"
      };
    }

    const plan = eligibility.plan;
    const plansCollection = await getPlansCollection();
    const purchasesCollection = await getPurchasesCollection();

    // Check if user already has an active trial (prevent duplicates)
    const existingTrial = await purchasesCollection.findOne({
      userId: new ObjectId(userId),
      isFreeTrial: true,
      isActive: true
    });

    if (existingTrial) {
      return {
        success: false,
        error: "User already has an active free trial"
      };
    }

    // Calculate expiration date
    const purchasedAt = new Date();
    const expiresAt = new Date(purchasedAt);
    expiresAt.setDate(expiresAt.getDate() + plan.validity_days);

    // Create snapshot of plan at assignment time
    const snapshot = {
      title: plan.title,
      subtitle: plan.subtitle || null,
      description: plan.description || null,
      price: plan.price,
      discount_price: plan.discount_price || null,
      challenges_free_access: plan.challenges_which_have_free_access || [],
      batches_free_access: plan.batches_which_have_free_access || [],
      unlimited_task_access: plan.unlimited_task_access || false,
      unlimited_tests_access: plan.unlimited_tests_access || false
    };

    // Create purchase record
    const purchase = {
      userId: new ObjectId(userId),
      planId: plan._id,
      isFreeTrial: true,
      purchasedAt: purchasedAt,
      expiresAt: expiresAt,
      isActive: true, // Will be computed based on expiresAt in access checks
      snapshot: snapshot,
      paymentId: null, // No payment for free trial
      createdBy: null, // System-assigned
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await purchasesCollection.insertOne(purchase);
    const purchaseId = result.insertedId;

    // Auto-enroll in batches and grant challenge access
    console.log(`🚀 [assignFreeTrial] Starting auto-enrollment for user ${userId}`);
    try {
      const { autoEnrollFromPlan } = require("./planEnrollmentService");
      const enrollmentResults = await autoEnrollFromPlan(
        new ObjectId(userId),
        snapshot,
        purchaseId,
        'free_trial'
      );

      if (!enrollmentResults.success) {
        console.warn(`⚠️ [assignFreeTrial] Some enrollments failed, but purchase was created`);
      }
    } catch (enrollmentError) {
      // Log error but don't fail the trial assignment
      console.error("❌ [assignFreeTrial] Error during auto-enrollment:", enrollmentError);
      // Purchase is still created, user can access manually if needed
    }

    return {
      success: true,
      purchase: { ...purchase, _id: purchaseId }
    };

  } catch (error) {
    console.error("Error assigning free trial:", error);
    return {
      success: false,
      error: "Error assigning free trial: " + error.message
    };
  }
}

/**
 * Mark trial as consumed for a user
 * 
 * This should be called when:
 * - Free trial expires naturally, OR
 * - User purchases any paid plan (even during active trial)
 * 
 * @param {ObjectId} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
async function markTrialConsumed(userId) {
  try {
    const usersCollection = await getSsbUserCollection();

    // Update user's trial_consumed flag
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          trial_consumed: true,
          updatedAt: new Date()
        }
      }
    );

    // Also deactivate any active trial purchases
    const purchasesCollection = await getPurchasesCollection();
    await purchasesCollection.updateMany(
      {
        userId: new ObjectId(userId),
        isFreeTrial: true,
        isActive: true
      },
      {
        $set: {
          isActive: false,
          updatedAt: new Date()
        }
      }
    );

    return true;

  } catch (error) {
    console.error("Error marking trial as consumed:", error);
    return false;
  }
}

/**
 * Check if user has consumed their trial
 * 
 * @param {ObjectId} userId - User ID
 * @returns {Promise<boolean>} True if trial is consumed
 */
async function hasConsumedTrial(userId) {
  try {
    const usersCollection = await getSsbUserCollection();
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return false;
    }

    return user.trial_consumed === true;

  } catch (error) {
    console.error("Error checking trial consumption:", error);
    return false;
  }
}

module.exports = {
  checkTrialEligibility,
  assignFreeTrial,
  markTrialConsumed,
  hasConsumedTrial
};
