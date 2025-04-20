"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const registeration_controller_1 = require("../controllers/registeration.controller");
const RegisterationRouter = express_1.default.Router();
RegisterationRouter.post("/registeration", registeration_controller_1.createRegisteration);
exports.default = RegisterationRouter;
