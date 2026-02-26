import { NextRequest } from "next/server";
import { runController } from "@/lib/expressAdapter";
const { loginUser } = require("@/api/controllers/userController");

export async function POST(request: NextRequest) {
    return runController(request, loginUser);
}
