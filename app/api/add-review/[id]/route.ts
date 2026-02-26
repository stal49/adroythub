import { NextRequest } from "next/server";
import { runController } from "@/lib/expressAdapter";
import { authenticate } from "@/lib/auth";
const { addReview } = require("@/api/controllers/courseController");

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { user, error } = await authenticate(request);
    if (error) return error;
    return runController(request, addReview, { user, params });
}
