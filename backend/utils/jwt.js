const jwt = require("jsonwebtoken");
const { redis } = require("./redis");
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;

// Parse expiration times from environment variables (fallback to default values)
const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || "3600", 10); // Default: 1 hour
const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || "604800", 10); // Default: 7 days

// Token options for cookies
const tokenOptions = {
  accessToken: {
    expires: new Date(Date.now() + accessTokenExpire * 1000),
    maxAge: accessTokenExpire * 1000,
    httpOnly: true,
    sameSite: "None",
    secure: true,
  },
  refreshToken: {
    expires: new Date(Date.now() + refreshTokenExpire * 1000),
    maxAge: refreshTokenExpire * 1000,
    httpOnly: true,
    sameSite: "None",
    secure: true,
  },
};

// Generate and Send Token
const sendToken = async (user, statusCode, res) => {
  // if (!res || typeof res.cookie !== "function") {
  //     throw new Error("Invalid response object: res is not an Express response");
  // }

  const accessToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "50m",
  });

  const refreshToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "7d",
  });

  // res.cookie("access_token", accessToken, { httpOnly: true,
  //   secure: process.env.NODE_ENV === "production", // ✅ Only secure in production
  //   sameSite: "None" });
  // res.cookie("refresh_token", refreshToken, { httpOnly: true,
  //   secure: process.env.NODE_ENV === "production", // ✅ Only secure in production
  //   sameSite: "None" });

  res.status(statusCode).json({
      success: true,
      user,
      accessToken,
      refreshToken,
  });
};

module.exports = { sendToken };
