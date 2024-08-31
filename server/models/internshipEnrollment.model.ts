import mongoose, { Document, Model, Schema } from "mongoose";

export interface IInternshipEnrollment extends Document {
  fullName: string;
  email: string;
  mobileNumber: string;
  courseCompleted: string;
  highestQualification: string;
}

const internshipEnrollmentSchema: Schema<IInternshipEnrollment> = new Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    validate: {
      validator: function (value: string) {
        // Email validation
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      message: "Invalid email address",
    },
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  courseCompleted: {
    type: String,
    required: true,
  },
  highestQualification: {
    type: String,
    required: true,
  },
});

const InternshipEnrollment: Model<IInternshipEnrollment> = mongoose.model("InternshipEnrollment", internshipEnrollmentSchema);

export default InternshipEnrollment;
