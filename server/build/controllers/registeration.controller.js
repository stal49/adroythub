"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRegisteration = void 0;
const registeration_model_1 = __importDefault(require("../models/registeration.model")); // Import your model
const createRegisteration = async (req, res) => {
    try {
        const { fullName, email, mobileNumber, College, Current_Year, Address, Course_Interested, } = req.body;
        // Create a new internship enrollment
        const newRegisteration = new registeration_model_1.default({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.createRegisteration = createRegisteration;
