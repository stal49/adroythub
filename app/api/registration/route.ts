import { NextRequest } from "next/server";
import { runController } from "@/lib/expressAdapter";
const { registrationUser } = require("@/api/controllers/userController");

export async function POST(request: NextRequest) {
    return runController(request, registrationUser);
}
