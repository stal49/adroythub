import { Request, Response } from "express";
import InternshipEnrollment from "../models/internshipEnrollment.model"; // Import your model

export const createInternshipEnrollment = async (req: Request, res: Response) => {
  try {
    const { fullName, email, mobileNumber, courseCompleted, highestQualification } = req.body;

    // Create a new internship enrollment
    const newEnrollment = new InternshipEnrollment({
      fullName,
      email,
      mobileNumber,
      courseCompleted,
      highestQualification,
    });

    // Save to database
    await newEnrollment.save();

    res.status(201).json({
      success: true,
      message: "Internship enrollment created successfully",
      data: newEnrollment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
