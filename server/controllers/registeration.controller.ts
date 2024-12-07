import { Request, Response } from "express";
import Registeration from "../models/registeration.model";// Import your model

export const createRegisteration = async (req: Request, res: Response) => {
  try {
    const { fullName, email, mobileNumber, College, Current_Year,
        Address,
        Course_Interested, } = req.body;

    // Create a new internship enrollment
    const newRegisteration = new Registeration({
      fullName,
      email,
      mobileNumber,
      College,
      Current_Year,
      Address,
      Course_Interested,
    });

    // Save to database
    await newRegisteration.save();

    res.status(201).json({
      success: true,
      message: "Registered successfully",
      data: newRegisteration,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
