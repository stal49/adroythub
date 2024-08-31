"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const internshipEnrollment_controller_1 = require("../controllers/internshipEnrollment.controller");
const internshipRouter = express_1.default.Router();
internshipRouter.post("/internship-enrollment", internshipEnrollment_controller_1.createInternshipEnrollment);
exports.default = internshipRouter;
