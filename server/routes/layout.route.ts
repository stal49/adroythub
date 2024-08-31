import express from "express";
import { authorizeRoles, isAutheticated } from "../middleware/auth";
import { createLayout, editLayout, getLayoutByType } from "../controllers/layout.controller";
const layoutRouter = express.Router();

layoutRouter.post("/create-layout", createLayout);

layoutRouter.put("/edit-layout", editLayout);

layoutRouter.get("/get-layout/:type",getLayoutByType);


export default layoutRouter;