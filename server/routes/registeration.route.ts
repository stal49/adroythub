import express from "express";
import { createRegisteration } from "../controllers/registeration.controller";


const RegisterationRouter = express.Router();

RegisterationRouter.post("/registeration", createRegisteration);

export default RegisterationRouter;
