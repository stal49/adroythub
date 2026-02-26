const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { redis } = require("../utils/redis");
const { getUserCollection } = require("../models/userModel");
const { ObjectId } = require("mongodb");

// **Compare Password**
const comparePassword = async (enteredPassword, hashedPassword) => {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};

// **Sign Access Token**
const SignAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.ACCESS_TOKEN, { expiresIn: "50m" });
};

// **Sign Refresh Token**
const SignRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN, { expiresIn: "3d" });
};

// **Get User by ID**
exports.getUserByIdService = async (id, res) => {
  const userJson = await redis.get(id);
  if (userJson) {
    const user = JSON.parse(userJson);
    return res.status(200).json({ success: true, user });
  }

  const usersCollection = await getUserCollection();
  const user = await usersCollection.findOne({ _id: new ObjectId(id) });

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  await redis.set(id, JSON.stringify(user));
  return res.status(200).json({ success: true, user });
};

// **Get All Users**
exports.getAllUsersService = async (res) => {
  const usersCollection = await getUserCollection();
  const users = await usersCollection.find().sort({ createdAt: -1 }).toArray();

  return res.status(200).json({ success: true, users });
};

// **Update User Role**
exports.updateUserRoleService = async (res, id, role) => {
  const usersCollection = await getUserCollection();
  const user = await usersCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { role } },
    { returnDocument: "after" }
  );

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  return res.status(200).json({ success: true, user: user });
};

// **Export Helper Functions**
exports.comparePassword = comparePassword;
exports.SignAccessToken = SignAccessToken;
exports.SignRefreshToken = SignRefreshToken;
