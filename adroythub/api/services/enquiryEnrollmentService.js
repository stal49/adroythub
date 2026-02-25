const { ObjectId } = require("mongodb");
const { getEnquiryCollection, getEnrollmentCollection } = require("../models/enquiryEnrollmentModel");

// Submit an Enquiry
async function submitEnquiry(enquiryData) {
  const { name, mobile, email, programName, programId, batchNo, expectedDuration } = enquiryData;

  if (!name || !mobile || !email || !programName || !programId || !batchNo || !expectedDuration) {
    return { success: 2, message: "Missing required fields." };
  }

  const enquiryCollection = await getEnquiryCollection();

  enquiryData.timestamp = new Date();
  enquiryData.status = 0; // default: new enquiry
  enquiryData.flag = 0;   // default: help me for enrollment
//   0 - New enquiry
//   1 - Reviewed
//   2 - Called user
//   3 - Mailed user
//   4 - Filled enrollment form
//   5 - Made payment
//   6 - Confirmation done
  
// flag
// 0 - Help me for enrollment (default)
// 1 - General enquiry
// 2 - Not interested
// 3 - Interested
// 4 - Interested but wants to wait
// 5 - Checking how enquiry works
// 6 - Call ASAP
// 7 - Help for enrollment

  await enquiryCollection.insertOne(enquiryData);
  return { success: 1, message: "Enquiry submitted successfully." };
}

// Update Enquiry by Admin
async function updateEnquiry(enquiryId, updates) {
    const enquiryCollection = await getEnquiryCollection();
  
    // Automatically update timestamp if remark is updated
    if (updates.remark) {
      updates.lastRemarkedAt = new Date();
    }
  
    const result = await enquiryCollection.updateOne(
      { _id: new ObjectId(enquiryId) },
      { $set: updates }
    );
  
    return {
      success: 1,
      message: "Enquiry updated.",
      modifiedCount: result.modifiedCount
    };
  }

  // Fetch Enquiries with Filters
  async function fetchEnquiries(filters = {}, limit = 10, offset = 0) {
    const enquiryCollection = await getEnquiryCollection();
  
    const query = {};
    if (filters.programId) query.programId = filters.programId;
    if (filters.batchNo) query.batchNo = filters.batchNo;
    if (filters.status !== undefined) query.status = filters.status;
    if (filters.flag !== undefined) query.flag = filters.flag;
  
    const enquiries = await enquiryCollection.find(query).skip(offset).limit(limit).toArray();
    return { success: 1, enquiries };
  }

// Submit an Enrollment
async function submitEnrollment(enrollmentData) {
  const { name, mobile, email, programName, programId, batchNo } = enrollmentData;

  if (!name || !mobile || !email || !programName || !programId || !batchNo) {
    return { success: 2, message: "Missing required fields." };
  }

  const enrollmentCollection = await getEnrollmentCollection();

  enrollmentData.timestamp = new Date();
  enrollmentData.status = 1; // filled enrollment form
//   1 - Filled enrollment form
// 2 - Made payment
// 3 - Received confirmation mail
// 4 - We called them
// 5 - Done

  enrollmentData.enquiryId = enrollmentData.enquiryId || null;

  const result = await enrollmentCollection.insertOne(enrollmentData);
  return { success: 1, message: "Enrollment successful.", enrollmentId: result.insertedId };
}

// Update Enrollment by Admin
async function updateEnrollment(enrollmentId, updates) {
    const enrollmentCollection = await getEnrollmentCollection();
  
    if (updates.remark) {
      updates.lastRemarkedAt = new Date();
    }
  
    const result = await enrollmentCollection.updateOne(
      { _id: new ObjectId(enrollmentId) },
      { $set: updates }
    );
  
    return {
      success: 1,
      message: "Enrollment updated.",
      modifiedCount: result.modifiedCount
    };
  }

async function fetchEnrollments(filters = {}, limit = 10, offset = 0) {
    const enrollmentCollection = await getEnrollmentCollection();

    const query = {};
    if (filters.programId) query.programId = filters.programId;
    if (filters.batchNo) query.batchNo = filters.batchNo;
    if (filters.status !== undefined) query.status = filters.status;
    if (filters.enquiryId) query.enquiryId = filters.enquiryId;

    const enrollments = await enrollmentCollection.find(query).skip(offset).limit(limit).toArray();
    return { success: 1, enrollments };
}

module.exports = {
  submitEnquiry,
  fetchEnquiries,
  updateEnquiry,
  submitEnrollment,
  fetchEnrollments,
  updateEnrollment
};
