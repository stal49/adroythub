import { NextRequest } from "next/server";
import { runController } from "@/lib/expressAdapter";
import { authenticate } from "@/lib/auth";
const { getCourseByUser } = require("@/api/controllers/courseController");

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { user, error } = await authenticate(request);
    if (error) return error;
    return runController(request, getCourseByUser, { user, params });
}
