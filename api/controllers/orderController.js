const path = require("path");
const ejs = require("ejs");
const { CatchAsyncError } = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const { getAllOrdersService, newOrder } = require("../services/orderService");
const { redis } = require("../utils/redis");
const { sendMail } = require("../utils/sendMail");
const { getUserCollection } = require("../models/userModel");
const { getCourseCollection } = require("../models/courseModel");
const { getNotificationCollection } = require("../models/notificationModel");
const { ObjectId } = require("mongodb");

// **Create Order**
exports.createOrder = CatchAsyncError(async (req, res, next) => {
  try {
    const { courseId, amount, currency } = req.body;
    console.log("create order called", courseId);

    const usersCollection = await getUserCollection();
    const coursesCollection = await getCourseCollection();

    const user = await usersCollection.findOne({ _id: new ObjectId(req.user?._id) });

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const courseExists = user.courses.some((course) => course.toString() === courseId);
    if (courseExists) {
      return next(new ErrorHandler("You have already purchased this course", 400));
    }

    const course = await coursesCollection.findOne({ _id: new ObjectId(courseId) });

    if (!course) {
      return next(new ErrorHandler("Course not found", 404));
    }

    const data = {
      courseId: course._id,
      userId: user._id,
      // payment_info,
    };

    const mailData = {
      order: {
        _id: course._id.toString().slice(0, 6),
        name: course.name,
        price: course.price,
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      },
      user: {
        _id: course._id.toString().slice(0, 6),
        name: course.name,
        price: course.price,
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      },
    };

    const html = await ejs.renderFile(
      path.join(process.cwd(), "api/mails/order-confirmation.ejs"),
      { order: mailData }
    );

    try {
      await sendMail({
        email: user.email,
        subject: "Order Confirmation",
        template: "order-confirmation.ejs",
        data: mailData,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }

    user.courses.push(course._id);
    await redis.set(req.user?._id.toString(), JSON.stringify(user));

    const updateResult = await usersCollection.updateOne(
      { _id: user._id },
      { $set: { courses: user.courses } }
    );

    console.log("User courses update result:", updateResult);
    if (updateResult.modifiedCount === 0) {
      console.warn("User courses not updated.");
    }

    const notificationsCollection = await getNotificationCollection();
    await notificationsCollection.insertOne({
      user: user._id,
      title: "New Order",
      message: `You have a new order from ${course.name}`,
    });

    await coursesCollection.updateOne(
      { _id: course._id },
      { $inc: { purchased: 1 } }
    );
    return newOrder(data, res, next);
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
  // } catch (error) {
  //   return res.status(201).json({
  //     success: true,
  //     order: result.ops[0],  // The inserted order document
  // });
  // }
});

// **Get All Orders (Admin)**
exports.getAllOrders = CatchAsyncError(async (req, res, next) => {
  try {
    getAllOrdersService(res);
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// **Send Stripe Publishable Key**
exports.sendStripePublishableKey = CatchAsyncError(async (req, res) => {
  res.status(200).json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

// **New Payment**
exports.newPayment = CatchAsyncError(async (req, res, next) => {
  try {
    // const myPayment = await stripe.paymentIntents.create({
    //   amount: req.body.amount,
    //   currency: "INR",
    //   metadata: {
    //     company: "ADROYTHUB",
    //   },
    //   automatic_payment_methods: {
    //     enabled: true,
    //   },
    // });

    res.status(201).json({
      success: true,
      client_secret: 'myPayment.client_secret',
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});
