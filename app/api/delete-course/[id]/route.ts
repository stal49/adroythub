import { NextRequest } from "next/server";
import { runController } from "@/lib/expressAdapter";
import { authenticate, checkRole } from "@/lib/auth";
const { deleteCourse } = require("@/api/controllers/courseController");

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { user, error } = await authenticate(request);
    if (error) return error;
    const roleError = checkRole(user, "admin");
    if (roleError) return roleError;
    return runController(request, deleteCourse, { user, params });
}
