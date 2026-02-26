import { NextRequest } from "next/server";
import { runController } from "@/lib/expressAdapter";
import { authenticate, checkRole } from "@/lib/auth";
const { editLayout } = require("@/api/controllers/layoutController");

export async function PUT(request: NextRequest) {
    const { user, error } = await authenticate(request);
    if (error) return error;
    const roleError = checkRole(user, "admin");
    if (roleError) return roleError;
    return runController(request, editLayout, { user });
}
