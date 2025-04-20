import mongoose, { Document, Model, Schema } from "mongoose";

export interface IRegisteration extends Document {
  fullName: string;
  email: string;
  mobileNumber: string;
  College : string,
  CurrentYear : string,
  Address : string,
  CourseInterested : string,
}

const registerationSchema: Schema<IRegisteration> = new Schema({
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
  College :{
    type: String,
    required: true,
  },
  CurrentYear : {
        type: String,
        required: true,
      },
Address : {
        type: String,
        required: true,
      },
    CourseInterested :{
        type: String,
        required: true,
      },
});

const Registeration: Model<IRegisteration> = mongoose.model("Registeration", registerationSchema);

export default Registeration;
