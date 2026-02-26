import { NextRequest } from "next/server";
import { runController } from "@/lib/expressAdapter";
const { activateUser } = require("@/api/controllers/userController");

export async function POST(request: NextRequest) {
    return runController(request, activateUser);
}
