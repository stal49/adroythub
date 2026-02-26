require("dotenv").config();
const jwt = require("jsonwebtoken");
const ejs = require("ejs");
const path = require("path");
const ErrorHandler = require("../utils/ErrorHandler");
const { CatchAsyncError } = require("../middleware/catchAsyncErrors");
const { sendMail } = require("../utils/sendMail");
const { accessTokenOptions, refreshTokenOptions } = require("../utils/jwt");
const { redis } = require("../utils/redis");
const { getUserCollection } = require("../models/userModel");
const { ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
const cloudinary = require("cloudinary");
const { getAllUsersService, updateUserRoleService, getUserByIdService } = require("../services/userService");
const { sendToken } = require("../utils/jwt");
const { disconnectUser } = require("../socketServer");

// Register user
exports.registrationUser = CatchAsyncError(async (req, res, next) => {
  console.log('this is request', req.body)
  try {
    const { name, email, password, mobile, institute, code } = req.body;
    const users = await getUserCollection();

    const isEmailExist = await users.findOne({ email });
    if (isEmailExist) {
      return next(new ErrorHandler("Email already exists", 400));
    }

    const user = { name, email, password, mobile, institute, code };
    const activationToken = createActivationToken(user);
    const activationCode = activationToken.activationCode;

    const data = { user: { name: user.name }, activationCode };
    const html = await ejs.renderFile(
      path.join(process.cwd(), "api/mails/activation-mail.ejs"),
      data
    );

    try {
      await sendMail({
        email: user.email,
        subject: "Activate your account",
        template: "activation-mail.ejs",
        data,
      });

      res.status(201).json({
        success: true,
        message: `Please check your email: ${user.email} to activate your account!`,
        activationToken: activationToken.token,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// Create activation token
const createActivationToken = (user) => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const token = jwt.sign({ user, activationCode }, process.env.ACTIVATION_SECRET, {
    expiresIn: "50m",
  });

  return { token, activationCode };
};

// Activate user
exports.activateUser = CatchAsyncError(async (req, res, next) => {
  try {
    const { activation_token, activation_code } = req.body;
    const decoded = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);

    if (decoded.activationCode !== activation_code) {
      return next(new ErrorHandler("Invalid activation code", 400));
    }

    const { name, email, password, mobile, institute, code } = decoded.user;
    const users = await getUserCollection();

    const existUser = await users.findOne({ email });
    if (existUser) {
      return next(new ErrorHandler("Email already exists", 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Get courses from Redis using offerCode
    let coursesAllowed = [];
    const cachedCourses = await redis.get(`offer_${code}`);

    if (cachedCourses) {
      coursesAllowed = JSON.parse(cachedCourses).map(courseId => ({ _id: new ObjectId(courseId) }));
    }

    const insertedUser = await users.insertOne({
      name,
      email,
      password: hashedPassword,
      mobile,
      institute,
      code,
      isVerified: false,
      role: "user",
      courses: coursesAllowed,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    // Generate tokens
    const userId = insertedUser.insertedId.toString();
    const accessToken = jwt.sign({ id: userId }, process.env.SECRET_KEY, { expiresIn: "50m" });
    const refreshToken = jwt.sign({ id: userId }, process.env.SECRET_KEY, { expiresIn: "7d" });
    await redis.set(userId, JSON.stringify(decoded.user), "EX", 604800);

    // Send response with tokens
    res.status(201).json({
      success: true,
      message: "Account activated successfully!",
      accessToken,
      refreshToken,
      user: decoded.user
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// Login user
exports.loginUser = CatchAsyncError(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(email, password)
    if (!email || !password) {
      return next(new ErrorHandler("Please enter email and password", 400));
    }

    const users = await getUserCollection();
    const user = await users.findOne({ email });

    if (!user) {
      return next(new ErrorHandler("Invalid email or password", 400));
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return next(new ErrorHandler("Invalid email or password", 400));
    }
    await redis.set(user._id, JSON.stringify(user), "EX", 604800);

    sendToken(user, 200, res);
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// // Logout User
// exports.logoutUser = CatchAsyncError(async (req, res, next) => {
//     try {
//         res.cookie("access_token", "", { maxAge: 1 });
//         res.cookie("refresh_token", "", { maxAge: 1 });

//         const userId = req.user?._id || "";
//         redis.del(userId);

//         res.status(200).json({
//             success: true,
//             message: "Logged out successfully",
//         });
//     } catch (error) {
//         return next(new ErrorHandler(error.message, 400));
//     }
// });

exports.logoutUser = CatchAsyncError(async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let userId = "";

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        // Decode token even if expired to get the userId for cleanup
        const decoded = jwt.verify(token, process.env.SECRET_KEY, { ignoreExpiration: true });
        userId = decoded.id;
      } catch (err) {
        console.warn("Logout: Could not decode token:", err.message);
      }
    }

    if (userId) {
      // Invalidate token by deleting user session from Redis
      await redis.del(userId);
      // Disconnect user from Socket.IO
      disconnectUser(userId);
      console.log(`✅ User ${userId} logged out and session cleared`);
    }

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout Error:", error);
    // Still return success to allow frontend cleanup
    res.status(200).json({
      success: true,
      message: "Logged out successfully (with errors)",
    });
  }
});

// // Update Access Token
// exports.updateAccessToken = CatchAsyncError(async (req, res, next) => {
//     try {
//         const refresh_token = req.cookies.refresh_token;
//         if (!refresh_token) {
//             return next(new ErrorHandler("Refresh token is required", 400));
//         }

//         const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN);
//         if (!decoded) {
//             return next(new ErrorHandler("Could not refresh token", 400));
//         }

//         const session = await redis.get(decoded.id);
//         if (!session) {
//             return next(new ErrorHandler("Please login to access this resource!", 400));
//         }

//         const user = JSON.parse(session);
//         const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN, { expiresIn: "50m" });
//         const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN, { expiresIn: "3d" });

//         req.user = user;

//         res.cookie("access_token", accessToken, accessTokenOptions);
//         res.cookie("refresh_token", refreshToken, refreshTokenOptions);

//         await redis.set(user._id, JSON.stringify(user), "EX", 604800); // 7 days

//         return next();
//     } catch (error) {
//         return next(new ErrorHandler(error.message, 400));
//     }
// });

exports.updateAccessToken = CatchAsyncError(async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new ErrorHandler("Refresh token is required", 401));
    }

    const refreshToken = authHeader.split(" ")[1];

    // Verify Refresh Token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.SECRET_KEY);
    } catch (err) {
      return next(new ErrorHandler("Invalid or expired refresh token", 403));
    }

    // Check if user session exists in Redis
    const session = await redis.get(decoded.id);
    if (!session) {
      return next(new ErrorHandler("Session expired. Please log in again!", 403));
    }

    // Generate a new access token only
    const user = JSON.parse(session);
    const newAccessToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: "50m" });

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken, // ✅ Only returning new access token
    });

  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// Get User Info
exports.getUserInfo = CatchAsyncError(async (req, res, next) => {
  console.log('in me', req.user)
  try {
    const userId = req.user?._id;
    getUserByIdService(userId, res);
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// Social Authentication
exports.socialAuth = CatchAsyncError(async (req, res, next) => {
  try {
    const { email, name, avatar } = req.body;

    const users = await getUserCollection();
    let user = await users.findOne({ email });

    if (!user) {
      const newUser = { email, name, avatar };
      await users.insertOne(newUser);
      user = newUser;
    }

    sendToken(user, 200, res);
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// Update User Info
exports.updateUserInfo = CatchAsyncError(async (req, res, next) => {
  try {
    const { name } = req.body;
    const userId = req.user?._id;

    if (!ObjectId.isValid(userId)) {
      return next(new ErrorHandler("Invalid user ID", 400));
    }

    const usersCollection = await getUserCollection();
    const updatedUser = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { name } },
      { returnDocument: "after" }
    );

    if (!updatedUser) {
      return next(new ErrorHandler("User not found", 404));
    }

    await redis.set(userId, JSON.stringify(updatedUser));

    res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// Update User Password
exports.updatePassword = CatchAsyncError(async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return next(new ErrorHandler("Please enter old and new password", 400));
    }

    const users = await getUserCollection();
    const user = await users.findOne({ _id: new ObjectId(req.user?._id) });

    if (!user || !user.password) {
      return next(new ErrorHandler("Invalid user", 400));
    }

    // Compare old password
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatch) {
      return next(new ErrorHandler("Invalid old password", 400));
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in DB
    data = await users.updateOne({ _id: new ObjectId(req.user?._id) }, { $set: { password: hashedPassword } });

    console.log(data)
    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// Update Profile Picture
exports.updateProfilePicture = CatchAsyncError(async (req, res, next) => {
  try {
    const { avatar } = req.body;
    const userId = req.user?._id;

    const users = await getUserCollection();
    const user = await users.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    if (avatar) {
      if (user?.avatar?.public_id) {
        await cloudinary.v2.uploader.destroy(user.avatar.public_id);
      }

      const myCloud = await cloudinary.v2.uploader.upload(avatar, {
        folder: "avatars",
        width: 150,
      });

      user.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };

      await users.updateOne({ _id: userId }, { $set: { avatar: user.avatar } });
    }

    await redis.set(userId, JSON.stringify(user));

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// Get All Users (Admin Only)
exports.getAllUsers = CatchAsyncError(async (req, res, next) => {
  try {
    getAllUsersService(res);
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// Update User Role (Admin Only)
exports.updateUserRole = CatchAsyncError(async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const users = await getUserCollection();
    const user = await users.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const id = user._id;
    updateUserRoleService(res, id, role);
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// Delete User (Admin Only)
exports.deleteUser = CatchAsyncError(async (req, res, next) => {
  try {
    const { id } = req.params;
    const users = await getUserCollection();
    const user = await users.findOne({ _id: new ObjectId(id) });

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    await users.deleteOne({ _id: id });
    await redis.del(id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});


//ssb
