const { connectToMongoDatabase } = require("../config/database");

// Get Notification Collection
async function getNotificationCollection() {
  const { mongodb } = await connectToMongoDatabase();
  return mongodb.collection("notifications");
}

/*
📌 Notification Data Structure (Example)
---------------------------------------
{
  title: "New Course Available",
  message: "A new JavaScript course has been added!",
  status: "unread",  // Possible values: "unread", "read"
  userId: "65b1a3cde24f2a0012345678",  // Reference to the user
  createdAt: ISODate("2024-02-05T10:00:00Z"),
  updatedAt: ISODate("2024-02-05T12:00:00Z")
}
*/

module.exports = { getNotificationCollection };
