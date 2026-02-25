const { getIncubationCollection } = require("../models/incubationModel");

// Function to Apply for Incubation
async function applyForIncubation(applicationData) {
  const { startupName, founderName, email, phone, ideaDescription } = applicationData;

  // Check for mandatory fields
  if (!startupName || !founderName || !email || !phone || !ideaDescription) {
    return { success: 2, message: "Missing required fields." };
  }

  const incubationCollection = await getIncubationCollection();
  applicationData.timestamp = new Date();

  await incubationCollection.insertOne(applicationData);
  return { success: 1, message: "Application submitted successfully." };
}

// Function to Fetch Applications (for admin)
async function fetchIncubationApplications(limit = 10, offset = 0) {
  const incubationCollection = await getIncubationCollection();

  const applications = await incubationCollection
    .find()
    .skip(offset)
    .limit(limit)
    .toArray();

  return { success: 1, applications };
}

module.exports = { applyForIncubation, fetchIncubationApplications };
