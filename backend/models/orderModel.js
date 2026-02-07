const { connectToMongoDatabase } = require("../config/database");

// Get Order Collection
async function getOrderCollection() {
  const { mongodb } = await connectToMongoDatabase();
  return mongodb.collection("orders");
}

/*
📌 Order Data Structure (Example)
---------------------------------
{
  courseId: "65b1a3cde24f2a0012345678",  // Reference to the course
  userId: "65b2c4dfe98a6b0019876543",    // Reference to the user
  payment_info: {
    method: "credit_card",
    transactionId: "txn_abc123xyz",
    amount: 49.99,
    currency: "USD",
    status: "completed"  // Possible values: "pending", "completed", "failed"
  },
  createdAt: ISODate("2024-02-05T10:00:00Z"),
  updatedAt: ISODate("2024-02-05T12:00:00Z")
}
*/

module.exports = { getOrderCollection };
