const { connectToMongoDatabase } = require("../config/database");

// Get Course Collection
async function getCourseCollection() {
  const { mongodb } = await connectToMongoDatabase();
  return mongodb.collection("courses");
}

/*
📌 Course Data Structure (Example)
---------------------------------
{
  name: "JavaScript Mastery",
  description: "Learn JavaScript from scratch",
  categories: "Programming",
  price: 99.99,
  estimatedPrice: 79.99,    // Optional
  thumbnail: {              // Cloudinary Image Data
    public_id: "xyz123",
    url: "https://image.url"
  },
  tags: "JavaScript, Web Development",
  level: "Beginner",
  demoUrl: "https://demo.video",
  benefits: [{ title: "Lifetime access" }, { title: "Certification" }],
  prerequisites: [{ title: "Basic HTML" }, { title: "Basic CSS" }],
  reviews: [
    {
      user: ObjectId("userId1"),
      rating: 5,
      comment: "Great course!",
      commentReplies: []
    }
  ],
  courseData: [
    {
      title: "Introduction",
      description: "Course Overview",
      videoUrl: "https://video.url",
      videoThumbnail: { public_id: "thumb123", url: "https://thumb.url" },
      videoSection: "Module 1",
      videoLength: 1200, // in seconds
      videoPlayer: "Vimeo",
      links: [{ title: "Docs", url: "https://docs.url" }],
      suggestion: "Complete exercises",
      questions: [
        {
          user: ObjectId("userId2"),
          question: "How does async/await work?",
          questionReplies: []
        }
      ]
    }
  ],
  ratings: 4.7, // Average rating
  purchased: 1500, // Total purchases
  createdAt: ISODate("2024-02-05T10:00:00Z"),
  updatedAt: ISODate("2024-02-05T12:00:00Z")
}
*/

module.exports = { getCourseCollection };
