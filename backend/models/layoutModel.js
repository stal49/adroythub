const { connectToMongoDatabase } = require("../config/database");

// Get Layout Collection
async function getLayoutCollection() {
  const { mongodb } = await connectToMongoDatabase();
  return mongodb.collection("layouts");
}

/*
📌 Layout Data Structure (Example)
---------------------------------
{
  type: "homepage",
  faq: [
    { question: "What is this platform?", answer: "It is an e-learning platform." }
  ],
  categories: [
    { title: "Programming" },
    { title: "Design" }
  ],
  banner: {
    image: { public_id: "banner123", url: "https://image.url" },
    title: "Welcome to Our Platform",
    subTitle: "Learn from the best courses"
  },
  createdAt: ISODate("2024-02-05T10:00:00Z"),
  updatedAt: ISODate("2024-02-05T12:00:00Z")
}
*/

module.exports = { getLayoutCollection };
