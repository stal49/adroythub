const { getLocCollection, getLocUserCollection, getLocUserCounterCollection } = require("../models/latlngModel");
const h3 = require("h3-js");
const bcrypt = require("bcrypt");

const requiredFields = ["lg", "lt", "ts", "ac", "at", "a_a", "h", "h_a", "s", "s_a", "i", "t", "st", "hx"];

function isValidLocationData(data) {
  return requiredFields.every(key => data.hasOwnProperty(key));
}

function attachHex(data, resolution = 9) {
  const { lt, lg } = data;
  data.hx = h3.latLngToCell(lt, lg, resolution); // ← Add hex to data
  return data;
}

async function storeLocationData(data) {
  if (!isValidLocationData(data)) {
    return { success: 2, message: "Missing required fields." };
  }

  attachHex(data); // ← Auto-calculate `hx`

  const collection = await getLocCollection();
  await collection.insertOne(data);
  return { success: 1, message: "Location data stored successfully." };
}

async function storeBulkLocationData(locations) {
  const validDocs = locations.filter(isValidLocationData).map(doc => attachHex(doc)); 

  if (validDocs.length === 0) {
    return { success: 2, message: "No valid location points to insert." };
  }

  const collection = await getLocCollection();
  await collection.insertMany(validDocs);

  return {
    success: 1,
    inserted: validDocs.length,
    message: `${validDocs.length} location points stored successfully.`
  };
}

// Check if user exists
async function checkUserExists(mobile, email) {
  const collection = await getLocUserCollection();
  return await collection.findOne({ $or: [{ mobile }, { email }] });
}

// Register a new user with unique user_number
async function registerUser({ name, mobile, email, location, pincode }) {
  const collection = await getLocUserCollection();

  const existing = await checkUserExists(mobile, email);
  if (existing) {
    return { success: 0, message: "Invalid - User already exists" };
  }

  // Use a MongoDB transaction or counter pattern
  const session = collection.client.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      // Find max user_number
      const maxUser = await collection
        .find({})
        .sort({ user_number: -1 })
        .limit(1)
        .toArray();

      const nextUserNumber = (maxUser[0]?.user_number || 0) + 1;

      const newUser = {
        user_number: nextUserNumber,
        name,
        mobile,
        email,
        location,
        pincode
      };

      await collection.insertOne(newUser, { session });
      result = { success: 1, user_number: nextUserNumber, message: "User registered successfully" };
    });
  } catch (err) {
    console.error("Error during user registration:", err);
    result = { success: 0, message: "Registration failed", error: err.message };
  } finally {
    await session.endSession();
  }

  return result;
}

// Fetch user by user_number
async function getUserByNumber(user_number) {
  const collection = await getLocUserCollection();
  const user = await collection.findOne({ user_number });

  if (!user) {
    return { success: 0, message: "User not found" };
  }

  return { success: 1, user };
}


async function registerUserWithPassword({
  name,
  mobile,
  password,
  email,
  location,
  pincode
}) {
  const collection = await getLocUserCollection();

  // existing user by mobile
  const existing = await collection.findOne({ mobile });
  if (existing) return { success: 0, message: "User already exists" };

  const hashedPassword = await bcrypt.hash(password, 10);

  // get current max user_number
  const maxUser = await collection
    .find({})
    .sort({ user_number: -1 })
    .limit(1)
    .toArray();
  const nextUserNumber = (maxUser[0]?.user_number || 0) + 1;

  const newUser = {
    user_number: nextUserNumber,
    name,
    mobile,
    email,
    location,
    pincode,
    password: hashedPassword
  };

  try {
    await collection.insertOne(newUser);
  } catch (err) {
    console.error("Insert user error:", err);
    return { success: 0, message: "Registration failed" };
  }

  return {
    success: 1,
    user_number: nextUserNumber,
    message: "User registered successfully"
  };
}

async function getUserByMobile(mobile) {
  const collection = await getLocUserCollection();
  return await collection.findOne({ mobile });
}


module.exports = { storeLocationData, storeBulkLocationData, getUserByNumber, registerUser, registerUserWithPassword, getUserByMobile };
