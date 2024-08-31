import express from "express";
import { createInternshipEnrollment } from "../controllers/internshipEnrollment.controller";

const internshipRouter = express.Router();

internshipRouter.post("/internship-enrollment", createInternshipEnrollment);

export default internshipRouter;
