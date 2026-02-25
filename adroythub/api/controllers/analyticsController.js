const ErrorHandler = require("../utils/ErrorHandler");
const { CatchAsyncError } = require("../middleware/catchAsyncErrors");
const { getUserCollection } = require("../models/userModel");
const { getCourseCollection } = require("../models/courseModel");
const { getOrderCollection } = require("../models/orderModel");
const generateLast12MonthsData = require("../utils/generateLast12MonthsData");

// Get users analytics --- only for admin
exports.getUsersAnalytics = CatchAsyncError(async (req, res, next) => {
  try {
    const usersCollection = await getUserCollection();
    const users = await generateLast12MonthsData(usersCollection);

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Get courses analytics --- only for admin
exports.getCoursesAnalytics = CatchAsyncError(async (req, res, next) => {
  try {
    const coursesCollection = await getCourseCollection();
    const courses = await generateLast12MonthsData(coursesCollection);

    res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Get order analytics --- only for admin
exports.getOrderAnalytics = CatchAsyncError(async (req, res, next) => {
  try {
    const ordersCollection = await getOrderCollection();
    const orders = await generateLast12MonthsData(ordersCollection);

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});
