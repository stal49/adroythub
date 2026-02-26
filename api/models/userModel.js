const { connectToMongoDatabase, connectToDatabase, connectToMainMongoDatabase } = require("../config/database");

// Get User Collection
async function getUserCollection() {
  const { mongodb } = await connectToMongoDatabase();
  return mongodb.collection("users");
}

// Get User Collection
async function getSsbUserCollection() {
  const { mongodb } = await connectToMainMongoDatabase();
  return mongodb.collection("calmchase_users");
}

/*
📌 User Data Structure (Example)
---------------------------------
{
  name: "John Doe",
  email: "johndoe@example.com",
  password: "hashed_password_here",
  mobile: "+1234567890",
  institute: "XYZ University",
  code: "ABC123",
  avatar: {
    public_id: "avatar_123",
    url: "https://example.com/avatar.jpg"
  },
  role: "user",  // Possible values: "user", "admin", etc.
  isVerified: false,
  courses: [
    { courseId: "65b1a3cde24f2a0012345678" }
  ],
  trial_consumed: Boolean,  // true if user has consumed their free trial (default: false)
  createdAt: ISODate("2024-02-05T10:00:00Z"),
  updatedAt: ISODate("2024-02-05T12:00:00Z")
}

📌 Trial Consumed Field:
------------------------
- trial_consumed: Boolean (default: false)
- Set to true when:
  * Free trial expires naturally, OR
  * User purchases any paid plan (even during active trial)
- Once true, user is permanently disqualified from all future free trials
- Index should be created on this field for performance: { trial_consumed: 1 }
*/


module.exports = { getUserCollection, getSsbUserCollection };