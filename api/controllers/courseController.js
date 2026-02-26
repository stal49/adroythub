const { CatchAsyncError } = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const cloudinary = require("cloudinary");
const { ObjectId } = require("mongodb"); // Import ObjectId for MongoDB
const { getCourseCollection } = require("../models/courseModel");
const { getNotificationCollection } = require("../models/notificationModel");
const { redis } = require("../utils/redis");

const path = require("path");
const ejs = require("ejs");
const axios = require("axios");
const sendMail = require("../utils/sendMail");
const { createCourse } = require("../services/courseService");
const { getInstituteCollection } = require("../models/instituteModel");

function getFormattedTime() {
  const now = new Date();
  
  // Get ISO string (UTC time) and remove the "Z" at the end
  const isoString = now.toISOString().slice(0, -1);

  // Get timezone offset in minutes
  const offsetMinutes = now.getTimezoneOffset();
  const offsetHours = Math.abs(Math.floor(offsetMinutes / 60));
  const offsetMins = Math.abs(offsetMinutes % 60);
  
  // Format timezone offset as ±HH:MM
  const sign = offsetMinutes > 0 ? "-" : "+";
  const formattedOffset = `${sign}${String(offsetHours).padStart(2, '0')}:${String(offsetMins).padStart(2, '0')}`;
  
  return `${isoString}${formattedOffset}`;
}
// upload course
exports.uploadCourse = CatchAsyncError(async (req, res, next) => {
  try {
    const data = req.body;
    const thumbnail = data.thumbnail;
    if (thumbnail) {
      const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
        folder: "courses",
      });

      data.thumbnail = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }
    data.reviews = []
    data.isFree = true
    data.ratings = 4.3
    data.purchased = 0
    data.createdAt = getFormattedTime()
    data.updatedAt = getFormattedTime()
    createCourse(data, res, next);
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// edit course
exports.editCourse = CatchAsyncError(async (req, res, next) => {
  try {
    const data = req.body;
    const thumbnail = data.thumbnail;
    const courseId = req.params.id;
    
    // Get course collection from MongoDB
    const courseCollection = await getCourseCollection();
    const courseData = await courseCollection.findOne({ _id: new ObjectId(courseId) });

    if (thumbnail && !thumbnail.startsWith("https")) {
      await cloudinary.v2.uploader.destroy(courseData.thumbnail.public_id);

      const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
        folder: "courses",
      });

      data.thumbnail = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }

    if (thumbnail.startsWith("https")) {
      data.thumbnail = {
        public_id: courseData?.thumbnail.public_id,
        url: courseData?.thumbnail.url,
      };
    }

    const updatedCourse = await courseCollection.findOneAndUpdate(
      { _id: new ObjectId(courseId) },
      { $set: data },
      { returnDocument: "after" }
    );

    res.status(201).json({
      success: true,
      course: updatedCourse,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// get single course --- without purchasing
exports.getSingleCourse = CatchAsyncError(async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const isCacheExist = await redis.get(courseId);

    if (isCacheExist) {
      const course = JSON.parse(isCacheExist);
      res.status(200).json({
        success: true,
        course,
      });
    } else {
      const courseCollection = await getCourseCollection();
      const course = await courseCollection.findOne({ _id: new ObjectId(courseId) });

      // await redis.set(courseId, JSON.stringify(course), "EX", 604800); // 7 days
      await redis.set(courseId, JSON.stringify(course), "EX", 14400); // 7 days

      res.status(200).json({
        success: true,
        course,
      });
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// get all courses --- without purchasing
exports.getAllCourses = CatchAsyncError(async (req, res, next) => {
  try {
    const courseCollection = await getCourseCollection();
    const courses = await courseCollection.find().toArray();

    res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// get course content -- only for valid user
exports.getCourseByUser = CatchAsyncError(async (req, res, next) => {
  try {
    const userCourseList = req.user?.courses;
const courseId = req.params.id;
console.log('courseID', courseId);
console.log('userCourseList', userCourseList);
console.log('req.user', req.user);

const courseExists = userCourseList?.includes(courseId);

if (!courseExists) {
  return next(new ErrorHandler("You are not eligible to access this course", 404));
}

const courseCollection = await getCourseCollection();
const course = await courseCollection.findOne({ _id: new ObjectId(courseId) });

const content = course?.courseData;

res.status(200).json({
  success: true,
  content,
});

  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// add question in course
exports.addQuestion = CatchAsyncError(async (req, res, next) => {
  try {
    const { question, courseId, contentId } = req.body;
    const courseCollection = await getCourseCollection();
    const course = await courseCollection.findOne({ _id: new ObjectId(courseId) });

    const courseContent = course?.courseData?.find(
      (item) => item._id.toString() === contentId
    );

    if (!courseContent) {
      return next(new ErrorHandler("Invalid content id", 400));
    }

    // create a new question object
    const newQuestion = {
      user: req.user,
      question,
      questionReplies: [],
    };

    // add this question to our course content
    courseContent.questions.push(newQuestion);

    // Send notification
    const notificationCollection = await getNotificationCollection();
    await notificationCollection.insertOne({
      userId: new ObjectId(req.user?._id),
      title: "New Question Received",
      message: `You have a new question in ${courseContent.title}`,
      status: "unread",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // save the updated course
    await courseCollection.updateOne(
      { _id: new ObjectId(courseId) },
      { $set: { courseData: course.courseData } }
    );

    res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// ✅ Add Answer to a Question
exports.addAnswer = CatchAsyncError(async (req, res, next) => {
  try {
    const { answer, courseId, contentId, questionId } = req.body;
    const courseCollection = await getCourseCollection();
    
    const course = await courseCollection.findOne({ _id: new ObjectId(courseId) });
    if (!course) return next(new ErrorHandler("Course not found", 404));

    const courseContent = course.courseData.find(item => item._id.toString() === contentId);
    if (!courseContent) return next(new ErrorHandler("Invalid content ID", 400));

    const question = courseContent.questions.find(q => q._id.toString() === questionId);
    if (!question) return next(new ErrorHandler("Invalid question ID", 400));

    const newAnswer = {
      user: req.user,
      answer,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    question.questionReplies.push(newAnswer);

    await courseCollection.updateOne(
      { _id: new ObjectId(courseId) },
      { $set: { courseData: course.courseData } }
    );

    if (req.user._id.toString() === question.user._id.toString()) {
      const notificationCollection = await getNotificationCollection();
      await notificationCollection.insertOne({
        userId: req.user._id,
        title: "New Question Reply Received",
        message: `You have a new question reply in ${courseContent.title}`,
        status: "unread",
        createdAt: new Date(),
      });
    } else {
      const data = { name: question.user.name, title: courseContent.title };
      const html = await ejs.renderFile(path.join(__dirname, "../mails/question-reply.ejs"), data);

      try {
        await sendMail({
          email: question.user.email,
          subject: "Question Reply",
          template: "question-reply.ejs",
          data,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }
    }

    res.status(200).json({ success: true, course });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// ✅ Add Review to Course
exports.addReview = CatchAsyncError(async (req, res, next) => {
  try {
    const userCourseList = req.user?.courses;
    const courseId = req.params.id;

    const courseExists = userCourseList?.some(course => course._id.toString() === courseId);
    if (!courseExists) return next(new ErrorHandler("You are not eligible to review this course", 404));

    const courseCollection = await getCourseCollection();
    const course = await courseCollection.findOne({ _id: new ObjectId(courseId) });

    if (!course) return next(new ErrorHandler("Course not found", 404));

    const { review, rating } = req.body;

    const reviewData = {
      user: req.user,
      rating,
      comment: review,
    };

    course.reviews.push(reviewData);

    let avg = course.reviews.reduce((sum, rev) => sum + rev.rating, 0) / course.reviews.length;
    course.ratings = avg;

    await courseCollection.updateOne(
      { _id: new ObjectId(courseId) },
      { $set: { reviews: course.reviews, ratings: avg } }
    );

    await redis.set(courseId, JSON.stringify(course), "EX", 604800);

    const notificationCollection = await getNotificationCollection();
    await notificationCollection.insertOne({
      userId: req.user._id,
      title: "New Review Received",
      message: `${req.user.name} has given a review in ${course.name}`,
      status: "unread",
      createdAt: new Date(),
    });

    res.status(200).json({ success: true, course });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// ✅ Add Reply to Review
exports.addReplyToReview = CatchAsyncError(async (req, res, next) => {
  try {
    const { comment, courseId, reviewId } = req.body;

    const courseCollection = await getCourseCollection();
    const course = await courseCollection.findOne({ _id: new ObjectId(courseId) });

    if (!course) return next(new ErrorHandler("Course not found", 404));

    const review = course.reviews.find(rev => rev._id.toString() === reviewId);
    if (!review) return next(new ErrorHandler("Review not found", 404));

    const replyData = {
      user: req.user,
      comment,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    review.commentReplies = review.commentReplies || [];
    review.commentReplies.push(replyData);

    await courseCollection.updateOne(
      { _id: new ObjectId(courseId) },
      { $set: { reviews: course.reviews } }
    );

    await redis.set(courseId, JSON.stringify(course), "EX", 604800);

    res.status(200).json({ success: true, course });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// ✅ Get All Courses for Admin
exports.getAdminAllCourses = CatchAsyncError(async (req, res, next) => {
  try {
    const courseCollection = await getCourseCollection();
    const courses = await courseCollection.find().toArray();

    res.status(200).json({ success: true, courses });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// ✅ Delete Course (Admin)
exports.deleteCourse = CatchAsyncError(async (req, res, next) => {
  try {
    const { id } = req.params;

    const courseCollection = await getCourseCollection();
    const course = await courseCollection.findOne({ _id: new ObjectId(id) });

    if (!course) return next(new ErrorHandler("Course not found", 404));

    await courseCollection.deleteOne({ _id: new ObjectId(id) });
    await redis.del(id);

    res.status(200).json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// ✅ Generate Video URL (VdoCipher)
exports.generateVideoUrl = CatchAsyncError(async (req, res, next) => {
  try {
    const { videoId } = req.body;
    const response = await axios.post(
      `https://dev.vdocipher.com/api/videos/${videoId}/otp`,
      { ttl: 300 },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Apisecret ${process.env.VDOCIPHER_API_SECRET}`,
        },
      }
    );
    console.log(response)

    res.json(response.data);
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});


exports.registerInstitute = CatchAsyncError(async (req, res, next) => {
  try {
      const {
          instituteName,
          offerCode,
          pincode,
          registeringUser,
          validity,
          issuedDate,
          eventName,
          coursesToAllow,
          certificateData,
      } = req.body;

      if (!instituteName || !offerCode || !validity || !coursesToAllow) {
          return next(new ErrorHandler("Required fields are missing", 400));
      }

      const institutes = await getInstituteCollection();

      // Check if offer code already exists
      const existingInstitute = await institutes.findOne({ offerCode });
      if (existingInstitute) {
          return next(new ErrorHandler("Offer code already exists", 400));
      }

      // Insert into database
      const instituteData = {
          instituteName,
          offerCode,
          pincode,
          registeringUser,
          validity,
          issuedDate,
          eventName: eventName || null,
          coursesToAllow,
          certificateData,
          createdAt: new Date(),
          updatedAt: new Date(),
      };

      await institutes.insertOne(instituteData);

      // Store offer code in Redis with courses
      await redis.set(`offer_${offerCode}`, JSON.stringify(coursesToAllow), "EX", validity * 86400);

      res.status(201).json({
          success: true,
          message: "Institute registered successfully",
          institute: instituteData,
      });
  } catch (error) {
      return next(new ErrorHandler(error.message, 400));
  }
});
