import { NextRequest } from "next/server";
import { runController } from "@/lib/expressAdapter";
import { authenticate, checkRole } from "@/lib/auth";
import { NextResponse } from "next/server";
const { getAllUsers } = require("@/api/controllers/userController");

export async function GET(request: NextRequest) {
    const { user, error } = await authenticate(request);
    if (error) return error;
    const roleError = checkRole(user, "admin");
    if (roleError) return roleError;
    return runController(request, getAllUsers, { user });
}
