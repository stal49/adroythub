import { NextRequest } from "next/server";
import { runController } from "@/lib/expressAdapter";
import { authenticate, checkRole } from "@/lib/auth";
const { getOrderAnalytics } = require("@/api/controllers/analyticsController");

export async function GET(request: NextRequest) {
    const { user, error } = await authenticate(request);
    if (error) return error;
    const roleError = checkRole(user, "admin");
    if (roleError) return roleError;
    return runController(request, getOrderAnalytics, { user });
}
