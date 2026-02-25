const { CatchAsyncError } = require("../middleware/catchAsyncErrors");
const { getCourseCollection } = require("../models/courseModel");

// create course
exports.createCourse = CatchAsyncError(async (data, res) => {
    const coursesCollection = await getCourseCollection(); // Access the course collection
    const result = await coursesCollection.insertOne(data);  // Insert data into the collection

    res.status(201).json({
        success: true,
        course: data,  // The inserted document will be in result.ops[0]
    });
});

// Get All Courses
exports.getAllCoursesService = async (res) => {
    const coursesCollection = await getCourseCollection(); // Access the course collection
    const courses = await coursesCollection.find().sort({ createdAt: -1 }).toArray();  // Get all courses

    res.status(200).json({
        success: true,
        courses,
    });
};
