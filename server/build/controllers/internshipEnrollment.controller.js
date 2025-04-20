"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInternshipEnrollment = void 0;
const internshipEnrollment_model_1 = __importDefault(require("../models/internshipEnrollment.model")); // Import your model
const createInternshipEnrollment = async (req, res) => {
    try {
        const { fullName, email, mobileNumber, courseCompleted, highestQualification } = req.body;
        // Create a new internship enrollment
        const newEnrollment = new internshipEnrollment_model_1.default({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.createInternshipEnrollment = createInternshipEnrollment;
