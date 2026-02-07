const { getLayoutCollection } = require("../models/layoutModel");
const { CatchAsyncError } = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const cloudinary = require("cloudinary").v2;

// Create Layout
exports.createLayout = CatchAsyncError(async (req, res, next) => {
  try {
    const { type } = req.body;
    const layoutsCollection = await getLayoutCollection();

    const isTypeExist = await layoutsCollection.findOne({ type });
    if (isTypeExist) {
      return next(new ErrorHandler(`${type} already exists`, 400));
    }

    let newLayout = { type };

    if (type === "Banner") {
      const { image, title, subTitle } = req.body;
      const myCloud = await cloudinary.uploader.upload(image, {
        folder: "layout",
      });

      newLayout.banner = {
        image: {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        },
        title,
        subTitle,
      };
    }

    if (type === "FAQ") {
      const { faq } = req.body;
      newLayout.faq = faq.map((item) => ({
        question: item.question,
        answer: item.answer,
      }));
    }

    if (type === "Categories") {
      const { categories } = req.body;
      newLayout.categories = categories.map((item) => ({
        title: item.title,
      }));
    }

    await layoutsCollection.insertOne(newLayout);

    res.status(200).json({
      success: true,
      message: "Layout created successfully",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Edit Layout
exports.editLayout = CatchAsyncError(async (req, res, next) => {
  try {
    const { type } = req.body;
    const layoutsCollection = await getLayoutCollection();

    const existingLayout = await layoutsCollection.findOne({ type });
    if (!existingLayout) {
      return next(new ErrorHandler(`${type} layout not found`, 404));
    }

    let updateData = { type };

    if (type === "Banner") {
      const { image, title, subTitle } = req.body;

      let newImage = existingLayout.banner.image;
      if (!image.startsWith("https")) {
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: "layout",
        });
        newImage = {
          public_id: uploadResponse.public_id,
          url: uploadResponse.secure_url,
        };
      }

      updateData.banner = { image: newImage, title, subTitle };
    }

    if (type === "FAQ") {
      const { faq } = req.body;
      updateData.faq = faq.map((item) => ({
        question: item.question,
        answer: item.answer,
      }));
    }

    if (type === "Categories") {
      const { categories } = req.body;
      updateData.categories = categories.map((item) => ({
        title: item.title,
      }));
    }

    await layoutsCollection.updateOne({ type }, { $set: updateData });

    res.status(200).json({
      success: true,
      message: "Layout updated successfully",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Get Layout by Type
exports.getLayoutByType = CatchAsyncError(async (req, res, next) => {
  try {
    const { type } = req.params;
    const layoutsCollection = await getLayoutCollection();

    const layout = await layoutsCollection.findOne({ type });
    if (!layout) {
      return next(new ErrorHandler(`${type} layout not found`, 404));
    }

    res.status(200).json({
      success: true,
      layout,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});
