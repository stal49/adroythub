const { hasBatchAccess, hasChallengeAccess, canCreateUnlimitedTasks, getTaskLimit, canTakeUnlimitedTests, getTestLimits } = require("../services/accessControlService");
const ErrorHandler = require("../utils/ErrorHandler");

/**
 * Middleware to check if user has access to a batch
 * Expects batchId in req.params.batchId or req.body.batchId
 */
const checkBatchAccess = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return next(new ErrorHandler("User authentication required", 401));
    }

    const batchId = req.params.batchId || req.body.batchId;

    if (!batchId) {
      return next(new ErrorHandler("Batch ID is required", 400));
    }

    const hasAccess = await hasBatchAccess(userId, batchId);

    if (!hasAccess) {
      return next(new ErrorHandler("You do not have access to this batch. Please purchase a plan that includes this batch.", 403));
    }

    // Attach access info to request for use in controller
    req.batchAccess = true;
    next();

  } catch (error) {
    console.error("Error in checkBatchAccess middleware:", error);
    return next(new ErrorHandler("Error checking batch access", 500));
  }
};

/**
 * Middleware to check if user has access to a challenge
 * Expects challengeId in req.params.challengeId or req.body.challengeId
 */
const checkChallengeAccess = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return next(new ErrorHandler("User authentication required", 401));
    }

    const challengeId = req.params.challengeId || req.body.challengeId;

    if (!challengeId) {
      return next(new ErrorHandler("Challenge ID is required", 400));
    }

    const hasAccess = await hasChallengeAccess(userId, challengeId);

    if (!hasAccess) {
      return next(new ErrorHandler("You do not have access to this challenge. Please purchase a plan that includes this challenge.", 403));
    }

    // Attach access info to request for use in controller
    req.challengeAccess = true;
    next();

  } catch (error) {
    console.error("Error in checkChallengeAccess middleware:", error);
    return next(new ErrorHandler("Error checking challenge access", 500));
  }
};

/**
 * Middleware to check task creation limit
 * Should be used before creating a new task
 */
const checkTaskCreationLimit = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return next(new ErrorHandler("User authentication required", 401));
    }

    const unlimited = await canCreateUnlimitedTasks(userId);

    if (unlimited) {
      // User has unlimited task access
      req.taskLimit = null;
      req.canCreateTask = true;
      return next();
    }

    // Get task limit
    const taskLimit = await getTaskLimit(userId);

    if (taskLimit === null) {
      // Unlimited (shouldn't happen if unlimited check failed, but handle it)
      req.taskLimit = null;
      req.canCreateTask = true;
      return next();
    }

    // Attach limit info to request
    // Controller should check current task count and enforce limit
    req.taskLimit = taskLimit;
    req.canCreateTask = true; // Let controller decide based on current count
    next();

  } catch (error) {
    console.error("Error in checkTaskCreationLimit middleware:", error);
    return next(new ErrorHandler("Error checking task creation limit", 500));
  }
};

/**
 * Middleware to check test access limit
 * Should be used before allowing user to take a test
 */
const checkTestLimit = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return next(new ErrorHandler("User authentication required", 401));
    }

    const unlimited = await canTakeUnlimitedTests(userId);

    if (unlimited) {
      // User has unlimited test access
      req.testLimit = null;
      req.canTakeTest = true;
      return next();
    }

    // Get test limits
    const testLimits = await getTestLimits(userId);

    // Attach limit info to request
    // Controller should check current test count and enforce limits
    req.testLimit = testLimits.total_limit;
    req.testPerTypeLimit = testLimits.per_type_limit;
    req.testItemLimits = testLimits.item_limits;
    req.canTakeTest = true; // Let controller decide based on current count
    next();

  } catch (error) {
    console.error("Error in checkTestLimit middleware:", error);
    return next(new ErrorHandler("Error checking test limit", 500));
  }
};

/**
 * Middleware to attach user access information to request
 * Useful for controllers that need to know user's access status
 */
const attachUserAccess = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return next(new ErrorHandler("User authentication required", 401));
    }

    const { getUserAccess } = require("../services/accessControlService");
    const access = await getUserAccess(userId);

    // Attach access info to request
    req.userAccess = access;
    next();

  } catch (error) {
    console.error("Error in attachUserAccess middleware:", error);
    // Don't fail the request, just don't attach access info
    req.userAccess = null;
    next();
  }
};

module.exports = {
  checkBatchAccess,
  checkChallengeAccess,
  checkTaskCreationLimit,
  checkTestLimit,
  attachUserAccess
};
