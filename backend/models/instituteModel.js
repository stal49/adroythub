const { connectToMongoDatabase } = require("../config/database");

// Get Institute Collection
async function getInstituteCollection() {
  const { mongodb } = await connectToMongoDatabase();
  return mongodb.collection("institutes");
}

/*
📌 Institute Data Structure (Example)
--------------------------------------
{
  instituteName: "ABC University",
  offerCode: "ABC123",
  pincode: "560001",
  registeringUser: "65b1a3cde24f2a0012345678",  // Admin User ID
  validity: 30,  // Validity in days
  issuedDate: ISODate("2024-02-07T10:00:00Z"),
  eventName: "Tech Fest 2024",  // Optional
  coursesToAllow: ["6723c7aa41e07d5cb9dcd6fe", "67852f865183494567ade298"],  // Course IDs
  certificateData: {
    signature: "signature_url.png",
    authorityName: "Dr. John Doe",
    collegeLogo: "logo_url.png"
  },
  createdAt: ISODate("2024-02-07T10:00:00Z"),
  updatedAt: ISODate("2024-02-07T10:00:00Z")
}
*/

module.exports = { getInstituteCollection };
